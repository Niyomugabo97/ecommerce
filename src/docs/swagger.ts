import path from "path";
import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API",
      version: "1.0.0",
      description:
        "API for customer accounts, products, orders, and administrator controls. " +
        "Protected endpoints use a Bearer token returned by /api/auth/login.",
    },
    servers: [
      {
        url: process.env.API_BASE_URL || "http://localhost:5000",
        description: "E-Commerce API server",
      },
    ],
    tags: [
      { name: "Authentication", description: "Registration, login, and accounts" },
      { name: "Products", description: "Public product catalog and admin product management" },
      { name: "Addresses", description: "Customer address management" },
      { name: "Orders", description: "Customer order operations" },
      { name: "Admin", description: "Administrator-only store management" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter the JWT returned by /api/auth/login.",
        },
      },
      schemas: {
        ApiError: {
          type: "object",
          properties: {
            message: { type: "string", example: "Administrator access required" },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            currentPage: { type: "integer", example: 1 },
            limit: { type: "integer", example: 10 },
            totalCount: { type: "integer", example: 42 },
            totalPages: { type: "integer", example: 5 },
          },
        },
        Product: {
          type: "object",
          required: ["name", "category", "price", "discountedPrice", "image"],
          properties: {
            _id: { type: "string", example: "68db123456789abcdef01234" },
            name: { type: "string", example: "Laptop" },
            category: { type: "string", example: "Electronics" },
            price: { type: "number", minimum: 0, example: 800 },
            discountedPrice: { type: "number", minimum: 0, example: 750 },
            image: { type: "string", format: "uri", example: "https://res.cloudinary.com/example/image/upload/laptop.jpg" },
            isPublished: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "68db123456789abcdef01234" },
            name: { type: "string", example: "Alex Example" },
            email: { type: "string", format: "email", example: "alex@example.com" },
            role: { type: "string", enum: ["user", "admin"], example: "user" },
          },
        },
        Address: {
          type: "object",
          properties: {
            _id: { type: "string", example: "68db123456789abcdef01234" },
            user: { type: "string", example: "68db123456789abcdef01234" },
            fullName: { type: "string", example: "Alex Example" },
            phoneNumber: { type: "string", example: "+1-555-0100" },
            street: { type: "string", example: "123 Main Street" },
            city: { type: "string", example: "Springfield" },
            province: { type: "string", example: "Illinois" },
            country: { type: "string", example: "United States" },
            postalCode: { type: "string", example: "62701" },
            isDefault: { type: "boolean", example: true },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Login successful" },
            token: { type: "string", description: "JWT bearer token" },
            user: { $ref: "#/components/schemas/User" },
          },
        },
        OrderItem: {
          type: "object",
          properties: {
            product: { type: "string", example: "68db123456789abcdef01234" },
            name: { type: "string", example: "Laptop" },
            image: { type: "string", format: "uri" },
            price: { type: "number", example: 750 },
            quantity: { type: "integer", minimum: 1, example: 1 },
          },
        },
        Order: {
          type: "object",
          properties: {
            _id: { type: "string", example: "68db123456789abcdef01234" },
            user: {
              oneOf: [
                { type: "string" },
                {
                  type: "object",
                  properties: {
                    _id: { type: "string" },
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                  },
                },
              ],
            },
            items: { type: "array", items: { $ref: "#/components/schemas/OrderItem" } },
            shippingAddress: {
              type: "object",
              properties: {
                fullName: { type: "string" },
                phoneNumber: { type: "string" },
                street: { type: "string" },
                city: { type: "string" },
                province: { type: "string" },
                country: { type: "string" },
              },
            },
            paymentMethod: { type: "string", enum: ["cashOnDelivery", "onlinePayment"] },
            paymentStatus: { type: "string", enum: ["pending", "paid", "failed", "refunded"] },
            orderStatus: {
              type: "string",
              enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
            },
            itemsPrice: { type: "number", example: 750 },
            shippingPrice: { type: "number", example: 0 },
            totalPrice: { type: "number", example: 750 },
          },
        },
      },
    },
  },
  apis: [
    path.resolve(__dirname, "../routes/*.ts").replace(/\\/g, "/"),
    path.resolve(__dirname, "../routes/*.js").replace(/\\/g, "/"),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
