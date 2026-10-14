import mongoose, { Collection, model } from "mongoose";
import bcrypt=require("bcrypt");
import { request } from "http";




export abstract class BaseService<schema>
{
    abstract readonly _collectionName: string;
    abstract readonly _model: Object;
    readonly _populate: string ="";
    readonly _select:any="";    
    /**
     * 
     * @param _id Find any user by id
     * @param fileds 
     * @returns 
     */
    async findOneById(_id:mongoose.Types.ObjectId | number,fileds:string)
    {
        try{
          console.log(this._populate);
          
          if(this._populate!="")
            return await  model(this._collectionName)
                          .findById(_id,fileds)
                          .populate(this._populate,this._select);
          else
          return await  model(this._collectionName)
                          .findById(_id,fileds)

         }
         catch(error)
         {
             throw new Error(error as string);           
         }     
    }

    /**
     * 
     * @param phoneNumber find any user by phone number
     * @returns 
     */
    async findOneByPhone(phoneNumber:string)
    {
        try{
           
            return await  model(this._collectionName)
                          .findOne({phoneNumber},"")
                          .populate(this._populate);
         }
         catch(error)
         {
             throw new Error(error as string);           
         }     
    }

    /**
     * 
     * @param condition find all users with specified type
     * @param fileds 
     * @returns 
     */
    async findAll(condition:{},fileds:string,page:number=1,PAGE_SIZE:number=20)
    {
        //pagination fixed by the server
        // const PAGE_SIZE = 20;                       
        const skip = (page - 1) * PAGE_SIZE; 
      
        try{
            //console.log(this._collectionName,condition,fileds,skip,page);
            return await  model(this._collectionName)
                          .find(condition,fileds)
                          .skip(skip)                
                          .limit(PAGE_SIZE)
                          .populate(this._populate,this._select);
                       
         }
         catch(error)
         {
             throw new Error(error as string);           
         }  
    }
    /**
     * count all data numbers
     * @param condition 
     * @param fileds 
     */
    async allDataNumber(condition:{},fileds:{})
    {
        console.log(this._collectionName,condition,fileds)
        return await  model(this._collectionName)
        .find(condition,fileds)
        
    }
    /**
     * find all based on stages array using aggregate function
     * @param stages 
     * @param page 
     * @param PAGE_SIZE 
     * @returns 
     */
    async findAllAggregate(stages:any,page:number=1,PAGE_SIZE:number=20)
    {
        // console.log(page,PAGE_SIZE)
        //pagination fixed by the server
        // const PAGE_SIZE = 20;                       
        const skip = (page - 1) * PAGE_SIZE; 
      
        try{
            return await  model(this._collectionName)
                          .aggregate(stages)
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
     * @param input create user (doctor  merchant flyboy )
     * @returns 
     */
   
    async createOne(input:schema)
    {
        // console.log(this._collectionName,input);
        try{
           
           return await  model(this._collectionName)
                         .create(input);

        }
        catch(error)
        {
            throw new Error(error as string);           
        }
    }

    /**
     * 
     * @param _id update any user
     * @param data 
     * @returns 
     */
    async updateOne(_id:mongoose.Types.ObjectId|number,data:{})
    {
        console.log(_id,data,this._collectionName)
        try{
            return await  model(this._collectionName)
                          .findByIdAndUpdate(_id,data)
         }
         catch(error)
         {
             throw new Error(error as string);           
         }     
    }
    /**
     * update based on condition
     * @param _id 
     * @param data 
     * @returns 
     */
    async updateOnewithCondition(condition:{},data:{})
    {
        try{
            return await  model(this._collectionName)
                          .updateOne(condition,data)
         }
         catch(error)
         {
             throw new Error(error as string);           
         }     
    }
    /**
     * 
     * @param condition 
     * @param data 
     * @returns 
     */
    async updateManywithCondition(condition:{},data:{})
    {
        try{
            return await  model(this._collectionName)
                          .updateMany(condition,data)
         }
         catch(error)
         {
             throw new Error(error as string);           
         }     
    }
    /**
     * 
     * @param _id delete any user
     * @returns 
     */
    async deleteOne(_id:mongoose.Types.ObjectId)
    {
        try{
            return await  model(this._collectionName)
                         .findByIdAndDelete(_id);
         }
         catch(error)
         {
             throw new Error(error as string);           
         }     
    }
     /**
     * 
     * @param _id delete any user
     * @returns 
     */
      async deleteOnebyCondition(condition:object)
      {
          try{
              return await  model(this._collectionName)
                           .deleteOne(condition);
           }
           catch(error)
           {
               throw new Error(error as string);           
           }     
      }
    /**
     * 
     * @param _id Change user password
     * @param updatedPassword 
     * @param oldPassword 
     * @returns 
     */
  async changePassword(
    _id: mongoose.Types.ObjectId,
    updatedPassword: string,
    oldPassword: string
  ) {
    try {
       
        const user: any =await  model(this._collectionName)
                              .findById(_id,"password")
      
      if(user!=null )
      {
        
        if (bcrypt.compareSync(oldPassword, user?.password)==false) {
            throw new Error('old password not matched your saved password');
          } else if (bcrypt.compareSync(updatedPassword, user?.password)==true) {
            throw new Error('new password is the same as old password');
          }
      }
      else
      {
          throw new Error("User is not Exists");
      }
     
      user.password =bcrypt.hashSync(updatedPassword,10);//updatedPassword; 

      await user.save();

      return user;
    } catch (err: Error | any) {
      throw new Error(err.message);
    }
  }

  /**
   * autoComplete serach for any collection by condition regex
   * @param condition 
   * @param fileds 
   * @returns 
   */
    async autoCompleteSearch(condition:{},fileds:string)
    {
       console.log(this._collectionName,"   collection name **********")
        try{
            return await model(this._collectionName).find(condition,fileds)
        }catch (err: Error | any) {
        throw new Error(err.message);
      }      

    } 

}