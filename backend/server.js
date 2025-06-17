// server.js - Main Express server
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const AWS = require('aws-sdk');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// AWS Configuration
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// Database Configuration (PostgreSQL)
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Email Configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow only specific file types
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
        }
    }
});

// Helper function to upload file to S3
async function uploadFileToS3(file, applicationId, fileType) {
    const key = `applications/${applicationId}/${fileType}_${Date.now()}_${file.originalname}`;

    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ServerSideEncryption: 'AES256'
    };

    try {
        const result = await s3.upload(params).promise();
        return {
            key: key,
            url: result.Location,
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype
        };
    } catch (error) {
        throw new Error(`Failed to upload file: ${error.message}`);
    }
}

// Helper function to send confirmation email
async function sendConfirmationEmail(email, firstName, applicationId) {
    const mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to: email,
        subject: 'Application Received - Psychiatrist Position',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Thank You for Your Application!</h2>
                <p>Dear Dr. ${firstName},</p>
                <p>We have successfully received your application for the psychiatrist position at our telemedicine practice.</p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #374151; margin-top: 0;">Application Details:</h3>
                    <p><strong>Application ID:</strong> ${applicationId}</p>
                    <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Status:</strong> Under Review</p>
                </div>

                <h3 style="color: #374151;">What's Next?</h3>
                <ul style="color: #6b7280;">
                    <li>Our team will review your application within 5-7 business days</li>
                    <li>We'll contact you if we need any additional information</li>
                    <li>Qualified candidates will be invited for a video interview</li>
                    <li>You'll receive updates via email at this address</li>
                </ul>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px;">
                        Questions? Contact us at <a href="mailto:careers@telemedicine-clinic.com">careers@telemedicine-clinic.com</a>
                        or call (555) 123-4567.
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent successfully');
    } catch (error) {
        console.error('Failed to send confirmation email:', error);
    }
}

// Helper function to send admin notification
async function sendAdminNotification(applicationData) {
    const mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to: process.env.ADMIN_EMAIL,
        subject: 'New Psychiatrist Application Received',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc2626;">New Application Alert</h2>
                <p>A new psychiatrist application has been submitted.</p>
                
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px;">
                    <h3>Applicant Information:</h3>
                    <p><strong>Name:</strong> Dr. ${applicationData.firstName} ${applicationData.lastName}</p>
                    <p><strong>Email:</strong> ${applicationData.email}</p>
                    <p><strong>Phone:</strong> ${applicationData.phone}</p>
                    <p><strong>Experience:</strong> ${applicationData.yearsExperience} years</p>
                    <p><strong>Telemedicine Experience:</strong> ${applicationData.telemedicineExperience}</p>
                    <p><strong>State Licenses:</strong> ${applicationData.stateLicenses.join(', ')}</p>
                </div>

                <p style="margin-top: 20px;">
                    <a href="${process.env.ADMIN_DASHBOARD_URL}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                        Review Application
                    </a>
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Admin notification sent successfully');
    } catch (error) {
        console.error('Failed to send admin notification:', error);
    }
}

// API Routes

