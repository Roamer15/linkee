import express from "express"
import authMiddleware from "../middlewares/authMiddleware.js"
import { linkInputValidator } from "../validators/link-validator.js"
import { urlShortenerHandler } from "../controllers/shorten-url-controller.js"
const router = express.Router()

router.post('/', authMiddleware, linkInputValidator, urlShortenerHandler)

export default router