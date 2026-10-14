import { Request } from "express";
import multer from "multer";

export const storage = multer.diskStorage({
  filename: (req: Request, file: any, cb: Function) => {
    const extension = file.mimetype.split("/")[1];
    const uniqueName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}.${extension}`;

    cb(null, uniqueName);
  },
});

export const fileFilter = (req: any, file: any, cb: Function) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

export const limits = { fileSize: 5 * 1024 * 1024 };
