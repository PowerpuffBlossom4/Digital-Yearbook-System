const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "yearbook_posts",

    format: async () => "png",

    transformation: [
      {
        width: 600,
        height: 600,
        crop: "fill",
        gravity: "face",
        quality: "auto",
      },
    ],
  },
});

const upload = multer({ storage });

module.exports = upload;