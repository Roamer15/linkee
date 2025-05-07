import express from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'
import { getShortenedUrlsHandler } from '../controllers/user-urls-controller.js'

const router = express.Router()

router.get('/', authMiddleware, getShortenedUrlsHandler)

export default router