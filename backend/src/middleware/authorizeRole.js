function authorize(allowedRoles = []) {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: "Neautorizovaný prístup." });
            }

            if (allowedRoles.length === 0) {
                return next();
            }

            console.log(req.user.role.type);

            if (!allowedRoles.includes(req.user.role.type)) {
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
