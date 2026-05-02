# Notification System - Campus Evaluation

A comprehensive notification system built with reusable logging middleware for reliable application monitoring and event tracking.

## Project Overview

This project demonstrates a complete notification system with:
- **Reusable Logging Middleware**: Core logging module for backend and frontend applications
- **Backend Notification Service**: Express.js-based notification application
- **Frontend Notification Interface**: React-based user interface for notification management

## Repository Structure

```
AP23110010119/
├── logging_middleware/          # Core reusable logging package
│   ├── logger.js               # JavaScript implementation
│   ├── logger.ts               # TypeScript implementation
│   └── package.json
├── notification_app_be/         # Backend notification service
│   ├── src/
│   ├── package.json
│   └── server.js
├── notification_app_fe/         # Frontend notification interface
│   ├── src/
│   ├── public/
│   └── package.json
├── notification_system_design.md
├── README.md
└── .gitignore
```

## Logging Middleware

The logging middleware provides a unified logging interface across the stack.

### Function Signature

```javascript
Log(stack, level, package, message)
```

### Parameters

| Parameter | Values | Description |
|-----------|--------|-------------|
| **stack** | `backend`, `frontend` | Application layer |
| **level** | `debug`, `info`, `warn`, `error`, `fatal` | Log severity level |
| **package** | See below | Component package name |
| **message** | string | Log message content |

### Allowed Packages

**Backend Packages** (9):
- `cache`
- `controller`
- `cron_job`
- `db`
- `domain`
- `handler`
- `repository`
- `route`
- `service`

**Frontend Packages** (5):
- `api`
- `component`
- `hook`
- `page`
- `state`

### Usage Example

```javascript
const { Log } = require('./logging_middleware/logger');

// Backend logging
await Log('backend', 'error', 'db', 'Database connection timeout');

// Frontend logging
await Log('frontend', 'warn', 'component', 'React component render failed');
```

## API Integration

### Registration
- **Endpoint**: `POST http://20.207.122.201/evaluation-service/register`
- **Purpose**: Obtain credentials for authentication

### Authentication
- **Endpoint**: `POST http://20.207.122.201/evaluation-service/auth`
- **Purpose**: Exchange credentials for access token

### Logging
- **Endpoint**: `POST http://20.207.122.201/evaluation-service/logs`
- **Headers**: `Authorization: Bearer <access_token>`
- **Purpose**: Submit application logs

## Setup Instructions

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Valid API credentials

### Installation

1. Install logging middleware dependencies:
```bash
cd logging_middleware
npm install
```

2. Install backend dependencies:
```bash
cd ../notification_app_be
npm install
```

3. Install frontend dependencies:
```bash
cd ../notification_app_fe
npm install
```

### Configuration

Create `.env` file in the logging middleware with:
```
ACCESS_TOKEN=<your_bearer_token>
CLIENT_ID=<client_id>
CLIENT_SECRET=<client_secret>
```

### Running the System

**Backend**:
```bash
cd notification_app_be
npm start
```

**Frontend**:
```bash
cd notification_app_fe
npm start
```

## Implementation Standards

- **Code Style**: Follows camelCase for variables and PascalCase for classes
- **Error Handling**: Errors logged silently to prevent application crashes
- **Type Safety**: TypeScript implementations for type-safe logging
- **API Compliance**: Strict enum validation for all parameters

## Validation

The logging middleware validates:
- Stack type (backend/frontend)
- Log level (debug/info/warn/error/fatal)
- Package name (stack-specific constraints)
- Message content (non-empty string)

Invalid inputs return detailed error messages without making API calls.

## Error Handling

All logging errors are handled gracefully:
- Validation errors return 400 status with detailed messages
- Network errors are caught and returned as failures
- Application execution continues even if logging fails

## Documentation

See [notification_system_design.md](./notification_system_design.md) for detailed system architecture and design decisions.

## License

MIT
