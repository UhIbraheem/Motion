# Motion – AI-Curated Local Adventures App

A planning app to find restaurants, share experiences, and book or reserve—all in one.

---

## 🚀 Getting Started

### 1. Run the Backend (Express + OpenAI)

```bash
cd backend
npm install
node index.js
```
> Starts the Express server at [http://localhost:5000](http://localhost:5000).  
> Powers the AI-based `/generate-plan` route.

---

### 2. Run the Marketing Landing Page

```bash
cd motion-landing
npm install
npm run dev
```

---

## 🌱 Git Branch Workflow

```bash
# Create a branch for new features
git checkout -b dev

# Stage and commit changes
git add .
git commit -m "Describe your update"

# Push to GitHub
git push origin dev

# Merge dev into main when ready
git checkout main
git merge dev
git push origin main
```

---

## 📄 Project Structure

motion/
├── backend/ → Express.js server and API endpoints
├── motion-landing/ → Marketing landing page (Next.js + Tailwind)
└── frontend/ → (Planned) React Native mobile app