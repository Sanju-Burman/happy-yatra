const nodemailer = require('nodemailer');
const logger = require('./logger');

const sendEmail = async (options) => {
    // If SMTP_USER and SMTP_PASS are not set, we can log the email content to console/logger for development
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        logger.info(`[EMAIL MOCK] Sending email to: ${options.to}`);
        logger.info(`Subject: ${options.subject}`);
        logger.info(`Text Content: ${options.text}`);
        logger.info(`HTML Content: ${options.html}`);
        return { mock: true, messageId: 'mock-id' };
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
        port: parseInt(process.env.SMTP_PORT || '2525', 10),
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: process.env.SMTP_FROM || '"Happy Yatra" <noreply@happyyatra.com>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        logger.error(`Error sending email: ${error.message}`, error);
        throw error;
    }
};

module.exports = sendEmail;
