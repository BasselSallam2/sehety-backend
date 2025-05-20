import { PrismaClient } from "@prisma/client";
import { DateTime } from "luxon";
import pkg from "rrule";
const { RRule } = pkg;

const prisma = new PrismaClient();

import {sendNotification} from "../util/services/notification.js";

export const createAppointment = async (req, res) => {
  try {
    const {
      scheduleName,
      startDate,
      endDate,
      time,
      appointmentDuration,
      breakDuration,
    } = req.body;
    const { userId } = req.user;

    const start = DateTime.fromISO(startDate);
    const end = DateTime.fromISO(endDate);

    const rruleDayMap = {
      Monday: RRule.MO,
      Tuesday: RRule.TU,
      Wednesday: RRule.WE,
      Thursday: RRule.TH,
      Friday: RRule.FR,
      Saturday: RRule.SA,
      Sunday: RRule.SU,
    };

    const appointmentEntries = [];

    for (const entry of time) {
      const weekday = rruleDayMap[entry.day];
      if (!weekday) continue;

      const [startHour, startMinute] = entry.start.split(":").map(Number);
      const [endHour, endMinute] = entry.end.split(":").map(Number);

      // Generate timeslots between start and end with appointment and break durations
      let current = start.set({
        hour: startHour,
        minute: startMinute,
        second: 0,
      });
      const dayEnd = start.set({ hour: endHour, minute: endMinute, second: 0 });

      while (current < dayEnd) {
        const ruleStartDate = current.toJSDate();

        const rule = new RRule({
          freq: RRule.WEEKLY,
          interval: 1,
          byweekday: [weekday],
          dtstart: ruleStartDate,
          until: end.toJSDate(),
        });

        appointmentEntries.push({
          name: `${scheduleName} - ${entry.day} @ ${current.toFormat("HH:mm")}`,
          rrule: rule.toString(),
          doctorId: userId,
        });

        // Increment by appointmentDuration + breakDuration
        current = current.plus({
          minutes: appointmentDuration + breakDuration,
        });
      }
    }

    

    await prisma.appointment.createMany({
      data: appointmentEntries,
    });

    res.status(200).json({
      message: "Recurring appointment rules created successfully.",
      count: appointmentEntries.length,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getAppointments = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: {
        id: doctorId,
      },
    });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorId,
      },
      select: { name: true, id: true, rrule: true },
    });

    const mappedarray = appointments.map((appointment) => {
      return {
        id: appointment.id,
        day: appointment.name.split(" - ")[1].split(" @ ")[0],
        time: appointment.name.split(" @ ")[1],
      };
    });

    const dayOrder = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 7,
    };

    const sortedAppointments = mappedarray.sort((a, b) => {
      const dayDiff = dayOrder[a.day] - dayOrder[b.day];
      if (dayDiff !== 0) {
        return dayDiff;
      }
      // Sort by time if days are equal
      return a.time.localeCompare(b.time);
    });

    res.status(200).json({
      from:
        appointments[0].rrule.slice(8, 12) +
        "/" +
        appointments[0].rrule.slice(12, 14) +
        "/" +
        appointments[0].rrule.slice(14, 16),
      to:
        appointments[0].rrule.slice(69, 73) +
        "/" +
        appointments[0].rrule.slice(73, 75) +
        "/" +
        appointments[0].rrule.slice(75, 77),
      appointments: sortedAppointments,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const resirveAppointment = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const { userId } = req.user;
    const { date } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: "Appointment ID is required" });
    }
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },include:{Doctor:true}
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const reservedAppointment = await prisma.reservationSlot.create({
      data: {
        appointmentId: appointmentId,
        userId: userId,
        date: date,
      },
    });

    const mobileToken = appointment.Doctor.mobileToken;
    const title = "New Appointment Reserved";
    const body = `You have a new appointment reserved on ${date} for ${appointment.name}`;
    const data = {
      appointmentId: reservedAppointment.id,
      date: date,
    };
    sendNotification(mobileToken, title, body, data);



    res.status(200).json({
      message: "Appointment reserved successfully.",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};


export const getFreeAppointments = async (req, res, next) => {
  try {
    const {date} = req.query;
    const { doctorId } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: {
        id: doctorId,
      },select:{id:true}
    });
    if(!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorId,
      },
      select: { name: true, id: true, rrule: true },
    });
    if(appointments.length === 0) {
      return res.status(404).json({ message: "No appointments found for this doctor" });
    }
    const reservedAppointments = await prisma.reservationSlot.findMany({
      where: {
        appointmentId: {
          in: appointments.map((appointment) => appointment.id),
        },
        date: date,
      },
    });

    
    const freeappointments = appointments.filter((appointment) => { 
      const isReserved = reservedAppointments.some(
        (reserved) => reserved.appointmentId === appointment.id
      );
      return !isReserved;
    }
    );

    const mappedarray = freeappointments.map((appointment) => {
      return {
        id: appointment.id,
        day: appointment.name.split(" - ")[1].split(" @ ")[0],
        time: appointment.name.split(" @ ")[1],
      };
    });

    const dayOrder = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 7,
    };

    const sortedAppointments = mappedarray.sort((a, b) => {
      const dayDiff = dayOrder[a.day] - dayOrder[b.day];
      if (dayDiff !== 0) {
        return dayDiff;
      }
      // Sort by time if days are equal
      return a.time.localeCompare(b.time);
    });

    res.status(200).json({
      from:
        appointments[0].rrule.slice(8, 12) +
        "/" +
        appointments[0].rrule.slice(12, 14) +
        "/" +
        appointments[0].rrule.slice(14, 16),
      to:
        appointments[0].rrule.slice(69, 73) +
        "/" +
        appointments[0].rrule.slice(73, 75) +
        "/" +
        appointments[0].rrule.slice(75, 77),
      appointments: sortedAppointments,
    });

  
  }
  catch (error) {
    console.log(error);
    next(error);
  }
}


