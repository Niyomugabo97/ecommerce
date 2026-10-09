
export const WelcomeEmailTemplate = (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Our Store</title>
</head>

<body style="margin: 0; padding: 0; background-color: #f0fdfa; font-family: Arial, Helvetica, sans-serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
    style="background-color: #f0fdfa; padding: 36px 16px;">
    <tr>
      <td align="center">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
          style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background-color: #0f766e; padding: 36px 28px; text-align: center;">

              <div style="font-size: 32px; margin-bottom: 12px;">
                🛍️
              </div>

              <h1 style="margin: 0; color: #ffffff; font-size: 28px; line-height: 1.4;">
                Welcome, ${name}!
              </h1>

              <p style="margin: 12px 0 0; color: #ccfbf1; font-size: 15px; line-height: 1.6;">
                We're happy to have you shopping with us.
              </p>

            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px; color: #334155; font-size: 15px; line-height: 1.8;">

              <p style="margin: 0 0 18px;">
                Hi ${name},
              </p>

              <p style="margin: 0 0 20px;">
                Thank you for creating an account with us!
                Your account is ready, and we're excited to be part of your shopping experience.
              </p>

              <div style="background-color: #f0fdfa; border-left: 4px solid #0f766e; padding: 18px 20px; margin: 24px 0; border-radius: 4px;">

                <h2 style="margin: 0 0 10px; color: #115e59; font-size: 18px;">
                  Get started
                </h2>

                <p style="margin: 0 0 8px;">
                  • Sign in to explore our products.
                </p>

                <p style="margin: 0 0 8px;">
                  • Discover products that match your needs.
                </p>

                <p style="margin: 0;">
                  • Keep your account password private and secure.
                </p>

              </div>

              <p style="margin: 24px 0 0;">
                We hope you enjoy shopping with us!
              </p>

              <p style="margin: 20px 0 0;">
                Best regards,<br />
                <strong style="color: #0f766e;">
                  The E-commerce Team
                </strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #ecfdf5; border-top: 1px solid #d1fae5; padding: 22px 28px; text-align: center;">

              <p style="margin: 0 0 8px; color: #475569; font-size: 12px; line-height: 1.6;">
                If you didn't create this account, you can safely ignore this email.
              </p>

              <p style="margin: 0; color: #64748b; font-size: 12px;">
                &copy; ${new Date().getFullYear()} E-commerce Store. All rights reserved.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
