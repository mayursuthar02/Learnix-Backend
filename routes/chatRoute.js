import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import { activateScholara, getMaterials, getSemester, start, studentDataSelector, textToSpeech } from '../controllers/chatController.js';
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
router.post('/student-data-Selector/:option/:semester', protectRoute, studentDataSelector);
router.post('/get-resources/:option/:semester/:studentDataSelector', protectRoute, getMaterials);

// Learnix
router.post('/activateScholara', protectRoute, activateScholara);
router.post('/textToSpeech', protectRoute, textToSpeech);

export default router;