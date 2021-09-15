module.exports = {
    ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000,
    FRONTEND_URL: process.env.FRONTEND_URL || '*',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/contacts',
    JWT_SECRET: process.env.JWT_SECRET || 'ma6G5+L*4.^.+.?A'
}