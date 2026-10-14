import { BaseController } from "./base.controller";
import {Category} from "./../models/category.model";
import {SubCategory} from "./../models/subCategory.model";


import { CategoryService } from "../services/category.service";
import { SubCategoryService } from "../services/category.service";
import {Request,Response, NextFunction } from "express";
import mongoose from "mongoose";
import { ProductService } from "../services/product.service";



export class CategoryController extends BaseController<Category>
{
    
        
 
    _serviceObj=new CategoryService();
    _subCategoryService=new SubCategoryService();
    

    updateImages=async (request: any, resposne: Response, next: NextFunction) => {
      
        try {
         
          const data = await this._serviceObj.updateOne(
                  new mongoose.Types.ObjectId(request.params.id),{
                  
                  $set:{"image":{url:request.imageurl,cloudinaryId:request.coudinaryId}}
                });  
        
          resposne.status(200).json(data);
        } catch (err) {
          next(err);
        }
      };
      deleteImage=async (request: Request, resposne: Response, next: NextFunction) => {
       
        try {
        
        
          const data = await this._serviceObj.updateOne(
            new mongoose.Types.ObjectId(request.body.id),
            { $unset:{"image":{url:request.body.deletedImage}}})
            resposne.status(200).json(data);
        } catch (err) {
          next(err);
        }
        
      };
    getCategoriesByType=async(request: Request, response: Response, next: NextFunction) => {

        try {
            let categories =await this._serviceObj.findAll({category_type:request.params.type},"name image.url",1,500);
            
            response.status(200).json(categories);
        } catch (error) {
            next(error);
        }

       
    }
    createCategory=async(request: Request, response: Response, next: NextFunction) => {

        try {
            let category =await this._serviceObj.createOne(request.body);
            response.status(200).json(category);
        } catch (error) {
            next(error);
        }

       
    }
    delete=async(request: Request, response: Response, next: NextFunction) => {

        try{
    
            const _id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(request.body.id);
           
            let deleteData=await this._serviceObj.deleteOne(_id);
            response.status(200).json({message:"deleted"});
    
    
        }catch(error)
        {
            next(error);
        }   
    
    }
}
export class SubCategoryController extends BaseController<SubCategory>
{
 
    _serviceObj=new SubCategoryService();
    _productService=new ProductService();
 
    
    updateImages=async (request: any, resposne: Response, next: NextFunction) => {
      
        try {
         
          const data = await this._serviceObj.updateOne(
                  new mongoose.Types.ObjectId(request.params.id),{
                  
                  $set:{"image":{url:request.imageurl,cloudinaryId:request.coudinaryId}}
                });  
        
          resposne.status(200).json(data);
        } catch (err) {
          next(err);
        }
      };
      deleteImage=async (request: Request, resposne: Response, next: NextFunction) => {
       
        try {
        
        
          const data = await this._serviceObj.updateOne(
            new mongoose.Types.ObjectId(request.body.id),
            { $unset:{"image":{url:request.body.deletedImage}}})
            resposne.status(200).json(data);
        } catch (err) {
          next(err);
        }
        
      };
    getSubCategories=async(request: Request, response: Response, next: NextFunction) => {

        try {
            let subcategories =await this._serviceObj.findAll({category:request.params.category},"name image.url",1,500);
            response.status(200).json(subcategories);
        } catch (error) {
            next(error);
        }

       
    }
    createSubCategory=async(request: Request, response: Response, next: NextFunction) => {

        try {
            let subCategory =await this._serviceObj.createOne(request.body);
            response.status(200).json(subCategory);
        } catch (error) {
            next(error);
        }  
    }
     updateSubCategory=async(request: Request, response: Response, next: NextFunction) => {

        let _id=request.body.id;
       
        let updatedBody={
           "$set":{ name:request.body.name,
                  category:request.body.category
                }
        }
        console.log(_id,updatedBody);
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

delete=async(request: Request, response: Response, next: NextFunction) => {

    try{

        const _id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(request.body.id);
       

        let deleteData=await this._serviceObj.deleteOne(_id);
        response.status(200).json({message:"deleted"});

    }catch(error)
    {
        next(error);
    }   

}
    
}