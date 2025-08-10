import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
// import helmet from "helmet";
// import rateLimit from "express-rate-limit";

// Routers
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import uploadingRouter from "./routes/uploading.route.js";
import notesRouter from "./routes/notes.route.js";
import adminRoutes from "./routes/admin.route.js";

// Utils
import { verifyToken } from "./utils/verifyUser.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware for JSON body parsing and cookies
app.use(express.json());
app.use(cookieParser());

// Helmet for securing HTTP headers
// app.use(helmet());

// // Rate Limiter to prevent brute-force attacks
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// CORS Configuration
const allowedOrigins = ['http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// Routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/uploading", uploadingRouter);
app.use("/api/notes", notesRouter);
app.use("/api/admin", adminRoutes);

// Optional test route
app.get("/api/test", (req, res) => {
  res.json({ message: "API working fine ✅" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Start Server (after routes/middleware)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
