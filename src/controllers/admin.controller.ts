import { BaseController } from "./base.controller";
import {Admin} from "./../models/admin.model"
import { AdminService } from "./../services/admin.service";
import { FlyBoyService } from "./../services/flyBoy.service";
import { DoctorService } from "./../services/doctor.service";
import { PharmacistService } from "../services/pharmacist.service";
import { Request,Response,NextFunction } from "express";
import { OrderService } from "../services/order.service";
import mongoose from "mongoose";
import bcrypt =require("bcrypt");





export class AdminController extends BaseController<Admin>
{
   
    _serviceObj=new AdminService();
    _flyboyService=new FlyBoyService();
    _doctorService=new DoctorService();
    _pharmacistService=new PharmacistService();
    _orderService=new OrderService();

   
    createAdmin=async(request: Request, response: Response, next: NextFunction) => {
      try{
              request.body.password = bcrypt.hashSync(request.body.password,10);
              const admin=await this._serviceObj.createOne(request.body);
              
              response.status(200).json(admin);
      }catch(error)
      {next(error)}
    }

      setUsersStatus=async(request: Request, response: Response, next: NextFunction) => {
        let types=["doctor","pharmacist","flyboy","admin","subadmin"];
        // let status=["active",""];
        let userType=request.body.type;
        let id=request.body.id;
        let status=request.body.status;
       
        try{

            if(!types.includes(userType))
            throw new Error("Bad request type...");

            userType=userType+"s";
           
            const data = await this._serviceObj.setUserSatatus(id,userType,status);
             if(data==null)
             throw new Error("User Not Exists");

            response.status(200).json({message:"status updated"});
          } catch (err) {
             next(err);
          }        
      }

     getAllPendingDoctors=async (request: Request, response: Response, next: NextFunction) => {
       
        try{
        //   let status=request.params.status;
          const data = await this._serviceObj.getAllUsersByStatus("doctors","pending","_id fullName type accountStatus phoneNumber",+request.params.page)
         
          response.status(200).json(data);
        } catch (err) {
           next(err);
        }
      };
      getAllPendingPharmasists=async (request: Request, response: Response, next: NextFunction) => {
       
        try{
        //   let status=request.params.status;
          const data = await this._serviceObj.getAllUsersByStatus("pharmacists","pending","_id fullName type accountStatus phoneNumber",+request.params.page)
         
          response.status(200).json(data);
        } catch (err) {
           next(err);
        }
      };
      getAllBlockedDoctors=async (request: Request, response: Response, next: NextFunction) => {
       
        try{
        //   let status=request.params.status;
          const data = await this._serviceObj.getAllUsersByStatus("doctors","blocked","_id fullName type accountStatus phoneNumber",+request.params.page);
         
          response.status(200).json(data);
        } catch (err) {
           next(err);
        }
      };
      getAllBlockedPharmasists=async (request: Request, response: Response, next: NextFunction) => {
       
        try{
        //   let status=request.params.status;
          const data = await this._serviceObj.getAllUsersByStatus("pharmacists","blocked","_id fullName type accountStatus phoneNumber",+request.params.page);
         
          response.status(200).json(data);
        } catch (err) {
           next(err);
        }
      };
      getAllDoctors=async (request: Request, response: Response, next: NextFunction) => {
        try{
          //   let status=request.params.status;
            const data = await this._doctorService.findAll({accountStatus:"active"},"",+request.params.page);
            response.status(200).json(data);
          } catch (err) {
             next(err);
          }
      }
      getAllPharmasists=async (request: Request, response: Response, next: NextFunction) => {
        try{
          //   let status=request.params.status;
            const data = await this._pharmacistService.findAll({accountStatus:"active"},"",+request.params.page);
           
            response.status(200).json(data);
          } catch (err) {
             next(err);
          }
      }
      getAllFlyboys=async (request: Request, response: Response, next: NextFunction) => {
        try{
          //   let status=request.params.status;
            const data = await this._flyboyService.findAll({accountStatus:"active"},"",+request.params.page);
           
            response.status(200).json(data);
          } catch (err) {
             next(err);
          }
      }
      getAllAdmins=async (request: Request, response: Response, next: NextFunction) => {
        try{
          //   let status=request.params.status;
            const data = await this._serviceObj.findAll({accountStatus:"active"},"",+request.params.page);
           
            response.status(200).json(data);
          } catch (err) {
             next(err);
          }
      }
     
    /************************Orders parts */
    
    doctorNewAddress=async (request: Request, response: Response, next: NextFunction) =>{
      try{
        //   let status=request.params.status;
          const data = await this._doctorService.updateOnewithCondition(
            {_id:new mongoose.Types.ObjectId(request.body.doctorId)},
            {
               $push:{  addresses:request.body.address}
            });
          response.status(200).json(data);
        } catch (err) {
           next(err);
        }

    }
    doctorUpdateBalance=async (request: Request, response: Response, next: NextFunction) =>{
      try{
        //   let status=request.params.status;
          const data = await this._doctorService.updateOnewithCondition(
            {_id:new mongoose.Types.ObjectId(request.body.doctorId)},
            {
               $set:{  balance:request.body.balance}
            });
          response.status(200).json(data);
        } catch (err) {
           next(err);
        }

    }
    pharmacistNewAddress=async (request: Request, response: Response, next: NextFunction) =>{
      try{
        //   let status=request.params.status;
          const data = await this._pharmacistService.updateOnewithCondition(
            {_id:new mongoose.Types.ObjectId(request.body.doctorId)},
            {
               $push:{  addresses:request.body.address}
            });
          response.status(200).json(data);
        } catch (err) {
           next(err);
        }

    }
    pharmacistUpdateBalance=async (request: Request, response: Response, next: NextFunction) =>{
      try{
        //   let status=request.params.status;
          const data = await this._pharmacistService.updateOnewithCondition(
            {_id:new mongoose.Types.ObjectId(request.body.doctorId)},
            {
               $set:{  balance:request.body.balance}
            });
          response.status(200).json(data);
        } catch (err) {
           next(err);
        }

    }


    /**
     * /orders/admin/changeOrderStatus
     * @param request 
     * @param response 
     * @param next 
     */
     changeOrderStatusDetails=async (request: Request, response: Response, next: NextFunction) =>{

        try{
              let updates=await this._orderService.updateOne(
                new mongoose.Types.ObjectId(request.body.id),
                {
                  $set:{
                    orderStatus:request.body.orderStatus,
                    "deliverInfo.date":request.body.date,
                    "deliverInfo.time":request.body.time,
                    "deliverInfo.address":request.body.address,
                    "deliverInfo.flyboy":request.body.flyboy
                  }
                }
              );

              response.status(200).json({message:"updated"});
        }catch(error)
        {
          next(error);
        }

     }

    /*
     * /orders/doctor/searchByDate/:date1/:date2
     */
    
    /**
     * /orders/doctor/getlatepaidOrders  for all clinet grouped by client id
     */
    /**
     * /**
     * /orders/doctor/getlatepaidOrders  for specified client
     */
    /**
     */
   
    

}
