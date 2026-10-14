import { BaseController } from "./base.controller";
import {Brand} from "./../models/brand.model";


import { ProductService } from "../services/product.service";
import { BrandService } from "../services/brand.service";
import { NextFunction, Request, Response } from "express";



export class BrandController extends BaseController<Brand>
{
 
    _serviceObj=new BrandService();

    createBrand=async(request: Request, response: Response, next: NextFunction) => {

        try {
            let brand =await this._serviceObj.createOne(request.body);
            response.status(200).json(brand);
        } catch (error) {
            next(error);
        }  
    }
   
    
}
