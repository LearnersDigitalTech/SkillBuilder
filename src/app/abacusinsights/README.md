# 🧮 AbacusInsights: Secure Assessment Portal

AbacusInsights is a premium, proctored examination platform designed for high-stakes testing, coding assessments, and student progress tracking. It provides a seamless experience for both administrators and candidates.

## 🚀 Core Features

### 👤 Student Experience (`/abacusinsights/test`)
- **Secure Entry:** Unique 6-digit UID validation for identity verification.
- **Proctored Environment:** 
  - Forced fullscreen mode.
  - Tab switch detection with automatic submission after 4 switches.
  - Disabled copy/paste and right-click to prevent malpractice.
- **Auto-Save:** Student progress is synced with the cloud every 5 seconds.
- **Diverse Question Types:** Supports MCQs, Coding (various languages), and SQL environments.

### 🛠 Admin Dashboard (`/abacusinsights/admin`)
- **Test Management:** Create, activate/deactivate, and customize exam parameters (duration, shuffle, camera requirements).
- **Bulk Import:** 
  - Upload questions via Excel templates.
  - Upload student registration lists via Excel.
- **Student Management:** Generate unique UIDs and track assigned papers.
- **Results & Analytics:** 
  - Real-time monitoring of active sessions.
  - Automated grading for MCQs.
  - Violation tracking (fullscreen exits, tab switches).
  - One-click **Export to Excel** for final scores.

---

## 📁 Project Structure

- `src/app/abacusinsights/admin/page.js`: Main administrative interface.
- `src/app/abacusinsights/test/page.js`: Candidate login and protocol agreement.
- `src/app/abacusinsights/test/[testId]/page.js`: The active examination environment.
- `src/services/abacusTestService.js`: Core logic for API/Database interactions.
- `src/components/AbacusInsights/`: Reusable UI components (Question renderers, SQL environments).

---

## 📝 Excel Import Guidelines

### 📊 Question Template
| S.No | Question | Option A | Option B | Option C | Option D | Answer | Type | Explanation |
|------|----------|----------|----------|----------|----------|--------|------|-------------|
| 1    | Text...  | Choice 1 | Choice 2 | Choice 3 | Choice 4 | A/B/C/D| mcq  | optional    |
| 2    | SELECT...| -        | -        | -        | -        | -      | sql  | optional    |

> [!IMPORTANT]
> **Manual Image Upload:** To ensure data integrity, images for questions should be uploaded manually via the Admin Dashboard's preview modal after the Excel import is complete.

---

## 🛠 Tech Stack
- **Frontend:** Next.js (App Router), Tailwind CSS.
- **Backend/Auth:** Firebase Firestore & Authentication.
- **Libraries:**
  - `xlsx-js-style`: Premium Excel generation and parsing.
  - `lucide-react`: High-quality iconography.
  - `react-toastify`: Real-time notifications.
- **UI Architecture:** Custom Glassmorphism design system.

---

## 🔒 Security Protocols
The platform implements a multi-layer security check:
1. **UID Validation:** Prevents unauthorized entry.
2. **Environment Locking:** Restricts browser interactions using `Fullscreen API`.
3. **Behavioral Analytics:** Tracks violations like `visibilitychange` and `fkey` events.
4. **Active Session Heartbeat:** Ensures students remain connected to the server.
