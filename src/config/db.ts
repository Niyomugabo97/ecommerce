import mongoose from "mongoose";
import process from "node:process";

// function for connection 

const connectDB = async ():Promise<void>=>{
 try{
      const mongoUri = process.env.MONGO_URI;
      if (!mongoUri) {
         throw new Error("MONGO_URI is not configured");
      }

      await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");
 }
 catch(error){
    console.log("MongoDB connection failed", error);
    process.exit(1);
 }

};

export default connectDB;

