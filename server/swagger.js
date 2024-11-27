export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Müşteri Yönetim API',
      version: '1.0.0',
      description: 'Müşteri bilgilerini yönetmek için API',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./server/routes/*.js'],
};