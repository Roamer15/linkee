import express from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'
import { getShortenedUrlsHandler } from '../controllers/user-urls-controller.js'

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Manipulation of URLs
 *   description: Performing all operations related to the urls i.e shortening to viewing
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get all shortened URLs for the authenticated user
 *     description: Returns a list of all shortened URLs created by the logged-in user.
 *     tags:
 *       - Short URLs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of shortened URLs.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ShortUrls'
 *       401:
 *         description: Unauthorized. User is not authenticated.
 *       500:
 *         description: Server error.
 */
router.get('/', authMiddleware, getShortenedUrlsHandler);


export default router