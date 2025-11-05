import jwt from "jsonwebtoken";
import prisma from "../../prisma/client.js";

export function generateToken(userId, email, role, type, expiresIn) {
    const payload = {
        userId,
        email,
        type,
        role
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: expiresIn,
        jwtid: crypto.randomUUID(),
    });
}

export async function verifyToken(token, expectedType) {
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.type !== expectedType) {
            console.warn(`Token type mismatch: expected ${expectedType}, got ${decoded.type}`);
            return null;
        }

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userId,
            }
        })

        if (!user) {
            console.warn(`User not found with id ${decoded.userId}`);
            return null;
        }

        return {decoded, user};
    }catch (err){
        console.error('Token verification failed', err.message);
        return null;
    }
}