const express = require("express");
const app = express();

const PORT = process.env.PORT || 5000;

// Requires
const routes = require("./src/routes/routes");
const errorHandler = require("./src/middleware/errorHandler");

//Middleware
app.use(express.json());
app.use("/api", routes);

//Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`\nServer is running!\n`);
    console.log(`Open in browser: http://localhost:${PORT}\n`);
});
