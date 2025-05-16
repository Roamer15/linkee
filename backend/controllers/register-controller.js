import { query } from "../config/db.js";
import logger from "../utils/logger.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const HASH_SALT = 10;

export async function registrationHandler(req, res, next) {
  const { username, email, password } = req.body;

  try {

    const userCheckQuery = "SELECT email, username FROM users WHERE email = $1 OR username = $2";
    const userCheckResult = await query(userCheckQuery, [email, username]);

    if (userCheckResult.rows.length > 0) {
      const existingUser = userCheckResult.rows[0];
      if (existingUser.email === email) {
        logger.warn(`Registration attempt failed: Email already exists - ${email}`);
        const err = new Error("Email already in use")
        err.status = 409
        return next(err)
      }
      if (existingUser.username === username) {
        logger.warn(`Registration attempt failed: Username already exists - ${username}`);
        const err = new Error("Username already in use")
        err.status = 409
        return next(err)      }
    }

    const passwordHash = await bcrypt.hash(password, HASH_SALT);

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
        const err = new Error("Username or Email already in use")
        err.status = 409
        return next(err)      }
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
    const baseUrl = process.env.BASE_URL ||  `http://localhost:${port || 3000}`
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`;

    // ✅ Pass username to email helper
    await sendVerificationEmail(newUser.email, newUser.username, verificationUrl);

    logger.info(`User registered successfully: ${newUser.id}, verification email sent.`);

    res.status(201).json({
      message: "User registered successfully. Please check your email to verify your account. If you do not find any email, consider checking your spam",
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


async function sendVerificationEmail(toEmail, username, verificationUrl) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
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
      <div style="font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif; max-width: 640px; margin: auto; padding: 0; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08); border: 1px solid #e8e8e8;">
  <!-- Header with gradient -->
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
    <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 600;">Welcome to Linkee</h1>
    <div style="color: rgba(255,255,255,0.8); font-size: 16px; margin-top: 8px;">Your url shortening awaits</div>
  </div>
  
  <!-- Main content -->
  <div style="padding: 32px 40px;">
    <h2 style="color: #2d3748; margin-top: 0; font-size: 22px; font-weight: 600;">Hi ${username},</h2>
    
    <p style="font-size: 16px; line-height: 1.6; color: #4a5568; margin-bottom: 24px;">
      Thank you for joining <span style="font-weight: 600; color: #5a67d8;">Linkee</span>! We're thrilled to have you on board. To complete your registration and unlock all features, please verify your email address:
    </p>
    
    <!-- CTA Button with hover effect -->
    <div style="text-align: center; margin: 32px 0 40px;">
      <a href="${verificationUrl}" style="background-color: #5a67d8; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px; font-weight: 600; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(90, 103, 216, 0.3); transition: all 0.3s ease;">
        Verify My Email Address
      </a>
    </div>
    
    <!-- Expiration notice with icon -->
    <div style="background-color: #f8f9fa; border-left: 4px solid #e9c46a; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
      <p style="margin: 0; color: #6b7280; font-size: 14px; display: flex; align-items: center;">
        <span style="margin-right: 8px;">⏳</span> For security reasons, this link expires in <strong>2 hours</strong>
      </p>
    </div>
    
    <p style="font-size: 14px; line-height: 1.5; color: #718096; margin-bottom: 0;">
      If you didn't request this account, no further action is required. For any questions, contact our <a href="mailto:support@bulletinhq.com" style="color: #5a67d8; text-decoration: underline;">support team</a>.
    </p>
  </div>
  
  <!-- Footer -->
  <div style="padding: 24px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #edf2f7;">
    <p style="margin: 0 0 12px 0; font-size: 14px; color: #a0aec0;">
      Connect with us:
      <a href="#" style="margin: 0 8px; display: inline-block;"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="20" alt="Instagram"></a>
      <a href="#" style="margin: 0 8px; display: inline-block;"><img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" width="20" alt="Twitter"></a>
      <a href="#" style="margin: 0 8px; display: inline-block;"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" width="20" alt="LinkedIn"></a>
    </p>
    <p style="margin: 0; font-size: 12px; color: #a0aec0;">
      &copy; ${new Date().getFullYear()} Linkee. All rights reserved.<br>
      
    </p>
  </div>
</div>
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
      const err = new Error("User not found")
        err.status = 404
        return next(err)
    }

    if (userResult.rows[0].is_verified) {
      const err = new Error("Email already verified, check your spam to be sure")
        err.status = 400
        return next(err)
    }

    await query(`UPDATE users SET is_verified = true, verification_token = NULL WHERE id = $1`, [userId]);

    logger.info(`User ${userId} email verified successfully`);

    res.status(200).json({ message: "Email verified successfully. You can now log in!" });

  } catch (error) {
    logger.error(`Email verification failed: `, error);
    return res.status(400).json({ 
      message: "Invalid or expired verification token",
      error: error.message });
  }
}

export async function resendVerificationEmailHandler(req, res, next) {
    const { email } = req.body;
  
    if (!email) {
      const err = new Error("Email is required")
      err.status = 400
      return next(err)
    }
  
    try {
      // Fetch user by email
      const userResult = await query(`SELECT id, username, is_verified FROM users WHERE email = $1`, [email]);
  
      if (userResult.rows.length === 0) {
        const err = new Error("User not found")
        err.status = 404
        return next(err)
      }
  
      const user = userResult.rows[0];
  
      if (user.is_verified) {
        const err = new Error("Email already verified")
        err.status = 400
        return next(err)
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
       const baseUrl = process.env.BASE_URL ||  `http://localhost:${port || 3000}`
      const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`;
  
      // Send the email again
      await sendVerificationEmail(email, user.username, verificationUrl);
  
      logger.info(`Resent verification email to user ${user.id}`);
  
      res.status(200).json({ message: "Verification email resent. Please check your inbox." });
  
    } catch (error) {
      logger.error(`Error resending verification email: `, error);
      next(error);
    }
  }
  