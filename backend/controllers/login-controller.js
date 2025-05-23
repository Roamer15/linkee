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
            const err = new Error("Account not found, invalid credentials")
            err.status = 401
            return next(err)
          }
          
        const user = userResult.rows[0]

        if (!user.is_verified && process.env.NODE_ENV !== 'test') {
          const err = new Error("Please verify your email before logging in")
          err.status = 403
          return next(err)
        }

        const is_passwordMatch = await bcrypt.compare(password, user.password)

        if(!is_passwordMatch) {
            logger.warn(`Login attempt failed: Incorrect password - ${email}`)
            const err = new Error("Invalid password")
            err.status = 401
            return next(err)
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
                return next(err);
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
    }
}
