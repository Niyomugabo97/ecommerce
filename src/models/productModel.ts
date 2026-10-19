import mongoose, { Document, Schema } from "mongoose";

//this is where we define our schema or model
export interface product extends Document {
  name: string;
  category: string;
  price: number;
  discountedPrice: number;
  image: string;
}

const productSchema = new Schema<product>(
  
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
    },
    discountedPrice:{
      type:Number,
      required:true,
    },
    image:{
      type:String,
      required:true,

    },
  },
  {
    timestamps: true,
  },

);


//creation model index for faster lookups
productSchema.index({name:1, category:1, price:1});
//this is where we create our model
const Product = mongoose.model<product>("Product", productSchema);

export default Product;