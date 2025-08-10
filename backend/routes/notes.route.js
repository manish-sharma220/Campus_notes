import express from "express";
import {
  getAllNotes,
  likeNote,
  commentOnNote,
  incrementDownload,
  archiveNote,
  getArchives,
  removeArchiveNote,
} from "../controllers/notes.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/archive/:id", verifyToken, archiveNote);
router.get("/archived/:id", verifyToken, getArchives);
router.post("/remove-archive/:noteId ", verifyToken, removeArchiveNote);
router.post("/remove-archive/:id", verifyToken, removeArchiveNote); // ✅ make sure this exists

router.get("/", getAllNotes); // Get all notes
router.put("/:id/like", verifyToken, likeNote); // Like/unlike
router.post("/:id/comment", verifyToken, commentOnNote); // Comment
router.put("/:id/download", incrementDownload); // Increment download count

export default router;
