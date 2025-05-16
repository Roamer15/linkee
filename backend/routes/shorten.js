import express from "express"
import authMiddleware from "../middlewares/authMiddleware.js"
import { linkInputValidator } from "../validators/link-validator.js"
import { urlShortenerHandler } from "../controllers/shorten-url-controller.js"
import {getStatsOfUrlHandler} from "../controllers/user-urls-controller.js"
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
 *   post:
 *     summary: Shorten a URL
 *     description: Authenticated users can shorten a long URL, with an optional custom code and expiration date.
 *     tags:
 *       - Short URLs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - longUrl
 *             properties:
 *               longUrl:
 *                 type: string
 *                 format: uri
 *                 description: The original long URL to shorten.
 *               customCode:
 *                 type: string
 *                 description: Optional custom code for the shortened URL.
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: Optional expiration date for the shortened link.
 *     responses:
 *       201:
 *         description: URL shortened successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   description: ID of the shortened URL.
 *                 shortUrl:
 *                   type: string
 *                   description: The generated short URL.
 *                 longUrl:
 *                   type: string
 *                   format: uri
 *                   description: The original long URL.
 *                 customCode:
 *                   type: string
 *                   description: Custom code (if provided).
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *                   description: Expiration date of the shortened URL.
 *                 clicks:
 *                   type: integer
 *                   description: Number of times the link has been clicked.
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Creation timestamp.
 *       400:
 *         description: Validation error / Missing required fields.
 *       401:
 *         description: Unauthorized (missing or invalid token).
 *       500:
 *         description: Server error.
 * 
 */
router.post('/', authMiddleware, linkInputValidator, urlShortenerHandler);
/**
 * @swagger
 * /api/shorten/{shortCode}/stats:
 *   get:
 *     summary: Get statistics for a shortened URL
 *     description: |
 *       Returns detailed analytics for a specific short URL owned by the authenticated user. 
 *       This includes click count, creation date, expiration date, and other available metrics.
 *     tags:
 *       - Short URLs
 *     parameters:
 *       - name: shortCode
 *         in: path
 *         required: true
 *         description: The short code of the URL you want stats for.
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved stats for the URL.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shortCode:
 *                   type: string
 *                   example: abc123
 *                 longUrl:
 *                   type: string
 *                   example: https://example.com/some-long-url
 *                 clickCount:
 *                   type: integer
 *                   example: 42
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-05-09T14:00:00Z
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                   example: 2025-12-31T23:59:59Z
 *                 lastClickedAt:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                   example: 2025-05-09T15:30:00Z
 *       '401':
 *         description: Unauthorized. Authentication required.
 *       '403':
 *         description: Forbidden. The user does not own this URL.
 *       '404':
 *         description: Short URL not found.
 *       '500':
 *         description: Server error.
 */

router.get('/:shortCode/stats', authMiddleware, getStatsOfUrlHandler)


export default router