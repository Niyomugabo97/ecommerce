import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHmac, randomInt, timingSafeEqual } from "crypto";
import User from "../models/userModel";
import {
  sendPasswordResetCodeEmail,
  sendWelcomeEmail,
} from "../services/emailService";

const hashResetCode = (code: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return createHmac("sha256", secret).update(code).digest("hex");
};

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(
    { userId },
    secret,
    {
      expiresIn: "1d",
    }
  );
};

// REGISTER
export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      message: "User registered successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },

      token,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Registration failed",
    });
  }
};

// LOGIN
export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(200).json({
      message: "Login successful",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },

      token,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Login failed",
    });
  }
};

// REQUEST PASSWORD RESET
export const requestPasswordReset = async (
  req: Request,
  res: Response
) => {
  try {
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (user) {
      const code = randomInt(100000, 1000000).toString();
      user.resetPasswordCodeHash = hashResetCode(code);
      user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      await sendPasswordResetCodeEmail(user.email, code);
    }

    return res.status(200).json({
      message: "If an account exists for that email, a reset code has been sent.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to send reset code" });
  }
};

// RESET PASSWORD
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;

    if (
      typeof email !== "string" ||
      typeof code !== "string" ||
      typeof newPassword !== "string" ||
      !email.trim() ||
      !code.trim() ||
      !newPassword
    ) {
      return res.status(400).json({
        message: "Email, code, and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters",
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    const storedHash = user?.resetPasswordCodeHash;
    const expiresAt = user?.resetPasswordExpires;

    if (!user || !storedHash || !expiresAt || expiresAt.getTime() <= Date.now()) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    const submittedHash = Buffer.from(hashResetCode(code.trim()), "hex");
    const expectedHash = Buffer.from(storedHash, "hex");

    if (
      submittedHash.length !== expectedHash.length ||
      !timingSafeEqual(submittedHash, expectedHash)
    ) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordCodeHash = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to reset password" });
  }
};