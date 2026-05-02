#!/usr/bin/env node

/**
 * Priority Inbox Tester
 * Fetches notifications and displays top 10 prioritized notifications
 */

const axios = require('axios');
require('dotenv').config({ path: '../../.env' });

// Priority scoring system
const PRIORITY_SCORES = {
  type: {
    'Result': 100,
    'Placement': 90,
    'Event': 70,
    'default': 50
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

function calculatePriorityScore(notification) {
  let score = 0;

  const typeScore = PRIORITY_SCORES.type[notification.Type] || PRIORITY_SCORES.type.default;
  score += typeScore;

  const message = (notification.Message || '').toLowerCase();
  for (const [keyword, points] of Object.entries(PRIORITY_SCORES.keywords)) {
    if (message.includes(keyword)) {
      score += points;
    }
  }

  const notifDate = new Date(notification.Timestamp).toDateString();
  const today = new Date().toDateString();
  if (notifDate === today) {
    score += 10;
  }

  return score;
}

async function getTopNotifications() {
  try {
    const accessToken = process.env.ACCESS_TOKEN;

    if (!accessToken) {
      throw new Error('ACCESS_TOKEN not found in .env file');
    }

    console.log('\n📡 Fetching notifications from API...\n');

    const response = await axios.get(
      'http://20.207.122.201/evaluation-service/notifications',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const notifications = response.data.notifications || [];

    console.log(`✅ Retrieved ${notifications.length} total notifications\n`);

    // Add priority scores
    const scoredNotifications = notifications.map((notif) => ({
      ...notif,
      priorityScore: calculatePriorityScore(notif)
    }));

    // Sort by priority
    const sorted = scoredNotifications.sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      return new Date(b.Timestamp) - new Date(a.Timestamp);
    });

    // Display top 10
    console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                    🏆 TOP 10 PRIORITY INBOX NOTIFICATIONS                      ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');

    const top10 = sorted.slice(0, 10);

    top10.forEach((notif, index) => {
      console.log(`${(index + 1).toString().padStart(2, '0')}. [SCORE: ${notif.priorityScore.toFixed(2)}] ${notif.Type.padEnd(12)}`);
      console.log(`    📝 ${notif.Message}`);
      console.log(`    🕐 ${notif.Timestamp}`);
      console.log(`    🔗 ID: ${notif.ID}\n`);
    });

    console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                         PRIORITY SCORING BREAKDOWN                            ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');

    console.log('Type-based scoring:');
    console.log('  • Result     = 100 points');
    console.log('  • Placement  = 90 points');
    console.log('  • Event      = 70 points');
    console.log('  • Other      = 50 points\n');

    console.log('Keyword bonuses:');
    console.log('  • "offer"      = +40 points (highest)');
    console.log('  • "selected"   = +30 points');
    console.log('  • "shortlist"  = +35 points');
    console.log('  • "interview"  = +25 points');
    console.log('  • "hiring"     = +25 points');
    console.log('  • "review"     = +20 points');
    console.log('  • "reject"     = +15 points');
    console.log('  • "extern"     = +10 points\n');

    console.log('Time-based bonus:');
    console.log('  • Today\'s notifications = +10 points\n');

    console.log('═'.repeat(88));
    console.log(`\nTotal Notifications Analyzed: ${notifications.length}`);
    console.log(`Top Priority Notifications Displayed: ${top10.length}\n`);

  } catch (error) {
    console.error('\n❌ Error occurred:');
    console.error(`   ${error.message}\n`);
    process.exit(1);
  }
}

// Run the tester
getTopNotifications();
