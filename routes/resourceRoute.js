import express from 'express';
import adminProtectRoute from '../middleware/adminProtectRoute.js';
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

router.get("/getResources", adminProtectRoute, getResources);
router.get("/getSingleResource/:id", adminProtectRoute, getSingleResource);
router.post("/upload", upload.single("resource"), adminProtectRoute, uploadResource);
router.put("/update/:id", upload.single("resource"), adminProtectRoute, updateResource);
router.delete("/delete/:id", adminProtectRoute, deleteResource);

export default router;