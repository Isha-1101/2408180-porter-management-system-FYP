import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Porter Management API",
      version: "1.0.0",
      description: "This will describe the Porter Management API",
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:5000",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    // Apply BearerAuth globally (optional)
    security: [
      {
        BearerAuth: [],
      },
    ],
  },

  // Paths to files where APIs are documented
  apis: ["./routes/*.js", "./models/*.js"],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
export const swaggerUiMiddleware = swaggerUi;
