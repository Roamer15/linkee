import express from "express"
import { loginValidator, registrationValidator } from "../validators/auth-validator.js"
import { registrationHandler } from "../controllers/register-controller.js"
import { verifyEmailHandler } from "../controllers/register-controller.js";
import { loginHandler } from "../controllers/login-controller.js";
import { resendVerificationEmailHandler } from "../controllers/register-controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { logoutUser } from "../controllers/logout-controller.js";

const router = express.Router()

router.post('/register', registrationValidator, registrationHandler)
router.get("/verify-email", verifyEmailHandler);
router.post("/resend-verification", resendVerificationEmailHandler);
router.post('/login', loginValidator, loginHandler)
router.post(
    '/logout',
    authMiddleware,
    logoutUser
  );


export default router