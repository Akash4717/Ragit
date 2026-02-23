# ⚡ RAGIT — KT Chatbot Platform

```
██████╗  █████╗  ██████╗ ██╗████████╗
██╔══██╗██╔══██╗██╔════╝ ██║╚══██╔══╝
██████╔╝███████║██║  ███╗██║   ██║   
██╔══██╗██╔══██║██║   ██║██║   ██║   
██║  ██║██║  ██║╚██████╔╝██║   ██║   
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝   ╚═╝   
```




VIDEO LINK-- https://drive.google.com/file/d/1j8uqEBLYdZiyN-qHOMB5-pTUvscuGHW5/view?usp=sharing

> **Turn your KT sessions into smart chatbots. Instantly. In any language. With your voice.**

[![Built with Groq](https://img.shields.io/badge/Built%20with-Groq-orange?style=flat-square)](https://groq.com)
[![Powered by Supabase](https://img.shields.io/badge/Powered%20by-Supabase-green?style=flat-square)](https://supabase.com)
[![Translated by Lingo.dev](https://img.shields.io/badge/Translated%20by-Lingo.dev-blue?style=flat-square)](https://lingo.dev)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](https://opensource.org/licenses/MIT)

---

## 🧠 What is RAGIT?

You know that feeling when a fresher joins your team and asks you the same questions you've answered 47 times already?

**"Where's the deployment guide?"**  
**"How do I set up the dev environment?"**  
**"What does this service actually do?"**

Yeah. That feeling. RAGIT kills it.

Upload your KT videos, PDFs, DOCX files, PowerPoints — anything. RAGIT transcribes them, chunks them, indexes them, and turns them into a **smart multilingual chatbot** that freshers can actually talk to. In their own language. With their own voice.

No more repeating yourself. No more stale Confluence docs. No more "just ask your senior."

**RAGIT answers. Instantly. Always.**

---

## 🚀 Features That Slap

### 🎙️ Auto Transcription
Upload a 2-hour KT recording at 11pm. By 11:05pm it's fully transcribed, chunked, and searchable. Groq Whisper does the heavy lifting so you don't have to.

### 🔍 RAG Pipeline
Not your grandma's keyword search. Questions get semantically matched to the most relevant chunks of your KT content using Supabase pgvector. The right answer, from the right document, every time.

### 🌐 Multilingual — For Real
Hindi? ✅ Chinese? ✅ Arabic? ✅ Japanese? ✅ Russian? ✅  
Freshers ask in their language, get answers in their language. Lingo.dev handles detection and translation automatically. Switch languages mid-conversation and everything translates instantly.

### 🔊 Voice Playback
Every bot response has a speak button. Click it and the answer is read aloud in the correct language using Web Speech API. Perfect for accessibility, perfect for when your eyes are tired.

### 🎤 Voice Input ← **NEW**
Don't want to type? **Don't.** Hit the mic button and just ask your question out loud. RAGIT listens, transcribes your voice in real-time, and fires the question to the chatbot. Your team can now literally *talk* to your KT documentation. We live in the future.

### 📦 npm Widget — Drop it Anywhere
```bash
npm install ragit-widget
```
```jsx
<RagitChat
  apiKey="rg_live_xxxxxxxxxxxx"
  productId="your-product-id"
  theme="dark"
/>
```
Two lines. That's it. The chatbot lives in your app now.

### 🔑 API Key Isolation
Every chatbot product gets its own API key. Zero cross-contamination between teams or products. Full RLS enforcement at the Supabase layer.

---

## 🗂️ Supported File Formats

| Format | Type | Processing |
|--------|------|------------|
| `.mp4` `.webm` | Video | Groq Whisper transcription |
| `.mp3` `.wav` `.m4a` | Audio | Groq Whisper transcription |
| `.pdf` | Document | pdf2json extraction |
| `.docx` | Word | mammoth extraction |
| `.ppt` `.pptx` | Presentation | officeParser extraction |
| `.txt` | Text | Direct chunking |

---

## 🏗️ Tech Stack

```
Frontend          →  React + Vite + Shadcn + TailwindCSS
Backend           →  Node.js + Express
Database          →  Supabase (PostgreSQL + pgvector)
Storage           →  Supabase Storage
Auth              →  Supabase Auth
LLM               →  Groq (llama-3.3-70b-versatile)
Transcription     →  Groq Whisper
Translation       →  Lingo.dev
Voice Input       →  Web Speech API (SpeechRecognition)
Voice Output      →  Web Speech API (SpeechSynthesis)
Deployment        →  Vercel (Frontend + Backend)
```

---

## 📁 Project Structure

```
ragit/
├── backend/
│   ├── config/
│   │   └── constants.js          # Groq models, chunk sizes
│   ├── routes/
│   │   ├── auth.js               # Signup/login
│   │   ├── products.js           # CRUD for chatbot products
│   │   ├── upload.js             # File upload + processing pipeline
│   │   └── chat.js               # RAG chat + translation endpoints
│   ├── services/
│   │   ├── ragService.js         # Chunk retrieval + Groq LLM
│   │   └── lingoService.js       # Lingo.dev translation
│   ├── utils/
│   │   └── chunker.js            # Text cleaning + chunking
│   ├── server.js                 # Express app entry
│   └── vercel.json               # Vercel serverless config
│
└── dashboard/
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Navbar.jsx
    │   │   │   └── ProtectedRoute.jsx
    │   │   ├── product/
    │   │   │   ├── ChatPreview.jsx     # Chat UI + voice I/O
    │   │   │   ├── UploadResource.jsx  # File upload UI
    │   │   │   └── ResourceList.jsx    # Resource management
    │   │   ├── AnimatedBackground.jsx
    │   │   └── LoadingScreen.jsx       # Boot sequence loader
    │   ├── pages/
    │   │   ├── Landing.jsx             # Landing page
    │   │   ├── Login.jsx               # Auth page
    │   │   ├── Dashboard.jsx           # Products overview
    │   │   ├── CreateProduct.jsx       # New chatbot form
    │   │   └── ProductDetail.jsx       # Upload + test + embed
    │   ├── context/
    │   │   └── AuthContext.jsx         # Supabase session management
    │   └── lib/
    │       ├── api.js                  # Axios instance
    │       ├── supabase.js             # Supabase client
    │       └── constants.js            # Supported locales
    └── vercel.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- Supabase account
- Groq API key
- Lingo.dev API key

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/ragit.git
cd ragit
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create `.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GROQ_API_KEY=your_groq_api_key
LINGODOTDEV_API_KEY=your_lingo_api_key
CLIENT_URL=http://localhost:5173
PORT=3000
```

```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd dashboard
npm install
```

Create `.env`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

```bash
npm run dev
```

### 4. Supabase Tables

Run these in Supabase SQL editor:

```sql
-- Products table
create table products (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  name text not null,
  description text,
  language text default 'en',
  api_key text unique,
  created_at timestamp default now()
);

-- Resources table
create table resources (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade,
  file_name text,
  file_type text,
  file_path text,
  status text default 'pending',
  created_at timestamp default now()
);

-- Chunks table
create table chunks (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade,
  resource_id uuid references resources(id) on delete cascade,
  content text,
  chunk_index integer,
  created_at timestamp default now()
);
```

---

## 🌍 Supported Languages

| Code | Language |
|------|----------|
| `en` | English |
| `hi` | Hindi |
| `es` | Spanish |
| `fr` | French |
| `de` | German |
| `zh` | Chinese |
| `ja` | Japanese |
| `ar` | Arabic |
| `pt` | Portuguese |
| `ru` | Russian |

---

## 🚢 Deployment

### Frontend → Vercel
```bash
cd dashboard
vercel --prod
```
Env vars needed:
```
VITE_API_URL=https://ragit-backend.vercel.app/api
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Backend → Vercel
```bash
cd backend
vercel --prod
```
Env vars needed:
```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GROQ_API_KEY=...
LINGODOTDEV_API_KEY=...
CLIENT_URL=https://ragit-frontend.vercel.app
```

---

## 🔥 The Pipeline (How It Actually Works)

```
User uploads file
      ↓
Supabase Storage (raw file saved)
      ↓
File type detection
      ↓
┌─────────────────────────────────┐
│  MP4/MP3/WAV → Groq Whisper     │
│  PDF         → pdf2json         │
│  DOCX        → mammoth          │
│  PPT/PPTX    → officeParser     │
│  TXT         → direct read      │
└─────────────────────────────────┘
      ↓
Text cleaning (null bytes, control chars stripped)
      ↓
Chunking (500 token chunks, 50 token overlap)
      ↓
Stored in Supabase chunks table
      ↓
Status → "done" ✅

--- Later when fresher asks a question ---

User question (typed OR spoken via mic 🎤)
      ↓
Language detection (Lingo.dev)
      ↓
Translated to English for retrieval
      ↓
ilike keyword search across chunks
      ↓
Top 5 relevant chunks retrieved
      ↓
Groq LLM (llama-3.3-70b-versatile) generates answer
      ↓
Answer translated back to user's language (Lingo.dev)
      ↓
Response displayed + optional voice playback 🔊
```

---

## 🎤 Voice Input — How It Works

RAGIT now supports full voice input using the **Web Speech API SpeechRecognition**:

1. Click the 🎤 mic button in the chat input
2. Speak your question naturally in any language
3. RAGIT transcribes it in real-time
4. The transcribed text appears in the input box
5. Hit send (or it auto-sends after silence detection)
6. Get your answer — in your language

No backend required. No API costs. Pure browser magic.

> Supported in Chrome, Edge, Safari. Firefox partial support.

---

## 🧩 Widget Usage

```bash
npm install ragit-widget
```

```jsx
import { RagitChat } from 'ragit-widget';

function App() {
  return (
    <RagitChat
      apiKey="rg_live_xxxxxxxxxxxx"
      productId="your-product-id"
      theme="dark"
      position="bottom-right"
    />
  );
}
```

---

## 🐛 Known Issues

- Vercel serverless has a 4.5MB request body limit — large video files may need chunked upload
- Lingo.dev occasionally times out on long texts (graceful fallback to original language built-in)
- Web Speech API voice input not supported in Firefox
- Render free tier cold starts (~30s) if using Render instead of Vercel for backend

---

## 🤝 Contributing

```bash
# Fork it
# Create your feature branch
git checkout -b feature/something-wild

# Commit your changes
git commit -m "feat: add something wild"

# Push and open a PR
git push origin feature/something-wild
```

---

## 📄 License

MIT License — do whatever you want with it. Build something cool.


---
## 👤 Built By

**AKX** — built at hackathon 2026 in one sleepless sprint.

> *"The best KT is the KT that answers itself."*

---

<div align="center">

**[🚀 Live Demo](https://ragit-frontend.vercel.app)** · **[📦 npm Widget](https://npmjs.com/package/ragit-widget)** · **[🐛 Issues](https://github.com/yourusername/ragit/issues)**

Made with ☕ + 🎧 + way too much Groq

</div>
