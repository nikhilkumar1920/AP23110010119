const axios = require('axios');

/**
 * Priority Inbox Service
 * Fetches notifications and prioritizes them based on importance
 */

// Priority scoring system
const PRIORITY_SCORES = {
  type: {
    'Result': 100,        // Results are high priority
    'Placement': 90,      // Placements are important
    'Event': 70,          // Events are moderate priority
    'default': 50         // Other types have default priority
  },
  keywords: {
    'review': 20,
    'hiring': 25,
    'selected': 30,
    'reject': 15,
    'interview': 25,
    'offer': 40,
    'shortlist': 35,
    'extern': 10
  }
};

/**
 * Calculate priority score for a notification
 * @param {Object} notification - Notification object
 * @returns {number} Priority score
 */
function calculatePriorityScore(notification) {
  let score = 0;

  // Base score from type
  const typeScore = PRIORITY_SCORES.type[notification.Type] || PRIORITY_SCORES.type.default;
  score += typeScore;

  // Bonus points for keywords in message
  const message = (notification.Message || '').toLowerCase();
  for (const [keyword, points] of Object.entries(PRIORITY_SCORES.keywords)) {
    if (message.includes(keyword)) {
      score += points;
    }
  }

  // Time-based bonus: newer notifications get slight boost
  // (notifications from same day get +10)
  const notifDate = new Date(notification.Timestamp).toDateString();
  const today = new Date().toDateString();
  if (notifDate === today) {
    score += 10;
  }

  return score;
}

/**
 * Fetch all notifications from the evaluation service
 * @param {string} accessToken - Bearer token for authentication
 * @returns {Promise<Array>} Array of notifications
 */
async function fetchNotifications(accessToken) {
  try {
    const response = await axios.get(
      'http://20.207.122.201/evaluation-service/notifications',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.notifications) {
      return response.data.notifications;
    }

    return [];
  } catch (error) {
    console.error('Error fetching notifications:', error.message);
    throw error;
  }
}

/**
 * Get top N prioritized notifications
 * @param {string} accessToken - Bearer token for authentication
 * @param {number} limit - Number of top notifications to return (default: 10)
 * @returns {Promise<Array>} Top N notifications sorted by priority
 */
async function getTopNotifications(accessToken, limit = 10) {
  try {
    // Fetch all notifications
    const notifications = await fetchNotifications(accessToken);

    // Add priority score to each notification
    const scoredNotifications = notifications.map((notif) => ({
      ...notif,
      priorityScore: calculatePriorityScore(notif)
    }));

    // Sort by priority score (descending) and then by timestamp (newest first)
    const sortedNotifications = scoredNotifications.sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      // If same priority, newer first
      return new Date(b.Timestamp) - new Date(a.Timestamp);
    });

    // Return top N
    return sortedNotifications.slice(0, limit);
  } catch (error) {
    console.error('Error getting top notifications:', error.message);
    throw error;
  }
}

/**
 * Get priority inbox with formatted output
 * @param {string} accessToken - Bearer token for authentication
 * @param {number} limit - Number of top notifications to return
 * @returns {Promise<Object>} Priority inbox data
 */
async function getPriorityInbox(accessToken, limit = 10) {
  try {
    const topNotifications = await getTopNotifications(accessToken, limit);

    return {
      totalCount: topNotifications.length,
      limit: limit,
      notifications: topNotifications.map((notif, index) => ({
        rank: index + 1,
        id: notif.ID,
        type: notif.Type,
        message: notif.Message,
        timestamp: notif.Timestamp,
        priorityScore: notif.priorityScore.toFixed(2)
      }))
    };
  } catch (error) {
    console.error('Error getting priority inbox:', error.message);
    throw error;
  }
}

module.exports = {
  calculatePriorityScore,
  fetchNotifications,
  getTopNotifications,
  getPriorityInbox
};
