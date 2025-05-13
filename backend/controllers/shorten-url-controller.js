import { query } from "../config/db.js";
import { generateCode } from "../utils/code-generator.js";
import logger from "../utils/logger.js";

export async function urlShortenerHandler(req, res, next) {
  const { longUrl, customCode, expiresAt } = req.body;
  const userId = req.user.id;
  try {
    let attempts = 0;
    let shortCode;

    do {
      const generatedShortCode = generateCode(6);
      shortCode = customCode || generatedShortCode;

      const checkCodeQuery = `SELECT * FROM short_urls WHERE short_code = $1`;
      const checkCodeResult = await query(checkCodeQuery, [shortCode]);

      if (checkCodeResult.rows.length === 0) break;

      attempts++;

      if (customCode) {
        logger.error(`Custom code ${shortCode} is already in use`);
        const err = new Error(
          "Custom Code conflict: Custom code is already in use. Try another one"
        );
        err.status = 409;
        return next(err);
      }
    } while (attempts < 3);

    if (attempts === 3) {
      logger.error(
        "Failed to generate a unique short code after multiple attempts"
      );
      const err = new Error(
        "Internal Server Error: Failed to generate unique short code. Please try again."
      );
      err.status = 500;
      return next(err);
    }

    const host =
      process.env.NODE_ENV === "production"
        ? "linkee.up.railway.app"
        : req.get("host");

    const shortUrl = `${req.protocol}://${host}/s/${shortCode}`;

    const insertUrlInfoQuery = `
              INSERT INTO short_urls (long_url, short_code, expires_at, user_id, short_url)
              VALUES($1, $2, $3, $4, $5)
              RETURNING created_at, expires_at`;
    const insertUrlInfoResult = await query(insertUrlInfoQuery, [
      longUrl,
      shortCode,
      expiresAt,
      userId,
      shortUrl,
    ]);

    logger.info(`Short URL created: ${shortCode} for user ${userId}`);

    res.status(201).json({
      message: "Short URL created successfully",
      custom_code: shortCode,
      shortened_URL: shortUrl,
      original_URL: longUrl,
      created_at: insertUrlInfoResult.rows[0].created_at,
      expires_at:
        insertUrlInfoResult.rows[0].expires_at || "No expiration time",
    });
  } catch (error) {
    logger.error(`URL shortening failed: ${error.message}`);
    res.status(500).json({
      message: "Failed to create short URL",
      error: error.message,
    });
  }
}

export async function urlRedirectionHandler(req, res, next) {
  const { shortCode } = req.params;

  try {
    const findResult = await query(
      `SELECT id, long_url, expires_at, clicks FROM short_urls WHERE short_code = $1`,
      [shortCode]
    );

    if (findResult.rows.length === 0) {
      logger.warn(`Short code not found: ${shortCode}`);
      const err = new Error("Short URL not found")
      err.status = 404
      return next(err)
    }

    const { long_url, expires_at, clicks, id } = findResult.rows[0];

    if (expires_at && new Date(expires_at) < new Date()) {
      logger.info(`Short code expired: ${shortCode}`);
      return res.status(410).json({ message: "This short URL has expired" });
    }

    await query(
      `UPDATE short_urls SET clicks = clicks + 1 WHERE short_code = $1`,
      [shortCode]
    );

    await query(
      `INSERT INTO click_logs(url_id)
                     VALUES ($1)
                     RETURNING clicked_at`,
      [id]
    );
    logger.info("Click stamp noted");

    logger.info(
      `Redirecting to ${long_url} | Short code: ${shortCode} | Clicks: ${
        clicks + 1
      }`
    );

    return res.redirect(302, long_url);
  } catch (error) {
    logger.error(`Redirection failed for ${shortCode}: ${error.message}`);
    return res.status(500).json({
      message: "Failed to process short URL",
      error: error.message,
    });
  }
}
