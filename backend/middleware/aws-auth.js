// backend/middleware/aws-auth.js
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');

// AWS Cognito configuration
const cognitoConfig = {
    region: process.env.AWS_REGION || 'us-east-1',
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    clientId: process.env.COGNITO_CLIENT_ID,
};

// Cache for JWKs
let cognitoKeys = null;

// Get Cognito public keys for JWT verification
const getCognitoKeys = async () => {
    if (cognitoKeys) return cognitoKeys;

    try {
        const response = await fetch(
            `https://cognito-idp.${cognitoConfig.region}.amazonaws.com/${cognitoConfig.userPoolId}/.well-known/jwks.json`
        );
        const data = await response.json();

        cognitoKeys = data.keys.reduce((keys, key) => {
            keys[key.kid] = jwkToPem(key);
            return keys;
        }, {});

        return cognitoKeys;
    } catch (error) {
        console.error('Failed to fetch Cognito keys:', error);
        throw error;
    }
};

// Verify Cognito JWT token
const verifyCognitoToken = async (token) => {
    try {
        const decodedHeader = jwt.decode(token, { complete: true });
        if (!decodedHeader) {
            throw new Error('Invalid token format');
        }

        const { kid } = decodedHeader.header;
        const keys = await getCognitoKeys();
        const key = keys[kid];

        if (!key) {
            throw new Error('Invalid token key');
        }

        const verified = jwt.verify(token, key, {
            algorithms: ['RS256'],
            issuer: `https://cognito-idp.${cognitoConfig.region}.amazonaws.com/${cognitoConfig.userPoolId}`,
            audience: cognitoConfig.clientId,
        });

        return verified;
    } catch (error) {
        console.error('Token verification failed:', error);
        throw error;
    }
};

// Middleware to authenticate with Cognito
const authenticateCognito = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access token required'
            });
        }

        const decodedToken = await verifyCognitoToken(token);

        // Extract user information from token
        req.user = {
            id: decodedToken.sub,
            email: decodedToken.email,
            name: decodedToken.name,
            role: decodedToken['custom:role'] || 'user',
            cognito_username: decodedToken['cognito:username'],
            email_verified: decodedToken.email_verified
        };

        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
};

// Middleware for optional authentication
const optionalCognitoAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            try {
                const decodedToken = await verifyCognitoToken(token);
                req.user = {
                    id: decodedToken.sub,
                    email: decodedToken.email,
                    name: decodedToken.name,
                    role: decodedToken['custom:role'] || 'user',
                    cognito_username: decodedToken['cognito:username'],
                    email_verified: decodedToken.email_verified
                };
            } catch (error) {
                // Token invalid, but continue without user
                console.warn('Optional auth failed:', error.message);
            }
        }

        next();
    } catch (error) {
        next();
    }
};

// Create or update user in Cognito
const createCognitoUser = async (userDetails) => {
    const cognito = new AWS.CognitoIdentityServiceProvider({
        region: cognitoConfig.region
    });

    const params = {
        UserPoolId: cognitoConfig.userPoolId,
        Username: userDetails.email,
        UserAttributes: [
            { Name: 'email', Value: userDetails.email },
            { Name: 'name', Value: userDetails.name },
            { Name: 'custom:role', Value: userDetails.role || 'user' }
        ],
        TemporaryPassword: userDetails.temporaryPassword,
        MessageAction: 'SUPPRESS' // Don't send welcome email
    };

    try {
        const result = await cognito.adminCreateUser(params).promise();
        return result.User;
    } catch (error) {
        console.error('Failed to create Cognito user:', error);
        throw error;
    }
};

// Update user attributes in Cognito
const updateCognitoUser = async (userId, attributes) => {
    const cognito = new AWS.CognitoIdentityServiceProvider({
        region: cognitoConfig.region
    });

    const userAttributes = Object.entries(attributes).map(([key, value]) => ({
        Name: key.startsWith('custom:') ? key : `custom:${key}`,
        Value: value
    }));

    const params = {
        UserPoolId: cognitoConfig.userPoolId,
        Username: userId,
        UserAttributes: userAttributes
    };

    try {
        await cognito.adminUpdateUserAttributes(params).promise();
        return true;
    } catch (error) {
        console.error('Failed to update Cognito user:', error);
        throw error;
    }
};

// Get user from Cognito
const getCognitoUser = async (userId) => {
    const cognito = new AWS.CognitoIdentityServiceProvider({
        region: cognitoConfig.region
    });

    const params = {
        UserPoolId: cognitoConfig.userPoolId,
        Username: userId
    };

    try {
        const result = await cognito.adminGetUser(params).promise();

        // Parse user attributes
        const attributes = {};
        result.UserAttributes.forEach(attr => {
            attributes[attr.Name] = attr.Value;
        });

        return {
            id: result.Username,
            email: attributes.email,
            name: attributes.name,
            role: attributes['custom:role'] || 'user',
            status: result.UserStatus,
            created: result.UserCreateDate,
            lastModified: result.UserLastModifiedDate
        };
    } catch (error) {
        console.error('Failed to get Cognito user:', error);
        throw error;
    }
};

module.exports = {
    authenticateCognito,
    optionalCognitoAuth,
    verifyCognitoToken,
    createCognitoUser,
    updateCognitoUser,
    getCognitoUser,
    cognitoConfig
};