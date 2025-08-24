-- ESM Platform - Database Performance Optimization
-- Optimized for 300+ concurrent users and 245+ employee records
-- Target: Sub-100ms query response times

-- ============================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================

-- Users table optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_employee_id 
  ON users (employee_id) WHERE status = 'active';
  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_department_status 
  ON users (department_id, status) 
  INCLUDE (first_name, last_name, email);
  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_lower 
  ON users (LOWER(email)) WHERE status = 'active';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_search_text 
  ON users USING GIN (to_tsvector('english', first_name || ' ' || last_name || ' ' || email));

-- Services table optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_category_active 
  ON services (category, is_active) 
  INCLUDE (name, description);
  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_name_search 
  ON services USING GIN (to_tsvector('english', name || ' ' || description));

-- User service access optimization (critical for permissions)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_service_access_user_service 
  ON user_service_access (user_id, service_id) 
  INCLUDE (access_level, granted_date, expires_at);
  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_service_access_service_level 
  ON user_service_access (service_id, access_level) 
  WHERE is_active = true AND (expires_at IS NULL OR expires_at > NOW());
  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_service_access_expires 
  ON user_service_access (expires_at) 
  WHERE expires_at IS NOT NULL AND is_active = true;

-- VPN access optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vpn_access_user_active 
  ON vpn_access (user_id, is_active) 
  INCLUDE (vpn_type, granted_date, expires_at);
  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vpn_access_type_expires 
  ON vpn_access (vpn_type, expires_at) 
  WHERE is_active = true;

-- Audit logs optimization (high volume table)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_timestamp_user 
  ON audit_logs (timestamp DESC, user_id) 
  INCLUDE (action, table_name);
  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_table_action_time 
  ON audit_logs (table_name, action, timestamp DESC);
  
-- Partition audit logs by month for better performance
CREATE TABLE IF NOT EXISTS audit_logs_y2025m01 PARTITION OF audit_logs 
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
  
CREATE TABLE IF NOT EXISTS audit_logs_y2025m02 PARTITION OF audit_logs 
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Departments optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_departments_name_active 
  ON departments (name) WHERE is_active = true;

-- ============================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- ============================================

-- User access summary (refresh every 15 minutes)
CREATE MATERIALIZED VIEW IF NOT EXISTS user_access_summary AS
SELECT 
  u.id as user_id,
  u.employee_id,
  u.first_name,
  u.last_name,
  u.department_id,
  d.name as department_name,
  COUNT(DISTINCT usa.service_id) as total_services,
  COUNT(DISTINCT CASE WHEN usa.access_level = 'admin' THEN usa.service_id END) as admin_services,
  COUNT(DISTINCT va.id) as vpn_accounts,
  MAX(al.timestamp) as last_activity
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN user_service_access usa ON u.id = usa.user_id AND usa.is_active = true
LEFT JOIN vpn_access va ON u.id = va.user_id AND va.is_active = true
LEFT JOIN audit_logs al ON u.id = al.user_id
WHERE u.status = 'active'
GROUP BY u.id, u.employee_id, u.first_name, u.last_name, u.department_id, d.name;

CREATE UNIQUE INDEX ON user_access_summary (user_id);
CREATE INDEX ON user_access_summary (department_id, total_services);

-- Service usage statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS service_usage_stats AS
SELECT 
  s.id as service_id,
  s.name as service_name,
  s.category,
  COUNT(DISTINCT usa.user_id) as total_users,
  COUNT(DISTINCT CASE WHEN usa.access_level = 'admin' THEN usa.user_id END) as admin_users,
  COUNT(DISTINCT CASE WHEN usa.access_level = 'manager' THEN usa.user_id END) as manager_users,
  COUNT(DISTINCT CASE WHEN usa.access_level = 'user' THEN usa.user_id END) as standard_users,
  AVG(CASE WHEN usa.expires_at IS NOT NULL 
          THEN EXTRACT(DAYS FROM usa.expires_at - usa.granted_date) 
          END) as avg_access_duration_days
FROM services s
LEFT JOIN user_service_access usa ON s.id = usa.service_id AND usa.is_active = true
WHERE s.is_active = true
GROUP BY s.id, s.name, s.category;

CREATE UNIQUE INDEX ON service_usage_stats (service_id);
CREATE INDEX ON service_usage_stats (category, total_users);

-- ============================================
-- PERFORMANCE MONITORING FUNCTIONS
-- ============================================

