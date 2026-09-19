const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "yearbook_memories",
    format: async () => "png",
    transformation: [
      {
        width: 1200,
        crop: "limit",
        quality: "auto",
      },
    ],
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per image
    files: 20,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only JPG, JPEG, PNG, and WEBP images are allowed."
        )
      );
    }
  },
});

module.exports = upload;