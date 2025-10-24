const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;

// Requires
const routes = require("./src/routes/routes");
const errorHandler = require("./src/middleware/errorHandler");

app.use("/api", routes);
app.use((req, res, next) => {
    const err = new Error("Route not found");
    err.statusCode = 404;
    next(err);
});
app.use(errorHandler);
app.use(express.json());

// Start server
app.listen(PORT, () => {
    console.log(`\nServer is running!\n`);
    console.log(`Open in browser: http://localhost:${PORT}\n`);
});
