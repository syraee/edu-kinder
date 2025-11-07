const { verifyToken } = require("../utils/jwt");

async function authenticate(req, res, next) {
    try {
        const token = (req.cookies?.accessToken) || req.headers["authorization"]?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "Neautorizovaný prístup." });
        }

        const { decoded, user } = await verifyToken(token, "access");

        if (!user) {
            return res.status(404).json({ error: "Používateľ neexistuje." });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("Auth error:", err);
        return res.status(403).json({ error: "Neplatný alebo expirovaný token." });
    }
}

module.exports = authenticate;