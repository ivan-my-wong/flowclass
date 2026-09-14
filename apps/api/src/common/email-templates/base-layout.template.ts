export const baseEmailLayout = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
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
            background: linear-gradient(90deg, #3b82f6, #1d4ed8);
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
            color: #3b82f6;
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
            background-color: #3b82f6;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            font-size: 15px;
            font-weight: 600;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
            transition: background-color 0.2s;
        }
        .btn:hover {
            background-color: #2563eb;
        }
        .link-fallback {
            font-size: 13px;
            color: #64748b;
            text-align: center;
            margin-bottom: 40px;
            word-break: break-all;
        }
        .link-fallback a {
            color: #3b82f6;
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
            <div class="header-accent" style="background: {{{headerAccent}}};"></div>
            <div class="content">
                {{#if schoolLogo}}
                <div class="logo-container">
                    <img src="{{schoolLogo}}" alt="{{institutionName}}" class="logo">
                </div>
                {{/if}}
                <h1>{{title}}</h1>
                {{#if subtitle}}
                <div class="subtitle" style="color: {{subtitleColor}};">{{subtitle}}</div>
                {{/if}}
                
                <div class="greeting">Hello {{studentName}},</div>
                <div class="body-text">
                    {{{body}}}
                </div>
                
                {{#if ctaUrl}}
                <div class="cta-container">
                    <a href="{{ctaUrl}}" class="btn" style="background-color: {{ctaBgColor}}; box-shadow: 0 4px 6px -1px {{{ctaShadowColor}}};" target="_blank">{{ctaText}}</a>
                </div>
                {{/if}}
                
                {{#if showFallbackLink}}
                <div class="link-fallback">
                    or by clicking the following link:<br>
                    <a href="{{ctaUrl}}" style="color: {{ctaBgColor}};" target="_blank">{{ctaUrl}}</a>
                </div>
                {{/if}}
                
                {{{additionalContent}}}
                
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
