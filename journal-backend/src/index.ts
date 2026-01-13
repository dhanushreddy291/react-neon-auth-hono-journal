import { serve } from '@hono/node-server';
import { Hono, type Context, type Next } from 'hono';
import { cors } from 'hono/cors';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, desc } from 'drizzle-orm';
import * as jose from 'jose';
import { journalEntries } from './db/schema.js';
import 'dotenv/config';

type AppVariables = { userId: string };

const app = new Hono<{ Variables: AppVariables }>();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const JWKS = jose.createRemoteJWKSet(
  new URL(`${process.env.NEON_AUTH_URL}/.well-known/jwks.json`)
);

const authMiddleware = async (c: Context<{ Variables: AppVariables }>, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const token = authHeader.split(' ')[1];

  try {
    const { payload } = await jose.jwtVerify(token, JWKS, {
      issuer: new URL(process.env.NEON_AUTH_URL!).origin,
    });
    if (!payload.sub) {
      return c.json({ error: 'Invalid Token' }, 401);
    }
    c.set('userId', payload.sub);
    await next();
  } catch (err) {
    console.error('Verification failed:', err);
    return c.json({ error: 'Invalid Token' }, 401);
  }
};

app.use(
  '/*',
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

app.get('/api/entries', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const entries = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.userId, userId))
    .orderBy(desc(journalEntries.createdAt));

  return c.json(entries);
});

app.post('/api/entries', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const { content } = await c.req.json();

  const [newEntry] = await db.insert(journalEntries).values({ userId, content }).returning();

  return c.json(newEntry);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Backend server running at http://localhost:${info.port}`);
  }
);