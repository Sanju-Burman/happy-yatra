require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 9000;

// Connect to Database
connectDB();

const logger = require('./utils/logger');

// Start Server
app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
    logger.info(`API available at http://localhost:${PORT}/api`);
});
