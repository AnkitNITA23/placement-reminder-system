import nodemailer from 'nodemailer';
import quotes from './quotes-list.js';

export default async function handler(req, res) {
  // Verify Vercel Cron signature if in production
  const isProd = process.env.NODE_ENV === 'production';
  const authHeader = req.headers.authorization;
  if (isProd && process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ success: false, error: 'Unauthorized request' });
  }

  try {
    // Configure defaults
    const receiverEmail = process.env.RECEIVER_EMAIL;
    const senderEmail = process.env.EMAIL_USER;
    const senderPass = process.env.EMAIL_PASS;
    const appUrl = process.env.APP_URL || 'http://localhost:5173';
    
    if (!receiverEmail || !senderEmail || !senderPass) {
      console.warn("Email configuration environment variables are missing.");
      return res.status(200).json({ 
        success: false, 
        message: 'Notification trigger skipped. Missing configuration (EMAIL_USER, EMAIL_PASS, or RECEIVER_EMAIL).' 
      });
    }

    // Calculate current countdown day
    const startStr = process.env.START_DATE || '2026-07-20';
    const startDate = new Date(startStr);
    const today = new Date();
    
    // Clear hours to calculate clean difference in days
    startDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Only send reminders within the 54 day range
    if (diffDays < 1 || diffDays > 54) {
      return res.status(200).json({ 
        success: true, 
        message: `Current day index is ${diffDays}. Notification only sent between Day 1 and 54.` 
      });
    }

    // Get today's quote
    const todayQuoteObj = quotes.find(q => q.day === diffDays) || quotes[0];
    const daysLeft = 54 - diffDays;

    // Create a beautiful HTML email template (Deep space dark theme)
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Placement Countdown Day ${diffDays}</title>
        <style>
          body {
            background-color: #0b0c10;
            color: #c5c6c7;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #1f2833;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #1f2833;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          }
          .header {
            background: linear-gradient(135deg, #1f4068, #162447);
            padding: 40px 30px;
            text-align: center;
            border-bottom: 2px solid #8b5cf6;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 26px;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          .header p {
            color: #66fcf1;
            margin: 10px 0 0 0;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            color: #ffffff;
            margin-bottom: 20px;
          }
          .quote-card {
            background: #0b0c10;
            border-left: 4px solid #66fcf1;
            padding: 24px;
            margin: 25px 0;
            border-radius: 4px 12px 12px 4px;
          }
          .quote-text {
            color: #e2e8f0;
            font-size: 16px;
            line-height: 1.6;
            font-style: italic;
            margin: 0 0 12px 0;
          }
          .quote-topic {
            color: #66fcf1;
            font-size: 12px;
            text-transform: uppercase;
            font-weight: bold;
            letter-spacing: 1px;
          }
          .cta-section {
            text-align: center;
            margin: 35px 0;
          }
          .cta-btn {
            background: linear-gradient(90deg, #66fcf1, #45a29e);
            color: #0b0c10 !important;
            text-decoration: none;
            padding: 14px 32px;
            font-size: 16px;
            font-weight: bold;
            border-radius: 8px;
            display: inline-block;
            box-shadow: 0 4px 15px rgba(102, 252, 241, 0.3);
            transition: all 0.3s ease;
          }
          .status-tag {
            background-color: rgba(102, 252, 241, 0.1);
            color: #66fcf1;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 20px;
          }
          .footer {
            background: #0b0c10;
            padding: 25px;
            text-align: center;
            font-size: 12px;
            color: #c5c6c7;
            border-top: 1px solid #1f2833;
          }
          .footer p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Day ${diffDays} of 54</h1>
            <p>Placement Basecamp Countdown</p>
          </div>
          <div class="content">
            <div class="status-tag">${daysLeft} Days Remaining</div>
            <div class="greeting">Hey Ankit Kumar,</div>
            <p>Another day is here to work towards your goals. Have you checked your placement status today? Open your dashboard, review your checklist, and stay calibrated.</p>
            
            <div class="quote-card">
              <p class="quote-text">"${todayQuoteObj.quote}"</p>
              <span class="quote-topic">Focus Area: ${todayQuoteObj.topic}</span>
            </div>
            
            <div class="cta-section">
              <a href="${appUrl}" class="cta-btn" target="_blank">Access Your Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>Ankit Kumar • NIT Agartala • B.Tech Electronics & Instrumentation</p>
            <p>Designed to cheer you up daily. Stay consistent, stay strong.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '465'),
      secure: process.env.EMAIL_SECURE !== 'false', // true for 465, false for other ports
      auth: {
        user: senderEmail,
        pass: senderPass,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"Placement Basecamp" <${senderEmail}>`,
      to: receiverEmail,
      subject: `Day ${diffDays} of 54: Calibrate & Focus`,
      html: emailHtml,
    });

    console.log(`Successfully sent email for Day ${diffDays}`);
    return res.status(200).json({ success: true, message: `Notification email sent for Day ${diffDays}.` });

  } catch (error) {
    console.error('Error sending cron email:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