export const getUserAppointments = async (req, res, next) => {
  try{
    
    const {userId} = req.params;
    const nowDate = new Date();
   
   
    let appointments = await prisma.reservationSlot.findMany({
      where:{
        userId:userId,  
      },include:{Appointment:{include:{Doctor: {include: {Specialty:true}}}}}
});

    
      console.log(appointments) ;
      
      let fillteredAppointments = appointments.map((appointment) => {
        let appointmentDate = new Date(appointment.date);
        if(appointment.isCancelled === true) {
          return   {
            id:appointment.id ,
            status: "Cancelled" ,
            date:appointment.date ,
            doctorName: appointment.Appointment.Doctor.name ,
            doctorId: appointment.Appointment.Doctor.id ,
            doctorSpeciality: appointment.Appointment.Doctor.Specialty.specialty
          }
        }else if(appointmentDate < nowDate) {
         return   {
            id:appointment.id ,
            status: "Done" ,
            date:appointment.date ,
            doctorName: appointment.Appointment.Doctor.name ,
            doctorId: appointment.Appointment.Doctor.id ,
            doctorSpeciality: appointment.Appointment.Doctor.Specialty.specialty
          }
        }else if(appointmentDate > nowDate && appointment.isCancelled === false) {
           return  {
            id:appointment.id ,
            status: "Upcoming" ,
            date:appointment.date ,
            doctorName: appointment.Appointment.Doctor.name ,
            doctorId: appointment.Appointment.Doctor.id ,
            doctorSpeciality: appointment.Appointment.Doctor.Specialty.specialty
          }
        }
        
      }); 
    
    
    res.status(200).json({
      appointments: fillteredAppointments,
    });

  }
  catch (error) {
    console.log(error);
    next(error);
  }

}

