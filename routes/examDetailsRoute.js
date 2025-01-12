import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import multer from 'multer';
import { deleteExamDetailsResource, getExamDetailsResources, getSingleExamDetailsResource, updateExamDetailsResource, uploadExamDetailsResource } from '../controllers/examDetailsController.js';

const router = express.Router();

const upload = multer({
    // limits: { fileSize: 5 * 1024 * 1024 },
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

router.get("/getExamDetailsResources", protectRoute, getExamDetailsResources);
router.get("/getSingleExamDetailsResource/:id", protectRoute, getSingleExamDetailsResource);
router.post("/upload", upload.single("resource"), protectRoute, uploadExamDetailsResource);
router.put("/update/:id", upload.single("resource"), protectRoute, updateExamDetailsResource);
router.delete("/delete/:id", protectRoute, deleteExamDetailsResource);

export default router;