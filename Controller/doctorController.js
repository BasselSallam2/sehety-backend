import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import e from "express";

export const getAllDoctors = async (req , res , next) => {
    try{
        const doctors = await prisma.doctor.findMany({where:{isDeleted:false},
           select:{id:true , name:true , email:true , phone:true , Specialty:true }
        });
        res.status(200).json(doctors);
    }
    catch(error) {
        console.log(error);
        next(error);
    }
}

export const createSpeciality = async (req , res , next) => {
    try {
        const {specialty} = req.body;
        const specialtyExists = await prisma.specialty.findUnique({
            where: { specialty },
        });
        if (specialtyExists) {
            return res.status(400).json({ message: "Specialty already exists" });
        }
        const newSpecialty = await prisma.specialty.create({
            data: { specialty },
        });
        res.status(201).json({message: "Specialty created successfully", specialty: newSpecialty});
    }
    catch(error) {
        console.log(error);
        next(error);
    }
}

export const getAllSpecialities = async (req , res , next) => {
    try {
        const specialties = await prisma.specialty.findMany({where:{isDelete:false},
            select: { id: true, specialty: true },
        });
        res.status(200).json(specialties);
    } catch (error) {
        console.log(error);
        next(error);
    }
}

export const getDoctorsWithSpeciality = async (req , res , next) => {
    try {
        const { speciality } = req.params;
        const doctors = await prisma.doctor.findMany({
            where: { specialtyId:speciality , isDeleted:false },
            select: { id: true, name: true, email: true, phone: true, Specialty: true },
        });

        if (doctors.length === 0) {
            return res.status(404).json({ message: "No doctors found with this specialty" });
        }
      

        res.status(200).json(doctors);

    }
    catch(error) {
        console.log(error);
        next(error);
    }
}

export const editSpeciality = async (req , res , next) => {
    try{
        const {specialityId} = req.params ;
        const {speciality} = req.body;

        const specialtyExists = await prisma.specialty.findUnique({
            where: { id: specialityId },
        });
        if (!specialtyExists) {
            return res.status(404).json({ message: "Specialty not found" });
        }
        const dublicatedSpecialty = await prisma.specialty.findFirst({
            where: { specialty: speciality , id: { not: specialityId } },
        });
        if (dublicatedSpecialty) {
            return res.status(400).json({ message: "Specialty already exists" });
        }
        const updatedSpecialty = await prisma.specialty.update({
            where: { id: specialityId },
            data: { specialty:speciality },
        });
        res.status(200).json({ message: "Specialty updated successfully", specialty: updatedSpecialty });

    }
    catch(error) {
        console.log(error);
        next(error);
    }
}

export const deleteSpeciality = async (req , res , next) => {
    try{
        const {specialityId} = req.params;
        const specialtyExists = await prisma.specialty.findUnique({
            where: { id: specialityId },
        });
        if (!specialtyExists) {
            return res.status(404).json({ message: "Specialty not found" });
        }
        await prisma.specialty.update({
            where: { id: specialityId },data:{isDelete:true , specialty:`${specialtyExists.specialty} (deleted)`}
        });
        res.status(200).json({ message: "Specialty deleted successfully" });
    }
    catch(error) {
        console.log(error);
        next(error);
    }
}

export const editDoctor = async (req , res , next) => {
    try{
        const {doctorId} = req.params;
        const {name , phone , speciality} = req.body;
        if(!name || !phone || !speciality) {
            return res.status(400).json({message:"Please provide all fields"});
        }
        const doctorExists = await prisma.doctor.findUnique({
            where: { id: doctorId },
        });
        if (!doctorExists) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        const specialtyExists = await prisma.specialty.findUnique({
            where: { id: speciality },
        });
        if (!specialtyExists) {
            return res.status(404).json({ message: "Specialty not found please give me id of speciality" });
        }
        const updatedDoctor = await prisma.doctor.update({
            where: { id: doctorId },
            data: { name, phone, specialtyId:speciality },
        });
        res.status(200).json({ message: "Doctor updated successfully", doctor: updatedDoctor });


    }
    catch(error) {
        console.log(error);
        next(error);
    }
}

export const deleteDoctor = async (req , res , next) => {
    try{
        const {doctorId} = req.params;
        const doctorExists = await prisma.doctor.findUnique({
            where: { id: doctorId },
        });
        if (!doctorExists) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        let date = new Date();
        await prisma.doctor.update({
            where: { id: doctorId },data:{isDeleted:true , name:`${doctorExists.name} (deleted) ${date}` , email:`${doctorExists.email} (deleted) ${date}` , phone:`${doctorExists.phone} (deleted) ${date}`}
        });
       
        res.status(200).json({ message: "Doctor deleted successfully" });
    }
    catch(error) {
        console.log(error);
        next(error);
    }
}