import logger from "../utils/logger.js";
import { query } from "../config/db.js";

export async function getShortenedUrlsHandler(req, res, next) {
    const userId = req.user.id
    try {
        const getUrlsQuery = `SELECT * FROM short_urls WHERE id=$1
                              ORDER BY created_at
                              `
        const getUrlsResult = await query(getUrlsQuery, [userId])

        if(getUrlsResult.rows.length === 0 ) {
            logger.error("THere are no shortened urls for this account")
            res.status(404).json({message: `NO shortened urls have been created for this user`})
        }

        res.json({
            message: "Here are your urls",
            urls: getUrlsResult
        })

    }
    catch(error) {
        logger.error(
            `Error displaying shortened urls for user ${userId} : `,
            error
          );
          res
            .status(500)
            .json({ message: "Failed to fetch urls", error: error.message });
        }
}