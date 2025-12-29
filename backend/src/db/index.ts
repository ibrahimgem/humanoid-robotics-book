import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// ============================================================================
// Database Connection
// ============================================================================

let client: postgres.Sql<Record<string, unknown>> | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Get database client (lazy initialization)
 */
export function getDbClient(): postgres.Sql<Record<string, unknown>> {
  if (!client) {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    client = postgres(databaseUrl, {
      max: 10, // Connection pool size
      idle_timeout: 20, // Seconds
      connect_timeout: 10, // Seconds
      ssl: 'prefer', // Prefer SSL
    });
  }

  return client;
}

/**
 * Get Drizzle ORM instance (lazy initialization)
 */
export function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!_db) {
    _db = drizzle(getDbClient(), { schema });
  }

  return _db;
}

// Export getDb as db for convenience
export { getDb as db };

// ============================================================================
// Database Health Check
// ============================================================================

export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> {
  const start = Date.now();

  try {
    const dbClient = getDbClient();
    await dbClient`SELECT 1`;
    return {
      healthy: true,
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// Graceful Shutdown
// ============================================================================

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.end();
    client = null;
    _db = null;
  }
}

// Handle process termination
if (typeof process !== 'undefined') {
  process.on('SIGTERM', closeDatabase);
  process.on('SIGINT', closeDatabase);
}
