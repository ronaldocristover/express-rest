# Project Conventions

This document outlines the coding conventions and project structure standards for the Payment Method Service.

## File Naming Conventions

### General Rules
- Use **kebab-case** for all file names
- All file names should be descriptive and indicate their purpose
- TypeScript files use `.ts` extension

### Directory Structure
```
src/
├── config/           # Configuration files (kebab-case)
├── controllers/      # Controller files (kebab-case)
├── errors/           # Custom error classes
├── interfaces/       # TypeScript interface definitions (kebab-case)
├── middlewares/      # Express middleware files (kebab-case)
├── repositories/     # Data access layer files (kebab-case)
├── routes/          # Route definition files (kebab-case)
├── services/        # Business logic files (kebab-case)
├── tests/           # Test files and setup
├── utils/           # Utility functions
├── validations/     # Validation schemas
└── validators/      # Validator exports (kebab-case)
```

### File Name Examples
- ✅ `user.controller.ts`
- ✅ `payment-method.service.ts`
- ✅ `api-auth.middleware.ts`
- ✅ `payment-method-validator.ts`
- ❌ `userController.ts`
- ❌ `paymentMethodService.ts`
- ❌ `errorMiddleware.ts`

## Import/Export Conventions

### Import Organization
Imports should be organized in the following order:

1. **Node.js/External library imports**
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
```

2. **Internal imports (from other directories)**
```typescript
import { userService } from '../services/user.service';
import { AuthenticatedRequest } from '../middlewares/api-auth.middleware';
import { userSchemas } from '../validators/user-validator';
```

3. **Relative imports (same directory)**
```typescript
import { logger } from './config/logger.config';
```

### Import Path Conventions
- Use **relative imports** with `../` for parent directories
- Use **kebab-case file names** in import paths
- Use **named exports** for most modules
- Use **default exports** for single-responsibility modules (controllers, services)

### Export Patterns

#### Named Exports (Preferred for utilities, middleware)
```typescript
// validators/user-validator.ts
export const userSchemas = {
  register: z.object({...}),
  login: z.object({...})
};
```

#### Default Exports (Controllers, Services)
```typescript
// controllers/user.controller.ts
class UserController {
  // methods...
}

export default new UserController();
```

#### Mixed Exports (Configuration, Middleware)
```typescript
// middlewares/error-middleware.ts
export const errorHandler = (err, req, res, next) => { ... };
export const createError = (message, statusCode) => { ... };
export const asyncHandler = (fn) => (req, res, next) => { ... };
```

## Code Style Conventions

### TypeScript/JavaScript
- Use **ES6+** features (arrow functions, destructuring, async/await)
- Use **TypeScript strict mode**
- Use **explicit return types** for functions
- Use **interface** for object shape definitions
- Use **type** for union types and complex types

### Error Handling
- Use **custom error classes** from `errors/response-error.ts`
- Use **asyncHandler** wrapper for async route handlers
- Use **structured logging** with winston logger
- Include **error context** in logs (userId, requestId, etc.)

### Validation
- Use **Zod schemas** for input validation
- Organize schemas by feature in `validators/` directory
- Use **validation middleware** for request validation

### Database Patterns
- Use **Prisma ORM** for database operations
- Use **repository pattern** for data access
- Include **cache layer** for frequently accessed data
- Use **transactional operations** for data consistency

### Controller Patterns
- Use **dependency injection** for services
- Implement **CRUD operations** consistently
- Use **standardized response format** via utils/response.ts
- Handle **authentication/authorization** via middleware

### Service Patterns
- Implement **business logic** separation from controllers
- Use **repository pattern** for data access
- Include **caching strategy** where appropriate
- Handle **error propagation** correctly

### Middleware Patterns
- Use **functional composition** for middleware chains
- Implement **authentication** via API keys
- Include **request logging** and **metrics collection**
- Use **error handling middleware** as the last middleware

## Response Format Standards

### Success Responses
```typescript
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "pagination": {  // For paginated responses
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Error Responses
```typescript
{
  "success": false,
  "error": {
    "message": "Error description",
    "stack": "..."  // Only in development
  }
}
```

## Configuration Management

### Environment Variables
- Use **dotenv** for environment variable loading
- Define **default values** where appropriate
- Use **type-safe configuration** objects
- Separate **development/production** configurations

### Database Configuration
- Use **Prisma** for database management
- Include **connection pooling** configuration
- Support **multiple database providers** (PostgreSQL, MySQL)
- Implement **database health checks**

### Logging Configuration
- Use **Winston** for structured logging
- Support **multiple log levels** (error, warn, info, debug)
- Include **correlation IDs** for request tracing
- Configure **external log aggregation** (Loki, ELK)

## Security Conventions

### Authentication
- Use **API key authentication** for service-to-service communication
- Implement **JWT tokens** for user authentication
- Use **secure password hashing** (bcrypt with salt rounds ≥ 12)
- Include **token expiration** and refresh mechanisms

### Security Headers
- Use **Helmet.js** for security headers
- Implement **CORS** configuration
- Use **rate limiting** for API protection
- Include **input sanitization** and validation

### Data Protection
- Never log **sensitive information** (passwords, tokens, PII)
- Use **HTTPS** in production environments
- Implement **data encryption** for sensitive storage
- Include **audit logging** for important operations

## Testing Conventions

### Test Structure
- Use **Jest** as the testing framework
- Organize tests by feature/module
- Include **unit tests** for business logic
- Include **integration tests** for API endpoints
- Use **mock implementations** for external dependencies

### Test Naming
- Use **descriptive test names** that indicate the scenario
- Follow the pattern: `should [expected behavior] when [condition]`
- Include **edge cases** and **error scenarios**
- Use **setup/teardown** functions for test isolation

## Development Workflow

### Git Conventions
- Use **semantic commit messages**
- Include **branch protection** for main/master
- Use **pull requests** for code review
- Implement **CI/CD pipelines** for automated testing and deployment

### Code Quality
- Use **ESLint** for linting with TypeScript rules
- Use **Prettier** for code formatting
- Include **pre-commit hooks** for code quality checks
- Maintain **high test coverage** (>80%)

### Documentation
- Include **JSDoc comments** for public APIs
- Maintain **up-to-date README** files
- Include **API documentation** (OpenAPI/Swagger)
- Document **architecture decisions** (ADRs)

## Examples of Correct Conventions

### Controller Example
```typescript
// controllers/user.controller.ts
import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { createError, asyncHandler } from '../middlewares/error-middleware';

class UserController {
  findAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const result = await userService.findAll(page, pageSize);

    return res.status(200).json({
      message: 'Users retrieved successfully',
      data: result
    });
  });
}

export default new UserController();
```

### Service Example
```typescript
// services/user.service.ts
import userRepository from '../repositories/user.repository';
import { cacheService } from './cache.service';
import { User, Prisma } from '@prisma/client';

class UserService {
  async findAll(page: number = 1, pageSize: number = 10): Promise<{...}> {
    return await userRepository.findAll(page, pageSize);
  }
}

export const userService = new UserService();
```

### Validator Example
```typescript
// validators/user-validator.ts
import { z } from 'zod';

export const userSchemas = {
  register: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2)
  }),

  login: z.object({
    email: z.string().email(),
    password: z.string()
  })
};
```

This convention document should be followed consistently across the entire project to maintain code quality and developer productivity.