import mongoose, {Document, Schema, Types } from "mongoose";

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  image?: string;
  price: number;
  quantity: number;
}


export interface IOrder extends Document {
 user: Types.ObjectId;
 items: IOrderItem[];
 shippingAddress:{
  fullName: string;
  phoneNumber: string;
  street: string;
  city: string;
  province?:string;
  country:string;
 },
 paymentMethod: string;
 paymentStatus:"pending" | "paid" | "failed" | "refunded";
 orderStatus:"pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

 itemsPrice:number;
 shippingPrice:number;
 totalPrice:number;
}

const orderItemSchema= new Schema<IOrderItem>({

    product:{
        type:Schema.ObjectId,
        ref:"Product",
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    quantity:{
        type:Number,
        required:true,
    },
    
},
{_id:false}

);

const orderSchema = new Schema<IOrder>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      items: [orderItemSchema],
      shippingAddress: {
        fullName: {
          type: String,
          required: true,
        },
        phoneNumber: {
          type: String,
          required: true,
        },
        street: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        province: {
          type: String,
        },
        country: {
          type: String,
          required: true,
        },
      },
      paymentMethod: {
        type: String,
        required: true,
      },
      paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      orderStatus: {
        type: String,
        enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default:"pending",

      },

     itemsPrice:{type:Number, required:true,min:0},
     shippingPrice:{type:Number, required:true,min:0, default:0},
     totalPrice:{type:Number,required:true,min:0, default:0},
    },
     {timestamps:true} 

    );
// creation of model and export
    export default mongoose.model<IOrder>("Order", orderSchema);




