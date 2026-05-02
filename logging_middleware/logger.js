/**
 * Logging Middleware - Core Module
 * Validates and sends logs to the evaluation service
 * 
 * Function Signature: Log(stack, level, package, message)
 * All parameters must match the exact enum values (case-sensitive, lowercase)
 */

const axios = require('axios');
require('dotenv').config();

// Enum validation constraints - exactly as specified
const VALID_STACKS = ['backend', 'frontend'];
const VALID_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];

const VALID_PACKAGES = {
  backend: [
    'cache', 'controller', 'cron_job', 'db', 'domain',
    'handler', 'repository', 'route', 'service'
  ],
  frontend: ['api', 'component', 'hook', 'page', 'state']
};

const API_ENDPOINT = 'http://20.207.122.201/evaluation-service/logs';

/**
 * Validates input parameters against enum constraints
 * @param {string} stack - 'backend' or 'frontend'
 * @param {string} level - 'debug', 'info', 'warn', 'error', 'fatal'
 * @param {string} pkg - Package name specific to stack
 * @param {string} message - Log message content
 * @returns {object} Validation result with status and errors
 */
function validateInput(stack, level, pkg, message) {
  const errors = [];

  if (!VALID_STACKS.includes(stack)) {
    errors.push(`Invalid stack: "${stack}". Allowed: ${VALID_STACKS.join(', ')}`);
  }

  if (!VALID_LEVELS.includes(level)) {
    errors.push(`Invalid level: "${level}". Allowed: ${VALID_LEVELS.join(', ')}`);
  }

  if (stack && !VALID_PACKAGES[stack]?.includes(pkg)) {
    const allowed = VALID_PACKAGES[stack]?.join(', ') || 'N/A';
    errors.push(`Invalid package: "${pkg}" for stack "${stack}". Allowed: ${allowed}`);
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    errors.push('Message must be a non-empty string');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Main logging function
 * Validates and sends logs to the evaluation service
 * 
 * @param {string} stack - 'backend' or 'frontend'
 * @param {string} level - 'debug', 'info', 'warn', 'error', 'fatal'
 * @param {string} pkg - Package name
 * @param {string} message - Log message
 * @returns {Promise<object>} Result object with success status
 */
async function Log(stack, level, pkg, message) {
  try {
    // Step 1: Validate against enum constraints
    const validation = validateInput(stack, level, pkg, message);
    if (!validation.valid) {
      return {
        success: false,
        status: 400,
        errors: validation.errors,
        timestamp: new Date().toISOString()
      };
    }

    // Step 2: Prepare payload
    const payload = {
      stack: stack.toLowerCase(),
      level: level.toLowerCase(),
      package: pkg.toLowerCase(),
      message: message.trim(),
      timestamp: new Date().toISOString()
    };

    // Step 3: Get access token from environment
    const accessToken = process.env.ACCESS_TOKEN;
    if (!accessToken) {
      console.error('[LogService] ERROR: ACCESS_TOKEN not found in environment');
      return {
        success: false,
        status: 500,
        error: 'Missing authentication token',
        timestamp: payload.timestamp
      };
    }

    // Step 4: Execute asynchronous POST request
    const response = await axios.post(API_ENDPOINT, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    return {
      success: true,
      status: response.status,
      data: response.data,
      timestamp: payload.timestamp
    };

  } catch (error) {
    // Step 5: Handle errors silently to prevent application crashes
    if (error.response) {
      return {
        success: false,
        status: error.response.status,
        error: error.response.data?.message || error.message,
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: false,
      status: 500,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { Log, validateInput, VALID_STACKS, VALID_LEVELS, VALID_PACKAGES };