export const cancellAppointment = async (req , res , next) => {
  try {
    const { appointmentId } = req.params;
    const { userId } = req.user;

    if (!appointmentId) {
      return res.status(400).json({ message: "Appointment ID is required" });
    }

    const appointment = await prisma.reservationSlot.findUnique({
      where: {
        id: appointmentId,
      },
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.userId !== userId) {
      return res.status(403).json({ message: "You are not authorized to cancel this appointment" });
    }

    await prisma.reservationSlot.update({
      where: {
        id: appointmentId,
      },
      data: {
        isCancelled: true,
      },
    });

    res.status(200).json({
      message: "Appointment cancelled successfully.",
    });
  }
  catch (error) {
    console.log(error);
    next(error);
  }
}

export const myAppointments = async (req, res, next) => {
  try{
    const {fillter} = req.query;
    const {userId} = req.user;
    const nowDate = new Date();
    if(!fillter){
      return res.status(400).json({message:"fillter is required"});
    }
    if(fillter !== "done" && fillter !== "cancelled" && fillter !== "upcoming"){
      return res.status(400).json({message:"fillter should be either done or cancelled or upcoming"});
    }
    const appointments = await prisma.reservationSlot.findMany({
      where:{
        userId:userId,  
      },include:{Appointment:{include:{Doctor:{include:{Specialty:true}}}}}
});
    
    let fillteredAppointments ;
    if(fillter === "cancelled"){
      fillteredAppointments = appointments.filter((appointment) => appointment.isCancelled === true);
    }
    else if(fillter === "done"){
      console.log("done")
      fillteredAppointments = appointments.filter((appointment) => {
        let appointmentDate = new Date(appointment.date);
        return appointmentDate < nowDate ;
      });
      
    }
   
    else if(fillter === "upcoming"){
      fillteredAppointments = appointments.filter((appointment) => {
        let appointmentDate = new Date(appointment.date);
        return appointmentDate > nowDate && appointment.isCancelled === false;
      });
    }

    const mappedarray = fillteredAppointments.map((appointment) => {
      return {
        id: appointment.id,
        date: appointment.date,
        doctorName: appointment.Appointment.Doctor.name,
        doctorId: appointment.Appointment.Doctor.id,
        doctorspecialization: appointment.Appointment.Doctor.Specialty.specialty,
      };
    });
    
    res.status(200).json({
      appointments: mappedarray,
    });

  }
  catch (error) {
    console.log(error);
    next(error);
  }

}

export const getReservedAppointments = async (req , res , next) => {
  try {
    const {userId} = req.user;
    const doctor = await prisma.doctor.findUnique({
      where: {
        id: userId,
      },
    });
    if (!doctor) {
      return res.status(404).json({ message: "Sorry you should be a doctor" });
    }
    const appointments = await prisma.reservationSlot.findMany({
      where:{
        Appointment:{
          doctorId:userId
        } , isCancelled:false
      },include:{Appointment:true , User:true}
    });


    const mappedappointments = appointments.map((appointment) => {
      return {
        appointmentid: appointment.id,
        date: appointment.date,
        patientName: appointment.User.name,
        patientPhone: appointment.User.phone,
        patientId: appointment.User.id,
        appointmenthour:appointment.Appointment.name.split(" @ ")[1],
        appointmentday: appointment.Appointment.name.split(" - ")[1].split(" @ ")[0],
      };
    }
    );

    res.status(200).json({
      appointments: mappedappointments,
    });



  }
  catch(error) {
    console.log(error);
    next(error);
  }
}

export const getReservedAppointmentsbyID = async (req , res , next) => {
  try{
    const {doctorId} = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: {
        id: doctorId,
      },
    });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor is not found" });
    }
    const appointments = await prisma.reservationSlot.findMany({
      where:{
        Appointment:{
          doctorId:doctorId
        } , isCancelled:false
      },include:{Appointment:true , User:true}
    });
    


    const mappedappointments = appointments.map((appointment) => {
      return {
        appointmentid: appointment.id,
        date: appointment.date,
        patientName: appointment.User.name,
        patientPhone: appointment.User.phone,
        patientId: appointment.User.id,
        appointmenthour:appointment.Appointment.name.split(" @ ")[1],
        appointmentday: appointment.Appointment.name.split(" - ")[1].split(" @ ")[0],
      };
    }
    );

    res.status(200).json({
      appointments: mappedappointments,
    });


  }
  catch(error) {
    console.log(error);
    next(error);
  }

}