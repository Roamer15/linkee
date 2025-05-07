import express from "express"
import { urlRedirectionHandler } from "../controllers/shorten-url-controller.js";

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Manipulation of URLs
 *   description: Performing all operations related to the urls i.e shortening to viewing
 */

/**
 * @swagger
 * /{shortCode}:
 *   get:
 *     summary: Redirect to the original URL
 *     description: Fetches the long URL based on the provided short code and redirects the user to that URL.
 *     tags:
 *       - Short URLs
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *         description: The short code of the URL.
 *     responses:
 *       302:
 *         description: Redirects to the long/original URL.
 *       404:
 *         description: Short code not found.
 *       410:
 *         description: The shortened URL has expired.
 *       500:
 *         description: Server error.
 */
router.get('/:shortCode', urlRedirectionHandler);


export default router