import { CategoryController } from "../controllers/category.controller";
import express =require("express");
import {body, param} from "express-validator"

import {InputValidation} from "../middelwraes/validation.middleware";
import { JwtClass } from "./../middelwraes/auth.middleware";
import {cloudinary} from "./../core/utils/cloudinary";
import { categoryFileFilter, categoryStorage ,limits} from "./../core/imagesConfig/CategoryConfig";
import multer = require("multer");
import { CategoryModel } from "../models/category.model";

let _categoryController=new CategoryController();
const router=express.Router();

/********************* validators */
const categoriesGetValidator=[
    param("type").isIn(["product","medicine","accessories"])
                .withMessage(`wrong categories type product,medicine,accessories `)
]
const categoriescreateValidator=[
    body("name").optional().isString().withMessage("category name should be string"),
    body("category_type").optional().isIn(["product","medicine","accessories"])
                .withMessage(`wrong categories type product,medicine,accessories `)
]
 let deleteValidator=[
    body("id").isMongoId().withMessage("wrong id type.......")
]
let idValidator=[
    param("id").isMongoId().withMessage("wrong id type.......")
]
/**********************
 * Authorization
 */
 router.use(JwtClass.checkJwt);
 router.use((request:any,response,next)=>{
             if(request.jwt.role=="doctor"|| request.jwt.role=="admin"|| request.jwt.role=="pharmacist")
             next();
             else
             next(new Error("Un Authorized"));
 
 });
 const checkOnlyAdmin=function(request:any,response:any,next:any)
 {
     if(request.jwt.role!="admin") next(new Error("not Authorized"));
     else
     next();   
 }
 const checkDoctor=function(request:any,response:any,next:any)
 {
     if(request.body.id!=request.jwt.id) next(new Error("not Authorized"));
     else
     next();   
 }

/***********************************
 * Routers
 */



router.get("/:type",categoriesGetValidator,
            InputValidation.basicValidate,
            _categoryController.getCategoriesByType)

router.route("")
.post(categoriescreateValidator,
             InputValidation.basicValidate,
             _categoryController.createCategory)
.put(categoriescreateValidator,
    InputValidation.basicValidate,
    _categoryController.put)
.delete(deleteValidator,
        InputValidation.basicValidate,
        async (request:any,resposne:any,next:any)=>{
            try{
              const categoryObject:any=await CategoryModel.findById({_id:request.body.id},{image:1});
              if(categoryObject==null)
              next(new Error("This category is no longer Exists"));
            
              let subCategories=await CategoryModel.find({category:request.body.id},"name");
              if(subCategories.length!=0)
              {
                  throw new Error("can't delete category ... it contains subCategories delete them first ! ");
              }
            
              if(categoryObject.image!=undefined)
              {
                if(categoryObject.image.cloudinaryId!=undefined)
               await cloudinary.api.delete_resources_by_prefix("categories/"+request.body.id);
               await cloudinary.api.delete_folder("categories/"+request.body.id);
              }
              next();
            }catch(error){next(error)}
        },
        _categoryController.delete);//should be select products with same category



router.route("/addimage/:id")

.all(checkOnlyAdmin,idValidator,InputValidation.basicValidate,
    multer({
    storage:categoryStorage,
    fileFilter:categoryFileFilter,
    limits
}).single("image"),
async (request:any,response:any,next:any)=>{
        try{
            const categoryObject:any=await CategoryModel.findById({_id:request.params.id},{image:1});
            if(categoryObject==null)
            next(new Error("This Catgory is not Exists"));
       
            if(categoryObject.image!=undefined)
            {
                if(categoryObject.image.cloudinaryId!=undefined)
                throw new Error("This Catgeory already has an image");
            }
            const result=await cloudinary.uploader.upload(request.file?.path,{"folder":"categories/"+request.params.id, transformation: [
            {width: 150, height: 150}]});//, , gravity: "face"crop: "thumb"}]});
        request.imageurl=result.secure_url;
        request.coudinaryId=result.public_id;
        next();
        }catch(error)
        {
        next(error);
        }
    })
.post(_categoryController.updateImages);

router.put("/removeimage",
[
  body("id").isMongoId().withMessage("wrong mongoId value"),
  body("deletedImage").isString().withMessage("wrong image value")
],
InputValidation.basicValidate,
checkOnlyAdmin,
async (request:any,resposne:any,next:any)=>{
   try
   {
      const categoryObject:any=await CategoryModel.findById({_id:request.body.id},{image:1});
      if(categoryObject==null)
      next(new Error("This Catgory is not Exists"));
        const deletedImage=categoryObject.image;
        
        if(deletedImage==undefined)
        throw new Error("This catgory has no images..");

        let {cloudinaryId}=deletedImage;
        if(cloudinaryId==undefined)
        throw new Error("This catgory has no images..");
        
        await cloudinary.uploader.destroy(deletedImage.cloudinaryId);
      
     
      next();
   }catch(error)
   {
    next(error);
   }
  
}
,_categoryController.deleteImage
)
export default router;
