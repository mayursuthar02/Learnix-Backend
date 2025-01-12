import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
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

router.get("/getPreviousPaperResources", protectRoute, getPreviousPaperResources);
router.get("/getSinglePreviousPaperResource/:id", protectRoute, getSinglePreviousPaperResource);
router.post("/upload", upload.single("resource"), protectRoute, uploadPreviousPaperResource);
router.put("/update/:id", upload.single("resource"), protectRoute, updatePreviousPaperResource);
router.delete("/delete/:id", protectRoute, deletePreviousPaperResource);

export default router;