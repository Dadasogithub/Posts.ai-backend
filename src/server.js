
import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/demo");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});