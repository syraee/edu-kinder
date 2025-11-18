const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../../prisma/client");

function generateToken(userId, email, role, type, expiresIn) {
    const payload = {
        userId,
        email,
        type,
        role
    };

    const secret = type === "access" ? process.env.JWT_ACCESS_SECRET : type === "refresh" ? process.env.JWT_REFRESH_SECRET : process.env.JWT_LOGIN_SECRET;

    return jwt.sign(payload, secret, {
        expiresIn: expiresIn,
        jwtid: crypto.randomUUID(),
    });
}

async function verifyToken(token, expectedType) {


        const secret =
            expectedType === "access"
                ? process.env.JWT_ACCESS_SECRET
                : expectedType === "refresh"
                    ? process.env.JWT_REFRESH_SECRET
                    : process.env.JWT_LOGIN_SECRET;

        if (!secret) {
            throw new Error(`Missing JWT secret for type: ${expectedType}`);
        }

        const decoded = jwt.verify(token, secret);

        if (decoded.type !== expectedType) {
            console.warn(`Token type mismatch: expected ${expectedType}, got ${decoded.type}`);
            return null;
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { role: true },
        });

        if (!user) {
            console.warn(`User not found with id ${decoded.userId}`);
        }

        return {decoded, user};

}

module.exports = { generateToken, verifyToken };