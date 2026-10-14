import { Medicine,MedicineModel } from "../models/medicine.model";
import { BaseService } from "./base.service";


export class MedicineService extends BaseService<Medicine> {
        _collectionName: string="medicines";
        _populate: string="";
        _model: any=MedicineModel;
        _select:any="";

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