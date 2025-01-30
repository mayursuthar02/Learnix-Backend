import express from 'express';
import adminProtectRoute from '../middleware/adminProtectRoute.js';
import multer from 'multer';
import { deletePreviousPaperResource, getPreviousPaperResources, getSinglePreviousPaperResource, updatePreviousPaperResource, uploadPreviousPaperResource } from '../controllers/previousPaperController.js';

const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    const allowedFileTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb({ message: "Unsupported file format. Only PDF and image files (JPEG, PNG, GIF, WEBP) are allowed" }, false);
    }
  }
})

router.get("/getPreviousPaperResources", adminProtectRoute, getPreviousPaperResources);
router.get("/getSinglePreviousPaperResource/:id", adminProtectRoute, getSinglePreviousPaperResource);
router.post("/upload", upload.single("resource"), adminProtectRoute, uploadPreviousPaperResource);
router.put("/update/:id", upload.single("resource"), adminProtectRoute, updatePreviousPaperResource);
router.delete("/delete/:id", adminProtectRoute, deletePreviousPaperResource);

export default router;