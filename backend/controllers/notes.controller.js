import Notes from "../models/uploading.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import mongoose from "mongoose";

// controllers/noteController.js

export const removeArchiveNote = async (req, res) => {
  try {
    const noteId = req.params.id;

    const note = await Notes.findById(noteId);
    if (!note)
      return res
        .status(404)
        .json({ success: false, message: "Note not found." });

    note.archived = false; // Mark note as not archived
    await note.save();

    // Also remove from user.archivedNotes array
    const userId = req.user.id;
    await User.findByIdAndUpdate(userId, {
      $pull: { archivedNotes: noteId },
    });

    res
      .status(200)
      .json({ success: true, message: "Note removed from archive." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

export const archiveNote = async (req, res, next) => {
  try {
    const noteId = req.params.id;

    const userId = req.user.id;

    const note = await Notes.findById(noteId);
    if (!note) {
      return next(errorHandler(404, "Note not found"));
    }

    const user = await User.findById(userId);

    // If already archived, don't add again
    if (user.archivedNotes.includes(noteId)) {
      return res
        .status(200)
        .json({ success: true, message: "Note already archived" });
    }

    // Add the note to the user's archive
    user.archivedNotes.push(noteId);
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Note archived successfully" });
  } catch (error) {
    next(error);
  }
};

// // Get all archived notes for a user
// export const getArchivedNotes = async (req, res) => {
//   const { userId } = req.params;

//   try {
//     const notes = await Note.find({ userId, archived: true });
//     res.status(200).json({ success: true, notes });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const getArchives = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate("archivedNotes");
    res.status(200).json(user.archivedNotes);
  } catch (error) {
    next(error);
  }
};

// 🔍 Get all notes with optional search/filter
export const getAllNotes = async (req, res, next) => {
  try {
    const { search, subject, college, semester, course, batch } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { subjectName: { $regex: search, $options: "i" } },
        { collegeName: { $regex: search, $options: "i" } },
        { courseName: { $regex: search, $options: "i" } },
      ];
    }

    if (subject) query.subjectName = subject;
    if (college) query.collegeName = college;
    if (semester) query.semester = semester;
    if (course) query.courseName = course;
    if (batch) query.batch = batch;

    const notes = await Notes.find(query)
      .populate("uploader", "name avatar") // if avatar added
      .populate("comments.user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, notes });
  } catch (err) {
    next(err);
  }
};

// ❤ Like/unlike note
export const likeNote = async (req, res, next) => {
  try {
    const note = await Notes.findById(req.params.id);
    const userId = req.user.id;

    if (!note) return res.status(404).json({ message: "Note not found" });

    const index = note.likes.indexOf(userId);
    if (index === -1) {
      note.likes.push(userId);
    } else {
      note.likes.splice(index, 1);
    }

    await note.save();
    res.status(200).json({ success: true, likes: note.likes });
  } catch (err) {
    next(err);
  }
};

// 💬 Comment on note
export const commentOnNote = async (req, res, next) => {
  try {
    const note = await Notes.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const comment = {
      user: req.user.id,
      text: req.body.text,
      commentedAt: new Date(),
    };

    note.comments.push(comment);
    await note.save();

    const updatedNote = await Notes.findById(req.params.id).populate(
      "comments.user",
      "name"
    );

    res.status(200).json({ success: true, comments: updatedNote.comments });
  } catch (err) {
    next(err);
  }
};

// ⬇ Increment download count
export const incrementDownload = async (req, res, next) => {
  try {
    const note = await Notes.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    note.downloadCount += 1;
    await note.save();

    res.status(200).json({ success: true, downloadCount: note.downloadCount });
  } catch (err) {
    next(err);
  }
};
