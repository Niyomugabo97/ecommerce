import { Request, Response } from "express";
import mongoose from "mongoose";
import Product from "../models/productModel";
import cloudinary from "../config/cloudinary";

const uploadProductImage = (buffer: Buffer): Promise<string> =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "ecommerce-products" },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result?.secure_url) {
          resolve(result.secure_url);
        } else {
          reject(new Error("Cloudinary returned no image URL"));
        }
      }
    );

    uploadStream.end(buffer);
  });

//logic goes here where you call the model and get the data
// GET all products
export const getProducts = async (
  req: Request,
  res: Response
) => {
  try {

    // get pagination value from query parameters

    const page = Math.max(1, Number.parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit as string) || 10)
    );

    //calculate the number of documents to skip based on the page and limit values

    const skip=(page-1)*limit;

    // fetch the products and total count simultaneously using Promise.all for better performance

    const [products, totalCount]=await Promise.all([
      Product.find({ isPublished: { $ne: false } })
        .sort({createdAt:-1})
        .skip(skip)
        .limit(limit),
      Product.countDocuments({ isPublished: { $ne: false } })
    ]);

    // calculate the total number of pages based on the total count and limit value
    const totalPages=Math.ceil(totalCount/limit);

    //  send response with products, total count, current page, and total pages
    res.status(200).json({

      success:true,
      // display products
      products,
      pagination:{
        currentPage:page,
        limit:limit,
        totalCount,
        totalPages
      },

    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to get products",
    });
  }
};

export const getAdminProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit as string) || 10)
    );
    const skip = (page - 1) * limit;
    const [products, totalCount] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        currentPage: page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Failed to get admin products:", error);
    res.status(500).json({
      message: "Failed to get products",
    });
  }
};

// GET one product
export const getProductById = async (
  req: Request,
  res: Response
) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || product.isPublished === false) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get product",
    });
  }
};

// CREATE product
export const createProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, category, price, discountedPrice } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof category !== "string" ||
      !category.trim() ||
      price === undefined ||
      discountedPrice === undefined
    ) {
      return res.status(400).json({
        message: "Name, category and price discount price are required",
      });
    }

    const parsedPrice = Number(price);
    const parsedDiscountedPrice = Number(discountedPrice);
    if (
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0 ||
      !Number.isFinite(parsedDiscountedPrice) ||
      parsedDiscountedPrice < 0
    ) {
      return res.status(400).json({
        message: "Price and discounted price must be non-negative numbers",
      });
    }
    const isPublished = req.body.isPublished;
    if (
      isPublished !== undefined &&
      isPublished !== true &&
      isPublished !== false &&
      isPublished !== "true" &&
      isPublished !== "false"
    ) {
      return res.status(400).json({ message: "isPublished must be a boolean" });
    }

    if(!req.file) {
      return res.status(400).json({
        message: "Image file is required",
      });
    }

    const image = await uploadProductImage(req.file.buffer);

    const product = await Product.create({
      name: name.trim(),
      category: category.trim(),
      price: parsedPrice,
      discountedPrice: parsedDiscountedPrice,
      image,
      isPublished: isPublished === undefined
        ? true
        : isPublished === "true" || isPublished === true,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create product",
    });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ message: "Invalid product ID" });
      return;
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    const { name, category, price, discountedPrice, isPublished } = req.body;
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        res.status(400).json({ message: "Name must be a non-empty string" });
        return;
      }
      product.name = name.trim();
    }
    if (category !== undefined) {
      if (typeof category !== "string" || !category.trim()) {
        res.status(400).json({ message: "Category must be a non-empty string" });
        return;
      }
      product.category = category.trim();
    }
    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        res.status(400).json({ message: "Price must be a non-negative number" });
        return;
      }
      product.price = parsedPrice;
    }
    if (discountedPrice !== undefined) {
      const parsedDiscountedPrice = Number(discountedPrice);
      if (!Number.isFinite(parsedDiscountedPrice) || parsedDiscountedPrice < 0) {
        res.status(400).json({
          message: "Discounted price must be a non-negative number",
        });
        return;
      }
      product.discountedPrice = parsedDiscountedPrice;
    }
    if (isPublished !== undefined) {
      if (typeof isPublished !== "boolean" && isPublished !== "true" && isPublished !== "false") {
        res.status(400).json({ message: "isPublished must be a boolean" });
        return;
      }
      product.isPublished = isPublished === true || isPublished === "true";
    }
    if (req.file) {
      product.image = await uploadProductImage(req.file.buffer);
    }

    await product.save();
    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Failed to update product:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
};

// DELETE product
export const deleteProduct = async (
  req: Request,
  res: Response
) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const product = await Product.findByIdAndDelete(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
    });
  }
};