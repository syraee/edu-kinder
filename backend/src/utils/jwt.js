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
            const err = new Error(
                `Token type mismatch: expected ${expectedType}, got ${decoded.type}`
            );
            err.name = "TokenTypeMismatchError";
            throw err;
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { role: true },
        });

        if (!user) {
            console.warn(`User not found with id ${decoded.userId}`);
            const err = new Error(`User not found with id ${decoded.userId}`);
            err.name = "UserNotFoundError";
            throw err;
        }

        return {decoded, user};

}

module.exports = { generateToken, verifyToken };