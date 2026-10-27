import { Request,Response } from "express";
import mongoose from "mongoose";    
import Order from "../models/orderModel";
import Product from "../models/productModel";
import { AuthRequest } from "../middleware/authMiddleware";

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

        const { items, shippingAddress, paymentMethod } = req.body;

        if(!Array.isArray(items) || items.length===0){
            res.status(400).json({message:"Order items are required"});
            return;
        }

        if(!shippingAddress || !shippingAddress.fullName || !(shippingAddress.phoneNumber || shippingAddress.phone) || !shippingAddress.street || !shippingAddress.city || !shippingAddress.country){
            res.status(400).json({message:"Shipping address is required"});
            return;
        }

        const allowedPaymentMethods = ["cashOnDelivery","onlinePayment"];
        if(!paymentMethod || !allowedPaymentMethods.includes(paymentMethod)){
            res.status(400).json({message:"Payment method must be cashOnDelivery or onlinePayment"});
            return;
        }

        const orderItems=[];
        let itemsPrice = 0;

        for (const item of items){
            const productId= item.productId ?? item.product;
            const quantity = Number(item.quantity ?? item.quality);

            if(!mongoose.isValidObjectId(productId) || !Number.isSafeInteger(quantity) || quantity<=0){
                res.status(400).json({message:`Product ${productId} is invalid`});
                return;
            }
            const product = await Product.findById(productId);
            if(!product || product.isPublished === false){
                res.status(400).json({message:`Product ${productId} not found`});
                return;
            }
            orderItems.push({
                product:productId,
                quantity,
                name:product.name,
                image:product.image,
                price:product.discountedPrice ?? product.price,
            });
            itemsPrice+=(product.discountedPrice ?? product.price)*quantity;
        }
        const shippingPrice = 0;
        const totalPrice = itemsPrice+shippingPrice;

        const order = await Order.create({
            user:userId,
            items:orderItems,
            shippingAddress: {
                fullName: shippingAddress.fullName,
                phoneNumber: shippingAddress.phoneNumber ?? shippingAddress.phone,
                street: shippingAddress.street,
                city: shippingAddress.city,
                province: shippingAddress.province,
                country: shippingAddress.country,
            },
            paymentMethod,
            paymentStatus: "pending",
            orderStatus: "pending",
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
        if(!mongoose.isValidObjectId(req.params.id)){
            res.status(400).json({message:"Invalid order ID"});
            return;
        }
        const order = await Order.findById(req.params.id);
        if(!order){
            res.status(404).json({message:"Order not found"});
            return;
        }
        if(order.user.toString() !== userId && (req as AuthRequest).userRole !== "admin"){
            res.status(403).json({message:"You are not allowed to access this order"});
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
        if(!mongoose.isValidObjectId(req.params.id)){
            res.status(400).json({message:"Invalid order ID"});
            return;
        }
        const order = await Order.findById(req.params.id);
        if(!order){
            res.status(404).json({message:"Order not found"});
            return;
        }
        if(order.user.toString() !== userId){
            res.status(403).json({message:"You are not allowed to cancel this order"});
            return;
        }
        if(order.orderStatus !== "pending" && order.orderStatus !== "confirmed"){
            res.status(400).json({message:"Only pending or confirmed orders can be cancelled"});
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
