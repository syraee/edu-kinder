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

const FRONTEND_URL = normalizeBaseUrl(process.env.FRONTEND_URL);
const BACKEND_URL = normalizeBaseUrl(process.env.BACKEND_URL) || "http://localhost:5000";

/**
 * -------------------------------------------------------------
 * DYNAMICKÁ DETEKCIA URL
 * Zistí, kam má smerovať odkaz v maily podľa toho, kto backend volá.
 * Priorita: 
 * 1. x-forwarded-host (volanie z tvojho Next.js serverApiFetch)
 * 2. origin/referer (priame volanie z prehliadača)
 * 3. Fallback na FRONTEND_URL (.env)
 * -------------------------------------------------------------
 */
function getDynamicFrontendUrl(req) {
  const forwardedHost = req.headers["x-forwarded-host"];
  const origin = req.headers.origin || "";
  const referer = req.headers.referer || "";

  // 1. Z hlavičky, ktorú sme ručne pridali do Next.js
  if (forwardedHost && forwardedHost.includes("localhost")) {
    return normalizeBaseUrl(forwardedHost);
  }

  // 2. Ak príde požiadavka z prehliadača
  const source = origin.includes("localhost") ? origin : (referer.includes("localhost") ? referer : null);
  if (source) {
    try {
      const url = new URL(source);
      return `${url.protocol}//${url.host}`;
    } catch (e) {
      return "http://localhost:3000";
    }
  }

  // 3. Predvolená produkcia (edukinder.sk)
  return FRONTEND_URL;
}

// Pomocná funkcia pre stavanie bezpečných linkov
function buildUrl(baseUrl, path = "/") {
  const p = String(path || "/");
  return `${normalizeBaseUrl(baseUrl)}${p.startsWith("/") ? "" : "/"}${p}`;
}

/**
 * -------------------------------------------------------------
 * COOKIE OPTIONS (Dôležité pre localhost vývoj proti Renderu)
 * -------------------------------------------------------------
 */
function cookieBaseOptions(req) {
  const isProd = process.env.NODE_ENV === "production";
  
  const forwardedHost = req?.headers["x-forwarded-host"] || "";
  const origin = req?.headers.origin || "";
  const referer = req?.headers.referer || "";
  
  // Ak sa backend rozpráva s localhostom, musíme vypnúť 'secure', 
  // inak prehliadač cookie odmietne prijať (lebo localhost nemá HTTPS)
  const isLocal = forwardedHost.includes("localhost") || origin.includes("localhost") || referer.includes("localhost");

  return {
    httpOnly: true,
    secure: isLocal ? false : isProd, 
    sameSite: isLocal ? "lax" : "none", // V produkcii medzi 2 doménami (render/vercel) musí byť "none" a secure: true
    path: "/",
  };
}

// -------------------- REGISTER INVITATIONS --------------------

router.post("/register/request", authenticate, authorize(["Admin"]), async (req, res) => {
  const { emails } = req.body;
  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: "Zoznam emailov je prázdny alebo neplatný." });
  }

  // Dynamicky zistíme, aký je frontend pre tento request
  const dynamicBase = getDynamicFrontendUrl(req);
  const results = { sent: [], skipped: [], failed: [] };

  for (const email of emails) {
    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (!existing || existing.active) {
        results.skipped.push({ email, reason: "Neexistuje alebo už aktívny" });
        continue;
      }

      const token = generateToken(existing.id, email, existing.roleId, "registration", "3d");
      
      // Vytvorenie dynamického odkazu na registráciu
      const regLink = buildUrl(dynamicBase, `/register?token=${encodeURIComponent(token)}`);
      
      await sendInvitationMail(email, regLink); 
      results.sent.push(email);
    } catch (err) {
      results.failed.push({ email, reason: "Chyba pri odosielaní" });
    }
  }

  return res.status(200).json({ message: "Spracovanie dokončené.", details: results });
});

