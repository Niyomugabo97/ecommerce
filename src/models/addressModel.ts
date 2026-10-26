
import mongoose, {Document,Schema,Types} from "mongoose";


export interface IAddress extends Document{
    user:Types.ObjectId;
    fullName:string;
    phoneNumber:string;
    street:string;
    city:string;
    province?:string;
    country:string;
    postalCode?:string;
    isDefault?:boolean;

}

const addressSchema = new Schema<IAddress>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
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
      postalCode: {
        type: String,
      },
      isDefault: {
        type: Boolean,
        default: false,
      },
})


export const Address = mongoose.model<IAddress>("Address",addressSchema);

