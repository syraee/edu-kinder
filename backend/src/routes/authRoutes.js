const express = require("express");
const prisma = require("../../prisma/client");
const { generateToken, verifyToken } = require("../utils/jwt");
const { verify } = require("jsonwebtoken");
const { sendInvitationMail, sendLoginMail } = require("../utils/mailer.js");
const authenticate = require("../middleware/authenticate.js");
const authorize = require("../middleware/authorizeRole.js");

const router = express.Router();

/**
 * Normalize base URL (remove trailing slash).
 */
function normalizeBaseUrl(url) {
  if (!url) return "";
  return String(url).trim().replace(/\/+$/, "");
}

const FRONTEND_URL = normalizeBaseUrl(process.env.FRONTEND_URL) || "http://localhost:3000";
const BACKEND_URL = normalizeBaseUrl(process.env.BACKEND_URL) || "http://localhost:5000";

// --- helpers for building links ---
function frontend(path = "/") {
  const p = String(path || "/");
  return `${FRONTEND_URL}${p.startsWith("/") ? "" : "/"}${p}`;
}

function backend(path = "/") {
  const p = String(path || "/");
  return `${BACKEND_URL}${p.startsWith("/") ? "" : "/"}${p}`;
}

/**
 * Unified cookie options (works for localhost + production).
 * - path: "/" ensures cookie is sent to /api/auth/me etc.
 * - sameSite: "lax" is stable for email-link logins and redirects.
 * - secure is only true in production (https).
 */
function cookieBaseOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
  };
}

// -------------------- REGISTER INVITATIONS --------------------

router.post("/register/request", authenticate, authorize(["Admin"]), async (req, res) => {
  const { emails } = req.body;

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: "Zoznam emailov je prázdny alebo neplatný." });
  }

  const results = { sent: [], skipped: [], failed: [] };

  for (const email of emails) {
    try {
      const existing = await prisma.user.findUnique({ where: { email } });

      if (!existing) {
        results.skipped.push({ email, reason: "Používateľ neexistuje" });
        continue;
      }

      if (existing.active) {
        results.skipped.push({ email, reason: "Už registrovaný používateľ" });
        continue;
      }

      const token = generateToken(existing.id, email, existing.roleId, "registration", "3d");

      await sendInvitationMail(email, token);
      results.sent.push(email);
    } catch (err) {
      console.error(`Nepodarilo sa odoslať pozvánku na ${email}:`, err);
      results.failed.push({ email, reason: "Chyba pri odosielaní" });
    }
  }

  return res.status(200).json({
    message: "Spracovanie dokončené.",
    summary: {
      sent: results.sent.length,
      skipped: results.skipped.length,
      failed: results.failed.length,
    },
    details: results,
  });
});

router.post("/register/prefill", async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ error: "Chýba token." });

    const result = await verifyToken(token, "registration");
    if (!result) return res.status(401).json({ error: "Neplatný alebo expirovaný token." });

    const { user } = result;

    if (user.active) {
      return res.status(409).json({
        error: "Registrácia je už dokončená. Môžete sa prihlásiť.",
        redirectUrl: "/login",
      });
    }

    const links = await prisma.childGuardian.findMany({
      where: { userId: user.id },
      include: { child: true },
      orderBy: { id: "asc" },
    });

    const children = links.map((l) => ({
      id: l.child.id,
      firstName: l.child.firstName || "",
      lastName: l.child.lastName || "",
      birthDate: l.child.birthDate ? l.child.birthDate.toISOString().slice(0, 10) : "",
    }));

    return res.json({
      parent: {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      },
      children,
    });
  } catch (err) {
    console.error("prefill error:", err);
    return res.status(500).json({ error: "Server zlyhal pri načítaní údajov." });
  }
});

router.post("/register/complete", async (req, res) => {
  try {
    const { token, parent, childIds } = req.body || {};
    if (!token) return res.status(400).json({ error: "Chýba token." });
    if (!parent) return res.status(400).json({ error: "Chýbajú údaje rodiča." });

    const result = await verifyToken(token, "registration");
    if (!result) return res.status(401).json({ error: "Neplatný alebo expirovaný token." });

    const { user } = result;

    if (Array.isArray(childIds) && childIds.length > 0) {
      const ids = childIds.map(Number);
      const guardians = await prisma.childGuardian.findMany({
        where: { userId: user.id, childId: { in: ids } },
        select: { childId: true },
      });
      const owned = new Set(guardians.map((g) => g.childId));
      const allMatch = ids.every((id) => owned.has(id));
      if (!allMatch) return res.status(403).json({ error: "Zoznam detí nezodpovedá priradeným deťom." });
    }

    const firstName = String(parent.firstName || "").trim();
    const lastName = String(parent.lastName || "").trim();
    const email = String(parent.email || "").trim().toLowerCase();
    const phone = String(parent.phone || "").trim();

    await prisma.user.update({
      where: { id: user.id },
      data: { firstName, lastName, email, phone, active: true },
    });

    return res.json({ message: "Registrácia dokončená a účet aktivovaný." });
  } catch (err) {
    console.error("registration/complete error:", err);
    return res.status(500).json({ error: "Server zlyhal pri ukladaní registrácie." });
  }
});

