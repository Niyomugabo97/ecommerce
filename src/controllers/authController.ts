
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createHmac,
  randomInt,
  timingSafeEqual,
} from "crypto";

import User from "../models/userModel";
import { AuthRequest } from "../middleware/authMiddleware";

import {
  sendPasswordResetCodeEmail,
  sendWelcomeEmail,
} from "../services/emailService";

import {
  registerSchema,
  loginSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "../validation/auth.validation";

// -----------------------------
// Helper: get JWT secret
// -----------------------------
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
};

// -----------------------------
// Helper: generate JWT token
// -----------------------------
const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    getJwtSecret(),
    { expiresIn: "1d" }
  );
};

// -----------------------------
// Helper: hash password reset code
// -----------------------------
const hashResetCode = (code: string): string => {
  return createHmac("sha256", getJwtSecret())
    .update(code)
    .digest("hex");
};

// -----------------------------
// Helper: format Zod errors
// -----------------------------
const formatValidationErrors = (issues: {
  path: PropertyKey[];
  message: string;
}[]) => {
  return issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
};

// =====================================================
// REGISTER
// POST /api/auth/register
// =====================================================
export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: formatValidationErrors(result.error.issues),
      });
      return;
    }

    const { name, password } = result.data;
    const normalizedEmail = result.data.email.toLowerCase();

    // Check whether the account already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      res.status(409).json({
        message: "An account with this email already exists",
      });
      return;
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Generate the token after the account is created
    const token = generateToken(user._id.toString());

    // Email failure should not make a successfully created
    // account appear to have failed.
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error("Welcome email failed:", emailError);
    }

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Registration failed",
    });
  }
};

// =====================================================
// LOGIN
// POST /api/auth/login
// =====================================================
export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: formatValidationErrors(result.error.issues),
      });
      return;
    }

    const normalizedEmail = result.data.email.toLowerCase();
    const { password } = result.data;

    const user = await User.findOne({
      email: normalizedEmail,
    });

    // Use the same message for an unknown email and a wrong password
    if (!user) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed",
    });
  }
};

export const getCurrentUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select("_id name email role");

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      message: "Unable to get current user",
    });
  }
};

// =====================================================
// REQUEST PASSWORD RESET
// POST /api/auth/forgot-password
// =====================================================
export const requestPasswordReset = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = requestPasswordResetSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: formatValidationErrors(result.error.issues),
      });
      return;
    }

    const normalizedEmail = result.data.email.toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    // Do not reveal whether an email address has an account
    if (user) {
      const code = randomInt(100000, 1000000).toString();

      user.resetPasswordCodeHash = hashResetCode(code);
      user.resetPasswordExpires = new Date(
        Date.now() + 10 * 60 * 1000
      );

      await user.save();

      try {
        await sendPasswordResetCodeEmail(user.email, code);
      } catch (emailError) {
        console.error("Password reset email failed:", emailError);

        // Clear the unusable reset code if delivery failed
        user.resetPasswordCodeHash = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(500).json({
          message: "Unable to send the reset code. Please try again.",
        });
        return;
      }
    }

    res.status(200).json({
      message:
        "If an account exists for that email, a password reset code has been sent.",
    });
  } catch (error) {
    console.error("Request password reset error:", error);

    res.status(500).json({
      message: "Unable to process the password reset request",
    });
  }
};

// =====================================================
// RESET PASSWORD
// POST /api/auth/reset-password
// =====================================================
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = resetPasswordSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: formatValidationErrors(result.error.issues),
      });
      return;
    }

    const normalizedEmail = result.data.email.toLowerCase();
    const { code, newPassword } = result.data;

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user || !user.resetPasswordCodeHash || !user.resetPasswordExpires) {
      res.status(400).json({
        message: "Invalid or expired reset code",
      });
      return;
    }

    // Reject expired reset codes
    if (user.resetPasswordExpires.getTime() <= Date.now()) {
      user.resetPasswordCodeHash = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.status(400).json({
        message: "Invalid or expired reset code",
      });
      return;
    }

    const submittedCodeHash = Buffer.from(hashResetCode(code), "hex");
    const savedCodeHash = Buffer.from(
      user.resetPasswordCodeHash,
      "hex"
    );

    // timingSafeEqual requires buffers of equal length
    const codeMatches =
      submittedCodeHash.length === savedCodeHash.length &&
      timingSafeEqual(submittedCodeHash, savedCodeHash);

    if (!codeMatches) {
      res.status(400).json({
        message: "Invalid or expired reset code",
      });
      return;
    }

    // Hash the new password before saving it
    user.password = await bcrypt.hash(newPassword, 12);

    // A reset code can only be used once
    user.resetPasswordCodeHash = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    res.status(500).json({
      message: "Unable to reset password",
    });
  }
};
