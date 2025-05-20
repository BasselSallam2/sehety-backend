import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import SibApiV3Sdk from "sib-api-v3-sdk";


dotenv.config();

export const loginUser = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }
    email = email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
   
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res
      .status(200)
      .json({ message: "Login successful", user: { userId: user.id } , token });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const loginDoctor = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }
    email = email.toLowerCase();
    const doctor = await prisma.doctor.findUnique({ where: { email:email} });
    if (!doctor) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: doctor.id }, process.env.JWT_SECRET);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res
      .status(200)
      .json({ message: "Login successful", user: { userId: doctor.id } , token });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const registerUser = async (req, res, next) => {
  try {
    let {
      firstname,
      lastname,
      birthdate,
      gender,
      bloodtype,
      phone,
      email,
      password,
      confirmPassword,
    } = req.body;

    if (
      !firstname ||
      !lastname ||
      !birthdate ||
      !gender ||
      !bloodtype ||
      !phone ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (gender !== "male" && gender !== "female") {
      return res
        .status(400)
        .json({ message: "Gender must be either male or female" });
    }

    email = email.toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let BirthDate;
    try {
      BirthDate = new Date(birthdate);
      if (isNaN(BirthDate.getTime())) {
        return res.status(400).json({ message: "Invalid birthdate format" });
      }
    } catch (error) {
      return res.status(400).json({ message: "Invalid birthdate format" });
    }

    const user = await prisma.user.create({
      data: {
        name: `${firstname} ${lastname}`,
        birthdate: BirthDate,
        gender,
        bloodtype,
        email,
        phone,
        password: hashedPassword,
      },
    });
    res
      .status(201)
      .json({
        message: "User registered successfully",
        user: { userId: user.id },
      });
  } catch (error) {
    console.log(error);
    next(error);
  }
};


export const registerDoctor = async (req, res, next) => {
  try {
    let {firstname , lastname , email , password , phone , specialty } = req.body;
    if (!firstname || !lastname || !email || !password ||!phone || !specialty) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }
    email = email.toLowerCase();
    const existingDoctor = await prisma.doctor.findUnique({ where: { email } });
    if (existingDoctor) {
      return res.status(409).json({ message: "Email already exists" });
    }
    const specialtyExists = await prisma.specialty.findUnique({
      where: { id: specialty },
    });
    if (!specialtyExists) {
      return res.status(404).json({ message: "Specialty is wrong" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const doctor = await prisma.doctor.create({
      data: {
        name: `${firstname} ${lastname}`,
        email,
        password: hashedPassword,
        phone,
        specialtyId:specialty,
      },
    });
    res.status(201).json({ message: "Doctor registered successfully", user: { userId: doctor.id } });

  }
  catch (error) {
    console.log(error);
    next(error);
  }
}


export const updateToken = async (req, res, next) => {
  try {
    const {userId} = req.user;
    const {token} = req.body;

    if (!token) {
      return res.status(400).json({ message: "Please provide token" });
    }
    const user = await prisma.doctor.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if(user.token === token){
      return res.status(200).json({ message: "Token is the same" });
    }
    const updatedUser = await prisma.doctor.update({
      where: { id: userId },
      data: { mobileToken: token },
    });
    res.status(200).json({ message: "Token updated successfully", user: { userId: updatedUser.id } });
  }
  catch (error) {
    console.log(error);
    next(error);
  }
}


export const forgetPassword = async (req , res , next) => {
  try{
    let {email} = req.body ;

    email = email.toLowerCase() ;

    const user = await prisma.user.findUnique({where:{email:email}}) ;

    if(!user) {
      return res.status(404).json({message:"user not found"}) ;
    }

    const forgetcode = Math.floor(1000 + Math.random() * 9000)
    .toString()
    .padStart(4, "0");

    await prisma.user.update({where:{id:user.id} , data:{forgetcode:forgetcode}}) ;

    SibApiV3Sdk.ApiClient.instance.authentications["api-key"].apiKey =
    process.env.BERVEO_API;

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  let htmlTable =  `<!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <title>Siehety Forget Password Code</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; margin: 0;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <img src="https://i.imgur.com/vz54cfz.png" alt="Siehety Forget Password" style="width: 100%; display: block;">
      <div style="padding: 30px;">
        <h2 style="color: #333;">Your Siehety Forget Password Code 🔐</h2>
        <p style="font-size: 16px; color: #555;">We received a request to reset your password for your Siehety account.</p>
        <p style="font-size: 16px; color: #555;">Please enter the following 4-digit code in the app to proceed:</p>
  
        <div style="font-size: 32px; font-weight: bold; color: #1a73e8; text-align: center; margin: 20px 0;">
          <span style="letter-spacing: 10px;">${forgetcode}</span>
        </div>
  
        <p style="font-size: 14px; color: #777;">If you did not request a password reset, you can safely ignore this message.</p>
  
        <p style="margin-top: 40px; font-size: 14px; color: #aaa;">— The Siehety Team</p>
      </div>
    </div>
  </body>
  </html>`;

  const sendSmtpEmail = {
    to: [
      {
        email: `${user.email}`, 
        name: "Forget Password", // Recipient name
      },
    ],
    sender: {
      email: "enjazapp098@gmail.com", // Verified sender email in Brevo
      name: `Sehaty No reply`, // Sender name
    },
    subject: `Forget Password OTP - Siehety app`,
    htmlContent: htmlTable, // our dynamically created table as content
  };

  apiInstance
    .sendTransacEmail(sendSmtpEmail)
    .then(function (data) {
      console.log("Email sent successfully:", data);
    })
    .catch(function (error) {
      console.error("Error sending email:", error);
      res.status(400).send({ error: "Error sending email", details: error });
    });

    res.status(200).json({
      message: "reset code has been sent successfully",
      userId: user.id,
    });

  }
  catch(error) {
    console.log(error) ;
    next(error) ;
  }
}

export const verifyCode = async (req , res , next) => {
  try{
    const {code} = req.body ;
    const {userId} = req.params ;

    const user = await prisma.user.findUnique({where:{id:userId}}) ;

    if(!user) {
      return res.status(404).json({message:"user is not found"}) ;
    }

    if(user.forgetcode !== code) {
      return res.status(400).json({ message: "Invalid code" });
    }

    await prisma.user.update({where:{id:userId} , data:{forgetcode:null , changePasswordPermetion:true}}) ;

    return res.status(200).json({ message: "Code verified successfully" });

  }
  catch(error) {
    console.log(error) ;
    next(error) ;
  }
}

export const changePassword = async (req , res , next) => {
  try {
    const {password , confirmPassword} = req.body ;
    const {userId} = req.params ;

    if(password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await prisma.user.findUnique({where:{id:userId}}) ;

    if(!user) {
      return res.status(404).json({message:"user not found"}) ;
    }

    if(user.changePasswordPermetion !== true) {
      return res.status(403).json({ message: "User does not have permission to change password yet" });
    }

    const hashedPassword = await bcrypt.hash(password , 12) ;
    const updatepassword = await prisma.user.update({where:{id:userId} , data:{password:hashedPassword , changePasswordPermetion:false}});

    return res.status(200).json({ message: "Password has been changed successfully" });


  }
  catch(error) {
    console.log(error) ;
    next(error);
  }
}