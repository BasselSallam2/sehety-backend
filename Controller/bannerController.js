import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import { sendNotification } from "../util/services/notification.js";

export const createBunner = async (req, res, next) => {
  try {
    const { title } = req.body;
    const { userId } = req.user;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let { filename } = req.file;

    const banner = await prisma.banner.create({
      data: {
        Title: title,
        image: filename,
        doctorId: userId,
      },
    });

    res.status(201).json({ message: "Banner is created", banner });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getAllBanners = async (req, res, next) => {
  try {
    const { id } = req.query;
    const banners = await prisma.banner.findMany({
      where: { id, isDeleted: false , Doctor:{isDeleted:false} },
      include: {
        User: { where:{isDeleted:false} , select: { id: true, name: true, email: true, phone: true } },
      },
    });
    res.status(200).json(banners);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const reserveBanner = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { bannerId } = req.params;

    const banner = await prisma.banner.findUnique({ where: { id: bannerId } });
    if (!banner) {
      res.status(404).json({ message: "banner is not found" });
    }
    const reserve = await prisma.banner.update({
      where: { id: bannerId },
      data: { User: { connect: { id: userId } } },
    });

    const doctor = await prisma.doctor.findUnique({where:{id:banner.doctorId} , select:{mobileToken:true}});
    const date = new Date().toISOString().split('T')[0];

    const mobileToken = doctor.mobileToken;
    const title = "New Banner Offer Reserved";
    const body = `You have a new offer reserved on ${date}`;
    const data = {
      bannerId: bannerId,
      date: date,
    };
    sendNotification(mobileToken, title, body, data);

    res.status(201).json({ message: "user has reserved the banner" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getMyBanners = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const doctor = await prisma.doctor.findUnique({
      where: { id: userId },
      select: { id: true, name: true, Banner: { where: { isDeleted: false } } },
    });

    if (!doctor) {
      return res.status(403).json({ message: "Sorry, you are not a doctor" });
    }

    res.status(200).json(doctor);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getMyBannersPatient = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, Banner: { where: { isDeleted: false } } },
    });

    if (!user) {
      return res.status(403).json({ message: "Sorry, you are not a patient" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const editbanner = async (req, res, next) => {
  try {
    const { title } = req.body;
    const { bannerid } = req.params;

    let { filename } = req.file;

    const banner = await prisma.banner.findUnique({ where: { id: bannerid } });

    if (!banner) {
      res.status(404).json({ message: "banner is not found" });
    }

    const updatebanner = await prisma.banner.update({
      where: { id: bannerid },
      data: {
        Title: title ? title : banner.Title,
        image: filename ? filename : banner.image,
      },
    });

    res.status(201).json({ messgae: "banner is updated succfully" });

    res.status(201).json({ message: "Banner is created", banner });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const deleteBanner = async (req, res, next) => {
  try {
    const { bannerid } = req.params;

    const banner = await prisma.banner.findUnique({ where: { id: bannerid } });

    if (!banner) {
      res.status(404).json({ message: "banner is not found" });
    }

    const updatebanner = await prisma.banner.update({
      where: { id: bannerid },
      data: { isDeleted: true },
    });

    res.status(201).json({ messgae: "banner is deleted succfully" });

    res.status(201).json({ message: "Banner is created", banner });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
