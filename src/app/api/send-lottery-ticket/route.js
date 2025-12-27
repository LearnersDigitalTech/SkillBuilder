import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
    try {
        const { email, name, ticketCode, imageDataUrl } = await request.json();

        // Validate required fields
        if (!email || !name || !ticketCode || !imageDataUrl) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Convert data URL to base64 buffer
        const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Send email with Resend
        const data = await resend.emails.send({
            from: 'Learners Math Skill Conquest <onboarding@resend.dev>', // Change to your verified domain later
            to: [email],
            subject: `🎉 Your Lucky Parent Lottery Ticket - ${ticketCode}`,
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
              }
              .container {
                background-color: #ffffff;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .header h1 {
                color: #4F46E5;
                margin: 0 0 10px 0;
                font-size: 28px;
              }
              .ticket-code {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                margin: 20px 0;
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 3px;
              }
              .content {
                color: #555;
                font-size: 16px;
              }
              .content p {
                margin: 15px 0;
              }
              .highlight {
                color: #4F46E5;
                font-weight: 600;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid #f0f0f0;
                text-align: center;
                color: #888;
                font-size: 14px;
              }
              .emoji {
                font-size: 48px;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="emoji">🎁</div>
                <h1>Registration Successful!</h1>
              </div>
              
              <div class="content">
                <p>Dear <strong>${name}</strong>,</p>
                
                <p>Thank you for registering for the <span class="highlight">Lucky Parent Lottery - Annual Day Celebration</span>! 🎉</p>
                
                <p>Your lottery ticket has been generated successfully. Please find your unique ticket code below:</p>
                
                <div class="ticket-code">
                  ${ticketCode}
                </div>
                
                <p><strong>Important Information:</strong></p>
                <ul>
                  <li>Keep this ticket code safe - you'll need it for the lucky draw</li>
                  <li>Your ticket image is attached to this email</li>
                  <li>Winners will be announced live during the Annual Day event</li>
                  <li>Make sure to attend the event to claim your prize if you win!</li>
                </ul>
                
                <p>We're excited to see you at the celebration! 🎊</p>
                
                <p>Best wishes,<br>
                <strong>Learners Global School & PU College</strong></p>
              </div>
              
              <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>For any queries, please contact us at the school office.</p>
              </div>
            </div>
          </body>
        </html>
      `,
            attachments: [
                {
                    filename: `LotteryTicket-${ticketCode}.png`,
                    content: buffer,
                },
            ],
        });

        return NextResponse.json({
            success: true,
            messageId: data.id,
            message: 'Email sent successfully!'
        });

    } catch (error) {
        console.error('Email sending error:', error);

        return NextResponse.json(
            {
                error: 'Failed to send email',
                details: error.message
            },
            { status: 500 }
        );
    }
}
