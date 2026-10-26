import {Request,Response} from "express";
import mongoose from "mongoose";
import {Address} from "../models/addressModel";

type AuthRequest = Request & {userId?:string};

const getUserId = (req:AuthRequest) =>{
    return req.userId;
};

const requiredFields = ["fullName","phoneNumber","street","city","country"];

export const createAddress = async(req:Request,res:Response):Promise<void> =>{
    try{
        const userId = getUserId(req as AuthRequest);
        if(!userId || !mongoose.isValidObjectId(userId)){
            res.status(401).json({message:"Authentication required"});
            return;
        }

        for(const field of requiredFields){
            if(!req.body[field]){
                res.status(400).json({message:`${field} is required`});
                return;
            }
        }
     const {
        fullName,
        phoneNumber,
        street,
        city,
        province,
        country,
        postalCode,
        isDefault,
     }=req.body;

     const shouldBeDefault = isDefault === "true";
     const existingAdresses = await Address.find({user:userId});

     if(shouldBeDefault){
        await Address.updateMany(
            {user:userId},
            {$set:{isDefault:false}}
        )
     }

    const address = await Address.create({
        user:userId,
        fullName,
        phoneNumber,
        street,
        city,
        province,
        country,
        postalCode,
        isDefault:shouldBeDefault || !existingAdresses,
    });

    res.status(201).json(address);
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"Failed to create address"});
    }



};

export const getMyAddresses =async(
    req:Request,
    res:Response
):Promise<void>=>{
    try {
        const userId = getUserId(req as AuthRequest);
        if(!userId || !mongoose.isValidObjectId(userId)){
            res.status(401).json({message:"Authentication required"});
            return;
        }
        const address = await Address.find({user:userId});
        res.status(200).json(address);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Failed to get address"});
    }
}

export const updateAddresses= async(
    req:Request,
    res:Response
):Promise<void>=>{
    try{
        const userId = getUserId(req as AuthRequest);
        const{id}=req.params;

        if(!userId || !mongoose.isValidObjectId(userId)){
            res.status(401).json({message:"Authentication required"});
            return;
        }

        if(!id || !mongoose.isValidObjectId(id)){
            res.status(400).json({message:"Invalid address id"});
            return;
        }

        const allowedField: Array<
            "fullName" |
            "phoneNumber" |
            "street" |
            "city" |
            "province" |
            "country" |
            "postalCode" |
            "isDefault"
        >=[
            "fullName",
            "phoneNumber",
            "street",
            "city",
            "province",
            "country",
            "postalCode",
            "isDefault",
        ];

        const address = await Address.findById(id);
        if(!address){
            res.status(404).json({message:"Address not found"});
            return;
        }

        for(const field of allowedField){
            if(req.body[field]){
                address.set(field,req.body[field]);
            }
        }

        await address.save();

        res.status(200).json(address);
    } catch(error){
            console.log(error);
            res.status(500).json({message:"Failed to update address"});
    }



};

