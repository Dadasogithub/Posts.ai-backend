import express from "express";
import Post from "../models/Post.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all posts
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = search ? {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const posts = await Post.find(query)
      .populate('author', 'email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create post
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = new Post({
      title,
      content,
      author: req.user.id
    });
    await post.save();
    await post.populate('author', 'email');
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update post
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, author: req.user.id },
      { title, content, updatedAt: Date.now() },
      { new: true }
    ).populate('author', 'email');

    if (!post) return res.status(404).json({ error: "Post not found or unauthorized" });
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete post
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.user.id });
    if (!post) return res.status(404).json({ error: "Post not found or unauthorized" });
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;