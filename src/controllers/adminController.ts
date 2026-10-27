
import { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../models/orderModel";
import Product from "../models/productModel";
import User from "../models/userModel";

const orderStatuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

const paymentStatuses = [
  "pending",
  "paid",
  "failed",
  "refunded",
] as const;

const getPagination = (req: Request) => {
  const parsedPage = Number.parseInt(req.query.page as string, 10);
  const parsedLimit = Number.parseInt(req.query.limit as string, 10);

  const page = Math.max(
    1,
    Number.isFinite(parsedPage) ? parsedPage : 1
  );

  const limit = Math.min(
    100,
    Math.max(1, Number.isFinite(parsedLimit) ? parsedLimit : 10)
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

// GET /api/admin/dashboard
export const getAdminDashboard = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const [
      users,
      products,
      unpublishedProducts,
      orders,
      pendingOrders,
      paidOrders,
    ] = await Promise.all([
      User.countDocuments(),

      Product.countDocuments(),

      // Include drafts and older products without isPublished.
      Product.countDocuments({
        $or: [
          { isPublished: false },
          { isPublished: { $exists: false } },
        ],
      }),

      Order.countDocuments(),

      Order.countDocuments({ orderStatus: "pending" }),

      Order.find({ paymentStatus: "paid" })
        .select("totalPrice")
        .lean(),
    ]);

    const paidRevenue = paidOrders.reduce((total, order) => {
      const amount = Number(order.totalPrice);
      return total + (Number.isFinite(amount) ? amount : 0);
    }, 0);

    res.status(200).json({
      users,
      products,
      unpublishedProducts,
      orders,
      pendingOrders,
      paidRevenue,
    });
  } catch (error) {
    console.error("Failed to get admin dashboard:", error);

    res.status(500).json({
      message: "Failed to get admin dashboard",
    });
  }
};

// GET /api/admin/orders?page=1&limit=10
export const getAdminOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, skip } = getPagination(req);

    const [orders, totalCount] = await Promise.all([
      Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Order.countDocuments(),
    ]);

    res.status(200).json({
      orders,
      pagination: {
        currentPage: page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Failed to get admin orders:", error);

    res.status(500).json({
      message: "Failed to get orders",
    });
  }
};

// PATCH /api/admin/orders/:id
export const updateAdminOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid order ID" });
      return;
    }

    const { orderStatus, paymentStatus } = req.body;

    if (
      orderStatus === undefined &&
      paymentStatus === undefined
    ) {
      res.status(400).json({
        message:
          "At least one of orderStatus or paymentStatus is required",
      });
      return;
    }

    if (
      orderStatus !== undefined &&
      !orderStatuses.includes(orderStatus)
    ) {
      res.status(400).json({
        message: `orderStatus must be one of: ${orderStatuses.join(", ")}`,
      });
      return;
    }

    if (
      paymentStatus !== undefined &&
      !paymentStatuses.includes(paymentStatus)
    ) {
      res.status(400).json({
        message: `paymentStatus must be one of: ${paymentStatuses.join(", ")}`,
      });
      return;
    }

    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    if (orderStatus !== undefined) {
      order.orderStatus = orderStatus;
    }

    if (paymentStatus !== undefined) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    res.status(200).json({
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error("Failed to update admin order:", error);

    res.status(500).json({
      message: "Failed to update order",
    });
  }
};

// GET /api/admin/users?page=1&limit=10
export const getAdminUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, skip } = getPagination(req);

    const [users, totalCount] = await Promise.all([
      User.find()
        .select("_id name email role createdAt updatedAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      User.countDocuments(),
    ]);

    res.status(200).json({
      users,
      pagination: {
        currentPage: page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Failed to get admin users:", error);

    res.status(500).json({
      message: "Failed to get users",
    });
  }
};
