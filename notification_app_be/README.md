# Notification App - Backend

Backend notification service implementing the logging middleware for server-side event tracking and logging.

## Features

- Express.js REST API
- Integration with logging middleware
- Event-driven architecture
- Database operations tracking
- Scheduled task logging

## Installation

```bash
npm install
```

## Running

**Development**:
```bash
npm run dev
```

**Production**:
```bash
npm start
```

## Logging Packages Used

- `cache` - Caching operations
- `controller` - Request handlers
- `cron_job` - Scheduled tasks
- `db` - Database operations
- `domain` - Domain models
- `handler` - Event handlers
- `repository` - Data access layer
- `route` - API routing
- `service` - Business services

## Example Usage

```javascript
const { Log } = require('../logging_middleware/logger');

// Log database operation
await Log('backend', 'error', 'db', 'Database connection failed');

// Log service operation
await Log('backend', 'info', 'service', 'User registration completed');

// Log scheduled task
await Log('backend', 'warn', 'cron_job', 'Task execution delayed');
```

## Configuration

Set `ACCESS_TOKEN` in `.env` file for API communication.

## Testing

```bash
npm test
```
