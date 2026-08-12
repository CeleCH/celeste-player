import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";
import musicRoutes from "./routes/musicRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow streaming media sources to load correctly in frontend
}));

// CORS Configuration
app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  credentials: true,
}));

// Rate Limiter to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas peticiones. Por favor, inténtalo de nuevo más tarde." },
});
app.use(limiter);

// Body Parsers
app.use(express.json());

// Routes
app.use("/api", musicRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Backend Error:", err);
  res.status(500).json({
    error: "Ocurrió un error interno en el servidor musical.",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🎵 Celeste Backend running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
