# Payment Method Management Microservice

A scalable Express.js microservice for managing payment methods with support for multiple payment providers.

## Features

- **User Management**: Registration, login, and API key generation
- **Payment Provider Management**: CRUD operations for payment providers
- **Payment Method Management**: Store, retrieve, update, and delete payment methods
- **Generic Provider Interface**: Extensible architecture for multiple payment providers
- **API Key Authentication**: Secure API access using API keys
- **Input Validation**: Comprehensive request validation using Joi
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Request Logging**: Detailed request/response logging
- **Rate Limiting**: Configurable rate limiting to prevent abuse
- **Health Checks**: Health check endpoints for monitoring
- **Docker Support**: Multi-stage Dockerfile and Docker Compose setup
- **TypeScript**: Full TypeScript support with strict typing
- **Testing**: Jest test suite with comprehensive coverage

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL
- **ORM**: Prisma
- **Containerization**: Docker
- **Validation**: Joi
- **Authentication**: API Key based
- **Testing**: Jest

## Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- Docker & Docker Compose (optional)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Set up the database:
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Docker Setup

1. Build and start with Docker Compose:
   ```bash
   docker-compose up -d
   ```

2. Run database migrations:
   ```bash
   docker-compose exec payment-service npm run db:migrate
   ```

## API Documentation

### Base URL
- Development: `http://localhost:3000`
- Production: `https://your-domain.com`

### Authentication

All API endpoints (except health checks and user registration/login) require an API key sent in the `X-API-Key` header.

### Health Check Endpoints

#### GET /health
Basic health check

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2023-07-01T12:00:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0",
  "database": "connected"
}
```

#### GET /health/detailed
Detailed health check with system information

### User Management Endpoints

#### POST /api/v1/users/register
Register a new user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2023-07-01T12:00:00.000Z"
    },
    "token": "jwt_token"
  }
}
```

#### POST /api/v1/users/login
Login user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /api/v1/users/api-key
Generate new API key

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### GET /api/v1/users/profile
Get user profile (requires API key)

#### PUT /api/v1/users/profile
Update user profile (requires API key)

### Payment Provider Endpoints

#### GET /api/v1/payment-providers
Get all payment providers (requires API key)

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `isActive`: Filter by active status (true/false)

#### GET /api/v1/payment-providers/:id
Get payment provider by ID (requires API key)

#### POST /api/v1/payment-providers
Create new payment provider (admin only)

**Request Body:**
```json
{
  "name": "stripe",
  "displayName": "Stripe",
  "isActive": true,
  "config": {
    "apiKey": "sk_test_...",
    "webhookSecret": "whsec_..."
  }
}
```

#### PUT /api/v1/payment-providers/:id
Update payment provider (admin only)

#### DELETE /api/v1/payment-providers/:id
Delete payment provider (admin only)

#### PATCH /api/v1/payment-providers/:id/toggle
Toggle provider active status (admin only)

### Payment Method Endpoints

#### GET /api/v1/payment-methods
Get all payment methods for authenticated user (requires API key)

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `type`: Filter by payment method type
- `isActive`: Filter by active status (true/false)
- `providerId`: Filter by provider ID

#### GET /api/v1/payment-methods/:id
Get payment method by ID (requires API key)

#### POST /api/v1/payment-methods
Create new payment method (requires API key)

**Request Body:**
```json
{
  "providerId": "provider_id",
  "type": "CREDIT_CARD",
  "providerMethodId": "pm_stripe_123",
  "last4": "4242",
  "expiryMonth": 12,
  "expiryYear": 2024,
  "brand": "visa",
  "isDefault": false,
  "metadata": {}
}
```

#### PUT /api/v1/payment-methods/:id
Update payment method (requires API key)

#### DELETE /api/v1/payment-methods/:id
Delete payment method (requires API key)

#### PATCH /api/v1/payment-methods/:id/set-default
Set payment method as default (requires API key)

#### PATCH /api/v1/payment-methods/:id/deactivate
Deactivate payment method (requires API key)

## Error Handling

The API returns standard HTTP status codes and follows this error response format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "stack": "Error stack trace (development only)"
  }
}
```

## Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Configurable via environment variables

## Environment Variables

See `.env.example` for all available environment variables.

## Development

### Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build TypeScript to JavaScript
- `npm start`: Start production server
- `npm test`: Run test suite
- `npm run test:watch`: Run tests in watch mode
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Fix ESLint issues
- `npm run format`: Format code with Prettier
- `npm run db:generate`: Generate Prisma client
- `npm run db:migrate`: Run database migrations
- `npm run db:push`: Push schema to database
- `npm run db:studio`: Open Prisma Studio

### Project Structure

```
src/
├── controllers/     # Route controllers
├── services/        # Business logic services
├── middleware/      # Express middleware
├── routes/          # API routes
├── validators/      # Joi validation schemas
├── interfaces/      # TypeScript interfaces
├── config/          # Configuration files
├── tests/           # Test files
└── types/           # Custom TypeScript types
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT License