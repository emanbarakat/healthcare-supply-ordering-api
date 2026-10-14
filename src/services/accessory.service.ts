import {Accessory,AccessoryModel } from "../models/accessory.model";
import { BaseService } from "./base.service";


export class AccessoryService extends BaseService<Accessory> {
        _collectionName: string="accessories";
        _populate: string="";
        _model: any=AccessoryModel;

        
        bulkWriteDec=async (products: any)=> {
              
                let bulkOptions=products.map((product:any) => {
                        return {
                          updateOne: {
                            filter: {
                              _id: product.id,
                              stockAmount:{$gte:product.quantity}
                            },
                            update: {
                             $inc:{"stockAmount":-(product.quantity)}
                            }
                          }
                        }
                      });
                   return  this._model.bulkWrite(bulkOptions)

            }
            bulkWriteInc=async (products: any)=> {
              
              let bulkOptions=products.map((product:any) => {
                      return {
                        updateOne: {
                          filter: {
                            _id: product.id
                          },
                          update: {
                           $inc:{"stockAmount":(product.quantity)}
                          }
                        }
                      }
                    });
                 return  this._model.bulkWrite(bulkOptions)

          }


}