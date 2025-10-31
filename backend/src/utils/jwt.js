import jwt from "jsonwebtoken";

export function generateRegistrationToken(userId, email) {
    const payload = {
        user_id: userId,
        email,
        type: "registration",
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "3d",
        jwtid: crypto.randomUUID(),
    });

    return token;
}