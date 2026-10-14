import { PharmacistOrder,PharmacistOrderModel} from "./../models/orderPharmtest.model";
import { BaseService } from "./base.service";


export class pharmacistOrderService extends BaseService<PharmacistOrder> {
        _collectionName: string="orderspharmacist";
        _populate: string="";
        _model: any=PharmacistOrderModel;
        _select:any="";

        
        bulkWriteOrder=async (orderId:any,products: any)=> {
              
                let bulkOptions=products.map((product:any) => {
                        return {
                          updateOne: {
                            filter: {
          
                              "products.id": product.id,//before populate
                              "_id":orderId
                            },
                            update: {
                             $set:{"products.$.quantity":product.quantity}
                            }
                          }
                        }
                      });
                   return  this._model.bulkWrite(bulkOptions)

            }

}