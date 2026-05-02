const express = require('express');
const dotenv = require('dotenv');
const { getPriorityInbox, getTopNotifications } = require('./src/services/notificationService');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes

/**
 * GET /api/priority-inbox
 * Returns top 10 prioritized notifications
 */
app.get('/api/priority-inbox', async (req, res) => {
  try {
    const accessToken = process.env.ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(500).json({
        error: 'ACCESS_TOKEN not configured',
        message: 'Please set ACCESS_TOKEN in .env file'
      });
    }

    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    // Validate limit
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        error: 'Invalid limit',
        message: 'Limit must be between 1 and 100'
      });
    }

    const inbox = await getPriorityInbox(accessToken, limit);

    res.json({
      success: true,
      data: inbox,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in /api/priority-inbox:', error);
    res.status(500).json({
      error: error.message,
      success: false
    });
  }
});

/**
 * GET /api/priority-inbox/top/:count
 * Returns top N prioritized notifications
 */
app.get('/api/priority-inbox/top/:count', async (req, res) => {
  try {
    const accessToken = process.env.ACCESS_TOKEN;
    const count = parseInt(req.params.count) || 10;

    if (!accessToken) {
      return res.status(500).json({
        error: 'ACCESS_TOKEN not configured',
        message: 'Please set ACCESS_TOKEN in .env file'
      });
    }

    if (count < 1 || count > 100) {
      return res.status(400).json({
        error: 'Invalid count',
        message: 'Count must be between 1 and 100'
      });
    }

    const topNotifications = await getTopNotifications(accessToken, count);

    res.json({
      success: true,
      count: topNotifications.length,
      notifications: topNotifications.map((notif, index) => ({
        rank: index + 1,
        id: notif.ID,
        type: notif.Type,
        message: notif.Message,
        timestamp: notif.Timestamp,
        priorityScore: parseFloat(notif.priorityScore.toFixed(2))
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in /api/priority-inbox/top/:count:', error);
    res.status(500).json({
      error: error.message,
      success: false
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /
 * Welcome endpoint
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Notification Backend Service with Priority Inbox',
    endpoints: {
      'GET /api/priority-inbox': 'Get top 10 prioritized notifications',
      'GET /api/priority-inbox/top/:count': 'Get top N prioritized notifications',
      'GET /health': 'Health check'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Notification Backend Service running on http://localhost:${PORT}`);
  console.log(`\n📋 Available Endpoints:`);
  console.log(`   • GET http://localhost:${PORT}/api/priority-inbox          - Top 10 notifications`);
  console.log(`   • GET http://localhost:${PORT}/api/priority-inbox/top/:count - Top N notifications`);
  console.log(`   • GET http://localhost:${PORT}/health                       - Health check\n`);
});

module.exports = app;
