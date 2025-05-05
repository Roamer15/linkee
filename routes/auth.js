import express from "express"
import { loginValidator, registrationValidator } from "../validators/auth-validator.js"
import { registrationHandler } from "../controllers/register-controller.js"
import { verifyEmailHandler } from "../controllers/register-controller.js";
import { loginHandler } from "../controllers/login-controller.js";
import { resendVerificationEmailHandler } from "../controllers/register-controller.js";

const router = express.Router()

router.post('/register', registrationValidator, registrationHandler)
router.get("/verify-email", verifyEmailHandler);
router.post("/resend-verification", resendVerificationEmailHandler);
router.post('/login', loginValidator, loginHandler)

export default router