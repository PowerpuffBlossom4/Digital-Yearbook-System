const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,

  params: {
    folder: "yearbook_profiles",

    format: async () => "jpg",

    transformation: [
      {
        width: 720,
        height: 1079,
        crop: "fill",
        gravity: "auto",
        quality: "auto",
        fetch_format: "auto",
      },
    ],
  },
});

const uploadProfile = multer({
  storage,
});

module.exports = uploadProfile;