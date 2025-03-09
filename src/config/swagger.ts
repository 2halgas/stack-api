import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Boilerplate API",
      version: "1.0.0",
      description:
        "A simple Express API with user management and authentication",
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // Scan routes and controllers for JSDoc comments
};

export const swaggerSpec = swaggerJsdoc(options);
