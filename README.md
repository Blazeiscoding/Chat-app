# AI Live Chat Agent

Customer support chat web app powered by Gemini AI with conversation persistence.

## Tech Stack

- Next.js 14 + React 18 + TypeScript
- PostgreSQL (NeonDB) + Prisma ORM
- Gemini API via OpenAI SDK

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
DATABASE_URL="postgresql://..."
GEMINI_API_KEY="your-key"
```

3. Setup database:
```bash
npm run db:push
```

4. Run dev server:
```bash
npm run dev
```

## API Endpoints

**POST /api/chat/message** - Send message, get AI response

```json
{ "message": "Hello", "sessionId": "optional-uuid" }
```

**GET /api/chat/history?sessionId=uuid** - Get conversation history
