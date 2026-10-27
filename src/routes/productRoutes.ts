import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import requireAdmin from "../middleware/requireAdmin";

import {
  getProducts,
  getProductById,
  createProduct,
  deleteProduct,
  updateProduct,
} from "../controllers/productController";

import upload  from "../middleware/uploadMiddleware";

const router = Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get published products
 *     description: Returns published products only. Supports page and limit query parameters.
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated product list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 products:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Product' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 */
router.get("/", getProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product MongoDB ID
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get("/:id", getProductById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a product
 *     description: Administrator only. Send multipart form data. Product image is required.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - price
 *               - discountedPrice
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *                 example: Laptop
 *               category:
 *                 type: string
 *                 example: Electronics
 *               price:
 *                 type: number
 *                 example: 800
 *               discountedPrice:
 *                 type: number
 *                 example: 750
 *               image:
 *                 type: string
 *                 format: binary
 *               isPublished:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid product data
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Administrator access required
 */
router.post("/", authMiddleware, requireAdmin, upload.single("image"), createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Edit or publish a product
 *     description: Administrator only. Send JSON for field updates or multipart form data when replacing the image.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Product MongoDB ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: Laptop }
 *               category: { type: string, example: Electronics }
 *               price: { type: number, minimum: 0, example: 800 }
 *               discountedPrice: { type: number, minimum: 0, example: 750 }
 *               isPublished: { type: boolean, example: false }
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               category: { type: string }
 *               price: { type: number, minimum: 0 }
 *               discountedPrice: { type: number, minimum: 0 }
 *               isPublished: { type: boolean }
 *               image: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Invalid product ID or field value
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Administrator access required
 *       404:
 *         description: Product not found
 *   delete:
 *     summary: Delete a product
 *     description: Administrator only.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Product MongoDB ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Administrator access required
 *       404:
 *         description: Product not found
 */
router.patch("/:id", authMiddleware, requireAdmin, upload.single("image"), updateProduct);
router.delete("/:id", authMiddleware, requireAdmin, deleteProduct);

export default router;