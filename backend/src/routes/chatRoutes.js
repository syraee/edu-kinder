const express = require("express");
const prisma = require("../../prisma/client");
const authenticate = require("../middleware/authenticate");

const {sendNewMessageEmail} = require("../utils/mailer.js");

const router = express.Router();

const path = require("path");
const fs = require("fs");
const multer = require("multer");

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function safeBaseName(name) {
    return String(name).replace(/[^\w.\-() ]+/g, "_");
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ts = Date.now();
        const base = safeBaseName(file.originalname || "file");
        cb(null, `${ts}_${base}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 },
});


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
            isAttachment: m.isAttachment,
            attachmentName: m.attachmentName,
            attachmentMime: m.attachmentMime,
            attachmentSize: m.attachmentSize,

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
router.post("/send", authenticate, upload.single("file"), async (req, res) => {
    try {
        const userId = Number(req.user?.id ?? req.userId);
        const recipientId = Number(req.body?.recipientId);
        const text = String(req.body?.value ?? "").trim();

        if (!userId) return res.status(401).json({ success: false, error: "Not authenticated" });
        if (!Number.isInteger(recipientId)) {
            return res.status(400).json({ success: false, error: "Missing recipientId" });
        }

        const file = req.file ?? null;

        if (!file && !text) {
            return res.status(400).json({ success: false, error: "Missing value or file" });
        }

        const isAttachment = Boolean(file);

        const value = isAttachment ? path.join("uploads", file.filename).replace(/\\/g, "/") : text;

        const created = await prisma.message.create({
            data: {
                senderId: userId,
                recipientId,
                value,
                isAttachment,
                attachmentName: isAttachment ? file.originalname : null,
                attachmentMime: isAttachment ? file.mimetype : null,
                attachmentSize: isAttachment ? file.size : null,
                notified: false,
                readAt: null,
            },
            include: {
                sender: { select: { id: true, email: true, firstName: true, lastName: true } },
                recipient: { select: { id: true, email: true, firstName: true, lastName: true } },
            },
        });

        if (!created.notified && created.recipient?.email) {
            const recipientEmail = created.recipient.email;

            const senderName =
                [created.sender?.firstName, created.sender?.lastName].filter(Boolean).join(" ").trim() ||
                created.sender?.email ||
                "Používateľ";


            await sendNewMessageEmail(
                recipientEmail,
                senderName,
                created.value.slice(0, 120),
            );

            await prisma.message.update({
                where: { id: created.id },
                data: { notified: true },
            });
        }

        return res.status(201).json({
            success: true,
            data: {
                id: created.id,
                senderId: created.senderId,
                recipientId: created.recipientId,
                value: created.value,
                isAttachment: created.isAttachment,
                attachmentName: created.attachmentName,
                attachmentMime: created.attachmentMime,
                attachmentSize: created.attachmentSize,
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


/**
 * POST /api/chat/send-bulk
 * Body: { recipientIds: number[], value: string }
 * Pošle rovnakú správu viacerým používateľom (bez skupiny).
 */
router.post("/send-bulk", authenticate, async (req, res) => {
    try {
        const userId = Number(req.user?.id ?? req.userId);
        const { recipientIds, value } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, error: "Not authenticated" });
        }

        const text = typeof value === "string" ? value.trim() : "";
        if (!text) {
            return res.status(400).json({ success: false, error: "Missing value" });
        }

        if (!Array.isArray(recipientIds) || recipientIds.length === 0) {
            return res.status(400).json({ success: false, error: "Missing recipientIds" });
        }


        const ids = Array.from(
            new Set(
                recipientIds
                    .map((x) => Number(x))
                    .filter((x) => Number.isInteger(x) && x > 0 && x !== userId)
            )
        );

        if (ids.length === 0) {
            return res.status(400).json({ success: false, error: "No valid recipients" });
        }


        const sender = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, firstName: true, lastName: true },
        });

        const senderName =
            [sender?.firstName, sender?.lastName].filter(Boolean).join(" ").trim() ||
            sender?.email ||
            "Používateľ";

        const recipients = await prisma.user.findMany({
            where: { id: { in: ids } },
            select: { id: true, email: true },
        });

        if (recipients.length === 0) {
            return res.status(400).json({ success: false, error: "Recipients not found" });
        }


        const preview = text.slice(0, 120);


        const CONCURRENCY = 10;

        async function runWithLimit(items, limit, fn) {
            const results = [];
            let idx = 0;

            async function worker() {
                while (idx < items.length) {
                    const current = items[idx++];
                    try {
                        results.push({ item: current, ok: true, result: await fn(current) });
                    } catch (err) {
                        results.push({ item: current, ok: false, error: err });
                    }
                }
            }

            const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
            await Promise.all(workers);
            return results;
        }

        const emailResults = await runWithLimit(
            recipients.filter((r) => r.email),
            CONCURRENCY,
            async (r) => {
                await sendNewMessageEmail(r.email, senderName, preview);
            }
        );


        const emailedOkIds = new Set(
            emailResults.filter((x) => x.ok).map((x) => x.item.id)
        );


        await prisma.message.createMany({
            data: recipients.map((r) => ({
                senderId: userId,
                recipientId: r.id,
                value: text,
                notified: emailedOkIds.has(r.id),
                readAt: null,
            })),
        });

        const failedEmails = emailResults.filter((x) => !x.ok).map((x) => x.item.id);

        return res.status(201).json({
            success: true,
            data: {
                sentTo: recipients.length,
                emailed: emailedOkIds.size,
                emailFailed: failedEmails.length,

            },
        });
    } catch (e) {
        console.error("POST /chat/send-bulk failed:", e);
        return res.status(500).json({ success: false, error: "Failed to send bulk message." });
    }
});

router.get("/file/:messageId", authenticate, async (req, res) => {
    try {
        const userId = Number(req.user?.id ?? req.userId);
        const messageId = Number(req.params.messageId);

        if (!userId) return res.status(401).json({ success: false, error: "Not authenticated" });
        if (!Number.isInteger(messageId)) return res.status(400).json({ success: false, error: "Invalid id" });

        const msg = await prisma.message.findUnique({ where: { id: messageId } });
        if (!msg || !msg.isAttachment) return res.status(404).json({ success: false, error: "Not found" });

        if (msg.senderId !== userId && msg.recipientId !== userId) {
            return res.status(403).json({ success: false, error: "Forbidden" });
        }

        const absPath = path.join(process.cwd(), msg.value);
        if (!absPath.startsWith(UPLOAD_DIR)) {

            return res.status(400).json({ success: false, error: "Invalid file path" });
        }

        return res.download(absPath, msg.attachmentName || "attachment");
    } catch (e) {
        console.error("GET /chat/file failed:", e);
        return res.status(500).json({ success: false, error: "Failed to download file." });
    }
});

// DELETE /api/chat/message/:id
router.delete("/message/:id", authenticate, async (req, res) => {
    try {
        const userId = Number(req.user?.id ?? req.userId);
        const msgId = Number(req.params.id);

        if (!userId) {
            return res.status(401).json({ success: false, error: "Not authenticated" });
        }
        if (!Number.isInteger(msgId)) {
            return res.status(400).json({ success: false, error: "Invalid message id" });
        }


        const msg = await prisma.message.findUnique({
            where: { id: msgId },
            select: { id: true, senderId: true, recipientId: true },
        });

        if (!msg) {
            return res.status(404).json({ success: false, error: "Message not found" });
        }


        const allowed = msg.senderId === userId || msg.recipientId === userId;
        if (!allowed) {
            return res.status(403).json({ success: false, error: "Forbidden" });
        }

        await prisma.message.delete({ where: { id: msgId } });

        return res.json({ success: true });
    } catch (e) {
        console.error("DELETE /chat/message/:id failed:", e);
        return res.status(500).json({ success: false, error: "Failed to delete message." });
    }
});


module.exports = router;

