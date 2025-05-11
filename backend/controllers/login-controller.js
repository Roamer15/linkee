import { query } from "../config/db.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import logger from "../utils/logger.js"

export async function loginHandler(req, res,next){
    const {email, password} = req.body
    try {
        const findUserQuery =     'SELECT id, email, username, password, is_verified FROM users WHERE email = $1'
        const userResult = await query(findUserQuery, [email])

        if (userResult.rows.length === 0) {
            logger.warn(`Login Attempt failed: Account with email ${email} doesn't exist`);
            return res.status(401).json({ message: "Account not found, invalid credentials" });
          }
          
        const user = userResult.rows[0]

        if (!user.is_verified && process.env.NODE_ENV !== 'test') {
          return res.status(403).json({ message: 'Please verify your email before logging in' });
        }

        const is_passwordMatch = await bcrypt.compare(password, user.password)

        if(!is_passwordMatch) {
            logger.warn(`Login attempt failed: Incorrect password - ${email}`)
            return res.status(401).json({ message: "Invalid password" })
        }

        const payload = {
            user: {
              id: user.id,
              email: user.email
            }
          }

          jwt.sign(payload, process.env.JWT_SECRET,
            {
              expiresIn: process.env.JWT_EXPIRES_IN
            }, (err, token) => {
              if (err) {
                logger.error(`Error generating JWT for ${email}: `, err)
                throw new Error('Error generating authentication token')
              }
              logger.info(`User logged in successfully: ${email} (ID: ${user.id})`)
              res.json({
                message: "Login Successfull!",
                token: token,
                user: {
                  id: user.id,
                  username: user.username,
                  email: user.email
                }
              })
            })
    } catch(err) {
        logger.error(`Error during login process for ${email}: `, err)
        next(err)
    res.status(500).json({ message: err.message || "Server error during login" })
    }
}
