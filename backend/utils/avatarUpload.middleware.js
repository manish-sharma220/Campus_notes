// middleware/avatarUpload.middleware.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dinn2svqr",
  api_key: "477623572645727",
  api_secret: "58Bj2smsT6A0oV2bL9gDa-pKIOY", // Click 'View API Keys' above to copy your API secret
});

cloudinary.api.ping((err, res) => {
  console.log("Cloudinary Ping:", err || res);
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "avatars",
    allowed_formats: ["jpg", "jpeg", "png"],
    resource_type: "image",
    public_id: (req, file) => `avatar-${Date.now()}-${file.originalname}`,
  },
});

export const avatarUpload = multer({ storage });
