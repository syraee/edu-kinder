function authorize(allowedRoles = []) {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: "Neautorizovaný prístup." });
            }

            if (allowedRoles.length === 0) {
                return next();
            }

            // Check if role exists
            if (!req.user.role) {
                console.error("User has no role:", req.user);
                return res.status(403).json({ error: "Používateľ nemá priradenú rolu." });
            }

            const userRoleType = req.user.role.type;
            console.log("User role type:", userRoleType, "Allowed roles:", allowedRoles);

            // Case-insensitive comparison
            const userRoleUpper = String(userRoleType || "").toUpperCase();
            const allowedRolesUpper = allowedRoles.map(r => String(r).toUpperCase());

            if (!allowedRolesUpper.includes(userRoleUpper)) {
                console.error(`Access denied: User role '${userRoleType}' not in allowed roles:`, allowedRoles);
                return res
                    .status(403)
                    .json({ error: "Nemáte oprávnenie pre túto akciu." });
            }

            next();
        } catch (err) {
            console.error("Authorize middleware error:", err);
            return res.status(500).json({ error: "Chyba pri overovaní oprávnenia." });
        }
    };
}

module.exports = authorize;