router.post("/register/prefill", async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ error: "Chýba token." });
    
    const result = await verifyToken(token, "registration");
    if (!result) return res.status(401).json({ error: "Neplatný alebo expirovaný token." });
    
    const { user } = result;
    if (user.active) return res.status(409).json({ error: "Registrácia už bola dokončená. Môžete sa prihlásiť.", redirectUrl: "/login" });
    
    const links = await prisma.childGuardian.findMany({ where: { userId: user.id }, include: { child: true }, orderBy: { id: "asc" } });
    const children = links.map((l) => ({ id: l.child.id, firstName: l.child.firstName || "", lastName: l.child.lastName || "", birthDate: l.child.birthDate ? l.child.birthDate.toISOString().slice(0, 10) : "" }));
    
    return res.json({ parent: { firstName: user.firstName || "", lastName: user.lastName || "", email: user.email || "", phone: user.phone || "" }, children });
  } catch (err) { return res.status(500).json({ error: "Server error" }); }
});

router.post("/register/complete", async (req, res) => {
  try {
    const { token, parent } = req.body || {};
    const result = await verifyToken(token, "registration");
    if (!result) return res.status(401).json({ error: "Neplatný token." });
    const { user } = result;
    
    await prisma.user.update({ 
      where: { id: user.id }, 
      data: { 
        firstName: String(parent.firstName).trim(), 
        lastName: String(parent.lastName).trim(), 
        email: String(parent.email).trim().toLowerCase(), 
        phone: String(parent.phone).trim(), 
        active: true 
      } 
    });
    return res.json({ message: "Registrácia dokončená." });
  } catch (err) { return res.status(500).json({ error: "Server error" }); }
});

router.get("/register/verify", async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = verify(token, process.env.JWT_SECRET);
    if (decoded.type !== "registration") return res.status(400).json({ error: "Neplatný typ tokenu" });
    res.json({ message: "Účet aktivovaný!" });
  } catch (err) { res.status(400).json({ error: "Neplatný token" }); }
});

// -------------------- AUTH ME & LOGOUT --------------------

router.get("/me", authenticate, (req, res) => {
  const u = req.user;
  if (!u?.id) return res.status(401).json({ user: null });
  const roleText = typeof u.role === "string" ? u.role : u.role?.name || u.roleId || "";
  res.setHeader("Cache-Control", "no-store");
  return res.json({ user: { id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email, role: roleText } });
});

router.post("/logout", (req, res) => {
  // Odošleme req do cookie funkcie pre prípad, že si na localhoste
  const base = cookieBaseOptions(req);
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

  // ✅ Tu sa udeje mágia. Zistí či prišiel dopyt z edukinder.sk alebo z localhostu
  const dynamicBase = getDynamicFrontendUrl(req);
  
  // ✅ Link sa pošle dynamicky s ohľadom na prostredie
  const link = buildUrl(dynamicBase, `/api/auth/login/verify?token=${encodeURIComponent(token)}`);

  console.log("[LOGIN LINK VYTVORENY PRE]:", link);

  try {
    await sendLoginMail(loginUser.email, link);
    return res.json({ message: "Na váš e-mail bol odoslaný prihlasovací odkaz." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Chyba pri odosielaní mailu." });
  }
});

router.get("/login/verify", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send("Chýba token");

    const { user } = await verifyToken(String(token), "login");

    const accessToken = generateToken(user.id, user.email, user.role, "access", "2h");
    const refreshToken = generateToken(user.id, user.email, user.role, "refresh", "7d");

    // Nastavíme cookies s ohľadom na prostredie
    const base = cookieBaseOptions(req);

    res.cookie("refreshToken", refreshToken, { ...base, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie("accessToken", accessToken, { ...base, maxAge: 2 * 60 * 60 * 1000 });

    // Kam presmerovať užívateľa po úspešnom prihlásení
    const dynamicBase = getDynamicFrontendUrl(req);
    return res.redirect(303, buildUrl(dynamicBase, "/"));
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
    
    const base = cookieBaseOptions(req);
    res.cookie("accessToken", newAccessToken, { ...base, maxAge: 2 * 60 * 60 * 1000 });

    return res.json({ success: true });
  } catch (err) {
    const base = cookieBaseOptions(req);
    res.cookie("accessToken", "", { ...base, maxAge: 0 });
    res.cookie("refreshToken", "", { ...base, maxAge: 0 });
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

module.exports = router;
