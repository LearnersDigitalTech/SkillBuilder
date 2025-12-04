# Skill Conquest - National Mathematics Skills Proficiency Test

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm, yarn, pnpm, or bun

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd math-learners
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

### Configuration

Create a `.env.local` file in the root directory and add the following environment variables.

**Admin Credentials**
These are used to access the `/admin-Login` page.
```env
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
```

**Firebase Configuration**
Required for authentication, database, and storage. You can find these in your Firebase Console project settings.
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Tutor Booking Webhook**
(Optional) Webhook URL for Google Apps Script to handle tutor booking notifications.
```env
NEXT_PUBLIC_TUTOR_BOOKING_WEBHOOK=your_google_script_webhook_url
```

### Tutor Booking Setup (Google Sheets & Apps Script)

To enable the tutor booking feature with Google Sheets and Email notifications:

1.  **Create a Google Sheet**:
    -   Go to [Google Sheets](https://sheets.google.com) and create a new sheet.
    -   Rename the tab to `Sheet1` (default).
    -   **Add the following headers to the first row (A1:I1):**
        -   Timestamp
        -   Parent Name
        -   Student Name
        -   Grade
        -   Phone
        -   Preferred Date
        -   Preferred Time Slot
        -   Mode
        -   Notes

2.  **Open Apps Script**:
    -   Click on `Extensions` > `Apps Script`.

3.  **Add the Script**:
    -   Delete any code in `Code.gs` and paste the following:

    ```javascript
    function doPost(e) {
      try {
        // Parse JSON body
        var body = e.postData && e.postData.contents ? e.postData.contents : null;
        if (!body) {
          return ContentService
            .createTextOutput(JSON.stringify({ success: false, message: "No body" }))
            .setMimeType(ContentService.MimeType.JSON);
        }

        var data = JSON.parse(body);

        // Fields
        var parentName        = data.parentName || "";
        var studentName       = data.studentName || "";
        var grade             = data.grade || "";
        var phone             = data.phone || "";
        var preferredDate     = data.preferredDate || "";
        var preferredTimeSlot = data.preferredTimeSlot || "";
        var mode              = data.mode || "";
        var notes             = data.notes || "";

        // Append to sheet
        var ss    = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = ss.getSheetByName("Sheet1");       // change if needed

        sheet.appendRow([
          new Date(),
          parentName,
          studentName,
          grade,
          phone,
          preferredDate,
          preferredTimeSlot,
          mode,
          notes
        ]);

        // Email
        var recipient = "capturerphotography10@gmail.com";   // <-- set your email
        var subject   = "New Tutor Booking Request – " + studentName;

        var plainBody =
          "A new tutor booking request has been submitted:\n\n" +
          "Parent: " + parentName + "\n" +
          "Student: " + studentName + "\n" +
          "Grade: " + grade + "\n" +
          "Phone: " + phone + "\n" +
          "Preferred Date: " + preferredDate + "\n" +
          "Preferred Time Slot: " + preferredTimeSlot + "\n" +
          "Mode: " + mode + "\n\n" +
          "Notes:\n" + (notes || "-") + "\n";

        var htmlBody =
          '<div style="font-family:system-ui, -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif; padding:16px; background:#f4f4f5;">' +
            '<div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:10px; box-shadow:0 6px 20px rgba(15,23,42,0.12); padding:20px 24px;">' +
              '<h2 style="margin:0 0 8px 0; font-size:20px; color:#111827;">New Tutor Booking Request</h2>' +
              '<p style="margin:0 0 16px 0; font-size:14px; color:#4b5563;">A new tutor booking request has been submitted. Details are below:</p>' +

              '<table cellpadding="0" cellspacing="0" style="width:100%; font-size:14px; color:#111827;">' +
                row("Parent",          parentName) +
                row("Student",         studentName) +
                row("Grade",           grade) +
                row("Phone",           phone) +
                row("Preferred Date",  preferredDate) +
                row("Time Slot",       preferredTimeSlot) +
                row("Mode",            mode) +
              '</table>' +

              '<div style="margin-top:16px; padding-top:12px; border-top:1px solid #e5e7eb;">' +
                '<div style="font-size:13px; font-weight:600; color:#111827; margin-bottom:4px;">Notes</div>' +
                '<div style="font-size:13px; color:#4b5563; white-space:pre-line;">' + (notes || "—") + '</div>' +
              '</div>' +

              '<p style="margin-top:20px; font-size:12px; color:#9ca3af;">This email was generated from the Math Skill Conquest booking form.</p>' +
            '</div>' +
          '</div>';

        MailApp.sendEmail({
          to: recipient,
          subject: subject,
          body: plainBody,   // fallback for non‑HTML clients
          htmlBody: htmlBody
        });

        return ContentService
          .createTextOutput(JSON.stringify({ success: true }))
          .setMimeType(ContentService.MimeType.JSON);

      } catch (err) {
        return ContentService
          .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      function row(label, value) {
        return (
          '<tr>' +
            '<td style="padding:4px 0; width:140px; font-weight:600; color:#4b5563;">' + label + '</td>' +
            '<td style="padding:4px 0; color:#111827;">' + (value || "—") + '</td>' +
          '</tr>'
        );
      }
    }
    ```

4.  **Deploy**:
    -   Click `Deploy` > `New deployment`.
    -   Select type: `Web app`.
    -   Description: `Tutor Booking Webhook`.
    -   Execute as: `Me`.
    -   Who has access: `Anyone`.
    -   Click `Deploy`.

5.  **Configure**:
    -   Copy the **Web App URL**.
    -   Paste it into your `.env.local` file as `NEXT_PUBLIC_TUTOR_BOOKING_WEBHOOK`.

### Running the Project

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

