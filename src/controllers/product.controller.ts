import { BaseController } from "./base.controller";
import {Product} from "./../models/product.model";
import { ProductService } from "../services/product.service";
import { NextFunction, Request, Response } from "express";
import { DoctorService } from "../services/doctor.service";
import mongoose from "mongoose";
import { SubCategoryService } from "../services/category.service";
import { BrandService } from "../services/brand.service";
import { OrderService } from "../services/order.service";
import { MedicineService } from "../services/medicine.service";
import { AccessoryService } from "../services/accessory.service";



export class ProductController extends BaseController<Product>
{
 

    _serviceObj=new ProductService();
    _medicineService=new MedicineService();
    _accessoryService=new AccessoryService();
    _doctorService=new DoctorService();
    _subCategory=new SubCategoryService();
    _brandService=new BrandService();
    _orderService=new OrderService();
    
    /**
     * 
     * @param request auto complete search
     * @param response 
     * @param next 
     */
    autoCompleteSearchByName=async (request: any, response: Response, next: NextFunction) => {
   
    

        try {
        
          const stages=[
            {
              $match:{"name":{$regex: request.params.value+"",$options:"i"}}
            },
           {
            $lookup:{
              from:"subcategories",
              localField:"subCategory.id",
              foreignField:"_id",
              as:"subCategory",
            }
          },
          // {
          //   $match:{"subCategory.0.category":request.params.id}
          // }
          // ,
        //   {
        //     "$addFields": {
        //         "subCategory": {
        //             "$arrayElemAt": [
        //                 {
        //                     "$filter": {
        //                         "input": "$subCategory",
        //                         "as": "subCategory",
        //                         "cond": {
        //                             "$eq": [ "$$subCategory.id.category", request.params.id ]
        //                         }
        //                     }
        //                 }, 0
        //             ]
        //         }
        //     }
        // },
           {
            $project:{"images.cloudinaryId":0}
           }

          ]

        
          const data:any = await this._serviceObj.findAllAggregate(stages,+request.params.page||1,10);
        
          let products:any=[];
          if(data.length!=0)
          {
            data.forEach((item:any)=>{
             
              if(item.subCategory[0].category==request.params.id)
              {
                  item.subCategory={
                    id:item.subCategory[0]._id,
                    name:item.subCategory[0].name,
                    category:item.subCategory[0].category,
                  }
                products.push(item);

              }
            })
          }
          let doctorWishList:any=null;
          if(request.jwt.role=="doctor")
          {
            doctorWishList=await this._doctorService.findAllAggregate([
              {$match:{_id:new mongoose.Types.ObjectId( request.jwt.id)}},
              {$project:{_id:0,"wishList.products":1}}
            ]);

            if(doctorWishList[0]!=undefined)
            {
              doctorWishList=doctorWishList[0].wishList.products;

              //search if client has this product in his wishlist to add favorite property
              for ( var i in products)
              {
                console.log(products[i]._id)
                  if(doctorWishList.findIndex((product:any)=> product.toString()==products[i]._id.toString())!=-1)
                  {
                    products[i].favorite=true;
                  }
              }
            }
           
          }
        

          
          response.status(200).json(products);
      }catch(error)
      {
        next(error)
      }
    }

