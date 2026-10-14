import { NextFunction, Request,response,Response } from "express";

const ErrorHnadler=(error:Error,request:Request,response:Response,next:NextFunction)=>{
    
    console.log(error);
    response.status(500).json({message:error+""});
}
export default ErrorHnadler;