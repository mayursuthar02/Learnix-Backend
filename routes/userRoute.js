import express from 'express';
import { deleteUser, fetchSingleUser, getAllProfessors, getAllStudents, loginAdmin, loginUser, logout, SignupUser, updateRole, updateUserDetails } from '../controllers/userController.js';
import protectRoute from '../middleware/protectRoute.js';

const router = express.Router();

// Admin
router.get('/getAllStudents', protectRoute, getAllStudents);
router.get('/getAllProfessors', protectRoute, getAllProfessors);

router.post("/signup", SignupUser);
router.post("/admin-login", loginAdmin);

router.put("/update-role/:id", protectRoute, updateRole);
router.delete("/delete-user/:id", protectRoute, deleteUser);

router.get('/logout', protectRoute, logout)

router.put('/updateUserDetails/:userId', protectRoute, updateUserDetails)
router.get('/fetchSingleUser/:userId', protectRoute, fetchSingleUser)
    
// User
router.post("/login", loginUser);   


export default router;