    put=async(request:any,resposne:Response,next:NextFunction)=>
    {
      try{

          let subCategory:any=await this._subCategory.findOneById(request.body.subCategory,"name");
          if(subCategory==null)
          throw new Error("there is no subcategory with that value");

          request.body.subCategory={
            id:subCategory._id,
            name:subCategory.name
          }
          let data=await this._serviceObj.updateOne(request.body.id,request.body);
          resposne.status(200).json({message:"updated"})
      }
      catch(error)
      {
        next(error);
      }
    }
    /**
     * 
     *  get all products for specifed sub category
     * @param request 
     * @param resposne 
     * @param next 
     */
    getAll = async (request: any, resposne: Response, next: NextFunction) => {
    
        try {

          
          const stages=[
            {
               "$match":{"subCategory.id":new mongoose.Types.ObjectId(request.params.subCategory)}
            },
         
            {$project:{"images.cloudinaryId":0}}
            // {"$project":{"name":1,"unitPrice":1,
            // "image":{"$first":"$images"}}}
          ]
          const data = await this._serviceObj.findAllAggregate(stages,+request.params.page||1,10);
          console.log(request.jwt.role);
          let doctorWishList:any;
          if(request.jwt.role=="doctor")
          {
            doctorWishList=await this._doctorService.findAllAggregate([
              {$match:{_id:new mongoose.Types.ObjectId( request.jwt.id)}},
              {$project:{_id:0,"wishList.products":1}}
            ]);

            if(doctorWishList[0]!=undefined)
            {
              doctorWishList=doctorWishList[0].wishList.products;

              //search if client has this product in his wishlist to add favorite property
              for ( var i in data)
              {
                console.log(data[i]._id)
                  if(doctorWishList.findIndex((product:any)=> product.toString()==data[i]._id.toString())!=-1)
                  {
                    data[i].favorite=true;
                  }
              }
            }
           
          }
        

          
          resposne.status(200).json(data);
        } catch (err) {
          next(err);
        }
      };
      /**
       * all products by type product for doctors /products/:type/:page
       * @param request 
       * @param resposne 
       * @param next 
       */
      getAllProducts = async (request: any, resposne: Response, next: NextFunction) => {
    
       
        try {
          let data=[];
          const stages=[
            {
              $lookup:{
                from:"subcategories",
                localField:"subCategory.id",
                foreignField:"_id",
                as:"subCategory"
              }
            },
            {$project:{"images.cloudinaryId":0, "subCategory.image.cloudinaryId":0,"subCategory.products":0,"subCategory.medicines":0}}
          ]
          /************************************** filter by type */
          if(request.params.type=="medicine")
          {
             data = await this._medicineService.findAllAggregate(stages,+request.params.page||1,20);
          }
          else if(request.params.type=="accessory")
          {
            data = await this._accessoryService.findAllAggregate(stages,+request.params.page||1,20);  
          }
          else if(request.params.type=="product")
          {
             data = await this._serviceObj.findAllAggregate(stages,+request.params.page||1,20);  
          }
          resposne.status(200).json(data);
        } catch (err) {
          next(err);
        }
      };
      /**
       * 
       * @param request get roandom products for specified product type
       * @param resposne 
       * @param next 
       */
      //for doctor and pharmacists
      getRandom = async (request: any, resposne: Response, next: NextFunction) => {
      
            try {
              const stages=[
                {
                    $sample: {size: 10}
                },
                // {"$project":{"name":1,"unitPrice":1,"brand.name":1,"subCategory.name":1,
                // "image":{"$first":"$images"}}}
                // ,
                {$project:{"images.cloudinaryId":0}}
              ]
              const data = await this._serviceObj.findAllAggregate(stages,+request.params.page||1,10);
              let doctorWishList:any;
              if(request.jwt.role=="doctor")
              {
                doctorWishList=await this._doctorService.findAllAggregate([
                  {$match:{_id:new mongoose.Types.ObjectId( request.jwt.id)}},
                  {$project:{_id:0,"wishList.products":1}}
                ]);

                if(doctorWishList[0]!=undefined)
                {
                  doctorWishList=doctorWishList[0].wishList.products;
    
                  //search if client has this product in his wishlist to add favorite property
                  for ( var i in data)
                  {
                    console.log(data[i]._id)
                      if(doctorWishList.findIndex((product:any)=> product.toString()==data[i]._id.toString())!=-1)
                      {
                        data[i].favorite=true;
                      }
                  }
                }
                
              }
            
              resposne.status(200).json(data);
            } catch (err) {
              next(err);
            }
          };
      /**
       * get product details by product Id
       * @param request 
       * @param resposne 
       * @param next 
       */
      getProductDetails=async (request: Request, resposne: Response, next: NextFunction) => {
     
        try {
          this._serviceObj._populate="subCategory.id";
          // this._serviceObj._select={category:1}
          const stages=[
           {
            $match:{_id:new mongoose.Types.ObjectId(request.params.id)}
           },
           {
            $lookup:{
              from:"subcategories",
              localField:"subCategory.id",
              foreignField:"_id",
              as:"subCategory"
            }
          },
           {$project:{"images.cloudinaryId":0}}
            // {"$project":{"name":1,"description":1,"unitPrice":1,"brand.name":1,"subCategory.name":1,
            // "images":1}}
            
           
          ]

         
         
          const data:any = await this._serviceObj.findAllAggregate(stages,+request.params.page||1,10);
          data[0].subCategory={
            id:data[0].subCategory[0]._id,
            name:data[0].subCategory[0].name,
            category:data[0].subCategory[0].category,
          }
          

          resposne.status(200).json(data);
        } catch (err) {
          next(err);
        }
      };
    /**
     * get product images
     * @param request 
     * @param resposne 
     * @param next 
     */
     getImages=async (request: Request, resposne: Response, next: NextFunction) => {
     
          try {
            const data = await this._serviceObj.findAll({_id:request.params.id},"images",1,10);
            resposne.status(200).json(data);
          } catch (err) {
            next(err);
          }
        };
      /**
       * create new product and create a folder for that product in images
       * @param request 
       * @param resposne 
       * @param next 
       */
      post=async (request: any, resposne: Response, next: NextFunction) => {
    
        try {

          //check category id 
          let subCategory:any=await this._subCategory.findAllAggregate([
            {$match:{_id: new mongoose.Types.ObjectId(request.body.subCategory)}},
            {
              $lookup:{
                from:"categories",
                localField:"category",
                foreignField:"_id",
                as:"category"
              }
            },
           {$project:{ name:"$name", _id:"$_id", category:{$arrayElemAt:["$category",0]}}}
          ]);
         
          if(subCategory.length==0)
          throw new Error("there is no subcategory with that value");

          if(subCategory[0].category==undefined){
            throw new Error("no such subcategory for product ....");
          }
          else
          {
            if(subCategory[0].category.category_type!="product")
            throw new Error("no such subcategory for product ....");

          }
          subCategory=subCategory[0];


          request.body.subCategory={
            id:subCategory._id,
            name:subCategory.name
          }

          if(request.body.brand!=undefined)
          {
            let brand:any=await this._brandService.findOneById(request.body.brand,"name");
            if(brand==null)
             throw new Error("there is no brand with that value");

             request.body.brand={
              id:brand._id,
              name:brand.name
            }

          }

          const data = await this._serviceObj.createOne(request.body);
          // const directory=path.join(__dirname,"..","..","src","images","products",data._id.toString());
          // if (!fs.existsSync(directory)){
          //   fs.mkdirSync(directory);}
          resposne.status(200).json(data);
        } catch (err) {
          next(err);
        }
      };

