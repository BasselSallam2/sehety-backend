import express from "express";
const router = express.Router();
import {getUserProfile , editUserProfile , getDoctorProfile , getAllUsers , deleteUser , adminEditUser} from "../Controller/profileController.js";
import {authenticateUser} from "../Middleware/Authentication.js";

router.get('/patient' , getAllUsers);
router.put('/patient/:userId' , authenticateUser , adminEditUser) ;
router.get('/patient/profile' , authenticateUser , getUserProfile) ;
router.put('/patient/profile/:userId'  , editUserProfile) ;
router.get('/doctor/profile/:doctorId' , authenticateUser , getDoctorProfile) ;
router.delete('/patinet/:userId'  , deleteUser ) ;




export default router;