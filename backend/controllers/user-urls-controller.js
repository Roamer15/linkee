import logger from "../utils/logger.js";
import { query } from "../config/db.js";

export async function getShortenedUrlsHandler(req, res, next) {
    const userId = req.user.id
    try {
        const getUrlsQuery = `SELECT * FROM short_urls WHERE user_id=$1
                              ORDER BY created_at
                              `
        const getUrlsResult = await query(getUrlsQuery, [userId])

        if(getUrlsResult.rows.length === 0 ) {
            logger.error("There are no shortened urls for this account")
            return res.status(404).json({message: `NO shortened urls have been created for this user: ${userId}`})
        }

        res.json({
            message: "Here are your urls",
            urls: getUrlsResult.rows
        })
        next()
    }
    catch(error) {
        logger.error(
            `Error displaying shortened urls for user ${userId} : `,
            error
          );
          next(error)
          res
            .status(500)
            .json({ message: "Failed to fetch urls", error: error.message });
        }
}

export async function getStatsOfUrlHandler(req, res, next){
    const {shortCode} = req.params
    const userId = req.user.id
    try {
        const urlStatsQuery = `SELECT id, long_url, clicks, created_at, expires_at, short_code FROM short_urls WHERE short_code=$1 AND user_id=$2`
        const urlStatResult = await query(urlStatsQuery, [shortCode, userId])

        if(urlStatResult.rows.length === 0) {
            return res.status(404).json({ message: 'URL not found or unauthorized' });
        }

        const url = urlStatResult.rows[0];

        // (Optional) Fetch click log stats
        const clickLogsResult = await query(
          'SELECT clicked_at FROM click_logs WHERE url_id = $1 ORDER BY clicked_at DESC',
          [url.id]
        );
        logger.info(url.id)
    const baseUrl = process.env.BASE_URL || 'http://localhost:4000'
        res.json({
          long_url: url.long_url,
          short_url: `${baseUrl}/s/${url.short_code}`,
          clicks: url.clicks,
          createdAt: url.created_at,
          expiresAt: url.expires_at,
          timeClicks: clickLogsResult.rows // Optional: array of click timestamps
        });
        next()
    }
    catch(error) {
        logger.error(error);
        next(error)
        res.status(500).json({ message: 'Server error' });
    }
}