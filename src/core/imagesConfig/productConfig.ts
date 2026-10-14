import { Request } from "express";
import multer from "multer";
import path from "path";

export const deletePath=(request:any)=>{
  //console.log(path.join(__dirname,"..","..","..","src","images","products",request.body.id+""))
// return  path.join(__dirname,"..","..","..","src","images","products",request.body.id+"")

}
export const productStorage=multer.diskStorage({
   //  destination:(req:any,file:any,cb:Function)=>{

      //   cb(null,path.join(__dirname,"..","..","..","src","images","products",req.params.id+""))    
       // cb(null,path.join("images","products",req.params.id+""))    
        
   //  },
    filename:(req:Request,file:any,cb:Function)=>{
        const extenstion = file.mimetype.split("/")[1]
         cb(null,Date.now().toString()+"."+extenstion);
    }
  });//eof storage
 export const productFileFilter=(req:any,file:any,cb:Function)=>{
    if(file.mimetype=="image/jpeg"||
       file.mimetype=="image/jpg"||
       file.mimetype=="image/png")
       cb(null,true)
    else
    cb(null,false)
  };//eof fileFilter
  
  export const limits={ fileSize:  5 * 1024 * 1024};