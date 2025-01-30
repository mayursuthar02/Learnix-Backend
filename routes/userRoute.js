import express from 'express';
import { adminLogout, deleteUser, fetchSingleUser, getAdminProfessors, getAllProfessors, getAllStudents, loginAdmin, loginUser, SignupUser, updateRole, updateUserDetails, updateUserProfile, userLogout } from '../controllers/userController.js';
import protectRoute from '../middleware/protectRoute.js';
import adminProtectRoute from '../middleware/adminProtectRoute.js';

const router = express.Router();

// Admin
router.get('/getAllStudents', adminProtectRoute, getAllStudents);
router.get('/getAllProfessors', adminProtectRoute, getAllProfessors);

router.post("/signup", SignupUser);
router.post("/admin-login", loginAdmin);

router.put("/update-role/:id", adminProtectRoute, updateRole);
router.delete("/delete-user/:id", adminProtectRoute, deleteUser);

router.get('/adminLogout', adminProtectRoute, adminLogout);

router.put('/updateUserDetails/:userId', adminProtectRoute, updateUserDetails);

router.put('/updateAdminUserProfile', adminProtectRoute, updateUserProfile);

router.get('/fetchSingleUser/:userId', adminProtectRoute, fetchSingleUser);

// User
router.post("/login", loginUser);   
router.put('/updateUserProfile', protectRoute, updateUserProfile);
router.get('/getAdminProfessors', protectRoute, getAdminProfessors);
router.get('/userLogout', protectRoute, userLogout);



export default router;