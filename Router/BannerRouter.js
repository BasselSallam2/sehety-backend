import express from "express";
const router = express.Router();
import {createBunner , getAllBanners , reserveBanner , getMyBanners , getMyBannersPatient , editbanner , deleteBanner} from "../Controller/bannerController.js"
import {authenticateUser} from "../Middleware/Authentication.js"

import multer from "multer";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const storage = multer.diskStorage({
    destination: path.join(__dirname, '../' , 'public' ,'bunners'), 
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); 
    } else {
        cb(new Error('Only image files are allowed'), false); 
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});
  


router.post('/banner' , authenticateUser , upload.single('image') , createBunner) ;
router.get('/banner' , getAllBanners) ;
router.post('/banner/reserve/:bannerId' , authenticateUser , reserveBanner) ;
router.get('/banners/doctor' ,  authenticateUser , getMyBanners) ;
router.get('/banners/patient' ,  authenticateUser , getMyBannersPatient) ;
router.put('/banner/:bannerid' , authenticateUser , upload.single('image')  , editbanner);
router.delete('/banner/:bannerid' , deleteBanner) ; 

 

export default router;