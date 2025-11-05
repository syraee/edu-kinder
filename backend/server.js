require("dotenv").config()
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const routes = require("./src/routes/routes");
const errorHandler = require("./src/middleware/errorHandler");
const swaggerFile = require("./swagger-output.json");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 5000;

//Middleware
app.use(express.json());
app.use("/api", routes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use(cookieParser());

app.get("/", (req, res) => {
    res.redirect("/api-docs");
});


//Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`\nServer is running!\n`);
    console.log(`Open in browser: http://localhost:${PORT}\n`);
});
