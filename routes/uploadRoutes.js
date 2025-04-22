const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const passport = require("passport");
const authenticateJWT = passport.authenticate("jwt", { session: false });
const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

router.post(
  "/avatar",
  authenticateJWT,
  upload.single("avatar"),
  uploadController.fileUpload
);
router.post(
  "/image",
  authenticateJWT,
  upload.single("avatar"),
  uploadController.imageUpload
);

module.exports = router;
