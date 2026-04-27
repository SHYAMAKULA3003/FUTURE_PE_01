<div align="center">

# ✨ SEO Content Studio

### AI-Powered Blog & Content Cluster Generator for Business Websites 

**Generate ranking-focused pillar blogs, supporting articles, and complete SEO content packs — all powered by AI.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://prisma.io/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-18181B?logo=shadcnui)](https://ui.shadcn.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5-orange?logo=appsembler)](https://zustand.docs.pmnd.rs/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

<img src="public/images/hero-banner.png" alt="SEO Content Studio Dashboard" width="100%" />

---

## 🎯 What is SEO Content Studio?

SEO Content Studio is a full-stack AI application that automates the entire SEO content creation workflow for business websites. It generates **content clusters** — a strategy used by top agencies and SaaS companies to rank higher on Google — in minutes instead of days.

### 🤔 Why Content Clusters?

Google rewards **topical authority**. Instead of writing random blog posts, a content cluster strategy organizes content around a central "pillar" topic with supporting subtopics, all interlinked. This approach is proven to improve search rankings.

<p align="center">
  <img src="public/images/architecture.png" alt="Content Cluster Architecture" width="70%" />
</p>

---

## ✨ Key Features

| Feature | Description |
|--------|------------|
| 🧠 **AI Keyword Strategy** | Generates primary, secondary, long-tail, and local keywords with search intent and difficulty |
| 📝 **Pillar Blog Generation** | Creates long-form authority blogs (1500+ words) with proper H1–H3 structure |
| 📄 **Supporting Blog Cluster** | Generates 3–5 supporting articles with internal linking |
| 🎯 **Local SEO Focus** | Optimized content for city and service-area targeting |
| 📊 **SEO Scoring** | Real-time analysis (keyword density, readability, structure, local signals) |
| 🔗 **Internal Linking** | AI-based linking suggestions between blogs |
| 📤 **Markdown Export** | Export complete content packs as Markdown files |
| 🔄 **Real-time Progress** | Background generation with live updates |
| 📱 **Responsive Design** | Works across mobile, tablet, and desktop |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+  
- Bun (recommended) or npm  
- SQLite (included with Prisma)  

### 1. Clone & Install
```bash
git clone https://github.com/your-username/seo-content-studio.git
cd seo-content-studio
bun install
```

### 2. Setup Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL="file:./db/custom.db"
```

### 3. Initialize Database
```bash
bun run db:push
```

### 4. Run Development Server
```bash
bun run dev
```

Open: http://localhost:3000

---

## 🛠️ How It Works

### 3-Step Workflow

```
BUSINESS → KEYWORDS → CONTENT PACK
```

1. **Business Profile**  
   Enter business details (name, type, location, audience)

2. **Keyword Strategy**  
   AI generates:
   - Primary keywords  
   - Secondary keywords  
   - Long-tail keywords  
   - Local keywords  
   - Content clusters  

3. **Content Pack Generation**  
   AI generates:
   - 1 pillar blog (~1500 words)  
   - 4 supporting blogs (~1000 words each)  
   - Meta tags + SEO score + linking  

---

## 🏗️ Architecture

### Tech Stack

- **Frontend:** React 19, Next.js 16, Tailwind CSS, shadcn/ui  
- **Backend:** Next.js API Routes  
- **Database:** Prisma + SQLite  
- **State Management:** Zustand  
- **AI Integration:** LLM SDK  
- **Animations:** Framer Motion  

---

## 📂 Project Structure

```
src/
├── app/
│   ├── api/
│   ├── layout.tsx
│   └── page.tsx
├── components/
├── lib/
```

---

## 📋 Scripts

```bash
bun run dev
bun run build
bun run start
bun run lint
bun run db:push
bun run db:studio
bun run db:generate
```

---

## 🧩 Key Design Decisions

### Background Processing
- Content generation runs asynchronously  
- Avoids timeouts  
- Provides live progress updates  
- Uses polling every 3 seconds  

### SEO Scoring
Score out of 100 based on:
- Keyword usage  
- Structure (H1, H2, H3)  
- Readability  
- Word count  
- Local SEO signals  

---

## 🔮 Roadmap

- Multi-language content  
- Competitor analysis  
- Content calendar  
- WordPress export  
- Team collaboration  
- SERP preview  
- Performance tracking  

---

## 🤝 Contributing

1. Fork the repository  
2. Create a branch  
3. Commit changes  
4. Push and create PR  

---

## 📄 License

MIT License

---

<div align="center">

Built with ❤️ using Next.js, Tailwind CSS, and AI

</div>
