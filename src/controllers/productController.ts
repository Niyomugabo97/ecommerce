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

    // get pagination value from query parameters

    const page=Math.max(1, Number.parseInt(req.query.page as string) || 10);

    const limit=Math.max(100, Number.parseInt(req.query.limit as string) || 10);

    //calculate the number of documents to skip based on the page and limit values

    const skip=(page-1)*limit;

    // fetch the products and total count simultaneously using Promise.all for better performance

    const [products, totalCount]=await Promise.all([
      Product.find().sort({_id:-1}).skip(skip).limit(limit),Product.countDocuments()
    ]);

    // calculate the total number of pages based on the total count and limit value
    const totalPages=Math.ceil(totalCount/limit);

    //send response with products, total count, current page, and total pages
    res.status(200).json({

      success:true,
      pagination:{
        currentPage:page,
        limit:limit,
        totalCount,
        totalPages
      },
  
    });

    res.status(200).json({
      message: "Products fetched successfully",
      products,
    })

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