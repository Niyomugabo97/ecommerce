import { Request,Response } from "express";
import mongoose from "mongoose";    
import Order from "../models/orderModel";
import Product from "../models/productModel";

type AuthRequest = Request & {
    userId?: string;
};

const getUserId =(req:AuthRequest) =>{
    return req.userId;
};

export const createOrder = async (req:Request, res:Response) =>{
    try {
        const userId = getUserId(req as AuthRequest);
        if(!userId || !mongoose.isValidObjectId(userId)){
            res.status(401).json({message:"Authentication required"});
            return;
        }

        const {items,shippingAddress,paymentStatus,orderStatus} = req.body;

        if(!Array.isArray(items) || items.length===0){
            res.status(400).json({message:"Order items are required"});
            return;
        }

        if(!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street || !shippingAddress.city || !shippingAddress.country){
            res.status(400).json({message:"Shipping address is required"});
            return;
        }

        const allowedPaymentMethods = ["cashOnDelivery","onlinePayment"];
        if(!paymentStatus || !allowedPaymentMethods.includes(paymentStatus)){
            res.status(400).json({message:"Payment status is required and must be one of the following: cashOnDelivery, onlinePayment"});
            return;
        }

        const orderItems=[];
        let itemsPrice = 0;

        for (const item of items){
            const productId= item.productId ?? item.product;
            const quality = Number(item.quality);

            if(!mongoose.isValidObjectId(productId) || !Number.isSafeInteger(quality) || quality<=1){
                res.status(400).json({message:`Product ${productId} is invalid`});
                return;
            }
            const product = await Product.findById(productId);
            if(!product){
                res.status(400).json({message:`Product ${productId} not found`});
                return;
            }
            orderItems.push({
                product:productId,
                quality,
                name:product.name,
                image:product.image,
                price:product.price,
            });
            itemsPrice+=product.price*quality;
        }
        const shippingPrice = 0;
        const totalPrice = itemsPrice+shippingPrice;

        const order = await Order.create({
            user:userId,
            items:orderItems,
            shippingAddress,
            paymentStatus,
            orderStatus,
            itemsPrice,
            shippingPrice,
            totalPrice,
        });
        res.status(201).json(order);

        
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Failed to create order"});
    }
};

export const getMyOrders =async(
    req:Request,
    res:Response

):Promise<void>=>{
    try {
        const userId = getUserId(req as AuthRequest);
        if(!userId || !mongoose.isValidObjectId(userId)){
            res.status(401).json({message:"Authentication required"});
            return;
        }
        const orders = await Order.find({user:userId});
        res.status(200).json(orders);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Failed to get orders"});
    }
};

export const getOrderById = async(
    req:Request,
    res:Response
):Promise<void>=>{
    try {
        const userId = getUserId(req as AuthRequest);
        if(!userId || !mongoose.isValidObjectId(userId)){
            res.status(401).json({message:"Authentication required"});
            return;
        }
        const order = await Order.findById(req.params.id);
        if(!order){
            res.status(404).json({message:"Order not found"});
            return;
        }
        res.status(200).json(order);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Failed to get order"});
    }
};

export const cancelOrder= async(
    req:Request,
    res:Response
):Promise<void>=>{
    try{
        const userId = getUserId(req as AuthRequest);
        if(!userId || !mongoose.isValidObjectId(userId)){
            res.status(401).json({message:"Authentication required"});
            return;
        }
        const order = await Order.findById(req.params.id);
        if(!order){
            res.status(404).json({message:"Order not found"});
            return;
        }
        order.orderStatus="cancelled";
        await order.save();
        res.status(200).json(order);
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"Failed to cancel order"});
    }
}




