import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import { deleteResource, getResources, getSingleResource, updateResource, uploadResource } from '../controllers/resourceController.js';
import multer from 'multer';
import path from 'path';

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

router.get("/getResources", protectRoute, getResources);
router.get("/getSingleResource/:id", protectRoute, getSingleResource);
router.post("/upload", upload.single("resource"), protectRoute, uploadResource);
router.put("/update/:id", upload.single("resource"), protectRoute, updateResource);
router.delete("/delete/:id", protectRoute, deleteResource);

export default router;