import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { BaseService } from "./../services/base.service"
import { OTPGenerator } from './../middelwraes/otpGenrator.middleware';
import path from 'path';
export   abstract class BaseController<schema>{
  abstract readonly _serviceObj: BaseService<schema>;

  /**
   * @param request  find all
   * @param resposne 
   * @param next 
   */
  getAll = async (request: Request, resposne: Response, next: NextFunction) => {
    
    try {
      const data = await this._serviceObj.findAll({},"",+request.params.page);
      resposne.status(200).json(data);
    } catch (err) {
      next(err);
    }
  };

  /**
   * 
   * @param request find by id
   * @param resposne 
   * @param next 
   */
  getOneById = async (request: Request, resposne: Response, next: NextFunction) => {
    const _id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(request.params.id);
    // const { fields = '' } = { ...request.query };
    try {
      const data = await this._serviceObj.findOneById(_id,"");
      resposne.status(200).json(data);
    } catch (err) {
      next(err);
    }
  };

  /**
   * 
   * @param request find by phone
   * @param resposne 
   * @param next 
   * @returns 
   */
  getOneByPhone = async (request: Request, resposne: Response, next: NextFunction) => {
   
    try {
      const data = await this._serviceObj.findOneByPhone(request.body.phoneNumber);
     
      return data;
    } catch (err) {
      next(err);
    }
  };
  

  /**
   * 
   * @param request insert
   * @param response 
   * @param next 
   */
  post = async (request: any, response:Response, next: NextFunction) => {
    const doc: any = request.body;
   
    try {
     
      doc.profileImage=request.imageurl;
      const data = await this._serviceObj.createOne(doc);
      //then gnerate OTP to send as verification
      //let otpCode=OTPGenerator.generateOTP();
      
      response.status(201).json({data,userType:request.body.type});
  
      
    } catch (err) {
   
      next(err);
    }
  };

  /**
   * 
   * @param request update
   * @param response 
   * @param next 
   */
  put = async (request: Request, response: Response, next: NextFunction) => {
    const doc: {} = request.body;
    const _id: mongoose.Types.ObjectId =request.body.id //new mongoose.Types.ObjectId(request.params.id);
    try {
      
      const data = await this._serviceObj.updateOne(_id, doc);
      response.status(200).json(data);
    } catch (err) {
      next(err);
    }
  };

  /**
   * 
   * @param request delete
   * @param response 
   * @param next 
   */
  delete = async (request: Request, response: Response, next: NextFunction) => {
    const _id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(request.body.id);
    try {
      
      const data = await this._serviceObj.deleteOne(_id);
      response.status(200).json(data);
    } catch (err) {
      next(err);
    }
  };

  /**
   * 
   * @param request change password
   * @param response 
   * @param next 
   */
  
  changePassword = async (request: any, response: Response, next: NextFunction) => {
    const password: string = request.body.newPassword;
    const oldPassword = request.body.oldPassword;
    const _id = new mongoose.Types.ObjectId(request.body.id);


    try {
          /*authorization*/
          
          const data = await this._serviceObj.changePassword(
            _id,
            password,
            oldPassword
          );

        response.status(200).json(data);
    } catch (err) {
      next(err);
    }
  };


 
  // forgetPassword=async (request: Request, response: Response, next: NextFunction) => {
  //            //find one bYPohne if exixts send him otp
  //            try{
  //                 let phone=request.body.phoneNumber;
  //                 let user=await this._serviceObj.findOneByPhone(phone);
  //                 if(user==null)
  //                 throw new Error("user doesn't exists");

  //                 //send user an otp
  //                 response.status(200).json({otpCode:OTPGenerator.generateOTP()});
                  
  //            }catch(error)
  //            {
  //              next(error);
  //            }
             
  // } 
}
