import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        birthdate: true,
        bloodtype: true,
        weight: true,
        hight: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const editUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    let {
      firstname,
      lastname,
      phone,
      birthdate,
      gender,
      bloodtype,
      weight,
      hight,
    } = req.body;
    if (
      !firstname ||
      !lastname ||
      !phone ||
      !birthdate ||
      !gender ||
      !bloodtype ||
      !weight ||
      !hight
    ) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    const Birthdate = new Date(birthdate);
    weight = parseInt(weight) ;
    hight = parseInt(hight) ;

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: `${firstname} ${lastname}`,
        phone,
        birthdate: Birthdate,
        gender,
        bloodtype,
        weight,
        hight,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getDoctorProfile = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        Specialty: { select: { specialty: true, id: true } },
      },
    });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const result = {
      id: doctor.id,
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      specialty: doctor.Specialty.specialty,
      specialtyId: doctor.Specialty.id,
    };

    return res.status(200).json({ result });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        birthdate: true,
        bloodtype: true,
        weight: true,
        hight: true,
      },
    });
    if (!users) {
      return res.status(404).json({ message: "Users not found" });
    }
    return res.status(200).json({ users });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const now = new Date();

    await prisma.user.update({
      where: { id: userId },
      data: { isDeleted: true, email: `${user.email}_deleted_${now}` , phone: `${user.phone}_deleted_${now}`},
    });

    res.status(200).json({message:"user deleted succfully"}) ;
  } catch (error) {}
};



export const adminEditUser = async (req, res, next) => {
    try {
      const { userId } = req.params;
      let {
        firstname,
        lastname,
        phone,
        birthdate,
        gender,
        bloodtype,
        weight,
        hight,
      } = req.body;
      if (
        !firstname ||
        !lastname ||
        !phone ||
        !birthdate ||
        !gender ||
        !bloodtype ||
        !weight ||
        !hight
      ) {
        return res.status(400).json({ message: "Please fill all the fields" });
      }
      const Birthdate = new Date(birthdate);
  
      const user = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          name: `${firstname} ${lastname}`,
          phone,
          birthdate: Birthdate,
          gender,
          bloodtype,
          weight,
          hight,
        },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  