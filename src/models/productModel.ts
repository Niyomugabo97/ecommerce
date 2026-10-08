import mongoose, { Document, Schema } from "mongoose";

//this is where we define our schema or model
export interface IProduct extends Document {
  name: string;
  category: string;
  price: number;
  image: string;
}

const productSchema = new Schema<IProduct>(
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
    image:{
      type:String,
      required:true,

    },
  },
  {
    timestamps: true,
  },
);
//this is where we create our model
const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;