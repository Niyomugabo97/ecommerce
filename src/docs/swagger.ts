import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "E-Commerce API",
      version: "1.0.0",
      description: "API documentation for the E-Commerce application",
    },

    servers: [
      {
        url: "http://localhost:5000",
      },
    ],

    components: {
      schemas: {
        Product: {
          type: "object",
          required: ["name", "category", "price"],
          properties: {
            id: {
              type: "string",
              description: "MongoDB product ID",
              example: "68db123456789",
            },

            name: {
              type: "string",
              description: "Product name",
              example: "Laptop",
            },

            category: {
              type: "string",
              description: "Product category",
              example: "Electronics",
            },

            price: {
              type: "number",
              description: "Product price",
              example: 800,
            },
          },
        },
      },
    },
  },

  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;