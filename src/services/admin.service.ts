import mongoose ,{ model }from "mongoose";
import { Admin, AdminModel } from "./../models/admin.model";
import { BaseService } from "./base.service";


export class AdminService extends BaseService<Admin> {
        _collectionName: string="admins";
        _populate: string="";
        _model: Object=AdminModel;
        
        
            /**
             * general method to get any collection type status
             * @param collection 
             * @param status 
             * @param fields 
             * @returns 
             */
       

        async getAllUsersByStatus(collection:string,status:string,fields:string,page:number=1)
        {
            // console.log({accountStatus:status},collection,fields);
            //pagination fixed by the server
                const PAGE_SIZE = 20;                       
                const skip = (page - 1) * PAGE_SIZE; 
                try{
                        return await  model(collection)
                                     .find({accountStatus:status},fields)
                                     .skip(skip)                
                                     .limit(PAGE_SIZE)
        
                     }
                     catch(error)
                     {
                         throw new Error(error as string);           
                     }   
        }

        /**
         * 
         * @param id  set any user status with full validation
         * @param collection 
         * @param status 
         * @returns 
         */
        async setUserSatatus(id:string,collection:string,status:string)
        {

            try{
                return  await  model(collection)
                             .findByIdAndUpdate(id,{$set:{
                                 accountStatus:status
                             }});
                            
                            
             }
             catch(error)
             {
                 throw new Error(error as string);           
             }
        }

        

}