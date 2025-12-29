const express = require("express");
const prisma = require("../../prisma/client");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

function formatUserName(u) {
    const fn = (u?.firstName || "").trim();
    const ln = (u?.lastName || "").trim();
    const full = `${fn} ${ln}`.trim();
    return full || u?.email || `User #${u?.id ?? "?"}`;
}


router.get("/my-messages", authenticate, async (req, res) => {
    try {
        const userId = req.user?.id ?? req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: "Not authenticated" });
        }

        const msgs = await prisma.message.findMany({
            where: {
                OR: [{ senderId: Number(userId) }, { recipientId: Number(userId) }],
            },
            orderBy: { createdAt: "asc" },
            select: {
                id: true,
                senderId: true,
                recipientId: true,
                value: true,
                createdAt: true,
                notified: true,
                readAt: true,
            },
        });

        return res.json({ success: true, data: msgs });
    } catch (e) {
        console.error("GET /chat/my-messages failed:", e);
        return res.status(500).json({ success: false, error: "Server error" });
    }
});

// GET /api/chat/users?q=bar
// vráti užívateľov pre "nová správa" autocomplete
router.get("/users", authenticate, async (req, res) => {
    try {
        const userId = Number(req.user?.id ?? req.userId);
        const q = String(req.query.q ?? "").trim();

        const users = await prisma.user.findMany({
            where: {
                id: { not: userId },
                ...(q
                    ? {
                        OR: [
                            { firstName: { contains: q, mode: "insensitive" } },
                            { lastName: { contains: q, mode: "insensitive" } },
                            { email: { contains: q, mode: "insensitive" } },
                        ],
                    }
                    : {}),
            },
            orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
            take: 20,
            select: { id: true, firstName: true, lastName: true, email: true },
        });

        const data = users.map((u) => ({
            id: u.id,
            name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email,
            email: u.email,
        }));

        return res.json({ success: true, data });
    } catch (e) {
        console.error("GET /chat/users failed:", e);
        return res.status(500).json({ success: false, error: "Failed to load users." });
    }
});


/**
 * GET /api/chat/conversations
 * Ľavý panel:
 * - každý “partner” s ktorým som si písal
 * - posledná správa + timestamp
 * - počet neprečítaných (unreadCount) z pohľadu prihláseného usera
 */
router.get("/conversations", authenticate, async (req, res) => {
    try {
        const userId = Number(req.user?.id ?? req.userId);
        if (!userId) {
            return res.status(401).json({ success: false, error: "Not authenticated" });
        }

        const messages = await prisma.message.findMany({
            where: {
                OR: [{ senderId: userId }, { recipientId: userId }],
            },
            orderBy: { createdAt: "desc" },
            include: {
                sender: { select: { id: true, email: true, firstName: true, lastName: true } },
                recipient: { select: { id: true, email: true, firstName: true, lastName: true } },
            },
        });

        const map = new Map();

        for (const m of messages) {
            const partnerId = m.senderId === userId ? m.recipientId : m.senderId;
            const partner = m.senderId === userId ? m.recipient : m.sender;

            if (!map.has(partnerId)) {
                map.set(partnerId, {
                    partnerId,
                    partnerName: formatUserName(partner),
                    lastMessage: m.value,
                    lastAt: m.createdAt,
                    unreadCount: 0,
                });
            }

            if (m.recipientId === userId && !m.readAt) {
                map.get(partnerId).unreadCount += 1;
            }
        }

        const data = Array.from(map.values()).sort(
            (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
        );

        return res.json({ success: true, data });
    } catch (e) {
        console.error("GET /chat/conversations failed:", e);
        return res.status(500).json({ success: false, error: "Failed to load conversations." });
    }
});

/**
 * GET /api/chat/thread/:partnerId
 * Pravý panel:
 * - všetky správy medzi mnou a partnerom
 * - zoradené chronologicky (ASC)
 */
router.get("/thread/:partnerId", authenticate, async (req, res) => {
    try {
        const userId = Number(req.user?.id ?? req.userId);
        const partnerId = Number(req.params.partnerId);

        if (!userId) {
            return res.status(401).json({ success: false, error: "Not authenticated" });
        }
        if (!Number.isInteger(partnerId)) {
            return res.status(400).json({ success: false, error: "Invalid partnerId" });
        }

        const msgs = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, recipientId: partnerId },
                    { senderId: partnerId, recipientId: userId },
                ],
            },
            orderBy: { createdAt: "asc" },
        });

        const data = msgs.map((m) => ({
            id: m.id,
            value: m.value,
            senderId: m.senderId,
            recipientId: m.recipientId,
            createdAt: m.createdAt.toISOString(),
            readAt: m.readAt ? m.readAt.toISOString() : null,
        }));

        return res.json({ success: true, data });
    } catch (e) {
        console.error("GET /chat/thread failed:", e);
        return res.status(500).json({ success: false, error: "Failed to load thread." });
    }
});

/**
 * POST /api/chat/send
 * Body: { recipientId, value }
 */
router.post("/send", authenticate, async (req, res) => {
    try {
        const userId = Number(req.user?.id ?? req.userId);
        const { recipientId, value } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, error: "Not authenticated" });
        }
        if (!recipientId || !value || !String(value).trim()) {
            return res.status(400).json({ success: false, error: "Missing recipientId/value" });
        }

        const created = await prisma.message.create({
            data: {
                senderId: userId,
                recipientId: Number(recipientId),
                value: String(value).trim(),
                notified: false,
                readAt: null,
            },
        });

        return res.status(201).json({
            success: true,
            data: {
                id: created.id,
                value: created.value,
                senderId: created.senderId,
                recipientId: created.recipientId,
                createdAt: created.createdAt.toISOString(),
            },
        });
    } catch (e) {
        console.error("POST /chat/send failed:", e);
        return res.status(500).json({ success: false, error: "Failed to send message." });
    }
});

/**
 * POST /api/chat/mark-read/:partnerId
 * Označí ako prečítané všetky správy od partnera -> mne, ktoré sú unread.
 */
router.post("/mark-read/:partnerId", authenticate, async (req, res) => {
    try {
        const userId = Number(req.user?.id ?? req.userId);
        const partnerId = Number(req.params.partnerId);

        if (!userId) {
            return res.status(401).json({ success: false, error: "Not authenticated" });
        }

        const now = new Date();

        const result = await prisma.message.updateMany({
            where: {
                senderId: partnerId,
                recipientId: userId,
                readAt: null,
            },
            data: {
                readAt: now,
            },
        });

        return res.json({ success: true, updatedCount: result.count });
    } catch (e) {
        console.error("POST /chat/mark-read failed:", e);
        return res.status(500).json({ success: false, error: "Failed to mark read." });
    }
});

module.exports = router;

