-- Create separate schemas for each microservice
CREATE SCHEMA IF NOT EXISTS user_service;
CREATE SCHEMA IF NOT EXISTS product_service;
CREATE SCHEMA IF NOT EXISTS order_service;
CREATE SCHEMA IF NOT EXISTS payment_service;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA user_service TO admin;
GRANT ALL PRIVILEGES ON SCHEMA product_service TO admin;
GRANT ALL PRIVILEGES ON SCHEMA order_service TO admin;
GRANT ALL PRIVILEGES ON SCHEMA payment_service TO admin;

-- Grant usage and create privileges on schemas
GRANT USAGE ON SCHEMA user_service TO admin;
GRANT CREATE ON SCHEMA user_service TO admin;
GRANT USAGE ON SCHEMA product_service TO admin;
GRANT CREATE ON SCHEMA product_service TO admin;
GRANT USAGE ON SCHEMA order_service TO admin;
GRANT CREATE ON SCHEMA order_service TO admin;
GRANT USAGE ON SCHEMA payment_service TO admin;
GRANT CREATE ON SCHEMA payment_service TO admin;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA user_service GRANT ALL ON TABLES TO admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA product_service GRANT ALL ON TABLES TO admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA order_service GRANT ALL ON TABLES TO admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA payment_service GRANT ALL ON TABLES TO admin;

-- Set default privileges for sequences (for auto-increment fields)
ALTER DEFAULT PRIVILEGES IN SCHEMA user_service GRANT ALL ON SEQUENCES TO admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA product_service GRANT ALL ON SEQUENCES TO admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA order_service GRANT ALL ON SEQUENCES TO admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA payment_service GRANT ALL ON SEQUENCES TO admin;
