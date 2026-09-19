
const nodemailer = require("nodemailer");

/* =========================================================
   ADSSU DIGITAL YEARBOOK
   EMAIL SERVICE
   Responsive • Gmail • Outlook • Mobile Friendly
========================================================= */

/* =========================================================
   SMTP TRANSPORTER
========================================================= */

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

/* =========================================================
   HELPER
   Escape HTML values before inserting them into email HTML
========================================================= */

function escapeHtml(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================================================
   SEND YEARBOOK PUBLISHED EMAIL
========================================================= */

async function sendYearbookPublishedEmail({
  email,
  name,
  title,
  batchName,
  batchYear,
  academicYear,
  yearbookId,
}) {
  try {
    /* -----------------------------------------------------
       VALIDATION
    ----------------------------------------------------- */

    if (!email) {
      throw new Error("Recipient email is required.");
    }

    if (!yearbookId) {
      throw new Error("Yearbook ID is required.");
    }

    if (!process.env.EMAIL_USER) {
      throw new Error("EMAIL_USER is missing from .env");
    }

    if (!process.env.EMAIL_APP_PASSWORD) {
      throw new Error(
        "EMAIL_APP_PASSWORD is missing from .env"
      );
    }

    /* -----------------------------------------------------
       DATA
    ----------------------------------------------------- */

    const frontendUrl =
      process.env.FRONTEND_URL ||
      "http://localhost:3000";

    const yearbookUrl =
      `${frontendUrl.replace(/\/$/, "")}/yearbooks/${yearbookId}`;

    const yearbookTitle =
      title || "ADSSU Digital Yearbook";

    const recipientName =
      name || "ADSSU Student";

    const batchDisplay =
      batchName && batchYear
        ? `${batchName} ${batchYear}`
        : batchName ||
          batchYear ||
          "N/A";

    const academicYearDisplay =
      academicYear || "N/A";

    const currentYear =
      new Date().getFullYear();

    /* -----------------------------------------------------
       ESCAPED VALUES
    ----------------------------------------------------- */

    const safeRecipientName =
      escapeHtml(recipientName);

    const safeYearbookTitle =
      escapeHtml(yearbookTitle);

    const safeBatchDisplay =
      escapeHtml(batchDisplay);

    const safeAcademicYear =
      escapeHtml(academicYearDisplay);

    const safeYearbookUrl =
      escapeHtml(yearbookUrl);

    /* =====================================================
       PLAIN TEXT EMAIL
    ===================================================== */

    const text = `
Dear ${recipientName},

We are pleased to inform you that ${yearbookTitle} has officially been published and is now available through the ADSSU Digital Yearbook System.

Yearbook: ${yearbookTitle}

Batch: ${batchDisplay}

Academic Year: ${academicYearDisplay}

Open your digital yearbook:

${yearbookUrl}

ADSSU Digital Yearbook
Agusan del Sur State University

This is an automated notification from the ADSSU Digital Yearbook System.

Please do not reply directly to this email.
`.trim();

    /* =====================================================
       HTML EMAIL
    ===================================================== */

    const html = `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>
    ${safeYearbookTitle}
  </title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background-color:#f3f7f4;
    font-family:Arial, Helvetica, sans-serif;
    color:#333333;
  "
>

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
      background-color:#f3f7f4;
      padding:30px 10px;
    "
  >

    <tr>

      <td align="center">

        <!-- MAIN CONTAINER -->

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width:650px;
            background:#ffffff;
            border-radius:14px;
            overflow:hidden;
            box-shadow:0 4px 18px rgba(0,0,0,0.08);
          "
        >

          <!-- HEADER -->

          <tr>

            <td
              align="center"
              style="
                background:#07552d;
                padding:38px 25px;
              "
            >

              <div
                style="
                  font-size:30px;
                  font-weight:bold;
                  color:#ffffff;
                  margin-bottom:8px;
                "
              >
                ADSSU
              </div>

              <div
                style="
                  font-size:21px;
                  font-weight:bold;
                  color:#ffffff;
                "
              >
                DIGITAL YEARBOOK
              </div>

              <div
                style="
                  margin-top:10px;
                  font-size:14px;
                  color:#dcefe4;
                "
              >
                Yearbook Publication Notification
              </div>

            </td>

          </tr>


          <!-- CONTENT -->

          <tr>

            <td
              style="
                padding:40px 35px;
              "
            >

              <h2
                style="
                  margin:0 0 18px 0;
                  color:#07552d;
                  font-size:24px;
                "
              >
                Dear ${safeRecipientName},
              </h2>

              <p
                style="
                  font-size:16px;
                  line-height:1.7;
                  color:#444444;
                  margin:0 0 20px 0;
                "
              >
                We are pleased to inform you that the
                <strong>${safeYearbookTitle}</strong>
                has officially been published and is now
                available through the ADSSU Digital Yearbook System.
              </p>


              <!-- YEARBOOK INFORMATION -->

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  background:#f1f8f4;
                  border-radius:10px;
                  border-left:5px solid #07552d;
                  margin:25px 0;
                "
              >

                <tr>

                  <td
                    style="
                      padding:22px;
                    "
                  >

                    <div
                      style="
                        font-size:14px;
                        color:#777777;
                        margin-bottom:5px;
                      "
                    >
                      YEARBOOK
                    </div>

                    <div
                      style="
                        font-size:17px;
                        font-weight:bold;
                        color:#07552d;
                        margin-bottom:18px;
                      "
                    >
                      ${safeYearbookTitle}
                    </div>


                    <div
                      style="
                        font-size:14px;
                        color:#777777;
                        margin-bottom:5px;
                      "
                    >
                      BATCH
                    </div>

                    <div
                      style="
                        font-size:16px;
                        color:#333333;
                        margin-bottom:18px;
                      "
                    >
                      ${safeBatchDisplay}
                    </div>


                    <div
                      style="
                        font-size:14px;
                        color:#777777;
                        margin-bottom:5px;
                      "
                    >
                      ACADEMIC YEAR
                    </div>

                    <div
                      style="
                        font-size:16px;
                        color:#333333;
                      "
                    >
                      ${safeAcademicYear}
                    </div>

                  </td>

                </tr>

              </table>


              <!-- BUTTON -->

              <div
                style="
                  text-align:center;
                  margin:35px 0;
                "
              >

                <a
                  href="${safeYearbookUrl}"
                  target="_blank"
                  style="
                    display:inline-block;
                    background:#07552d;
                    color:#ffffff;
                    text-decoration:none;
                    font-size:16px;
                    font-weight:bold;
                    padding:15px 30px;
                    border-radius:8px;
                  "
                >
                  View Digital Yearbook
                </a>

              </div>


              <p
                style="
                  font-size:14px;
                  line-height:1.7;
                  color:#666666;
                  margin:0;
                "
              >
                Click the button above to open the published
                digital yearbook.
              </p>


              <!-- FALLBACK LINK -->

              <p
                style="
                  font-size:12px;
                  line-height:1.6;
                  color:#999999;
                  margin-top:25px;
                  word-break:break-all;
                "
              >
                If the button does not work, copy and paste
                this link into your browser:
                <br><br>

                <a
                  href="${safeYearbookUrl}"
                  style="
                    color:#07552d;
                  "
                >
                  ${safeYearbookUrl}
                </a>

              </p>

            </td>

          </tr>


          <!-- FOOTER -->

          <tr>

            <td
              align="center"
              style="
                background:#f5f7f6;
                padding:25px 20px;
                border-top:1px solid #e5e5e5;
              "
            >

              <div
                style="
                  font-size:14px;
                  font-weight:bold;
                  color:#07552d;
                  margin-bottom:6px;
                "
              >
                ADSSU Digital Yearbook System
              </div>

              <div
                style="
                  font-size:13px;
                  color:#777777;
                  margin-bottom:8px;
                "
              >
                Agusan del Sur State University
              </div>

              <div
                style="
                  font-size:11px;
                  color:#999999;
                  line-height:1.5;
                "
              >
                This is an automated notification from the
                ADSSU Digital Yearbook System.
                <br>
                Please do not reply directly to this email.
              </div>

              <div
                style="
                  font-size:11px;
                  color:#aaaaaa;
                  margin-top:12px;
                "
              >
                © ${currentYear} ADSSU Digital Yearbook System
              </div>

            </td>

          </tr>

        </table>

      </td>

    </tr>

  </table>

</body>

</html>
`;

    /* =====================================================
       SEND EMAIL
    ===================================================== */

    const info = await transporter.sendMail({
      from: `"ADSSU Digital Yearbook" <${process.env.EMAIL_USER}>`,
      to: email,

      subject:
        `ADSSU Digital Yearbook • ${yearbookTitle} is Now Published`,

      text,

      html,
    });

    /* =====================================================
       EMAIL SUBMISSION LOG
    ===================================================== */

    console.log("========================================");
    console.log("📧 EMAIL SUBMISSION RESULT");
    console.log("========================================");
    console.log("To:", email);
    console.log("Message ID:", info.messageId);
    console.log("Accepted:", info.accepted);
    console.log("Rejected:", info.rejected);
    console.log("Response:", info.response);
    console.log("Envelope:", info.envelope);
    console.log("========================================");

    console.log(
      `✅ Yearbook published email sent to ${email}`
    );

    return {
      success: true,
      email,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
      envelope: info.envelope,
    };

  } catch (error) {

    console.error(
      "❌ Failed to send yearbook published email:"
    );

    console.error(error);

    throw error;
  }
}


/* =========================================================
   VERIFY EMAIL TRANSPORTER
========================================================= */

async function verifyEmailTransporter() {

  try {

    if (!process.env.EMAIL_USER) {
      throw new Error(
        "EMAIL_USER is missing from .env"
      );
    }

    if (!process.env.EMAIL_APP_PASSWORD) {
      throw new Error(
        "EMAIL_APP_PASSWORD is missing from .env"
      );
    }

    await transporter.verify();

    console.log(
      "========================================"
    );

    console.log(
      "✅ Email transporter is ready"
    );

    console.log(
      `📧 Email account: ${process.env.EMAIL_USER}`
    );

    console.log(
      "========================================"
    );

    return true;

  } catch (error) {

    console.error(
      "========================================"
    );

    console.error(
      "❌ Email transporter verification failed"
    );

    console.error(
      error.message
    );

    console.error(
      "========================================"
    );

    return false;
  }
}


/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  transporter,
  sendYearbookPublishedEmail,
  verifyEmailTransporter,
};

