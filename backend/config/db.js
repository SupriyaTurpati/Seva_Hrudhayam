const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 6543,
  database: process.env.DB_NAME || 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL Connected successfully to Supabase');
    client.release();
    
    // Initialize database tables
    await initDatabase();
  } catch (error) {
    console.error(`Error connecting to PostgreSQL: ${error.message}`);
    process.exit(1);
  }
};

const initDatabase = async () => {
  const ddlQuery = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS admins (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'admin',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS donors (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(20) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'donor',
      email VARCHAR(255) UNIQUE,
      pincode VARCHAR(20),
      village VARCHAR(255),
      district VARCHAR(255),
      serving_count INT DEFAULT 0,
      reset_password_token VARCHAR(255),
      reset_password_expires TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orphanage_heads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      head_name VARCHAR(255) NOT NULL,
      phone VARCHAR(20) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'orphanage_head',
      email VARCHAR(255) UNIQUE,
      is_verified BOOLEAN DEFAULT FALSE,
      reset_password_token VARCHAR(255),
      reset_password_expires TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orphanages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      orphanage_name VARCHAR(255) NOT NULL,
      head_name VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      boys_count INT DEFAULT 0,
      girls_count INT DEFAULT 0,
      district VARCHAR(255) NOT NULL,
      village VARCHAR(255) NOT NULL,
      pincode VARCHAR(20) NOT NULL,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      head_id UUID NOT NULL REFERENCES orphanage_heads(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS donation_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
      item_type VARCHAR(50) CHECK (item_type IN ('Food', 'Clothes', 'Toys', 'Old Beds', 'Other')) NOT NULL,
      item_description TEXT,
      quantity VARCHAR(255) NOT NULL,
      serving_count INT DEFAULT 0,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      pincode VARCHAR(20),
      village VARCHAR(255),
      district VARCHAR(255),
      status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'rejected')),
      accepted_by UUID REFERENCES orphanages(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS future_bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
      booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
      donation_mode VARCHAR(50) DEFAULT 'future',
      item_type VARCHAR(50) CHECK (item_type IN ('Food', 'Clothes', 'Toys', 'Old Beds', 'Other')) NOT NULL,
      quantity VARCHAR(255) NOT NULL,
      serving_count INT DEFAULT 0,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      pincode VARCHAR(20),
      village VARCHAR(255),
      district VARCHAR(255),
      extra_notes TEXT,
      status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'rejected')),
      accepted_by UUID REFERENCES orphanages(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS donation_histories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      donation_id UUID NOT NULL,
      donation_model VARCHAR(50) CHECK (donation_model IN ('DonationRequest', 'FutureBooking')) NOT NULL,
      donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
      orphanage_id UUID NOT NULL REFERENCES orphanages(id) ON DELETE CASCADE,
      status VARCHAR(50) NOT NULL,
      completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      user_model VARCHAR(50) CHECK (user_model IN ('Admin', 'Donor', 'OrphanageHead')) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'info',
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await pool.query(ddlQuery);
    console.log('Database tables initialized/verified successfully');
  } catch (error) {
    console.error(`Error initializing database tables: ${error.message}`);
    throw error;
  }
};

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  connectDB
};
