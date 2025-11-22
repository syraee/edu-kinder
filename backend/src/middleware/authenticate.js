const {verifyToken, generateToken} = require("../utils/jwt");

async function authenticate(req, res, next) {
    try {
        const accessToken = (req.cookies?.accessToken) || req.headers["authorization"]?.split(" ")[1];
        const refreshToken = req.cookies?.refreshToken;


        if (!accessToken) {
            return res.status(401).json({error: "Neautorizovaný prístup."});
        }


        try {
            const {user} = await verifyToken(accessToken, "access");
            req.user = user;
            return next();
        } catch (err) {
            console.warn("Access token neplatný", err.message);

            if (err.name !== "TokenExpiredError") {
                return res.status(401).json({ error: "Neplatný token." });
            }
        }


        if (!refreshToken) {
            return res.status(401).json({error: "Neautorizovaný prístup."});
        }
        try {
            const {decoded, user} = await verifyToken(refreshToken, "refresh");

            const newAccessToken = generateToken(
                user.id,
                user.email,
                user.role,
                "access",
                "2h"
            );

            res.cookie("accessToken", newAccessToken, {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                maxAge: 2 * 60 * 60 * 1000,
            });
            req.user = user;
            return next();
        } catch (err) {
            console.warn("Refresh token neplatný alebo expirovaný:", err.message);
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            return res.status(401).json({error: "Session expirovala, prihlás sa znova."});
        }
    } catch (err) {
        console.error("Auth error:", err);
        return res.status(403).json({error: "Neplatný alebo expirovaný token."});
    }
}

module.exports = authenticate;