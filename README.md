# LumaCycle — Menstrual Cycle & Reproductive Health Companion

**LumaCycle** is a privacy-first, personalized menstrual health companion with intelligent period predictions, recurring symptom intelligence, multi-device cloud synchronization, and a modern purple-and-pink aesthetic.

---

## 🌟 Modern Purple & Pink Design Palette

LumaCycle features an empathetic, high-contrast, and calming visual identity:
- **Deep Purple** (`#542080`): Primary actions, brand mark, and high-emphasis elements
- **Royal Purple** (`#7B2CBF`): Navigation active indicators, cycle arcs, and primary buttons
- **Lavender** (`#C8A2E8`): Borders, subtle dividers, and follicular phase arcs
- **Soft Lavender Background** (`#F6F0FC`): Easy-on-the-eyes app backdrop
- **Bright Pink** (`#EC4899`): Menstrual phase indicators, bleeding status, and urgent badges
- **Soft Blush Pink** (`#FCE7F3`): Card backgrounds, pill tags, and subtle highlights
- **Dark Plum Text** (`#321442`): High-legibility typography matching WCAG AAA contrast
- **White** (`#FFFFFF`): Clean container surfaces and elevated modals

---

## 🔬 Core Capabilities

### 1. Intelligent Period Prediction with Outlier Resistance
- **Outlier Filtering**: Calculates cycle lengths between consecutive period start dates. Excludes atypical cycles (<18 days or >60 days) to prevent temporary disruptions from skewing future forecasts.
- **Dynamic Uncertainty Ranges**: Provides a clear prediction window (e.g., Nov 18 – Nov 22) derived from standard deviation of recent cycles (clamped between ±1 and ±4 days).
- **Adaptive Confidence Levels**:
  - *Provisional*: 0–1 recorded cycles (uses user preferences baseline)
  - *Moderate*: 2–3 recorded cycles (averages available cycles with max variance)
  - *High Confidence*: 4+ recorded cycles (weighted moving average of the last 4 cycles)
- **Early & Late Period Detection**:
  - Detects if a recorded period started *earlier than expected*, *within expected range*, or *later than expected*.
  - When the expected date passes without a logged period, displays a gentle, reassuring notification distinguishing normal variation from a missed period.

### 2. Menstrual Health Intelligence & Recurring Symptoms
- **Strictly Data-Driven**: Analyzes stored cycle records and daily logs without fabricating symptoms or patterns.
- **Phase-Specific Pattern Correlation**: Identifies whether symptoms consistently occur during the **Pre-Menstrual Window** (1–7 days before flow) or **Menstrual Phase** (active bleeding days).
- **Pain Severity Breakdown**: Tracks specific severity levels (mild, moderate, severe) for cramps, headaches, lower back pain, and pelvic pain.
- **Medications & Pain Relief**: Records medications taken (e.g. Ibuprofen, Paracetamol) and notes changes across cycles.
- **Clinical Safety Boundaries**: Factual, non-alarmist health summaries that assist in clinical appointments while explicitly noting that statistical patterns do not diagnose medical conditions like endometriosis, PCOS, or fibroids. Provides prompt urgent-care warnings for severe acute pain or hemorrhaging.

### 3. Historical Period Recording Across Months & Years
- **Past Months & Years**: Record previous periods from September 2026, August 2026, or earlier.
- **Synchronized Duration & Dates**: Selecting start and end dates automatically calculates period duration; adjusting duration updates the end date.
- **Cycle Recalculation**: Automatically measures cycle length as the exact number of days from Day 1 of one period to Day 1 of the subsequent period.
- **Edit & Delete Protection**: Edit previous entries or delete incorrect cycles with safety confirmation modals.

### 4. Interactive Personalized Cycle Calendar
- Month-by-month navigation without modifying the local "Today" date.
- Clear visual distinction between **Confirmed Logged Bleed Days** (solid pink) and **Predicted Period Window** (dashed lavender border with light pink fill).
- Direct day inspection to log symptoms, moods, medications, and vitals for any selected date.

### 5. Verified Google Authentication & Data Sovereignty
- **Google Sign-In**: Powered by Firebase Authentication with automatic profile retrieval.
- **Strict User Isolation**: All health logs are scoped under `/users/{uid}/...` with Firestore security rules preventing cross-user access.
- **Data Sovereignty & Permanent Erasure**:
  - Clear all menstrual and health records with one click.
  - Permanently delete the entire Google-linked account and all associated cloud data.
  - Download or restore encrypted JSON backups at any time.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript
- **Tooling**: Vite 8, Tailwind CSS v4
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion)
- **Database & Auth**: Google Cloud Firestore & Firebase Authentication
- **Security**: Hardened Attribute-Based Access Control (ABAC) in `firestore.rules`

---

## ⚖️ Clinical Disclaimer

> **Important**: Cycle predictions, ovulation windows, and symptom insights generated by LumaCycle are statistical estimates based on user-entered historical data. They do not constitute medical diagnosis, clinical advice, or guaranteed contraception. For reproductive health questions or severe symptoms, always consult a licensed gynecologist or healthcare practitioner.
