# Notification System Design Document

## 1. System Architecture

### Overview
The notification system is built on a three-tier architecture with a reusable logging middleware as the foundation.

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│              - User Interface                               │
│              - Event Handlers                               │
│              - State Management                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Logging Middleware (Core)                      │
│         - Parameter Validation                              │
│         - Enum Constraint Checking                          │
│         - API Communication                                 │
│         - Error Handling                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         Evaluation Service (External API)                   │
│    - Registration Endpoint                                  │
│    - Authentication Endpoint                                │
│    - Logging/Events Endpoint                                │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

#### 1. Logging Middleware (`logging_middleware/`)
**Purpose**: Unified logging interface for all applications

**Key Features**:
- Validates all input parameters against enum constraints
- Prevents invalid API requests with pre-validation
- Handles authentication via Bearer token
- Implements graceful error handling
- Async POST to evaluation service

**Validation Flow**:
```
Input Parameters
      ↓
Validate Stack (backend/frontend)
      ↓
Validate Level (debug/info/warn/error/fatal)
      ↓
Validate Package (stack-specific list)
      ↓
Validate Message (non-empty string)
      ↓
Create Payload with Timestamp
      ↓
Send POST with Bearer Token
      ↓
Return Result
```

#### 2. Backend Notification Service (`notification_app_be/`)
**Purpose**: Server-side notification logic and API endpoints

**Responsibilities**:
- Process notification events
- Call logging middleware for event tracking
- Handle business logic validation
- Manage database operations
- Return appropriate responses

**Uses Logging Packages**:
- `cache` - Caching operations
- `controller` - Request handlers
- `cron_job` - Scheduled tasks
- `db` - Database operations
- `domain` - Domain models
- `handler` - Event handlers
- `repository` - Data access layer
- `route` - API routing
- `service` - Business services

#### 3. Frontend Notification Interface (`notification_app_fe/`)
**Purpose**: User-facing notification management interface

**Responsibilities**:
- Display notifications
- Handle user interactions
- Manage application state
- Call logging middleware for frontend events

**Uses Logging Packages**:
- `api` - API communication
- `component` - React components
- `hook` - Custom React hooks
- `page` - Page components
- `state` - State management

## 2. API Integration Details

### 2.1 Registration Flow

**Request**:
```javascript
POST http://20.207.122.201/evaluation-service/register
Content-Type: application/json

{
  "email": "user@institution.edu",
  "name": "User Name",
  "rollNo": "roll123",
  "mobileNo": "1234567890",
  "githubUsername": "username",
  "accessCode": "xxxxxx"
}
```

**Response**:
```json
{
  "email": "user@institution.edu",
  "name": "user name",
  "rollNo": "roll123",
  "clientID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxxxxxxxxxx"
}
```

**Storage**: Credentials saved in `.env` (never in git)

### 2.2 Authentication Flow

**Request**:
```javascript
POST http://20.207.122.201/evaluation-service/auth
Content-Type: application/json

{
  "email": "user@institution.edu",
  "name": "User Name",
  "rollNo": "roll123",
  "accessCode": "xxxxxx",
  "clientID": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxxxxxxxxxx"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expiresIn": 86400
}
```

**Usage**: Token used in all subsequent logging API calls

### 2.3 Logging API

**Request**:
```javascript
POST http://20.207.122.201/evaluation-service/logs
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "stack": "backend",
  "level": "error",
  "package": "db",
  "message": "Database connection timeout",
  "timestamp": "2026-05-02T10:30:45.123Z"
}
```

**Validation** (all lowercase, exact match):
- `stack`: Must be "backend" or "frontend"
- `level`: Must be one of "debug", "info", "warn", "error", "fatal"
- `package`: Must match stack-specific list
- `message`: Must be non-empty string

**Error Response** (validation failure):
```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": [
    "Invalid package 'xyz' for stack 'backend'"
  ]
}
```

## 3. Validation Constraints

### Enum Values (Case-Sensitive - Lowercase Only)

