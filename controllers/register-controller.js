import { query } from "../config/db.js";
import logger from "../utils/logger.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const HASH_SALT = 10;

export async function registrationHandler(req, res, next) {
  const { username, email, password } = req.body;

  // ✅ Basic input validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Username, email, and password are required." });
  }

  try {
    // 1️⃣ Check if email or username already exists
    const userCheckQuery = "SELECT email, username FROM users WHERE email = $1 OR username = $2";
    const userCheckResult = await query(userCheckQuery, [email, username]);

    if (userCheckResult.rows.length > 0) {
      const existingUser = userCheckResult.rows[0];
      if (existingUser.email === email) {
        logger.warn(`Registration attempt failed: Email already exists - ${email}`);
        return res.status(409).json({ message: "Email already in use" });
      }
      if (existingUser.username === username) {
        logger.warn(`Registration attempt failed: Username already exists - ${username}`);
        return res.status(409).json({ message: "Username already in use" });
      }
    }

    // 2️⃣ Hash password
    const passwordHash = await bcrypt.hash(password, HASH_SALT);

    // 3️⃣ Insert user (is_verified = false)
    let newUserResult;
    try {
      const insertUserSql = `
        INSERT INTO users (username, email, password, is_verified)
        VALUES ($1, $2, $3, false)
        RETURNING id, username, email
      `;
      newUserResult = await query(insertUserSql, [username, email, passwordHash]);
    } catch (insertError) {
      // ✅ Handle race condition → unique constraint violation
      if (insertError.code === '23505') {
        logger.warn(`Unique constraint violation on insert: `, insertError.detail);
        return res.status(409).json({ message: "Email or username already in use" });
      }
      throw insertError; // rethrow other errors
    }

    const newUser = newUserResult.rows[0];

    // 4️⃣ Generate verification token
    const verificationToken = jwt.sign(
      { userId: newUser.id, 
        email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" } // or shorter if you prefer
    );

    await query(`UPDATE users SET verification_token = $1 WHERE id = $2`, [verificationToken, newUser.id]);

    const port = process.env.PORT || 3000;
    const verificationUrl = `http://localhost:${port}/api/auth/verify-email?token=${verificationToken}`;

    // ✅ Pass username to email helper
    await sendVerificationEmail(newUser.email, newUser.username, verificationUrl);

    logger.info(`User registered successfully: ${newUser.id}, verification email sent.`);

    res.status(201).json({
      message: "User registered successfully. Please check your email to verify your account.",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });

  } catch (error) {
    logger.error(`Registration error: `, error);
    next(error);
  }
}

// ✅ Updated helper: receives username
async function sendVerificationEmail(toEmail, username, verificationUrl) {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or use SMTP config
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Please verify your email",
    html: `
      <p>Hi ${username},</p>
      <p>Thank you for registering! Please click below to verify your email:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function verifyEmailHandler(req, res, next) {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const userResult = await query(`SELECT is_verified FROM users WHERE id = $1`, [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userResult.rows[0].is_verified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    await query(`UPDATE users SET is_verified = true, verification_token = NULL WHERE id = $1`, [userId]);

    logger.info(`User ${userId} email verified successfully`);

    res.status(200).json({ message: "Email verified successfully. You can now log in!" });

  } catch (error) {
    logger.error(`Email verification failed: `, error);
    return res.status(400).json({ message: "Invalid or expired verification token" });
  }
}

export async function resendVerificationEmailHandler(req, res, next) {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
  
    try {
      // Fetch user by email
      const userResult = await query(`SELECT id, username, is_verified FROM users WHERE email = $1`, [email]);
  
      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: "User not found." });
      }
  
      const user = userResult.rows[0];
  
      if (user.is_verified) {
        return res.status(400).json({ message: "Email already verified." });
      }
  
      // Generate a new verification token
      const verificationToken = jwt.sign(
        { userId: user.id, email },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );
  
      // Update the token in the database
      await query(`UPDATE users SET verification_token = $1 WHERE id = $2`, [verificationToken, user.id]);
  
      const port = process.env.PORT || 3000;
      const verificationUrl = `http://localhost:${port}/api/auth/verify-email?token=${verificationToken}`;
  
      // Send the email again
      await sendVerificationEmail(email, user.username, verificationUrl);
  
      logger.info(`Resent verification email to user ${user.id}`);
  
      res.status(200).json({ message: "Verification email resent. Please check your inbox." });
  
    } catch (error) {
      logger.error(`Error resending verification email: `, error);
      next(error);
    }
  }
  