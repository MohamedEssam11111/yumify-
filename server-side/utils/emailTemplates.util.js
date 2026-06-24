// utils/emailTemplates.util.js
const CLIENT_URL = "http://localhost:5173"; // Default to localhost if CLIENT_URL is not set

const headerImage = `${CLIENT_URL}/header.png`;
const footerImage = `${CLIENT_URL}/footer.png`;
export const verificationEmailTemplate = (userName, verificationUrl) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Email Verification</title>
  </head>

  <body style="
      margin:0;
      padding:0;
      background:#f4f7fb;
      font-family:Arial, Helvetica, sans-serif;
    ">

    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding:30px 15px;">

          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
              max-width:600px;
              background:#ffffff;
              border-radius:20px;
              overflow:hidden;
              box-shadow:0 10px 30px rgba(0,0,0,.08);
            "
          >

            <!-- Header -->
            <tr>
              <td>
                <img
                  src="${headerImage}"
                  alt="Yumify"
                  width="600"
                  style="
                    width:100%;
                    max-width:600px;
                    display:block;
                    border:0;
                  "
                />
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:40px 30px; text-align:center;">

                <h1 style="
                  margin:0;
                  color:#FF7A18;
                  font-size:32px;
                  line-height:40px;
                ">
                  Welcome to Yumify 🍽️
                </h1>

                <p style="
                  color:#4B5563;
                  font-size:18px;
                  line-height:30px;
                  margin-top:30px;
                ">
                  Hi <strong>${userName}</strong>,
                </p>

                <p style="
                  color:#6B7280;
                  font-size:16px;
                  line-height:28px;
                ">
                  Thank you for joining Yumify.
                  Please verify your email address to activate your account and start enjoying our services.
                </p>

                <table
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  align="center"
                  style="margin-top:35px;"
                >
                  <tr>
                    <td
                      align="center"
                      bgcolor="#FF7A18"
                      style="border-radius:12px;"
                    >
                      <a
                        href="${verificationUrl}"
                        target="_blank"
                        style="
                          display:inline-block;
                          padding:16px 36px;
                          color:#ffffff;
                          text-decoration:none;
                          font-size:16px;
                          font-weight:bold;
                        "
                      >
                        Verify Email
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="
                  margin-top:35px;
                  color:#9CA3AF;
                  font-size:14px;
                  line-height:24px;
                ">
                  This verification link will expire in 24 hours.
                </p>

                <p style="
                  color:#9CA3AF;
                  font-size:13px;
                  line-height:22px;
                  margin-top:20px;
                  word-break:break-all;
                ">
                  If the button doesn't work, copy and paste this link into your browser:<br/>
                  <a
                    href="${verificationUrl}"
                    style="color:#FF7A18;"
                  >
                    ${verificationUrl}
                  </a>
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td>
                <img
                  src="${footerImage}"
                  alt="Yumify Footer"
                  width="600"
                  style="
                    width:100%;
                    max-width:600px;
                    display:block;
                    border:0;
                  "
                />
              </td>
            </tr>

            <tr>
              <td style="
                background:#111827;
                color:#ffffff;
                text-align:center;
                padding:25px;
              ">
                <p style="margin:0;font-size:14px;">
                  © ${new Date().getFullYear()} Yumify. All rights reserved.
                </p>

                <p style="
                  margin-top:10px;
                  color:#D1D5DB;
                  font-size:13px;
                ">
                  Delicious experiences delivered to your doorstep.
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
};

export const resetPasswordTemplate = (userName, resetPasswordUrl) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Reset Password</title>
  </head>

  <body style="
    margin:0;
    padding:0;
    background:#f4f7fb;
    font-family:Arial, Helvetica, sans-serif;
  ">

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:30px 15px;">

          <table
            width="100%"
            style="
              max-width:600px;
              background:#ffffff;
              border-radius:20px;
              overflow:hidden;
            "
          >

            <tr>
              <td>
                <img
                  src="${headerImage}"
                  width="600"
                  style="width:100%;display:block;"
                />
              </td>
            </tr>

            <tr>
              <td style="padding:40px 30px;text-align:center;">

                <h1 style="color:#FF7A18;">
                  Reset Your Password 🔒
                </h1>

                <p style="
                  color:#6B7280;
                  line-height:28px;
                  font-size:16px;
                ">
                  Hi <strong>${userName}</strong>,
                </p>

                <p style="
                  color:#6B7280;
                  line-height:28px;
                  font-size:16px;
                ">
                  We received a request to reset your Yumify account password.
                </p>

                <a
                  href="${resetPasswordUrl}"
                  style="
                    display:inline-block;
                    margin-top:30px;
                    background:#FF7A18;
                    color:#fff;
                    padding:16px 36px;
                    border-radius:12px;
                    text-decoration:none;
                    font-weight:bold;
                  "
                >
                  Reset Password
                </a>

                <p style="
                  margin-top:30px;
                  color:#9CA3AF;
                  font-size:14px;
                ">
                  If you didn't request this, simply ignore this email.
                </p>

              </td>
            </tr>

            <tr>
              <td>
                <img
                  src="${footerImage}"
                  width="600"
                  style="width:100%;display:block;"
                />
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};
