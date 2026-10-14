import { SubCategoryController } from "../controllers/category.controller";
import express =require("express");
import {body, param} from "express-validator"
// import { JwtClass } from "./../middelwraes/auth.middleware";
import {InputValidation} from "../middelwraes/validation.middleware";
import { JwtClass } from "./../middelwraes/auth.middleware";
import {cloudinary} from "./../core/utils/cloudinary";
import { categoryFileFilter, categoryStorage ,limits} from "./../core/imagesConfig/CategoryConfig";
import multer = require("multer");
import { SubCategoryModel } from "../models/subCategory.model";
import { ProductModel } from "../models/product.model";

let _categoryController=new SubCategoryController();
const router=express.Router();

/********************* validators */
const getValidator=[
    param("category").isMongoId()
                .withMessage(`wrong category id.... `)
]
const createValidator=[
    body("name").isString().withMessage("category name should be string"),
    body("category").optional().isMongoId()
                .withMessage(`wrong category type `)
]

const updateValidator=[
    body("name").optional().isString().withMessage("category name should be string"),
    body("category").optional().isMongoId().withMessage(`wrong categories type `),
   
]
 let deleteValidator=[
    body("id").isMongoId().withMessage("wrong id type"),
    
]
let idValidator=[
    param("id").isMongoId().withMessage("wrong id type.......")
]
let productsValidator=[
    body("products").optional().isArray().withMessage("products should be array"),
    
    body("products.*").optional().isMongoId().withMessage(" id is not valid"),
    body("product").optional().isMongoId().withMessage(" id is not valid"),

]

let medicineValidator=[
    body("medicines").optional().isArray().withMessage("medicines should be array"),
    body("medicines.*").optional().isMongoId().withMessage("id is not valid") ,
    body("medicine").optional().isMongoId().withMessage("id is not valid") ];

/******************************
 * Authorization
 */

 router.use(JwtClass.checkJwt);
 router.use((request:any,response,next)=>{
             if(request.jwt.role=="doctor"|| request.jwt.role=="admin"|| request.jwt.role=="pharmacist")
             next();
             else
             next(new Error("Un Authorized"));
 
 });
 
 const checkDoctor=function(request:any,response:any,next:any)
 {
     if(request.body.id!=request.jwt.id) next(new Error("not Authorized"));
     else
     next();   
 }

 const checkOnlyAdmin=function(request:any,response:any,next:any)
 {
     if(request.jwt.role!="admin") next(new Error("not Authorized"));
     else
     next();   
 }
/***********************************
 * Routers
 */
router.get("/:category",
            getValidator,
            InputValidation.basicValidate,
            _categoryController.getSubCategories)
router.route("")
.post(createValidator,
             InputValidation.basicValidate,
             _categoryController.createSubCategory)
.put(updateValidator,
    InputValidation.basicValidate,
    _categoryController.updateSubCategory)
.delete(deleteValidator,
        InputValidation.basicValidate,
        async (request:any,resposne:any,next:any)=>{
            try{
              const categoryObject:any=await SubCategoryModel.findById({_id:request.body.id},{image:1});
              if(categoryObject==null)
              next(new Error("This subCategory is no longer Exists"));
            
              let products=await ProductModel.find({"subCategory.id":request.body.id},"name");

            if(products.length!=0)
            throw new Error(" can't delete subCategory .. it Contains products!.. ");
            
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

router.put("/addproduct",
        productsValidator,InputValidation.basicValidate,
        _categoryController.addProducts);
router.put("/removeproduct",
        productsValidator,InputValidation.basicValidate,            
        _categoryController.removeProduct);
router.put("/addmedicine",
        medicineValidator,InputValidation.basicValidate,
        _categoryController.addMedicines);
router.put("/removemedicine",
        medicineValidator,InputValidation.basicValidate,

        _categoryController.removeMedicine);

        
router.route("/addimage/:id")

.all(checkOnlyAdmin,idValidator,InputValidation.basicValidate,
    multer({
    storage:categoryStorage,
    fileFilter:categoryFileFilter,
    limits
}).single("image"),
async (request:any,response:any,next:any)=>{
        try{
            const categoryObject:any=await SubCategoryModel.findById({_id:request.params.id},{image:1});
            if(categoryObject==null)
            next(new Error("This SubCatgory is not Exists"));
       
            if(categoryObject.image!=undefined)
            {
                if(categoryObject.image.cloudinaryId!=undefined)
                throw new Error("This SubCatgeory already has an image");
            }
            const result=await cloudinary.uploader.upload(request.file?.path,{"folder":"subcategories/"+request.params.id, transformation: [
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
      const categoryObject:any=await SubCategoryModel.findById({_id:request.body.id},{image:1});
      if(categoryObject==null)
      next(new Error("This subCatgory is not Exists"));
        const deletedImage=categoryObject.image;
        
        if(deletedImage==undefined)
        throw new Error("This subCatgory has no images..");

        let {cloudinaryId}=deletedImage;
        if(cloudinaryId==undefined)
        throw new Error("This Subcatgory has no images..");
        
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