-- Function to get slow query statistics
CREATE OR REPLACE FUNCTION get_slow_queries()
RETURNS TABLE (
  query TEXT,
  calls BIGINT,
  total_time DOUBLE PRECISION,
  mean_time DOUBLE PRECISION,
  max_time DOUBLE PRECISION
) 
LANGUAGE sql
AS $$
  SELECT 
    query,
    calls,
    total_exec_time as total_time,
    mean_exec_time as mean_time,
    max_exec_time as max_time
  FROM pg_stat_statements
  WHERE mean_exec_time > 100  -- Queries taking more than 100ms
  ORDER BY mean_exec_time DESC
  LIMIT 20;
$$;

-- Function to get table size statistics
CREATE OR REPLACE FUNCTION get_table_sizes()
RETURNS TABLE (
  table_name TEXT,
  size_mb BIGINT,
  row_count BIGINT
) 
LANGUAGE sql
AS $$
  SELECT 
    t.table_name::TEXT,
    (pg_total_relation_size(quote_ident(t.table_name))/(1024*1024))::BIGINT as size_mb,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = t.table_name)::BIGINT as row_count
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
  ORDER BY pg_total_relation_size(quote_ident(t.table_name)) DESC;
$$;

-- ============================================
-- OPTIMIZATION SETTINGS
-- ============================================

-- Optimize PostgreSQL settings for the application
-- Note: These should be set in postgresql.conf for production

-- Memory settings
-- shared_buffers = 256MB              -- 25% of available RAM
-- effective_cache_size = 1GB          -- 75% of available RAM
-- work_mem = 16MB                     -- Per-query working memory
-- maintenance_work_mem = 64MB         -- For maintenance operations

-- Connection settings
-- max_connections = 200               -- Handle high concurrency
-- superuser_reserved_connections = 3  -- Reserve for admin

-- Query planner settings
-- random_page_cost = 1.1              -- SSD optimized
-- effective_io_concurrency = 200      -- Concurrent disk operations

-- WAL and checkpoint settings
-- wal_buffers = 16MB                  -- WAL buffer size
-- checkpoint_completion_target = 0.9  -- Spread checkpoint I/O
-- max_wal_size = 4GB                  -- Allow more WAL before checkpoint

-- ============================================
-- REFRESH PROCEDURES FOR MATERIALIZED VIEWS
-- ============================================

-- Procedure to refresh materialized views
CREATE OR REPLACE PROCEDURE refresh_performance_views()
LANGUAGE plpgsql
AS $$
BEGIN
  -- Refresh user access summary
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_access_summary;
  
  -- Refresh service usage stats
  REFRESH MATERIALIZED VIEW CONCURRENTLY service_usage_stats;
  
  -- Update table statistics
  ANALYZE users;
  ANALYZE services;
  ANALYZE user_service_access;
  ANALYZE vpn_access;
  ANALYZE audit_logs;
  
  RAISE NOTICE 'Performance views refreshed successfully';
END;
$$;

-- ============================================
-- CLEANUP PROCEDURES
-- ============================================

-- Procedure to clean up old audit logs (keep 6 months)
CREATE OR REPLACE PROCEDURE cleanup_old_audit_logs()
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs 
  WHERE timestamp < NOW() - INTERVAL '6 months';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Cleaned up % old audit log records', deleted_count;
END;
$$;

-- ============================================
-- MONITORING QUERIES
-- ============================================

-- Query to check index usage
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   idx_tup_read,
--   idx_tup_fetch,
--   idx_scan
-- FROM pg_stat_user_indexes
-- WHERE idx_scan = 0  -- Unused indexes
-- ORDER BY schemaname, tablename;

-- Query to check table access patterns
-- SELECT 
--   schemaname,
--   tablename,
--   seq_scan,
--   seq_tup_read,
--   idx_scan,
--   idx_tup_fetch,
--   n_tup_ins + n_tup_upd + n_tup_del as total_writes
-- FROM pg_stat_user_tables
-- ORDER BY seq_scan DESC;  -- Tables with high sequential scans

-- Query to check connection pool status
-- SELECT 
--   count(*) as total_connections,
--   count(*) FILTER (WHERE state = 'active') as active_connections,
--   count(*) FILTER (WHERE state = 'idle') as idle_connections
-- FROM pg_stat_activity
-- WHERE datname = 'esm_platform';