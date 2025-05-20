import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
dotenv.config();
const prisma = new PrismaClient();
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

const PORT = process.env.PORT || 3000;

const app = express();


app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


import ErrorHandler from "./Middleware/ErrorHandler.js";
import AuthRouter from "./Router/AuthRouter.js";
import AppointmentRouter from "./Router/AppointmentRouter.js";
import DoctorRouter from "./Router/doctorsRouter.js";
import ProfileRouter from "./Router/ProfileRouter.js";
import BannerRouter from "./Router/BannerRouter.js"


app.use("/api", AuthRouter);
app.use("/api", AppointmentRouter);
app.use("/api", DoctorRouter);
app.use("/api", ProfileRouter);
app.use('/api' , BannerRouter) ;

app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
  });
  
  app.use("/", (req, res, next) => {
    res.status(404).send("Page not found");
  });
  
  app.use(ErrorHandler);


  
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
