
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";

const app = express();

// CORS configuration for deployment
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Allow your frontend URL
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

 
 
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

app.get("/", (req, res) => res.send("API Running"));

export default app;
