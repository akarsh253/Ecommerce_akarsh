import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const signupUser = async (req, res) => {
  const name = String(req.body.name ?? "").trim();
  const email = String(req.body.email ?? "").trim().toLowerCase();
  const password = String(req.body.password ?? "");

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  if (await User.findOne({ email })) {
    return res.status(400).json({ message: "An account with this email already exists" });
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role: adminEmail && email === adminEmail ? "admin" : "user",
  });

  res.status(201).json({
    message: "Account created",
    token: signToken(user._id),
    user: publicUser(user),
  });
};

export const loginUser = async (req, res) => {
  const email = String(req.body.email ?? "").trim().toLowerCase();
  const password = String(req.body.password ?? "");

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email });
  // Same message for both cases so attackers can't tell which emails exist
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  res.json({
    message: "Login successful",
    token: signToken(user._id),
    user: publicUser(user),
  });
};

export const getMe = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};
