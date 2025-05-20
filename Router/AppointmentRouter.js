import express from "express";
const router = express.Router();
import {
  createAppointment,
  getAppointments,
  resirveAppointment,
  getFreeAppointments,
  myAppointments,
  cancellAppointment,
  getUserAppointments,
  getReservedAppointments,
  getReservedAppointmentsbyID
} from "../Controller/AppointmentController.js";
import { authenticateUser } from "../Middleware/Authentication.js";

router.get(
  "/doctor/appointment/reserved",
  authenticateUser,
  getReservedAppointments
);
router.post("/doctor/appointment", authenticateUser, createAppointment);
router.get("/doctor/appointment/:doctorId", authenticateUser, getAppointments);

router.get(
  "/doctor/appointment/reserved/:doctorId",
  authenticateUser,
  getReservedAppointmentsbyID
);
router.get("/patient/appointment/:userId", getUserAppointments);
router.get(
  "/doctor/appointment/free/:doctorId",
  authenticateUser,
  getFreeAppointments
);
router.post(
  "/patient/resirve/:appointmentId",
  authenticateUser,
  resirveAppointment
);
router.get("/patient/appointment", authenticateUser, myAppointments);
router.delete(
  "/patient/appointment/:appointmentId",
  authenticateUser,
  cancellAppointment
);

export default router;
