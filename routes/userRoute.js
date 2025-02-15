import express from 'express';
import { authCheck, deleteUser, fetchSingleUser, getAdminProfessors, getAllProfessors, getAllStudents, loginAdmin, loginUser, searchUsers, SignupUser, updateRole, updateUserDetails, updateUserProfile, userLogout } from '../controllers/userController.js';
import protectRoute from '../middleware/protectRoute.js';

const router = express.Router();

router.get("/check", authCheck);

// Admin
router.get('/getAllStudents', protectRoute, getAllStudents);
router.get('/getAllProfessors', protectRoute, getAllProfessors);

router.post("/signup", SignupUser);
router.post("/admin-login", loginAdmin);

router.put("/update-role/:id", protectRoute, updateRole);
router.delete("/delete-user/:id", protectRoute, deleteUser);

router.put('/updateUserDetails/:userId', protectRoute, updateUserDetails);

router.put('/updateAdminUserProfile', protectRoute, updateUserProfile);

router.get('/fetchSingleUser/:userId', protectRoute, fetchSingleUser);

router.get('/searchUsers/:query', protectRoute, searchUsers);


// User
router.post("/login", loginUser);   
router.put('/updateUserProfile', protectRoute, updateUserProfile);
router.get('/getAdminProfessors', protectRoute, getAdminProfessors);
router.get('/userLogout', protectRoute, userLogout);



export default router;