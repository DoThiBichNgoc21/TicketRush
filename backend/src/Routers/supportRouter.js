import express from "express";
import {
    getPublishedArticles,
    getArticleBySlug,
    getContactInfo,
} from "../Controllers/supportController.js";

const router = express.Router();

router.get("/articles", getPublishedArticles);
router.get("/articles/:slug", getArticleBySlug);
router.get("/contact", getContactInfo);

export default router;
