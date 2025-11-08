// src/docs/swagger.js
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "GymTrack API",
      version: "1.0.0",
      description: "API de GymTrack (máquinas, auth, roles)",
    },
    servers: [
      { url: "http://localhost:3000", description: "Local" },
      // Cambia por tu dominio en Render:
      { url: "https://api-gymtrack-z1ja.onrender.com", description: "Render" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Machine: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            image: { type: "string" },
            status: { type: "string", enum: ["Disponible", "Reservada", "Mantenimiento"] },
            user: { 
              type: "object",
              properties: {
                _id: { type: "string" },
                username: { type: "string" },
                email: { type: "string" },
                role: { type: "string", enum: ["admin","trainer"] },
              }
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        MachineCreateResponse: { $ref: "#/components/schemas/Machine" },
        MachineListResponse: {
          type: "object",
          properties: {
            page: { type: "integer" },
            limit: { type: "integer" },
            totalPages: { type: "integer" },
            total: { type: "integer" },
            machines: {
              type: "array",
              items: { $ref: "#/components/schemas/Machine" }
            },
          },
        },
        AuthUser: {
          type: "object",
          properties: {
            _id: { type: "string" },
            username: { type: "string" },
            email: { type: "string" },
            role: { type: "string", enum: ["admin","trainer"] },
          }
        },
        LoginResponse: {
          type: "object",
          properties: {
            token: { type: "string" },
            user: { $ref: "#/components/schemas/AuthUser" }
          }
        },
        Error: {
          type: "object",
          properties: { message: { type: "string" } }
        }
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // Archivos a escanear por comentarios JSDoc con @openapi
  apis: [
    "./src/routes/*.js",
    "./src/server.js",      // si documentas endpoints “utilitarios”
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
