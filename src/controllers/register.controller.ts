import { NextFunction, Request, response, Response } from 'express';

import bcrypt =require("bcrypt");
import fs from "fs";

import { DoctorController } from './doctor.controller';
import { PharmacistController } from './pharmacist.controller';
import { FlyBoyController } from './flyBoy.controller';
import { OTPGenerator } from './../middelwraes/otpGenrator.middleware';
import { RegisterService } from './../services/register.service';
import path = require('path');

let doctorController=new DoctorController();
let pharmacistController=new PharmacistController();
let flyboyController=new FlyBoyController();

export class RegisterController 
{
   
    
   /**
    * add new user depending on type (doctor, merchant ,flyboy,subadmin)
    * @param request  
    * @param response 
    * @param next 
    */
    postUser=async function(request:Request,response:Response,next:NextFunction)
    {
        /**
         * post doctor , pharmacist and flyboy depending on type value 
         */
        
        try{
            let doctor=await doctorController.getOneByPhone(request,response,next)
            if(doctor!=null )
            {
                //remove uploaded images from multer
                // fs.unlink(path.resolve(request?.file?.path||""), (err) => {console.log("unlink")});
                response.status(403).json({message:"phone number already exists.."});
            }
            else
            {
                let pharmacist=await  pharmacistController.getOneByPhone(request,response,next);
                if(pharmacist!=null)
                {   console.log("here error")
                    // fs.unlink(path.resolve(request?.file?.path||""), (err) => { console.log("unlink")});
                    response.status(403).json({message:"phone number already exists.."});

                }
                else
                {
                    //now hash the password
    
                    request.body.password = bcrypt.hashSync(request.body.password,10);
                
                    //then gnerate OTP to send as verification
                   
                    // if(request.file!=null)
                    // {
                    //      request.body.profileImage=request.file.path;
                    // }else
                    // {
                    //     //defualt image path depending on type
                    //     let folderName=request.body.type+"s";
                    //     request.body.profileImage=path.join(__dirname,"..","images",folderName,"avatar.png")
                    // }
                   
                   
                    if(request.body.type=="doctor")
                    {
                        doctorController.post(request,response,next);
                        
                    }          
                        
                    else if(request.body.type=="pharmacist")
                    {
                        
                        pharmacistController.post(request,response,next);
                    }
                    // else if(request.body.type=="flyboy")
                    // {
    
                    //     flyboyController.post(request,response,next);
                    // }
                    else
                    {
                        throw new Error("Internal Error..."); 
                    }
                    
                }
    
            }            
        }catch(error)
        {
            next(error);
        }
    }
    /**
     * 
     * @param request forget password
     * @param response 
     * @param next 
     */

    async forgetPassword(request:Request,response:Response,next:NextFunction)
    {
        let doctor=await doctorController.getOneByPhone(request,response,next)
        if(doctor==null)
        {
            let pharmacist=await  pharmacistController.getOneByPhone(request,response,next);
            if(pharmacist==null)
            {
                let flyBoy=await flyboyController.getOneByPhone(request,response,next);
                if(flyBoy==null)
                throw new Error("Internal Error..");//("phone number doen't exists");
                else
                 response.status(200).json({otpCode:OTPGenerator.generateOTP(),id:flyBoy._id});

            }
            else
            {
            response.status(200).json({otpCode:OTPGenerator.generateOTP(),id:pharmacist._id});

            }
        }
        else
        {
            response.status(200).json({otpCode:OTPGenerator.generateOTP(),id:doctor._id});
        }                
    }

    /**
   * 
   * @param request get all governorates
   * @param response 
   * @param next 
   */
  async getGovernorates(request: Request, response: Response, next: NextFunction)
  {
      console.log(this,"register Object")
    try{

        const governorates=await  RegisterService.getGovernorates();
        response.status(200).json(governorates);
    }catch(error)
    {
      next(error);
    }

  }
  /**
   * 
   * @param request get cities by governorate id
   * @param response 
   * @param next 
   */
  async getCities(request: Request, response: Response, next: NextFunction)
  {
    try{

        const cities=await  RegisterService.getCities(+request.params.id);
        response.status(200).json(cities);
    }catch(error)
    {
      next(error);
    }

  }
}