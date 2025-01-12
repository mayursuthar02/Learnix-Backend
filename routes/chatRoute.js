import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import { activateScholara, getMaterials, getSemester, getSubject, start } from '../controllers/chatController.js';
import multer from 'multer';



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

router.post('/start', protectRoute, start);
router.post('/get-semster/:option', protectRoute, getSemester);
router.post('/get-subject/:option/:semester', protectRoute, getSubject);
router.post('/get-materials/:option/:semester/:subject', protectRoute, getMaterials);

// Scholara
router.post('/activateScholara', protectRoute, activateScholara);

export default router;