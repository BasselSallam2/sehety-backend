import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import "dotenv/config";
import jwt from "jsonwebtoken";

export const authenticateUser = async (req, res, next) => {
  let token = req.cookies.token || req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    let decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    console.log(decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