      /**
       * update images array for any product
       * @param request 
       * @param resposne 
       * @param next 
       */
      updateImages=async (request: any, resposne: Response, next: NextFunction) => {
      
        try {
          // const files:any=request.files;
          // const paths=files.map((file:any)=>file.path)
          const data = await this._serviceObj.updateOne(
                  new mongoose.Types.ObjectId(request.params.id),{
                  // $addToSet:{"images":{$each:[...paths]}}    
                  $addToSet:{"images":{url:request.imageurl,cloudinaryId:request.coudinaryId}}
                });  
        
          resposne.status(200).json(data);
        } catch (err) {
          next(err);
        }
      };
      
      /**
       * 
       * @param request delete one image form products
       * @param resposne 
       * @param next 
       */
      deleteImage=async (request: Request, resposne: Response, next: NextFunction) => {
       
        try {
        
         // const deletedPath=deletePath(request);
          // fs.unlink(path.resolve(deletedPath,request.body.image), (err) => { console.log("unlink error")});
          const data = await this._serviceObj.updateOne(
            new mongoose.Types.ObjectId(request.body.id),
            { $pull:{"images":{url:request.body.deletedImage}}})
            resposne.status(200).json(data);
        } catch (err) {
          next(err);
        }
        
      };
      
      delete=async (request: Request, response: Response,next: NextFunction)=>{

             try {

              //what if products included in orders not devlivered or cancelled
             
               let data= await this._serviceObj.deleteOne(request.body.id);
             

               //remove product from all carts
               let updateCarts=await this._doctorService.updateManywithCondition(
                {},
                {
                  $pull:{"cart.products":{id:request.body.id}}
                }
               )
               //const deletedPath=deletePath(request);
              //  fs.rmdirSync(deletedPath,{ recursive: true },);
               response.status(200).json({"message":"deleted"});
             //
             } catch (error) {
              next(error);
             }

      }
    }