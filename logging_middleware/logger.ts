/**
 * Logging Middleware - TypeScript Implementation
 * Validates and sends logs to the evaluation service
 * 
 * Function Signature: Log(stack, level, package, message)
 */

import axios, { AxiosError } from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

// Type definitions matching enum constraints
type Stack = 'backend' | 'frontend';
type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
type BackendPackage = 'cache' | 'controller' | 'cron_job' | 'db' | 'domain' | 'handler' | 'repository' | 'route' | 'service';
type FrontendPackage = 'api' | 'component' | 'hook' | 'page' | 'state';
type Package = BackendPackage | FrontendPackage;

interface LogPayload {
  stack: Stack;
  level: Level;
  package: Package;
  message: string;
  timestamp: string;
}

interface LogResult {
  success: boolean;
  status: number;
  data?: unknown;
  error?: string;
  errors?: string[];
  timestamp: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID_STACKS: Stack[] = ['backend', 'frontend'];
const VALID_LEVELS: Level[] = ['debug', 'info', 'warn', 'error', 'fatal'];

const VALID_PACKAGES: Record<Stack, Package[]> = {
  backend: [
    'cache', 'controller', 'cron_job', 'db', 'domain',
    'handler', 'repository', 'route', 'service'
  ] as BackendPackage[],
  frontend: ['api', 'component', 'hook', 'page', 'state'] as FrontendPackage[]
};

const API_ENDPOINT = 'http://20.207.122.201/evaluation-service/logs';

/**
 * Validates input parameters against enum constraints
 */
function validateInput(
  stack: unknown,
  level: unknown,
  pkg: unknown,
  message: unknown
): ValidationResult {
  const errors: string[] = [];

  if (!VALID_STACKS.includes(stack as Stack)) {
    errors.push(`Invalid stack: "${stack}". Allowed: ${VALID_STACKS.join(', ')}`);
  }

  if (!VALID_LEVELS.includes(level as Level)) {
    errors.push(`Invalid level: "${level}". Allowed: ${VALID_LEVELS.join(', ')}`);
  }

  if (stack && !VALID_PACKAGES[stack as Stack]?.includes(pkg as Package)) {
    const allowed = VALID_PACKAGES[stack as Stack]?.join(', ') || 'N/A';
    errors.push(`Invalid package: "${pkg}" for stack "${stack}". Allowed: ${allowed}`);
  }

  if (!message || typeof message !== 'string' || (message as string).trim().length === 0) {
    errors.push('Message must be a non-empty string');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Main logging function - asynchronous
 * 
 * @param stack - 'backend' or 'frontend'
 * @param level - 'debug', 'info', 'warn', 'error', 'fatal'
 * @param pkg - Package name
 * @param message - Log message
 * @returns Promise<LogResult> with success status and response details
 */
async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string
): Promise<LogResult> {
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

    // Step 2: Format the payload
    const payload: LogPayload = {
      stack: stack.toLowerCase() as Stack,
      level: level.toLowerCase() as Level,
      package: pkg.toLowerCase() as Package,
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

    // Step 4: Execute asynchronous POST request to Log API
    const response = await axios.post<LogPayload>(API_ENDPOINT, payload, {
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
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      return {
        success: false,
        status: axiosError.response.status,
        error: (axiosError.response.data as Record<string, unknown>)?.message as string || axiosError.message,
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: false,
      status: 500,
      error: axiosError.message,
      timestamp: new Date().toISOString()
    };
  }
}

export { Log, validateInput, VALID_STACKS, VALID_LEVELS, VALID_PACKAGES };
export type { LogResult, LogPayload, Stack, Level, Package };
