import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { Doctor } from "./../models/doctor.model";
import { Pharmacist } from "../models/pharmacist.model";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }

  return secret;
}

export class JwtClass {
  static token: any = null;

  static checkJwt = (
    request: any,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const token = <string>request.headers.authorization?.split(" ")[1];

      if (!token) {
        return response.status(401).json({ message: "Unauthorized" });
      }

      this.token = token;

      jwt.verify(token, getJwtSecret(), (error, decoded) => {
        if (error) {
          return response.status(401).json({ message: "Invalid token" });
        }

        request.jwt = decoded;
        next();
      });
    } catch (error) {
      next(error);
    }
  };

  static signinJwt = (user: Doctor | Pharmacist, role: string) => {
    try {
      return jwt.sign(
        {
          id: user._id,
          role,
          fullName: user.fullName,
        },
        getJwtSecret(),
        {
          expiresIn: process.env.JWT_EXPIRES_IN || "1h",
        }
      );
    } catch (error) {
      throw new Error("Unable to create authentication token");
    }
  };
}
