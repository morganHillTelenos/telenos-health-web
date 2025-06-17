// scripts/setup-database.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function setupDatabase() {
    const client = await pool.connect();

    try {
        console.log('Setting up database schema...');

        // Create main applications table
        await client.query(`
            CREATE TABLE IF NOT EXISTS psychiatrist_applications (
                id SERIAL PRIMARY KEY,
                
                -- Personal Information
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                phone VARCHAR(20),
                address TEXT,
                
                -- Professional Credentials
                medical_school VARCHAR(255) NOT NULL,
                graduation_year INTEGER NOT NULL,
                residency_program VARCHAR(255) NOT NULL,
                residency_year INTEGER NOT NULL,
                board_certified VARCHAR(50) NOT NULL,
                
                -- Licensing Information
                state_licenses TEXT[] NOT NULL,
                other_licenses TEXT,
                dea_number VARCHAR(20) NOT NULL,
                dea_expiration DATE NOT NULL,
                
                -- Clinical Experience
                years_experience VARCHAR(20) NOT NULL,
                telemedicine_experience VARCHAR(50) NOT NULL,
                specializations TEXT[],
                age_groups TEXT[],
                
                -- Technology & Setup
                tech_comfort VARCHAR(20) NOT NULL,
                office_setup VARCHAR(20) NOT NULL,
                internet_speed VARCHAR(20),
                
                -- Availability
                hours_per_week VARCHAR(20) NOT NULL,
                time_zone VARCHAR(10) NOT NULL,
                working_days TEXT[],
                
                -- References
                reference1_name VARCHAR(255),
                reference1_contact VARCHAR(255),
                reference2_name VARCHAR(255),
                reference2_contact VARCHAR(255),
                
                -- Additional Information
                motivation TEXT,
                additional_info TEXT,
                
                -- Application Management
                status VARCHAR(20) DEFAULT 'pending',
                notes TEXT,
                reviewer_id INTEGER,
                
                -- File Storage
                cv_file_key VARCHAR(500),
                license_files TEXT[],
                other_documents TEXT[],
                
                -- Timestamps
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                reviewed_at TIMESTAMP WITH TIME ZONE,
                
                -- Constraints
                CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
                CONSTRAINT valid_graduation_year CHECK (graduation_year BETWEEN 1970 AND EXTRACT(YEAR FROM CURRENT_DATE)),
                CONSTRAINT valid_residency_year CHECK (residency_year BETWEEN 1975 AND EXTRACT(YEAR FROM CURRENT_DATE)),
                CONSTRAINT valid_status CHECK (status IN ('pending', 'reviewed', 'interview_scheduled', 'approved', 'rejected'))
            )
        `);
        console.log('✅ Created psychiatrist_applications table');

        // Create indexes
        await client.query('CREATE INDEX IF NOT EXISTS idx_applications_email ON psychiatrist_applications(email)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_applications_status ON psychiatrist_applications(status)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_applications_created_at ON psychiatrist_applications(created_at)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_applications_state_licenses ON psychiatrist_applications USING GIN(state_licenses)');
        console.log('✅ Created indexes');

        // Create trigger function for updated_at
        await client.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql'
        `);
        console.log('✅ Created trigger function');

        // Create trigger
        await client.query(`
            DROP TRIGGER IF EXISTS update_applications_updated_at ON psychiatrist_applications;
            CREATE TRIGGER update_applications_updated_at 
                BEFORE UPDATE ON psychiatrist_applications 
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        `);
        console.log('✅ Created trigger');

        // Create admin users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS admin_users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                role VARCHAR(50) DEFAULT 'reviewer',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created admin_users table');

        // Insert default admin user if not exists
        await client.query(`
            INSERT INTO admin_users (email, first_name, last_name, role) 
            SELECT 'admin@telemedicine-clinic.com', 'Admin', 'User', 'admin'
            WHERE NOT EXISTS (
                SELECT 1 FROM admin_users WHERE email = 'admin@telemedicine-clinic.com'
            )
        `);
        console.log('✅ Created default admin user');

        // Create application status history table
        await client.query(`
            CREATE TABLE IF NOT EXISTS application_status_history (
                id SERIAL PRIMARY KEY,
                application_id INTEGER NOT NULL REFERENCES psychiatrist_applications(id),
                previous_status VARCHAR(20),
                new_status VARCHAR(20) NOT NULL,
                changed_by INTEGER REFERENCES admin_users(id),
                notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created application_status_history table');

        // Create application documents table
        await client.query(`
            CREATE TABLE IF NOT EXISTS application_documents (
                id SERIAL PRIMARY KEY,
                application_id INTEGER NOT NULL REFERENCES psychiatrist_applications(id),
                document_type VARCHAR(50) NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                s3_key VARCHAR(500) NOT NULL,
                file_size INTEGER,
                mime_type VARCHAR(100),
                uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created application_documents table');

        console.log('\n🎉 Database setup completed successfully!');

        // Display table summary
        const tableCount = await client.query(`
            SELECT COUNT(*) as count FROM psychiatrist_applications
        `);
        console.log(`📊 Current applications in database: ${tableCount.rows[0].count}`);

    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

// Run setup if called directly
if (require.main === module) {
    setupDatabase();
}

module.exports = { setupDatabase };