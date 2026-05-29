# Database Configuration

This application supports multiple database engines through environment variables.

## Supported Engines

- **Aurora PostgreSQL** (`aurora-postgresql`) - Recommended for production
- **Aurora MySQL** (`aurora-mysql`) - Alternative for MySQL workloads
- **RDS PostgreSQL** (`postgresql`) - Single-instance PostgreSQL
- **RDS MySQL** (`mysql`) - Single-instance MySQL

## Environment Variables

The application automatically detects the database engine and uses the appropriate driver:

```bash
DB_ENGINE=aurora-postgresql  # or aurora-mysql, postgresql, mysql
DB_HOST=your-db-endpoint
DB_PORT=5432                  # 5432 for PostgreSQL, 3306 for MySQL
DB_USER=postgres              # or admin for MySQL
DB_PASSWORD=your-password
DB_NAME=app
DB_SSL=true                   # Enable SSL/TLS
```

## Database Sizing

| Size | Instance Type | vCPU | RAM  | Monthly Cost* |
|------|---------------|------|------|---------------|
| S    | db.t4g.small  | 2    | 2GB  | ~$30          |
| M    | db.t4g.medium | 2    | 4GB  | ~$60          |
| L    | db.t4g.large  | 2    | 8GB  | ~$120         |

*Approximate costs for Aurora/RDS in us-east-1

## Migrations

Migrations are engine-specific:

- `migrations/*.postgresql.sql` - PostgreSQL migrations
- `migrations/*.mysql.sql` - MySQL migrations

The application automatically selects the correct migration based on `DB_ENGINE`.

## Code Structure

- `src/db.js` - Database connection factory
  - Detects engine from `DB_ENGINE` environment variable
  - Loads appropriate driver (`pg` or `mysql2`)
  - Provides unified `executeQuery()` interface

- `src/index.js` - Application code
  - Uses `pool.executeQuery()` for database-agnostic queries
  - SQL queries are compatible with both PostgreSQL and MySQL

## Adding New Queries

Use standard SQL that works on both engines:

```javascript
// Good - works on both
const result = await pool.executeQuery(
  "SELECT id, email FROM users WHERE id = ?",
  [userId]
);

// Avoid engine-specific syntax
// PostgreSQL: $1, $2 placeholders
// MySQL: ? placeholders
```

## Health Check

The `/api/health` endpoint returns:

```json
{
  "status": "ok",
  "now": "2025-02-10T12:00:00.000Z",
  "engine": "aurora-postgresql"
}
```

This confirms the database connection and shows which engine is in use.
