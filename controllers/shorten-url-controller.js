import { query } from "../config/db.js";
import { generateCode } from "../utils/code-generator.js";
import logger from "../utils/logger.js";
// import crypto from "crypto"

export async function urlShortenerHandler(req, res, next) {
  const { longUrl, customCode, expiresAt } = req.body;
  const userId = req.user.id;
  try {
    if (customCode) {
        const checkCustomCode = `SELECT * FROM short_urls WHERE short_code=$1`;
        const checkCustomCodeResult = await query(checkCustomCode, [customCode]);
      
        if (checkCustomCodeResult.rows.length > 0) {
          logger.error(`Custom code ${customCode} is already in use`);
          return res.status(409).json({
            message: "Custom Code conflict: Custom code is already in use. Try another one",
          });
        }
      }
      
    const generatedShortCode = generateCode(6);
    const shortCode = customCode || generatedShortCode;

    const insertUrlInfoQuery = `
              INSERT INTO short_urls (long_url, short_code, expires_at, user_id)
              VALUES($1, $2, $3, $4)
              RETURNING created_at, expires_at`;
    const insertUrlInfoResult = await query(insertUrlInfoQuery, [
      longUrl,
      shortCode,
      expiresAt,
      userId,
    ]);
    const host =
      process.env.NODE_ENV === "production"
        ? "https://linkee.up.railway.app/"
        : req.get("host");

    const shortUrl = `${req.protocol}://${host}/s/${shortCode}`;

    logger.info(`Short URL created: ${shortCode} for user ${userId}`);

      res.status(201).json({
        message: "Short URL created successfully",
        "custom_code": shortCode,
        "shortened_URL": shortUrl,
        "original_URL": longUrl,
        "created_at": insertUrlInfoResult.rows[0].created_at,
        "expires_at": insertUrlInfoResult.rows[0].expires_at || "No expiration time"
      });
  } catch (error) {
    logger.error(`URL shortening failed: ${error.message}`);
      res.status(500).json({ 
        message: 'Failed to create short URL',
        error: error.message 
      });
  }
}

export async function urlRedirectionHandler(req, res, next) {
    const { shortCode } = req.params;

    try {
        // First: find the URL mapping
        const findResult = await query(
            `SELECT long_url, expires_at, clicks FROM short_urls WHERE short_code = $1`,
            [shortCode]
        );

        if (findResult.rows.length === 0) {
            logger.warn(`Short code not found: ${shortCode}`);
            return res.status(404).json({ message: 'Short URL not found' });
        }

        const { long_url, expires_at, clicks } = findResult.rows[0];

        // Check if the URL has expired
        if (expires_at && new Date(expires_at) < new Date()) {
            logger.info(`Short code expired: ${shortCode}`);
            return res.status(410).json({ message: 'This short URL has expired' });
        }

        // Increment the click count only if the link is valid
        await query(
            `UPDATE short_urls SET clicks = clicks + 1 WHERE short_code = $1`,
            [shortCode]
        );

        // Log success with details
        logger.info(`Redirecting to ${long_url} | Short code: ${shortCode} | Clicks: ${clicks + 1}`);

        // Redirect to the original URL
        return res.redirect(302, long_url); // Use 302 (Found) for flexibility

    } catch (error) {
        logger.error(`Redirection failed for ${shortCode}: ${error.message}`);
        return res.status(500).json({
            message: 'Failed to process short URL',
            error: error.message
        });
    }
}
