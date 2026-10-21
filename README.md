# LumaCycle — Period & Menstrual Health Tracker

**LumaCycle** is a privacy-first, clinical-grade menstrual cycle, ovulation, and reproductive health companion. Built with an empathetic design language, it helps users track their menstrual flow, predict fertile windows, understand the four biological phases of the menstrual cycle, and log symptoms with complete confidentiality and multi-device cloud synchronization.

---

## 🌟 Key Features

### 1. Secure Authentication & User Isolation
- **Google Sign-In & Email Authentication**: Instant, secure login with Google OAuth via Firebase Authentication, with email and password fallback.
- **Pre-Auth Protection**: Visitors cannot view or record personal health data until authenticated.
- **Strict Data Isolation**: Each user’s cycles, daily symptoms, and vitals are stored under their own verified user ID (`/users/{uid}/...`). Firebase security rules mathematically enforce that User A can never access or query User B’s records.
- **Account Clearing**: Logging out or switching accounts immediately flushes sensitive data from active browser memory.

### 2. Interactive Biological Cycle Dial & Period Start Recording
- **Explicit Period Start Logging**: Dedicated "Record When Period Started" modal with quick options (*Today*, *Yesterday*, *2 days ago*, or custom calendar date), initial flow intensity, bleed duration stepper, and early symptom tags.
- **Lively Ambient Visuals**: Dynamic phase-responsive radial backdrop glowing softly in Menstrual Rose, Follicular Violet, Ovulatory Gold, or Luteal Teal.
- **Real-Time Cycle Calibration**: Recording a period start date automatically closes prior ongoing cycles, sets Day 1 of the new cycle, and recalibrates upcoming ovulation and fertile window forecasts.
- **Lively Biological Energy Vibe & Hormone Horoscope**: Daily meters tracking *Physical Stamina*, *Creative Focus*, *Social & Drive*, and *Restorative Need* with motivational body wisdom quotes.
- **Quick Tap Mood Reaction**: One-tap mood chips (🌿 Calm, ☀️ Happy, ⚡ Energetic, 💧 Sensitive, 🔥 Irritable, 🛌 Tired) directly on the main dashboard.

### 3. Interactive Monthly Calendar
- Full month grid with smooth month/year navigation and quick "Jump to Today".
- Color-coded badges for active bleed days, predicted periods, fertile windows, peak ovulation day, and PMS alerts.
- Day inspection drawer: Click any calendar date to inspect or edit logged symptoms, moods, and vitals.

### 4. Comprehensive Daily Health Logger
- **Flow Intensity**: None, Spotting, Light, Medium, Heavy.
- **Physical Symptoms**: Cramps, Tender Breasts, Headache, Bloating, Fatigue, Backache, Acne, Food Cravings, Nausea, Insomnia.
- **Mood & Emotions**: Calm, Happy, Energetic, Sensitive, Irritable, Anxious, Sad, Exhausted.
- **Cervical Fluid / Mucus**: Dry, Sticky, Creamy, Egg-White (peak fertile), Watery.
- **Vitals & Habits**: Basal Body Temperature (°C or °F), Body Weight (kg or lbs), Sleep hours stepper, Water intake tracker.
- **Intimacy & Contraception**: Daily contraceptive pill check-off and intimacy protection tracker.
- **Journal Notes**: Freeform notes for thoughts, food reactions, and emotional reflections.

### 5. Hormone Guide & Cycle Syncing
- Comprehensive educational guide detailing hormonal fluctuations (Estrogen, Progesterone, LH, FSH).
- Phase-synced nutrition recommendations and seed cycling suggestions.
- Workout and movement recommendations tailored to hormonal energy rhythms.
- Self-care rituals for menstrual restoration and luteal comfort.

### 6. Historical Period Recording & Dynamic Cycle Calculations
- **Automatic Real-Time Date & Time Tracking**: Automatically detects the current date in the user's local timezone (e.g. Wednesday, 21st October 2026) with midnight auto-rollover and live clock.
- **Past Month & Year Historical Period Logging**: Record previous menstrual periods from any month or year (e.g., September 2026, August 2026, July 2026).
- **Exact Start Date, End Date & Duration Synchronization**: Setting start/end dates automatically calculates bleed duration, and adjusting duration automatically updates the end date.
- **Accurate Cycle Length Calculation**: Calculates cycle lengths as the exact number of days between the first day of one period and the first day of the next period.
- **Empirical Cycle Average vs Custom Estimate**: Dynamically computes average cycle length from recorded consecutive cycles when data is available, with a clearly labeled estimation source and fallback to customizable settings.
- **Edit & Delete Protection**: Edit existing cycle records or delete with a safety confirmation dialog; all predictions, cycle lengths, and fertile windows recalibrate in real time.

### 7. My Profile & Data Sovereignty
- **Verified Identity**: Displays verified Google account name, email address, profile picture, account creation date, and last active session.
- **Clinical Preferences**: Adjust average cycle length (20–50 days), period bleed duration (2–12 days), luteal phase span, temperature units, and weight units.
- **Discreet / Commute Mode**: Neutralizes sensitive terms for privacy when in public or commuting.
- **Data Erasure**: One-click options to wipe all personal tracking records or permanently delete the entire account.
- **JSON Export / Import**: Download or restore an encrypted local backup file.

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Bundler & Tooling**: Vite 8
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Authentication**: Firebase Authentication (Google OAuth + Email/Password)
- **Database**: Google Cloud Firestore (`ai-studio-lumacycleperiodm-3c57a66a-901e-4898-8512-741e62712e47`)
- **Security**: Hardened Attribute-Based Access Control (ABAC) in `firestore.rules`

---

## 🔒 Privacy & Security Standards

- **Zero Third-Party Profiling**: No advertising pixels, tracking cookies, or health broker integrations.
- **Privacy-by-Design**: Engineered in alignment with modern data protection principles, including Kenya's Data Protection Act and international privacy frameworks.
- **Encrypted in Transit & at Rest**: All network communications use TLS/HTTPS, and database records are securely isolated.

---

## ⚖️ Clinical Disclaimer

> **Important**: Cycle predictions, ovulation windows, and fertility dates provided by LumaCycle are statistical estimates based on biological rhythm algorithms and historical patterns. They should not be used as a method of contraception, family planning guarantees, or medical diagnostic advice. Always consult a qualified healthcare provider for reproductive health decisions.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone or open the project directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```
