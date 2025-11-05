export function authorizeRole(allowedRoles = []) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Neautorizovaný prístup." });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Nemáte oprávnenie pre túto akciu." });
        }

        next();
    };
}
