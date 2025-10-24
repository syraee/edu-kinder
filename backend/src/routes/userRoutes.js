const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
    try {
        const fail = false;
        if (fail) {
            const error = new Error("Failed to fetch users");
            error.statusCode = 400;
            return next(error);
        }

        res.json({
            success: true,
            data: ["Alice", "Bob", "Charlie"]
        });
    } catch (err) {
        next(err); // všetky neočakávané chyby posielame do error handlera
    }
});

// POST /api/users
router.post("/", (req, res) => {
    res.send("User created");
});

module.exports = router;