| Category | Values |
|----------|--------|
| **Stack** | backend, frontend |
| **Level** | debug, info, warn, error, fatal |
| **Backend Packages** | cache, controller, cron_job, db, domain, handler, repository, route, service |
| **Frontend Packages** | api, component, hook, page, state |

### Validation Rules

1. **Stack Validation**: Exact match against allowed stacks
2. **Level Validation**: Exact match against allowed levels
3. **Package Validation**: Must belong to selected stack
4. **Message Validation**: Non-empty string, trimmed before submission
5. **Pre-validation**: All checks performed before API call

## 4. Error Handling Strategy

### Validation Errors (400)
```javascript
{
  success: false,
  status: 400,
  errors: ["error message"],
  timestamp: "2026-05-02T10:30:45.123Z"
}
```

### Authentication Errors (401/403)
```javascript
{
  success: false,
  status: 401,
  error: "Unauthorized",
  timestamp: "2026-05-02T10:30:45.123Z"
}
```

### Server Errors (500)
```javascript
{
  success: false,
  status: 500,
  error: "Internal server error",
  timestamp: "2026-05-02T10:30:45.123Z"
}
```

### Graceful Degradation
- Errors are logged but do not crash the application
- Failed logging calls return error objects instead of throwing
- Application continues functioning even if logging fails

## 5. Data Flow Examples

### Backend: Database Error Logging

```
Application Error in 'db' package
           ↓
Log('backend', 'error', 'db', 'Connection timeout')
           ↓
Validate: stack='backend', level='error', package='db'
           ↓
Create payload with timestamp
           ↓
POST to API with Bearer token
           ↓
Return {success: true/false, status: xxx}
           ↓
Application continues (error handled gracefully)
```

### Frontend: Component Error Logging

```
React component error
           ↓
Log('frontend', 'error', 'component', 'Render failed')
           ↓
Validate: stack='frontend', level='error', package='component'
           ↓
Create payload with timestamp
           ↓
POST to API with Bearer token
           ↓
Return {success: true/false, status: xxx}
           ↓
UI continues functioning
```

## 6. Security Considerations

### Token Management
- Access tokens stored in `.env` only (never in code)
- Token transmitted via Authorization header
- HTTPS used for all API communications
- Tokens have expiration time

### Data Privacy
- No sensitive user data logged
- Messages contain only operational context
- Timestamps in UTC for consistency
- All communications encrypted

### API Compliance
- Strict parameter validation prevents injection
- Required enumeration values prevent unexpected values
- Case-sensitive validation ensures precision
- Pre-validation prevents invalid API calls

## 7. Performance Considerations

### Logging Overhead
- Asynchronous calls prevent blocking main thread
- Timeouts (5 seconds) prevent hanging requests
- Silent error handling prevents cascading failures
- Validation errors caught before API call

### Scalability
- Middleware reusable across applications
- Stateless logging operations
- No persistent connections
- Minimal memory footprint

## 8. Testing Strategy

### Unit Tests
- Validation function tests for all enum constraints
- Edge cases for message validation
- Error handling scenarios

### Integration Tests
- API endpoint connectivity
- Authentication with test credentials
- Logging functionality end-to-end

### Manual Testing
- Frontend interface submission
- Backend API calls
- Error scenarios
- Network failure handling

## 9. Compliance & Standards

### Code Quality
- TypeScript for type safety
- camelCase for variables
- PascalCase for classes
- Descriptive error messages

### Documentation
- Inline code comments
- Function documentation
- API documentation
- System design document

### Git Practices
- Logical commits at milestones
- Clear commit messages (no personal data)
- .gitignore properly configured
- No secrets in version control

## 10. Deployment Checklist

- [ ] All dependencies installed
- [ ] `.env` file configured with ACCESS_TOKEN
- [ ] `.env` added to `.gitignore`
- [ ] All validation rules implemented
- [ ] API endpoints tested
- [ ] Error handling verified
- [ ] No personal data in code/comments
- [ ] Documentation complete
- [ ] Repository pushed to GitHub
