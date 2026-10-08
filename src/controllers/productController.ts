import { Request, Response } from "express";
import Product from "../models/productModel";
import cloudinary from "../config/cloudinary";


//logic goes here where you call the model and get the data
// GET all products
export const getProducts = async (
  req: Request,
  res: Response
) => {
  try {
    const products = await Product.find();

    res.status(200).json(products);
  } catch (error) {
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

    if (!product) {
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
    const { name, category, price } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({
        message: "Name, category and price are required",
      });
    }

    if(!req.file) {
      return res.status(400).json({
        message: "Image file is required",
      });
    }

    // Upload image to Cloudinary
     const result = await new Promise<any>(
      (resolve, reject) => {
        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder: "ecommerce-products",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

        uploadStream.end(req.file!.buffer);
      }
    );

    const product = await Product.create({
      name,
      category,
      price,
      image: result.secure_url, // Save the image path to the database
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

// DELETE product
export const deleteProduct = async (
  req: Request,
  res: Response
) => {
  try {
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