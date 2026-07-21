import nodemailer from 'nodemailer';
import quotes from './quotes-list.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { 
      emailUser, 
      emailPass, 
      receiverEmail, 
      emailHost = 'smtp.gmail.com', 
      emailPort = 465,
      emailSecure = true,
      currentDay = 1,
      appUrl = 'http://localhost:5173'
    } = req.body;

    // Use values from request body or fall back to environment variables
    const finalSenderUser = emailUser || process.env.EMAIL_USER;
    const finalSenderPass = emailPass || process.env.EMAIL_PASS;
    const finalReceiver = receiverEmail || process.env.RECEIVER_EMAIL;
    const finalHost = emailHost || process.env.EMAIL_HOST || 'smtp.gmail.com';
    const finalPort = parseInt(emailPort || process.env.EMAIL_PORT || '465');
    const finalSecure = emailSecure !== undefined ? emailSecure : (process.env.EMAIL_SECURE !== 'false');

    if (!finalSenderUser || !finalSenderPass || !finalReceiver) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required configuration. Please provide sender email, app password, and receiver email.' 
      });
    }

    const todayQuoteObj = quotes.find(q => q.day === currentDay) || quotes[0];
    const daysLeft = 54 - currentDay;

    // Create a beautiful HTML email template (Deep space dark theme)
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Test Notification - Placement Countdown</title>
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
            <h1>Test Connection: Successful</h1>
            <p>Placement Basecamp Countdown</p>
          </div>
          <div class="content">
            <div class="status-tag">Test Notification (Day ${currentDay})</div>
            <div class="greeting">Hey Ankit Kumar,</div>
            <p>Your email notification system has been successfully verified! You will receive daily cheer messages on this address.</p>
            
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
            <p>You have configured the email client correctly. Stay consistent, stay strong.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: finalHost,
      port: finalPort,
      secure: finalSecure,
      auth: {
        user: finalSenderUser,
        pass: finalSenderPass,
      },
    });

    // Send email
    await transporter.sendMail({
      from: `"Placement Basecamp" <${finalSenderUser}>`,
      to: finalReceiver,
      subject: `Test Verification: Placement Countdown Day ${currentDay}`,
      html: emailHtml,
    });

    return res.status(200).json({ success: true, message: 'Test email sent successfully!' });

  } catch (error) {
    console.error('Error sending test email:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
