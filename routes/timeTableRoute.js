import express from 'express';
import adminProtectRoute from '../middleware/adminProtectRoute.js';
import multer from 'multer';
import { deleteTimeTableResource, getSingleTimeTableResource, getTimeTableResources, updateTimeTableResource, uploadTimeTableResource } from '../controllers/timeTableController.js';

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

router.get("/getTimeTableResources", adminProtectRoute, getTimeTableResources);
router.get("/getSingleTimeTableResource/:id", adminProtectRoute, getSingleTimeTableResource);
router.post("/upload", upload.single("resource"), adminProtectRoute, uploadTimeTableResource);
router.put("/update/:id", upload.single("resource"), adminProtectRoute, updateTimeTableResource);
router.delete("/delete/:id", adminProtectRoute, deleteTimeTableResource);

export default router;