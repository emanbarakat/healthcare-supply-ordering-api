import { Request, Response, NextFunction } from 'express';
import { validationResult } from "express-validator";
import fs=require("fs");
import path = require('path');
export class InputValidation
{
    //simple validator


static basicValidate(request: Request, response: Response, next: NextFunction){
        
    const result=validationResult(request);
   
    if(!result.isEmpty())
    {
       
        const errorMessages=result.array().reduce((current,error)=>current+error.msg+" , ","");
        let error=new Error(errorMessages);
        console.log(error);
      next(error);
    }
    else
    {
       
        next();
    }
}

    static validate(request: Request, response: Response, next: NextFunction){
        
        const result=validationResult(request);
       
        if(!result.isEmpty())
        {
           
            const errorMessages=result.array().reduce((current,error)=>current+error.msg+" , ","");
            let error=new Error(errorMessages);
          
            //to delete the image
            fs.unlink(path.resolve(request?.file?.path||""), (err) => {
                if (err) {
                 console.log("error deleteing file",request?.file?.path);
                }
                console.log(`successfully deleted ${request?.file?.path}`);
              });
          
             
             
            
            next(error);
        }
        else
        {
           
            next();
        }
    }
}