import { BaseController } from "./base.controller";
import {Supplier} from "./../models/supplier.model";


import { SupplierService } from "../services/supplier.service";

import { NextFunction, Request, Response } from "express";
import mongoose, { mongo } from "mongoose";



export class SupplierController extends BaseController<Supplier>
{
 
    _serviceObj=new SupplierService();

    createSuppleir=async(request: Request, response: Response, next: NextFunction) => {

        try {
            let supplier =await this._serviceObj.createOne(request.body);
            console.log(supplier,"hi");
            response.status(200).json(supplier);
        } catch (error) {
            next(error);
        }  
    }

    updateSupplier=async(request: Request, response: Response, next: NextFunction) => {

        let _id=request.body.id;
        let products=request.body.products||[];
        let medicines=request.body.medicines||[];
        // let addresses=request.body.addresses;

        let updatedBody={
           $set:{ fullName:request.body.fullName,
            phoneNumber:request.body.phoneNumber,
            whatsAppNumber:request.body.whatsAppNumber,
            email:request.body.email,

                }
            }
      
        try {
            let subCategory =await this._serviceObj.updateOne(_id,updatedBody)
            response.status(200).json(subCategory);
        } catch (error) {
            next(error);
        }  
    }

   addProducts=async(request: Request, response: Response, next: NextFunction) => {

        let _id=request.body.id;
        let products=request.body.products||[];
       

        let updatedBody={
                $addToSet:{products:{$each:products}}
            }
      
        try {
            let subCategory =await this._serviceObj.updateOne(_id,updatedBody)
            response.status(200).json(subCategory);
        } catch (error) {
            next(error);
        }  
    }

    removeProduct=async(request: Request, response: Response, next: NextFunction) => {

        let _id=new mongoose.Types.ObjectId( request.body.id);
      
       

        let updatedBody={
                $pull:{products:request.body.product}
            }
      
        try {
            let subCategory =await this._serviceObj.updateOne(_id,updatedBody)
            response.status(200).json(subCategory);
        } catch (error) {
            next(error);
        }  
    }
    
   addMedicines=async(request: Request, response: Response, next: NextFunction) => {

    let _id=request.body.id;
    let medicines=request.body.medicines||[];
   

    let updatedBody={
            $addToSet:{medicines:{$each:medicines}}
        }
  
    try {
        let subCategory =await this._serviceObj.updateOne(_id,updatedBody)
        response.status(200).json(subCategory);
    } catch (error) {
        next(error);
    }  
}

removeMedicine=async(request: Request, response: Response, next: NextFunction) => {

    let _id=new mongoose.Types.ObjectId( request.body.id);
  
   

    let updatedBody={
            $pull:{medicines:request.body.medicine}
        }
  
    try {
        let subCategory =await this._serviceObj.updateOne(_id,updatedBody)
        response.status(200).json(subCategory);
    } catch (error) {
        next(error);
    }  
}

addAddress=async(request: Request, response: Response, next: NextFunction) => {

    let _id=request.body.id;
    let address=request.body.address;
   

    let updatedBody={
            $addToSet:{addresses:address}
        }
  console.log(updatedBody);
    try {
        let subCategory =await this._serviceObj.updateOne(_id,updatedBody)
        response.status(200).json(subCategory);
    } catch (error) {
        next(error);
    }  
}

removeAddress=async(request: Request, response: Response, next: NextFunction) => {

    let _id=new mongoose.Types.ObjectId( request.body.id);
  
   

    let updatedBody={
            $pull:{addresses:request.body.address}
        }
  
    try {
        let subCategory =await this._serviceObj.updateOne(_id,updatedBody)
        response.status(200).json(subCategory);
    } catch (error) {
        next(error);
    }  
}
}
