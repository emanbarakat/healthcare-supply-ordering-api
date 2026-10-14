import { Request } from "express";
import multer from "multer";



export const categoryStorage=multer.diskStorage({
    filename:(req:Request,file:any,cb:Function)=>{
        const extenstion = file.mimetype.split("/")[1]
         cb(null,Date.now().toString()+"."+extenstion);
    }
  });//eof storage
 export const categoryFileFilter=(req:any,file:any,cb:Function)=>{
    if(file.mimetype=="image/jpeg"||
       file.mimetype=="image/jpg"||
       file.mimetype=="image/png")
       cb(null,true)
    else
    cb(null,false)
  };//eof fileFilter
  
  export const limits={ fileSize:  5 * 1024 * 1024};