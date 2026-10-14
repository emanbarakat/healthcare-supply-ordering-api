import { Order,OrderModel} from "./../models/order.model";
import { BaseService } from "./base.service";


export class OrderService extends BaseService<Order> {
        _collectionName: string="orders";
        _populate: string="";
        _model: any=OrderModel;
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