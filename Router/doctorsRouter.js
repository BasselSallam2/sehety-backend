import express from "express";
const router = express.Router();
import {getAllDoctors , createSpeciality , getAllSpecialities , getDoctorsWithSpeciality , editSpeciality , deleteSpeciality , editDoctor , deleteDoctor} from "../Controller/doctorController.js";
router.get('/doctors', getAllDoctors) ;
router.post('/doctors/speciality' , createSpeciality ) ;
router.put('/doctor/:doctorId' , editDoctor ) ;
router.delete('/doctor/:doctorId' , deleteDoctor ) ;
router.get('/doctors/speciality' , getAllSpecialities ) ;
router.get('/doctors/speciality/:speciality' , getDoctorsWithSpeciality ) ;
router.put('/doctors/speciality/:specialityId' , editSpeciality ) ;
router.delete('/doctors/speciality/:specialityId' , deleteSpeciality ) ;




export default router;