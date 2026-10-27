import "./../config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "../config/db";
import User from "../models/userModel";

const createAdmin = async (): Promise<void> => {
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD before running this command"
    );
  }
  if (password.length < 6) {
    throw new Error("ADMIN_PASSWORD must contain at least 6 characters");
  }

  await connectDB();
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    existingUser.role = "admin";
    await existingUser.save();
    console.log(`Promoted existing account ${email} to admin.`);
    return;
  }

  await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 12),
    role: "admin",
  });
  console.log(`Created admin account ${email}.`);
};

createAdmin()
  .catch(async (error: unknown) => {
    console.error("Admin account setup failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
