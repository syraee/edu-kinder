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

const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = normalizeBaseUrl(process.env.BACKEND_URL) || "http://localhost:5000";

// --- UPRAVENÝ HELPER PRE LINKY ---
// Pridaný parameter requestUrl, aby sme vedeli dynamicky určiť cieľ
function frontend(path = "/", requestUrl = null) {
  const p = String(path || "/");
  let base = FRONTEND_URL;

  // Ak požiadavka prišla z localhostu, prepíšeme základnú URL na localhost
  if (requestUrl && requestUrl.includes("localhost")) {
    try {
      const urlParsed = new URL(requestUrl);
      base = `${urlParsed.protocol}//${urlParsed.host}`;
    } catch (e) {
      base = FRONTEND_URL;
    }
  }

  return `${normalizeBaseUrl(base)}${p.startsWith("/") ? "" : "/"}${p}`;
}

function backend(path = "/") {
  const p = String(path || "/");
  return `${BACKEND_URL}${p.startsWith("/") ? "" : "/"}${p}`;
}

/**
 * Unified cookie options.
 * POZOR: Ak vyvíjaš lokálne proti Renderu, 'secure: true' môže blokovať uloženie cookies na localhoste (HTTP).
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
  const origin = req.headers.origin || req.headers.referer;

  for (const email of emails) {
    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (!existing || existing.active) {
        results.skipped.push({ email, reason: "Neexistuje alebo už aktívny" });
        continue;
      }

      const token = generateToken(existing.id, email, existing.roleId, "registration", "3d");
      
      // Aj pri registrácii teraz link rešpektuje odkiaľ prišla požiadavka
      const regLink = frontend(`/register?token=${encodeURIComponent(token)}`, origin);
      await sendInvitationMail(email, regLink); 
      
      results.sent.push(email);
    } catch (err) {
      results.failed.push({ email, reason: "Chyba pri odosielaní" });
    }
  }

  return res.status(200).json({ message: "Spracovanie dokončené.", details: results });
});

// ... (ostatné registračné routy ostávajú nezmenené) ...

router.post("/register/prefill", async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ error: "Chýba token." });
    const result = await verifyToken(token, "registration");
    if (!result) return res.status(401).json({ error: "Neplatný alebo expirovaný token." });
    const { user } = result;
    if (user.active) return res.status(409).json({ error: "Už registrovaný.", redirectUrl: "/login" });
    const links = await prisma.childGuardian.findMany({ where: { userId: user.id }, include: { child: true }, orderBy: { id: "asc" } });
    const children = links.map((l) => ({ id: l.child.id, firstName: l.child.firstName || "", lastName: l.child.lastName || "", birthDate: l.child.birthDate ? l.child.birthDate.toISOString().slice(0, 10) : "" }));
    return res.json({ parent: { firstName: user.firstName || "", lastName: user.lastName || "", email: user.email || "", phone: user.phone || "" }, children });
  } catch (err) { return res.status(500).json({ error: "Server error" }); }
});

router.post("/register/complete", async (req, res) => {
  try {
    const { token, parent, childIds } = req.body || {};
    const result = await verifyToken(token, "registration");
    if (!result) return res.status(401).json({ error: "Neplatný token." });
    const { user } = result;
    await prisma.user.update({ where: { id: user.id }, data: { firstName: String(parent.firstName).trim(), lastName: String(parent.lastName).trim(), email: String(parent.email).trim().toLowerCase(), phone: String(parent.phone).trim(), active: true } });
    return res.json({ message: "Registrácia dokončená." });
  } catch (err) { return res.status(500).json({ error: "Server error" }); }
});

// -------------------- AUTH ME & LOGOUT --------------------

router.get("/me", authenticate, (req, res) => {
  const u = req.user;
  if (!u?.id) return res.status(401).json({ user: null });
  const roleText = typeof u.role === "string" ? u.role : u.role?.name || u.roleId || "";
  return res.json({ user: { id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email, role: roleText } });
});

router.post("/logout", (req, res) => {
  const base = cookieBaseOptions();
  res.cookie("accessToken", "", { ...base, maxAge: 0 });
  res.cookie("refreshToken", "", { ...base, maxAge: 0 });
  return res.json({ ok: true });
});

// -------------------- LOGIN (PASSWORDLESS) - UPRAVENÉ --------------------

router.post("/login/request", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email je povinný" });

  const loginUser = await prisma.user.findUnique({ where: { email: String(email).trim().toLowerCase() } });
  if (!loginUser) return res.status(404).json({ error: "Používateľ neexistuje" });

  const token = generateToken(loginUser.id, loginUser.email, loginUser.roleId, "login", "15m");

  // ✅ Získame Origin (napr. http://localhost:3000 alebo https://tvoj-web.sk)
  const origin = req.headers.origin || req.headers.referer;

  // ✅ Funkcia frontend teraz dynamicky určí, či má vrátiť localhost alebo produkčnú URL
  const link = frontend(`/api/auth/login/verify?token=${encodeURIComponent(token)}`, origin);

  await sendLoginMail(loginUser.email, link);
  console.log("[LOGIN LINK POSLANÝ NA]", link);

  return res.json({ message: "Na váš e-mail bol odoslaný prihlasovací odkaz." });
});

router.get("/login/verify", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send("Missing token");

    const { user } = await verifyToken(String(token), "login");

    // Tu použijeme referer, aby sme vedeli, kam po prihlásení redirectnúť (späť na localhost alebo web)
    const origin = req.headers.referer;

    const accessToken = generateToken(user.id, user.email, user.role, "access", "2h");
    const refreshToken = generateToken(user.id, user.email, user.role, "refresh", "7d");

    const base = cookieBaseOptions();

    res.cookie("refreshToken", refreshToken, { ...base, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie("accessToken", accessToken, { ...base, maxAge: 2 * 60 * 60 * 1000 });

    return res.redirect(303, frontend("/", origin));
  } catch (err) {
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
    res.cookie("accessToken", newAccessToken, { ...base, maxAge: 2 * 60 * 60 * 1000 });
    return res.json({ success: true });
  } catch (err) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

module.exports = router;
