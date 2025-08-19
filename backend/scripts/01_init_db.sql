-- PostgreSQL schema for Coffee Shop
-- (Nếu đang ở psql)
-- CREATE DATABASE coffee_shop4;
-- \c coffee_shop4
\echo "🔨🔨🔨Creating database..."
\echo "Dropping old tables if they exist..."
-- Drop old tables (safe to re-run)
DROP TABLE IF EXISTS system_settings_admin CASCADE;
DROP TABLE IF EXISTS revenue_statistics_report CASCADE;
DROP TABLE IF EXISTS salary CASCADE;
DROP TABLE IF EXISTS stock CASCADE;
DROP TABLE IF EXISTS recipe_ingredient CASCADE;
DROP TABLE IF EXISTS order_detail CASCADE;
DROP TABLE IF EXISTS payment CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_item CASCADE;
DROP TABLE IF EXISTS drink CASCADE;
DROP TABLE IF EXISTS recipe CASCADE;
DROP TABLE IF EXISTS report CASCADE;
DROP TABLE IF EXISTS revenue_statistics CASCADE;
DROP TABLE IF EXISTS logs CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS staffs CASCADE;
DROP TABLE IF EXISTS managers CASCADE;
DROP TABLE IF EXISTS shift_employee CASCADE;
DROP TABLE IF EXISTS shifts CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS ingredient CASCADE;
DROP TABLE IF EXISTS users CASCADE;