router.get("/register/verify", async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "registration") {
      return res.status(400).json({ error: "Neplatný typ tokenu" });
    }

    res.json({ message: "Účet bol úspešne aktivovaný!" });
  } catch (err) {
    res.status(400).json({ error: "Neplatný alebo expirovaný token" });
  }
});

// -------------------- AUTH ME --------------------

router.get("/me", authenticate, (req, res) => {
  try {
    const u = req.user;
    if (!u?.id) return res.status(401).json({ user: null });

    const roleText =
      typeof u.role === "string" ? u.role : u.role?.name || u.role?.code || u.role?.type || u.roleId || "";

    res.setHeader("Cache-Control", "no-store");
    return res.json({
      user: { id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email, role: roleText },
    });
  } catch (err) {
    console.error("GET /api/auth/me error:", err);
    return res.status(500).json({ user: null, error: "Internal error" });
  }
});

// -------------------- LOGOUT --------------------

router.post("/logout", (req, res) => {
  const base = cookieBaseOptions();

  res.cookie("accessToken", "", { ...base, maxAge: 0 });
  res.cookie("refreshToken", "", { ...base, maxAge: 0 });

  return res.json({ ok: true });
});

// -------------------- LOGIN (PASSWORDLESS) --------------------

router.post("/login/request", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email je povinný" });

  const loginUser = await prisma.user.findUnique({ where: { email: String(email).trim().toLowerCase() } });
  if (!loginUser) return res.status(404).json({ error: "Používateľ neexistuje" });

  const token = generateToken(loginUser.id, loginUser.email, loginUser.roleId, "login", "15m");

  /**
   * ✅ DÔLEŽITÉ:
   * Link v emaili má smerovať na FRONTEND (Next route /api/auth/verify),
   * nie na BACKEND. Frontend potom zavolá backend /login/verify a prekopíruje cookies.
   */
  const link = frontend(`/api/auth/login/verify?token=${encodeURIComponent(token)}`);

  await sendLoginMail(loginUser.email, link);
    console.log("[LOGIN LINK]", link);

  return res.json({ message: "Na váš e-mail bol odoslaný prihlasovací odkaz." });
});

/**
 * (Optional) POST verify – ak niekde používaš token posielaný v body.
 * Držíme to konzistentné s cookieBaseOptions().
 */
router.post("/login/verify", async (req, res) => {
    const {token} = req.body;

    try {
        const {decoded, user} = await verifyToken(token, "login")

        const accessToken = generateToken(
            user.id,
            user.email,
            user.role.name,
            "access",
            "7d"
        );

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.redirect(303, "http://localhost:3000/");
    } catch (err) {
        console.error(err);
        return res.status(401).json({error: "Neplatný alebo expirovaný token."});
    }
});

/**
 * GET verify – používa sa pri kliknutí na email link (cez backend, alebo cez frontend proxy).
 */
router.get("/login/verify", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send("Missing token");

    const { user } = await verifyToken(String(token), "login");

    const accessToken = generateToken(user.id, user.email, user.role, "access", "2h");
    const refreshToken = generateToken(user.id, user.email, user.role, "refresh", "7d");

    const base = cookieBaseOptions();

    res.cookie("refreshToken", refreshToken, {
      ...base,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", accessToken, {
      ...base,
      maxAge: 2 * 60 * 60 * 1000,
    });

    return res.redirect(303, frontend("/"));
  } catch (err) {
    console.error("GET /login/verify failed:", err);
    return res.status(401).send("Neplatný alebo expirovaný token.");
  }
});

// -------------------- REFRESH --------------------

router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.cookies || {};
    if (!refreshToken) return res.status(401).json({ error: "Missing refresh token" });

    const { user } = await verifyToken(refreshToken, "refresh");

    const newAccessToken = generateToken(user.id, user.email, user.role, "access", "2h");

    const base = cookieBaseOptions();

    res.cookie("accessToken", newAccessToken, {
      ...base,
      maxAge: 2 * 60 * 60 * 1000,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("refresh failed:", err);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

module.exports = router;
