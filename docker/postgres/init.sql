-- OpsBoard database initialization.
--
-- This script runs automatically the first time the postgres container
-- starts with an empty data directory (docker-entrypoint-initdb.d
-- convention). Table creation and seed data are handled by the backend's
-- SQLAlchemy startup routine instead of here, so the schema stays defined
-- in one place (the ORM models) rather than being duplicated in SQL.

-- Ensure the database uses UTC consistently regardless of host timezone.
ALTER DATABASE opsboard SET timezone TO 'UTC';
