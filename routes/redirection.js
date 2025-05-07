import express from "express"
import { urlRedirectionHandler } from "../controllers/shorten-url-controller.js";

const router = express.Router()

router.get('/:shortCode', urlRedirectionHandler)

export default router