export const paymentRejectedTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Rejected</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
            color: #334155;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            background-color: #f8fafc;
            padding: 40px 20px;
            box-sizing: border-box;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
        }
        .header-accent {
            height: 6px;
            background: linear-gradient(90deg, #ef4444, #f59e0b);
        }
        .content {
            padding: 40px;
        }
        .logo-container {
            margin-bottom: 24px;
            text-align: center;
        }
        .logo {
            max-height: 48px;
        }
        h1 {
            font-size: 24px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 0;
            margin-bottom: 8px;
            text-align: center;
        }
        .subtitle {
            font-size: 16px;
            color: #ef4444;
            font-weight: 600;
            margin-bottom: 32px;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .greeting {
            font-size: 16px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 12px;
        }
        .body-text {
            font-size: 15px;
            line-height: 1.6;
            color: #475569;
            margin-bottom: 32px;
        }
        .cta-container {
            text-align: center;
            margin-bottom: 32px;
        }
        .btn {
            display: inline-block;
            background-color: #ef4444;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            font-size: 15px;
            font-weight: 600;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2);
            transition: background-color 0.2s;
        }
        .btn:hover {
            background-color: #dc2626;
        }
        .link-fallback {
            font-size: 13px;
            color: #64748b;
            text-align: center;
            margin-bottom: 40px;
            word-break: break-all;
        }
        .link-fallback a {
            color: #ef4444;
            text-decoration: underline;
        }
        .section-title {
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #cbd5e1;
        }
        .info-card {
            background-color: #f1f5f9;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 24px;
        }
        .info-row {
            margin-bottom: 12px;
        }
        .info-row:last-child {
            margin-bottom: 0;
        }
        .info-label {
            font-size: 12px;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
        }
        .info-value {
            font-size: 14px;
            color: #0f172a;
            font-weight: 500;
            line-height: 1.4;
        }
        .support-box {
            border-top: 1px solid #e2e8f0;
            margin-top: 40px;
            padding-top: 24px;
            text-align: center;
        }
        .support-text {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 16px;
        }
        .support-email {
            font-weight: 600;
            color: #0f172a;
            text-decoration: none;
        }
        .signature {
            font-size: 14px;
            color: #475569;
            margin-top: 24px;
            text-align: center;
        }
        .footer {
            padding: 24px 40px;
            background-color: #f8fafc;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header-accent"></div>
            <div class="content">
                {{#if schoolLogo}}
                <div class="logo-container">
                    <img src="{{schoolLogo}}" alt="{{institutionName}}" class="logo">
                </div>
                {{/if}}
                <h1>Sorry, your payment is rejected</h1>
                <div class="subtitle">Action Required</div>
                
                <div class="greeting">Hello {{studentName}},</div>
                <div class="body-text">
                    we're sorry to inform you that your payment for the application has been rejected. You can resubmit your payment receipt for further verification, or get in touch with the organization for assistance.
                </div>
                
                <div class="cta-container">
                    <a href="{{reUploadPaymentUrl}}" class="btn" target="_blank">Upload Payment Receipt Again</a>
                </div>
                
                <div class="link-fallback">
                    or by clicking the following link:<br>
                    <a href="{{reUploadPaymentUrl}}" target="_blank">{{reUploadPaymentUrl}}</a>
                </div>
                
                <div class="section-title">Application Information</div>
                <div class="info-card">
                    <div class="info-row">
                        <div class="info-label">Application ID</div>
                        <div class="info-value">{{enrolId}}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Application name</div>
                        <div class="info-value">{{courseName}}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Option name</div>
                        <div class="info-value">{{{className}}}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Date & Time</div>
                        <div class="info-value">{{{classDateTime}}}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Time Zone</div>
                        <div class="info-value">{{timeZone}}</div>
                    </div>
                    {{#if location}}
                    <div class="info-row">
                        <div class="info-label">Location</div>
                        <div class="info-value">{{location}}</div>
                    </div>
                    {{/if}}
                </div>
                
                <div class="section-title">Contact Information of {{institutionName}}</div>
                <div class="info-card">
                    <div class="info-row">
                        <div class="info-label">Name</div>
                        <div class="info-value">{{institutionName}}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Phone</div>
                        <div class="info-value">{{adminPhone}}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Email</div>
                        <div class="info-value"><a href="mailto:{{adminEmail}}" style="color: #0f172a; text-decoration: none;">{{adminEmail}}</a></div>
                    </div>
                </div>
                
                <div class="section-title">Payment Information</div>
                <div class="info-card">
                    {{#if transactionId}}
                    <div class="info-row">
                        <div class="info-label">Payment ID</div>
                        <div class="info-value">{{transactionId}}</div>
                    </div>
                    {{/if}}
                    <div class="info-row">
                        <div class="info-label">Price</div>
                        <div class="info-value">{{price}}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Payment Status</div>
                        <div class="info-value" style="color: #ef4444; font-weight: 600;">{{paymentStatus}}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Payment Method</div>
                        <div class="info-value">{{paymentMethod}}</div>
                    </div>
                </div>
                
                <div class="support-box">
                    <div class="support-text">
                        <strong>We're here to help</strong><br>
                        If you have any questions or want more information, drop us a message at <a href="mailto:{{adminEmail}}" class="support-email">{{adminEmail}}</a>
                    </div>
                    <div class="signature">
                        - {{institutionName}}
                    </div>
                </div>
            </div>
            <div class="footer">
                &copy; {{currentYear}} {{institutionName}}. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>`
