import express from "express";
const router = express.Router();
import {loginDoctor , loginUser , registerUser , registerDoctor , updateToken , forgetPassword , verifyCode , changePassword} from "../Controller/AuthController.js";
import { authenticateUser } from "../Middleware/Authentication.js";


router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.post('/doctor/login', loginDoctor);
router.post('/doctor/register', registerDoctor);
router.post('/doctor/token', authenticateUser , updateToken);
router.post('/forget' , forgetPassword) ;
router.post('/forget/verify/:userId' , verifyCode) ;
router.post('/forget/change/:userId' , changePassword) ;





export default router;