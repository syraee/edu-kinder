import {verifyToken} from "../utils/jwt.js";

export async function authenticate(req, res, next) {
    try {
        console.log(req.cookies);
        const token = (req.cookies?.accessToken) || req.headers["authorization"]?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "Neautorizovaný prístup." });
        }

        const { decoded, user } = await verifyToken(token, "access");

        if (!user) {
            return res.status(404).json({ error: "Používateľ neexistuje." });
        }

        req.user = decoded;
        next();
    } catch (err) {
        console.error("Auth error:", err);
        return res.status(403).json({ error: "Neplatný alebo expirovaný token." });
    }
}
