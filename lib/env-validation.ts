/**
 * Environment variable validation utility
 * Ensures all required environment variables are properly loaded
 */

interface EnvValidationResult {
  isValid: boolean;
  missing: string[];
  invalid: string[];
  warnings: string[];
  values: Record<string, string | undefined>;
}

interface EnvConfig {
  required: string[];
  optional: string[];
  validators?: Record<string, (value: string) => boolean>;
}

/**
 * Convex environment configuration
 */
const convexEnvConfig: EnvConfig = {
  required: [
    'NEXT_PUBLIC_CONVEX_URL',
    'CONVEX_WEBHOOK_SIGNING_SECRET',
  ],
  optional: [
    'CONVEX_SELF_HOSTED_URL',
    'CONVEX_SELF_HOSTED_ADMIN_KEY',
  ],
  validators: {
    NEXT_PUBLIC_CONVEX_URL: (value: string) => value.startsWith('http'),
    CONVEX_WEBHOOK_SIGNING_SECRET: (value: string) => value.length > 10, // Basic length check for secret
  },
};


export function validateEnvConfig(config: EnvConfig, env: Record<string, string | undefined> = process.env): EnvValidationResult {
  const result: EnvValidationResult = {
    isValid: true,
    missing: [],
    invalid: [],
    warnings: [],
    values: {},
  };

  // Check required variables
  for (const key of config.required) {
    const value = env[key];
    if (!value || value === '') {
      result.missing.push(key);
      result.isValid = false;
    } else {
      result.values[key] = value;

      // Validate if validator exists
      if (config.validators?.[key] && !config.validators[key](value)) {
        result.invalid.push(`${key} (invalid format)`);
        result.isValid = false;
      }
    }
  }

  // Check optional variables and add warnings for missing ones that might be needed
  for (const key of config.optional) {
    const value = env[key];
    result.values[key] = value;

    if (!value || value === '') {
      result.warnings.push(`${key} is not set (optional but recommended)`);
    } else if (config.validators?.[key] && !config.validators[key](value)) {
      result.warnings.push(`${key} has invalid format`);
    }
  }

  return result;
}

/**
 * Validate all environment configurations
 */
export function validateAllEnvs(env: Record<string, string | undefined> = process.env) {
  const results = {
    convex: validateEnvConfig(convexEnvConfig, env),
  };

  const overallValid = Object.values(results).every(result => result.isValid);

  return {
    overallValid,
    results,
    summary: {
      totalMissing: Object.values(results).reduce((sum, r) => sum + r.missing.length, 0),
      totalInvalid: Object.values(results).reduce((sum, r) => sum + r.invalid.length, 0),
      totalWarnings: Object.values(results).reduce((sum, r) => sum + r.warnings.length, 0),
    },
  };
}

/**
 * Get a safe environment variable value with validation
 */
export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];

  // If no value and no default, throw error
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }

  // If value exists, return it
  if (value && value !== '') {
    return value;
  }

  // Return default if provided
  if (defaultValue) {
    console.warn(`Environment variable ${key} not set, using default: ${defaultValue}`);
    return defaultValue;
  }

  // This should never happen due to the check above, but TypeScript needs it
  throw new Error(`Environment variable ${key} is required but not set`);
}

/**
 * Get environment variable with validation for URLs
 */
export function getEnvUrl(key: string, defaultValue?: string): string {
  const value = getEnvVar(key, defaultValue);

  if (!value.startsWith('http://') && !value.startsWith('https://')) {
    throw new Error(`Environment variable ${key} must be a valid URL starting with http:// or https://`);
  }

  return value;
}

/**
 * Get environment variable as boolean
 */
export function getEnvBool(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];

  if (!value || value === '') {
    return defaultValue;
  }

  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Get environment variable as number
 */
export function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];

  if (!value || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is required but not set`);
  }

  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }

  return parsed;
}