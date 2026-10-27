
import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} from "../controllers/orderControllers";
import protect from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Place an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items, shippingAddress, paymentMethod]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [productId, quantity]
 *                   properties:
 *                     productId: { type: string }
 *                     quantity: { type: integer, minimum: 1, example: 1 }
 *               shippingAddress:
 *                 type: object
 *                 required: [fullName, phoneNumber, street, city, country]
 *                 properties:
 *                   fullName: { type: string }
 *                   phoneNumber: { type: string }
 *                   street: { type: string }
 *                   city: { type: string }
 *                   province: { type: string }
 *                   country: { type: string }
 *               paymentMethod:
 *                 type: string
 *                 enum: [cashOnDelivery, onlinePayment]
 *     responses:
 *       201:
 *         description: Order created. Prices and statuses are set by the server.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid items, shipping address, or payment method
 *       401:
 *         description: Missing or invalid token
 */
router.post("/", protect, createOrder);

/**
 * @swagger
 * /api/orders/my-orders:
 *   get:
 *     summary: Get the authenticated user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Order' }
 *       401:
 *         description: Missing or invalid token
 */
router.get("/my-orders", protect, getMyOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     description: Customers can access their own orders; admins can access any order.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Not allowed to access this order
 *       404:
 *         description: Order not found
 */
router.get("/:id", protect, getOrderById);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     summary: Cancel an order
 *     description: The owner may cancel an order while its status is pending or confirmed.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Cancelled order
 *       400:
 *         description: Order is not cancellable
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Not allowed to cancel this order
 *       404:
 *         description: Order not found
 */
router.patch("/:id/cancel", protect, cancelOrder);

export default router;
