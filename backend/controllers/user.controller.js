import { errorHandler } from "../utils/error.js";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Note from "../models/uploading.model.js";

export const test = (req, res) => {
  res.json({
    message: "Hello",
  });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, "You can only update your own account!"));
  }

  try {
    const updateData = {
      username: req.body.username,
      email: req.body.email,
    };

    // 🔐 If password is being updated
    if (req.body.password) {
      updateData.password = bcrypt.hashSync(req.body.password, 10);
    }

    // 📷 If a new avatar image is uploaded
    if (req.file && req.file.path) {
      console.log("File path:", req.file.path);

      updateData.avatar = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, "You can only delete your own account!"));
  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie("access_token");
    res.status(200).json("User has been deleted");
  } catch (error) {
    next(error);
  }
};

export const getUserUploads = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      const notes = await Note.find({ uploader: req.params.id });
      res.status(200).json(notes);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, "You can only view your own Uploads"));
  }
};