// Submit psychiatrist application
app.post('/api/psychiatrist-applications', upload.single('cv'), async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const {
            firstName, lastName, email, phone, address,
            medicalSchool, graduationYear, residencyProgram, residencyYear, boardCertified,
            stateLicenses, otherLicenses, deaNumber, deaExpiration,
            yearsExperience, telemedicineExperience, specializations, ageGroups,
            techComfort, officeSetup, internetSpeed,
            hoursPerWeek, timeZone, workingDays,
            reference1Name, reference1Contact, reference2Name, reference2Contact,
            motivation, additionalInfo
        } = req.body;

        // Parse JSON strings for arrays
        const parsedStateLicenses = Array.isArray(stateLicenses) ? stateLicenses : JSON.parse(stateLicenses || '[]');
        const parsedSpecializations = Array.isArray(specializations) ? specializations : JSON.parse(specializations || '[]');
        const parsedAgeGroups = Array.isArray(ageGroups) ? ageGroups : JSON.parse(ageGroups || '[]');
        const parsedWorkingDays = Array.isArray(workingDays) ? workingDays : JSON.parse(workingDays || '[]');

        // Insert application into database
        const insertQuery = `
            INSERT INTO psychiatrist_applications (
                first_name, last_name, email, phone, address,
                medical_school, graduation_year, residency_program, residency_year, board_certified,
                state_licenses, other_licenses, dea_number, dea_expiration,
                years_experience, telemedicine_experience, specializations, age_groups,
                tech_comfort, office_setup, internet_speed,
                hours_per_week, time_zone, working_days,
                reference1_name, reference1_contact, reference2_name, reference2_contact,
                motivation, additional_info
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
            RETURNING id
        `;

        const values = [
            firstName, lastName, email, phone, address,
            medicalSchool, parseInt(graduationYear), residencyProgram, parseInt(residencyYear), boardCertified,
            parsedStateLicenses, otherLicenses, deaNumber, deaExpiration,
            yearsExperience, telemedicineExperience, parsedSpecializations, parsedAgeGroups,
            techComfort, officeSetup, internetSpeed,
            hoursPerWeek, timeZone, parsedWorkingDays,
            reference1Name, reference1Contact, reference2Name, reference2Contact,
            motivation, additionalInfo
        ];

        const result = await client.query(insertQuery, values);
        const applicationId = result.rows[0].id;

        // Handle file upload if CV was provided
        let cvFileKey = null;
        if (req.file) {
            try {
                const fileUpload = await uploadFileToS3(req.file, applicationId, 'cv');
                cvFileKey = fileUpload.key;

                // Update application with file key
                await client.query(
                    'UPDATE psychiatrist_applications SET cv_file_key = $1 WHERE id = $2',
                    [cvFileKey, applicationId]
                );

                // Insert document record
                await client.query(
                    `INSERT INTO application_documents (application_id, document_type, file_name, s3_key, file_size, mime_type)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [applicationId, 'cv', fileUpload.fileName, fileUpload.key, fileUpload.fileSize, fileUpload.mimeType]
                );
            } catch (fileError) {
                console.error('File upload error:', fileError);
                // Continue without file - don't fail the entire application
            }
        }

        await client.query('COMMIT');

        // Send confirmation email (don't wait for it)
        sendConfirmationEmail(email, firstName, applicationId).catch(console.error);

        // Send admin notification (don't wait for it)
        sendAdminNotification({
            firstName, lastName, email, phone,
            yearsExperience, telemedicineExperience,
            stateLicenses: parsedStateLicenses
        }).catch(console.error);

        res.status(201).json({
            message: 'Application submitted successfully',
            applicationId: applicationId,
            status: 'pending'
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Application submission error:', error);

        if (error.code === '23505') { // Unique constraint violation
            res.status(400).json({
                error: 'An application with this email address already exists'
            });
        } else {
            res.status(500).json({
                error: 'Failed to submit application. Please try again.'
            });
        }
    } finally {
        client.release();
    }
});

// Get all applications (admin endpoint)
app.get('/api/admin/applications', async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT id, first_name, last_name, email, phone, status, 
                   years_experience, telemedicine_experience, state_licenses,
                   created_at, updated_at
            FROM psychiatrist_applications
        `;
        let values = [];

        if (status) {
            query += ' WHERE status = $1';
            values.push(status);
        }

        query += ' ORDER BY created_at DESC LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
        values.push(limit, offset);

        const result = await pool.query(query, values);

        // Get total count
        let countQuery = 'SELECT COUNT(*) FROM psychiatrist_applications';
        let countValues = [];

        if (status) {
            countQuery += ' WHERE status = $1';
            countValues.push(status);
        }

        const countResult = await pool.query(countQuery, countValues);
        const totalCount = parseInt(countResult.rows[0].count);

        res.json({
            applications: result.rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
                totalCount: totalCount,
                hasNext: offset + limit < totalCount,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Failed to fetch applications:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// Get specific application (admin endpoint)
app.get('/api/admin/applications/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT a.*, d.document_type, d.file_name, d.s3_key as document_s3_key
            FROM psychiatrist_applications a
            LEFT JOIN application_documents d ON a.id = d.application_id
            WHERE a.id = $1
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Group documents
        const application = result.rows[0];
        const documents = result.rows
            .filter(row => row.document_type)
            .map(row => ({
                type: row.document_type,
                fileName: row.file_name,
                s3Key: row.document_s3_key
            }));

        // Remove document fields from application object
        delete application.document_type;
        delete application.file_name;
        delete application.document_s3_key;

        res.json({
            ...application,
            documents: documents
        });
    } catch (error) {
        console.error('Failed to fetch application:', error);
        res.status(500).json({ error: 'Failed to fetch application' });
    }
});

// Update application status (admin endpoint)
app.put('/api/admin/applications/:id/status', async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const { id } = req.params;
        const { status, notes, reviewerId } = req.body;

        // Get current application
        const currentApp = await client.query(
            'SELECT status FROM psychiatrist_applications WHERE id = $1',
            [id]
        );

        if (currentApp.rows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const previousStatus = currentApp.rows[0].status;

        // Update application
        const updateQuery = `
            UPDATE psychiatrist_applications 
            SET status = $1, notes = $2, reviewer_id = $3, reviewed_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING *
        `;

        const result = await client.query(updateQuery, [status, notes, reviewerId, id]);

        // Add to status history
        await client.query(
            `INSERT INTO application_status_history (application_id, previous_status, new_status, changed_by, notes)
             VALUES ($1, $2, $3, $4, $5)`,
            [id, previousStatus, status, reviewerId, notes]
        );

        await client.query('COMMIT');

        // Send status update email to applicant
        const application = result.rows[0];
        sendStatusUpdateEmail(application.email, application.first_name, status, application.id).catch(console.error);

        res.json({
            message: 'Application status updated successfully',
            application: result.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Failed to update application status:', error);
        res.status(500).json({ error: 'Failed to update application status' });
    } finally {
        client.release();
    }
});

// Download document (admin endpoint)
app.get('/api/admin/applications/:id/documents/:documentId', async (req, res) => {
    try {
        const { id, documentId } = req.params;

        // Get document info
        const result = await pool.query(
            `SELECT d.s3_key, d.file_name, d.mime_type 
             FROM application_documents d 
             JOIN psychiatrist_applications a ON d.application_id = a.id 
             WHERE a.id = $1 AND d.id = $2`,
            [id, documentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const document = result.rows[0];

        // Generate pre-signed URL for download
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: document.s3_key,
            Expires: 300, // 5 minutes
            ResponseContentDisposition: `attachment; filename="${document.file_name}"`
        };

        const downloadUrl = s3.getSignedUrl('getObject', params);

        res.json({
            downloadUrl: downloadUrl,
            fileName: document.file_name,
            mimeType: document.mime_type
        });

    } catch (error) {
        console.error('Failed to generate download URL:', error);
        res.status(500).json({ error: 'Failed to generate download URL' });
    }
});

// Upload additional documents (admin or applicant endpoint)
app.post('/api/applications/:id/documents', upload.array('documents', 5), async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const { id } = req.params;
        const { documentTypes } = req.body; // Array of document types corresponding to files

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files provided' });
        }

        // Verify application exists
        const appCheck = await client.query(
            'SELECT id FROM psychiatrist_applications WHERE id = $1',
            [id]
        );

        if (appCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const uploadedDocs = [];

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const docType = documentTypes ? documentTypes[i] : 'other';

            try {
                const fileUpload = await uploadFileToS3(file, id, docType);

                // Insert document record
                const docResult = await client.query(
                    `INSERT INTO application_documents (application_id, document_type, file_name, s3_key, file_size, mime_type)
                     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                    [id, docType, fileUpload.fileName, fileUpload.key, fileUpload.fileSize, fileUpload.mimeType]
                );

                uploadedDocs.push({
                    id: docResult.rows[0].id,
                    type: docType,
                    fileName: fileUpload.fileName,
                    fileSize: fileUpload.fileSize
                });

            } catch (fileError) {
                console.error(`Failed to upload file ${file.originalname}:`, fileError);
                // Continue with other files
            }
        }

        await client.query('COMMIT');

        res.json({
            message: 'Documents uploaded successfully',
            documents: uploadedDocs
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Document upload error:', error);
        res.status(500).json({ error: 'Failed to upload documents' });
    } finally {
        client.release();
    }
});

// Get application statistics (admin dashboard)
app.get('/api/admin/statistics', async (req, res) => {
    try {
        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total_applications,
                COUNT(*) FILTER (WHERE status = 'pending') as pending_applications,
                COUNT(*) FILTER (WHERE status = 'reviewed') as reviewed_applications,
                COUNT(*) FILTER (WHERE status = 'interview_scheduled') as interview_scheduled,
                COUNT(*) FILTER (WHERE status = 'approved') as approved_applications,
                COUNT(*) FILTER (WHERE status = 'rejected') as rejected_applications,
                COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as applications_this_week,
                COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as applications_this_month
            FROM psychiatrist_applications
        `);

        const licenseStats = await pool.query(`
            SELECT 
                UNNEST(state_licenses) as state,
                COUNT(*) as count
            FROM psychiatrist_applications
            GROUP BY UNNEST(state_licenses)
            ORDER BY count DESC
            LIMIT 10
        `);

        const experienceStats = await pool.query(`
            SELECT 
                years_experience,
                COUNT(*) as count
            FROM psychiatrist_applications
            GROUP BY years_experience
            ORDER BY count DESC
        `);

        res.json({
            overview: stats.rows[0],
            stateLicenses: licenseStats.rows,
            experienceDistribution: experienceStats.rows
        });

    } catch (error) {
        console.error('Failed to fetch statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Helper function to send status update email
async function sendStatusUpdateEmail(email, firstName, status, applicationId) {
    const statusMessages = {
        'reviewed': {
            subject: 'Application Under Review',
            message: 'Your application is currently under review by our team.',
            color: '#f59e0b'
        },
        'interview_scheduled': {
            subject: 'Interview Invitation',
            message: 'Congratulations! We would like to schedule an interview with you.',
            color: '#10b981'
        },
        'approved': {
            subject: 'Application Approved',
            message: 'Congratulations! Your application has been approved.',
            color: '#059669'
        },
        'rejected': {
            subject: 'Application Status Update',
            message: 'Thank you for your interest. Unfortunately, we will not be moving forward with your application at this time.',
            color: '#dc2626'
        }
    };

    const statusInfo = statusMessages[status] || {
        subject: 'Application Status Update',
        message: 'Your application status has been updated.',
        color: '#6b7280'
    };

    const mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to: email,
        subject: statusInfo.subject,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: ${statusInfo.color};">Application Status Update</h2>
                <p>Dear Dr. ${firstName},</p>
                <p>${statusInfo.message}</p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #374151; margin-top: 0;">Application Details:</h3>
                    <p><strong>Application ID:</strong> ${applicationId}</p>
                    <p><strong>Status:</strong> <span style="color: ${statusInfo.color}; font-weight: bold;">${status.replace('_', ' ').toUpperCase()}</span></p>
                    <p><strong>Updated:</strong> ${new Date().toLocaleDateString()}</p>
                </div>

                ${status === 'interview_scheduled' ? `
                    <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #065f46; margin-top: 0;">Next Steps:</h3>
                        <p>A member of our team will contact you within 24-48 hours to schedule your interview.</p>
                        <p>Please ensure your calendar is available for the next two weeks.</p>
                    </div>
                ` : ''}

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px;">
                        Questions? Contact us at <a href="mailto:careers@telemedicine-clinic.com">careers@telemedicine-clinic.com</a>
                        or call (555) 123-4567.
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Status update email sent to ${email}`);
    } catch (error) {
        console.error('Failed to send status update email:', error);
    }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
    }

    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Health check: http://localhost:${port}/api/health`);
});

module.exports = app;