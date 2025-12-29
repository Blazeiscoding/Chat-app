# AI Live Chat Agent

A customer support chat web application where an AI agent (powered by Gemini) answers user questions with conversation persistence.

![TechNest Support Chat](https://via.placeholder.com/800x400?text=TechNest+AI+Chat+Agent)

## 🚀 Features

- **Real-time AI Chat**: Powered by Gemini API via OpenAI SDK
- **Conversation Persistence**: Messages stored in PostgreSQL (NeonDB)
- **Session Management**: Resume conversations on page reload
- **Modern UI**: Dark theme with glassmorphism effects
- **Typing Indicators**: Visual feedback while AI is responding
- **Error Handling**: Graceful handling of API failures
- **Input Validation**: Character limits, empty message prevention
- **Suggested Questions**: Quick-start conversation prompts

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Backend | Next.js API Routes |
| Database | PostgreSQL (NeonDB) with Prisma ORM |
| AI/LLM | Gemini API via OpenAI SDK |
| Styling | Vanilla CSS with CSS Variables |

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- NeonDB account (or any PostgreSQL database)
- Gemini API key

## 🔧 Local Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd Chat-app
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database - NeonDB PostgreSQL connection string
DATABASE_URL="postgresql://username:password@host.neon.tech/database?sslmode=require"

# Gemini API Key
GEMINI_API_KEY="your-gemini-api-key-here"
```

**Getting your credentials:**
- **NeonDB**: Sign up at [neon.tech](https://neon.tech), create a project, and copy the connection string
- **Gemini API**: Get your key from [Google AI Studio](https://aistudio.google.com/apikey)

### 3. Database Setup

```bash
# Push the Prisma schema to your database
npm run db:push

# (Optional) Open Prisma Studio to view data
npm run db:studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
Chat-app/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── llm.ts             # LLM service wrapper
│   │   └── constants.ts       # Store knowledge & prompts
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   └── styles/
│       └── globals.css        # Global styles
├── pages/
│   ├── api/
│   │   └── chat/
│   │       ├── message.ts     # POST /api/chat/message
│   │       └── history.ts     # GET /api/chat/history
│   ├── _app.tsx               # App wrapper
│   └── index.tsx              # Main chat page
├── components/
│   ├── ChatWidget.tsx         # Main chat container
│   ├── MessageList.tsx        # Scrollable message list
│   ├── MessageBubble.tsx      # Individual message display
│   └── ChatInput.tsx          # Input box + send button
└── README.md
```

## 🏗️ Architecture Overview

### Backend Layers

```
┌─────────────────────────────────────────────────────────┐
│                    API Routes Layer                      │
│  /api/chat/message.ts  │  /api/chat/history.ts          │
├─────────────────────────────────────────────────────────┤
│                    Service Layer                         │
│            llm.ts (generateReply, validation)            │
├─────────────────────────────────────────────────────────┤
│                    Data Layer                            │
│               prisma.ts (Prisma ORM)                     │
├─────────────────────────────────────────────────────────┤
│                    Database                              │
│            PostgreSQL (NeonDB)                           │
└─────────────────────────────────────────────────────────┘
```

### Data Model

```
Conversation
├── id (UUID, primary key)
├── createdAt (timestamp)
├── updatedAt (timestamp)
├── metadata (JSON - user agent, etc.)
└── messages[] (one-to-many)

Message
├── id (UUID, primary key)
├── conversationId (foreign key)
├── sender ("user" | "ai")
├── text (message content)
└── createdAt (timestamp)
```

## 🤖 LLM Integration

### Provider
- **Gemini API** via OpenAI SDK compatibility layer
- Model: `gemini-2.0-flash` (fast, cost-effective)

### Prompting Strategy
1. **System Prompt**: Contains full store knowledge (shipping, returns, support hours, etc.)
2. **Conversation History**: Last 10 messages included for context
3. **Persona**: "Alex" - a friendly, helpful support agent for TechNest

### Cost Controls
- Max 500 tokens per response
- Only last 10 messages included in context
- Character limit (2000) on user input

### Error Handling
- API authentication errors → friendly message
- Rate limits → retry suggestion
- Timeouts → graceful degradation
- All errors logged but user sees clean messages

## 🎨 Design Decisions

1. **Next.js API Routes**: Keeps frontend and backend in one project, simplifies deployment
2. **Prisma ORM**: Type-safe database access, easy migrations
3. **OpenAI SDK for Gemini**: Familiar API, easy to switch providers later
4. **Session in localStorage**: Simple, no auth needed, persists across refreshes
5. **Optimistic UI Updates**: Messages appear immediately while waiting for AI
6. **CSS Variables**: Easy theming, consistent design tokens

## 🔌 Extensibility

### Adding More Channels
The architecture separates the LLM logic from the API layer, making it easy to add:
- WhatsApp integration (Twilio webhook → same LLM service)
- Instagram DMs (Meta webhook → same LLM service)
- Slack integration (Slack Events API → same LLM service)

### Adding More Tools
The `generateReply` function can be extended to:
- Call external APIs (order lookup, inventory check)
- Use function calling for structured actions
- Connect to a knowledge base or RAG system

## ⚠️ Trade-offs & Limitations

1. **No Authentication**: Anyone can chat, conversations aren't tied to users
2. **No Rate Limiting**: Could add Redis-based rate limiting for production
3. **No Streaming**: Responses appear all at once (could add SSE for streaming)
4. **Single Database**: Could shard by conversation ID for scale
5. **No Analytics**: Could add tracking for conversation metrics

## 🚧 If I Had More Time...

- [ ] Add streaming responses with Server-Sent Events
- [ ] Implement rate limiting with Redis
- [ ] Add conversation export (download chat history)
- [ ] Create admin dashboard for viewing all conversations
- [ ] Add user satisfaction rating after each conversation
- [ ] Implement semantic search over FAQ for better retrieval
- [ ] Add A/B testing for different prompts
- [ ] Set up monitoring and alerting (Sentry, etc.)
- [ ] Add comprehensive test suite (Jest + Playwright)
- [ ] Implement dark/light theme toggle

## 📄 API Reference

### POST /api/chat/message

Send a message and get AI response.

**Request:**
```json
{
  "message": "What's your return policy?",
  "sessionId": "optional-session-uuid"
}
```

**Response:**
```json
{
  "reply": "We offer a 30-day return policy...",
  "sessionId": "uuid-of-conversation"
}
```

### GET /api/chat/history

Retrieve conversation history.

**Request:**
```
GET /api/chat/history?sessionId=uuid-here
```

**Response:**
```json
{
  "messages": [
    { "id": "...", "sender": "user", "text": "...", "createdAt": "..." },
    { "id": "...", "sender": "ai", "text": "...", "createdAt": "..." }
  ],
  "sessionId": "uuid-here"
}
```

## 📝 License

MIT
