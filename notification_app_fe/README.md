# Notification App - Frontend

Frontend interface for the notification system implementing the logging middleware for client-side event tracking.

## Features

- React-based user interface
- Real-time notification display
- Integrated logging for user interactions
- Event-driven state management
- Responsive design

## Installation

```bash
npm install
```

## Running

**Development**:
```bash
npm start
```

**Build**:
```bash
npm run build
```

## Logging Packages Used

- `api` - API communication
- `component` - React components
- `hook` - Custom React hooks
- `page` - Page components
- `state` - State management

## Example Usage

```javascript
import { Log } from '../logging_middleware/logger';

// Log component error
await Log('frontend', 'error', 'component', 'Notification component failed to render');

// Log API call
await Log('frontend', 'info', 'api', 'Fetching notifications from server');

// Log state change
await Log('frontend', 'debug', 'state', 'Updated notification state with new items');
```

## Configuration

Set `ACCESS_TOKEN` in `.env` file for API communication.

## Testing

```bash
npm test
```

## Architecture

- `/src/components` - Reusable React components
- `/src/hooks` - Custom React hooks
- `/src/pages` - Page components
- `/src/state` - State management
- `/src/api` - API integration
