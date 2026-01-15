require("dotenv").config()
const path = require("path");
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const cors = require('cors');
const routes = require("./src/routes/routes");
const errorHandler = require("./src/middleware/errorHandler");
const swaggerFile = require("./swagger-output.json");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 5000;
const ORIGIN = 'http://localhost:3000';
app.use(cors({ origin: ORIGIN, credentials: true }));

// fallback, keby niečo prešlo mimo cors() – nech je 100% istota
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', ORIGIN);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

//Middleware
app.use(express.json());
app.use(cookieParser());
app.use("/api", routes);
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
const uploadsDir = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsDir));

app.use((req, _res, next) => { console.log(req.method, req.path); next(); });

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
