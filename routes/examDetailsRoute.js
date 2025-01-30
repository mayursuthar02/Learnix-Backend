import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import adminProtectRoute from '../middleware/adminProtectRoute.js';
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

router.get("/getExamDetailsResources", adminProtectRoute, getExamDetailsResources);
router.get("/getSingleExamDetailsResource/:id", adminProtectRoute, getSingleExamDetailsResource);
router.post("/upload", upload.single("resource"), adminProtectRoute, uploadExamDetailsResource);
router.put("/update/:id", upload.single("resource"), adminProtectRoute, updateExamDetailsResource);
router.delete("/delete/:id", adminProtectRoute, deleteExamDetailsResource);

export default router;