import express from "express";
import {
  getUsers,
  getUserStats,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
} from "../Controllers/adminUserManagementController.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/stats", getUserStats);
router.post("/", createUser);
router.put("/:id", updateUser);
router.patch("/:id/status", updateUserStatus);
router.delete("/:id", deleteUser);

export default router;