import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import requireAdmin from "../middleware/requireAdmin";
import {
  getAdminDashboard,
  getAdminOrders,
  getAdminUsers,
  updateAdminOrder,
} from "../controllers/adminController";
import { getAdminProducts } from "../controllers/productController";

const router = Router();

router.use(authMiddleware, requireAdmin);

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Store totals and paid-order revenue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users: { type: integer, example: 24 }
 *                 products: { type: integer, example: 18 }
 *                 unpublishedProducts: { type: integer, example: 2 }
 *                 orders: { type: integer, example: 42 }
 *                 pendingOrders: { type: integer, example: 3 }
 *                 paidRevenue: { type: number, example: 1250 }
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Administrator access required
 */
router.get("/dashboard", getAdminDashboard);

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     summary: List all products for administration
 *     description: Includes unpublished products.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Administrator access required
 */
router.get("/products", getAdminProducts);

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: List all customer orders
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated orders with customer name and email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Order' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Administrator access required
 */
router.get("/orders", getAdminOrders);

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   patch:
 *     summary: Update an order's status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: MongoDB order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               orderStatus:
 *                 type: string
 *                 enum: [pending, confirmed, processing, shipped, delivered, cancelled]
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, paid, failed, refunded]
 *             example:
 *               orderStatus: shipped
 *               paymentStatus: paid
 *     responses:
 *       200:
 *         description: Order updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Order updated successfully }
 *                 order: { $ref: '#/components/schemas/Order' }
 *       400:
 *         description: Invalid ID or status
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Administrator access required
 *       404:
 *         description: Order not found
 */
router.patch("/orders/:id", updateAdminOrder);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List registered users
 *     description: Passwords and password-reset fields are never included.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated user list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/User' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Administrator access required
 */
router.get("/users", getAdminUsers);

export default router;
