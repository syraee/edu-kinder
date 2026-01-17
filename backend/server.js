require("dotenv").config();

const path = require("path");
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const routes = require("./src/routes/routes");
const authRoutes = require("./src/routes/authRoutes");
const errorHandler = require("./src/middleware/errorHandler");
const swaggerFile = require("./swagger-output.json");

const app = express();
const PORT = process.env.PORT || 5000;

const allowlist = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl/postman/server-to-server
    if (allowlist.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); 

// Loguj hneď na začiatku (uvidíš aj preflight)
app.use((req, _res, next) => {
  console.log(req.method, req.path, "origin:", req.headers.origin || "-");
  next();
});

// Middleware
app.use(express.json());
app.use(cookieParser());

// Static uploads (stačí 1x)
const uploadsDir = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsDir));

// Routes
app.use("/api", routes);
app.use("/api/auth", authRoutes);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Root
app.get("/", (_req, res) => {
  res.redirect("/api-docs");
});

// Error handler (posledný)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`\nServer is running!\n`);
  console.log(`Local: http://localhost:${PORT}\n`);
  console.log(`Allowed CORS origins:`, allowlist);
});
