import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
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

router.get("/getTimeTableResources", protectRoute, getTimeTableResources);
router.get("/getSingleTimeTableResource/:id", protectRoute, getSingleTimeTableResource);
router.post("/upload", upload.single("resource"), protectRoute, uploadTimeTableResource);
router.put("/update/:id", upload.single("resource"), protectRoute, updateTimeTableResource);
router.delete("/delete/:id", protectRoute, deleteTimeTableResource);

export default router;