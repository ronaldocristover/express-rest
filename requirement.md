
# Express.js Microservice Specification

## Overview
Build a scalable microservice using Express.js, TypeScript, Docker, Prisma, and MySQL.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL
- **ORM**: Prisma
- **Containerization**: Docker

## Architecture Requirements

### 1. Project Structure
```
src/
├── controllers/
├── services/
├── models/
├── middleware/
├── routes/
├── config/
├── utils/
└── types/
```

### 2. Core Features
- RESTful API endpoints
- Input validation
- Error handling middleware
- Request logging
- CORS configuration
- Environment-based configuration

### 3. Database Layer
- Prisma ORM integration
- Database migrations
- Connection pooling
- Transaction support

### 4. Docker Configuration
- Multi-stage Dockerfile
- Docker Compose for development
- MySQL container setup
- Volume persistence

### 5. Scalability Features
- Stateless design
- Health check endpoints
- Graceful shutdown
- Process clustering support
- Load balancer ready

### 6. Development Setup
- TypeScript compilation
- Hot reload in development
- ESLint and Prettier
- Jest for testing
- Environment variables

### 7. API Standards
- HTTP status codes
- JSON response format
- API versioning
- Rate limiting
- Request/response validation

### 8. Naming Conventions

#### Files and Directories
- **Services**: `user.service.ts`, `auth.service.ts`
- **Models**: `user.model.ts`, `product.model.ts`
- **Routes**: `user.routes.ts`, `auth.routes.ts`
- **Controllers**: `user.controller.ts`, `auth.controller.ts`
- **Middleware**: `auth.middleware.ts`, `validation.middleware.ts`

#### Conventions
- Use **camelCase** for file names
- Add appropriate **suffix** to indicate file type
- Use **singular** nouns for entity names
- Keep names **descriptive** and **consistent**

