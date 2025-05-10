import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0', // OpenAPI version
    info: {
      title: 'Linkee',
      version: '1.0.0',
      description: 'A REST API for a URL shortening service',
      contact: {
        name: 'API Support',
        // url: 'http://www.example.com/support', // Optional
        // email: 'support@example.com', // Optional
      },
      license: { // Optional
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [ // Add server information
      {
        url: `http://localhost:${process.env.PORT || 3000}/`, // Adjust if your base path differs
        description: 'Development server',
      },
      // Add other servers like staging or production if needed
    ],
    components: { // Define reusable components like security schemes
      securitySchemes: {
        bearerAuth: { // Name of the security scheme
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', // Format of the token
          description: 'Enter JWT Bearer token **_only_**'
        }
      },
      schemas: { // Define reusable schemas for request/response bodies
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Client ID' },
            username: { type: 'string', description: 'Users\'s username name' },
            email: { type: 'string', format: 'email', description: 'User\'s email address' },
            profileImageUrl: { type: 'string', format: 'url', nullable: true, description: 'URL of the user\'s profile image' },
            createdAt: { type: 'string', format: 'date-time', description: 'Timestamp of user account creation' },
          },
          required: ['id', 'username', 'email']
        },
        ShortUrls: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', description: 'Short URL ID' },
              longUrl: { type: 'string', format: 'uri', description: 'URL to be shortened' },
              customCode: { type: 'string', description: 'Customized link code' },
              expiresAt: { type: 'string', format: 'date-time', description: 'Expiration date of shortened link' },
              userId: { type: 'string', format: 'uuid', description: 'ID of the user who shortened the link' },
              clicks: { type: 'integer', description: 'Number of clicks the link has received' },
              createdAt: { type: 'string', format: 'date-time', description: 'Timestamp of short URL creation' },
            },
            required: ['id', 'longUrl', 'createdAt', 'clicks']
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Error message' },
          }
        }
      }
    },
    security: [ // Apply security globally (can be overridden per operation)
      {
        bearerAuth: [] // Requires bearerAuth for all routes unless specified otherwise
      }
    ]
  },
  // Path to the API docs files that contain OpenAPI annotations
  apis: ['./routes/*.js'], // Looks for JSDoc comments in all .js files in the routes directory
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec; 
