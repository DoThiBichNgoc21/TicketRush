/*
import express from "express";

import {
    getCategories,
    getArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
} from "../Controllers/adminInstructionController.js";

const router = express.Router();

router.get("/categories", getCategories);

router.get("/", getArticles);

router.get("/:id", getArticleById);

router.post("/", createArticle);

router.put("/:id", updateArticle);

router.delete("/:id", deleteArticle);

export default router;
*/

import express from "express";

import {
    getCategories,
    getArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    getContactInfo,
    updateContactInfo,
} from "../Controllers/adminInstructionController.js";

const router = express.Router();

router.get("/categories", getCategories);

// Phải đặt trước "/:id"
// Nếu đặt sau "/:id", Express sẽ hiểu "contact" là id.
router.get("/contact", getContactInfo);
router.put("/contact", updateContactInfo);

router.get("/", getArticles);

router.get("/:id", getArticleById);

router.post("/", createArticle);

router.put("/:id", updateArticle);

router.delete("/:id", deleteArticle);

export default router;