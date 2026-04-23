import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import type { Request, Response } from "express";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { ENV } from "./_core/env";

const COOKIE_NAME = "altyn_session";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

function getSecret() {
  return new TextEncoder().encode(ENV.cookieSecret || "altyn-therapy-secret-key-change-in-production");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(userId: number, email: string, role: string): Promise<string> {
  const secret = getSecret();
  return new SignJWT({ userId, email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor((Date.now() + ONE_YEAR_MS) / 1000))
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<{ userId: number; email: string; role: string } | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    const { userId, email, role } = payload as Record<string, unknown>;
    if (typeof userId !== "number" || typeof email !== "string" || typeof role !== "string") return null;
    return { userId, email, role };
  } catch {
    return null;
  }
}

export function getSessionFromRequest(req: Request): string | undefined {
  const cookieHeader = req.headers.cookie || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k?.trim(), v.join("=")];
    })
  );
  return cookies[COOKIE_NAME];
}

export function setSessionCookie(res: Response, token: string) {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: ONE_YEAR_MS,
    path: "/",
  });
}

export function clearSessionCookie(res: Response) {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });
}

export async function authenticateRequest(req: Request) {
  const token = getSessionFromRequest(req);
  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session) return null;

  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  const user = result[0];
  if (!user || !user.isActive) return null;

  return user;
}

export async function isFirstUser(): Promise<boolean> {
  const db = await getDb();
  if (!db) return true;
  const result = await db.select({ id: users.id }).from(users).limit(1);
  return result.length === 0;
}

export { COOKIE_NAME };
