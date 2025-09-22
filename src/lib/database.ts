import { Pool, PoolClient } from 'pg';

class Database {
  private pool: Pool | null = null;

  private getPool(): Pool {
    if (!this.pool) {
      // Load environment variables
      const connectionString = process.env.DATABASE_URL;

      if (!connectionString) {
        console.error('DATABASE_URL not found in environment variables');
        throw new Error('Database configuration missing');
      }

      console.log('Initializing database connection...');

      this.pool = new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false
        },
        // Additional connection settings for Azure
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
        max: 10
      });

      // Handle pool errors
      this.pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
      });
    }

    return this.pool;
  }

  async getClient(): Promise<PoolClient> {
    try {
      return await this.getPool().connect();
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }

  async query(text: string, params?: any[]) {
    const client = await this.getClient();
    try {
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  // Test connection method
  async testConnection() {
    try {
      const client = await this.getClient();
      const result = await client.query('SELECT version()');
      client.release();
      console.log('Database connection successful:', result.rows[0].version);
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
}

export const db = new Database();
