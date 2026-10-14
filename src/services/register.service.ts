import mongoose, { model } from "mongoose";
require("./../models/governorate.model");
require("./../models/city.model");
export class RegisterService{
    
 static async getGovernorates()
  {
    try{
        return await  model("governorates")
                     .find({},{_id:0,id:1,governorate_name_en:1});
                     
     }
     catch(error)
     {
         throw new Error(error as string);           
     }      
  }
  static async getCities(governorateId:number)
  {
    try{
        return await  model("cities")
                     .find({"governorate_id":governorateId },{_id:0,id:1/*,governorate_id:1*/,city_name_en:1});
                     
     }
     catch(error)
     {
         throw new Error(error as string);           
     }      
  }
}