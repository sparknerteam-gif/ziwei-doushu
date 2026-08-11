import { NextResponse } from "next/server";
import { Pool } from "pg";

// ── PostgreSQL connection pool ──
// Uses Supabase Postgres (POSTGRES_URL from Vercel env, auto-added by Supabase integration)
// Falls back to in-memory storage when POSTGRES_URL is not available

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool && process.env.POSTGRES_URL) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      max: 3, // Keep connection pool small for serverless
      idleTimeoutMillis: 30000,
    });
    console.log("✓ PostgreSQL pool created (Supabase)");
  }
  return pool!;
}

// ── In-memory fallback ──
const memoryStore: Record<string, unknown>[] = [];

function hasDb(): boolean {
  return !!process.env.POSTGRES_URL;
}

// ── Ensure table exists ──
let tableReady = false;

async function ensureTable(): Promise<void> {
  if (tableReady || !hasDb()) return;
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS submissions (
      id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      birth_date TEXT DEFAULT '',
      birth_city TEXT DEFAULT '',
      birth_time_accuracy TEXT DEFAULT '',
      exact_birth_time TEXT,
      part_of_day TEXT,
      gender TEXT DEFAULT '',
      life_event1 TEXT DEFAULT '',
      life_event2 TEXT,
      life_event3 TEXT,
      email TEXT DEFAULT '',
      social_handle TEXT DEFAULT '',
      interest_area TEXT DEFAULT '',
      siblings TEXT,
      physical TEXT,
      mbti TEXT,
      anything_else TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  tableReady = true;
  console.log("✓ PostgreSQL submissions table ready");
}

// ── POST — submit form data ──
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const submittedAt = body.submittedAt || new Date().toISOString();

    const submission = {
      submittedAt,
      birthDate: body.birthDate || "",
      birthCity: body.birthCity || "",
      birthTimeAccuracy: body.birthTimeAccuracy || "",
      exactBirthTime: body.exactBirthTime || null,
      partOfDay: body.partOfDay || null,
      gender: body.gender || "",
      lifeEvent1: body.lifeEvent1 || "",
      lifeEvent2: body.lifeEvent2 || null,
      lifeEvent3: body.lifeEvent3 || null,
      email: body.email || "",
      socialHandle: body.socialHandle || "",
      interestArea: body.interestArea || "",
      siblings: body.siblings || null,
      physical: body.physical || null,
      mbti: body.mbti || null,
      anythingElse: body.anythingElse || null,
    };

    // Console log (always works as backup)
    console.log("═══════════════════════════════════════");
    console.log("📥 NEW KISMET FORM SUBMISSION");
    console.log("═══════════════════════════════════════");
    console.log("Date:", submission.submittedAt);
    console.log("Email:", submission.email);
    console.log("Social:", submission.socialHandle);
    console.log("Interest:", submission.interestArea);
    console.log("---");
    console.log("DOB:", submission.birthDate, "| City:", submission.birthCity);
    console.log("Time:", submission.birthTimeAccuracy, "| Exact:", submission.exactBirthTime || "n/a");
    console.log("Gender:", submission.gender);
    console.log("---");
    console.log("Event:", (submission.lifeEvent1 as string).substring(0, 100) + "...");
    console.log("MBTI:", submission.mbti || "n/a");
    console.log("═══════════════════════════════════════\n");

    if (hasDb()) {
      await ensureTable();
      const p = getPool();
      await p.query(
        `INSERT INTO submissions (
          submitted_at, birth_date, birth_city, birth_time_accuracy,
          exact_birth_time, part_of_day, gender,
          life_event1, life_event2, life_event3,
          email, social_handle, interest_area,
          siblings, physical, mbti, anything_else
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10,
          $11, $12, $13,
          $14, $15, $16, $17
        )`,
        [
          submission.submittedAt, submission.birthDate, submission.birthCity, submission.birthTimeAccuracy,
          submission.exactBirthTime, submission.partOfDay, submission.gender,
          submission.lifeEvent1, submission.lifeEvent2, submission.lifeEvent3,
          submission.email, submission.socialHandle, submission.interestArea,
          submission.siblings, submission.physical, submission.mbti, submission.anythingElse,
        ]
      );
      console.log("✓ Saved to Supabase PostgreSQL");
    } else {
      // Fallback to in-memory
      memoryStore.push(submission);
      console.log("⚠ Saved to memory only (no POSTGRES_URL)");
    }

    return NextResponse.json({ success: true, submission });
  } catch (err) {
    console.error("❌ Form submission error:", err);
    return NextResponse.json(
      { error: "Failed to process submission. Please try again." },
      { status: 500 }
    );
  }
}

// ── GET — view submissions (protected by key for MVP) ──
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");

    if (key !== "kismet-admin-2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let submissions: Record<string, unknown>[] = [];
    let storage = "memory";

    if (hasDb()) {
      await ensureTable();
      const p = getPool();
      const result = await p.query(
        `SELECT * FROM submissions ORDER BY submitted_at DESC LIMIT 50`
      );
      submissions = result.rows.map((row) => ({
        submittedAt: row.submitted_at,
        birthDate: row.birth_date,
        birthCity: row.birth_city,
        birthTimeAccuracy: row.birth_time_accuracy,
        exactBirthTime: row.exact_birth_time,
        partOfDay: row.part_of_day,
        gender: row.gender,
        lifeEvent1: row.life_event1,
        lifeEvent2: row.life_event2,
        lifeEvent3: row.life_event3,
        email: row.email,
        socialHandle: row.social_handle,
        interestArea: row.interest_area,
        siblings: row.siblings,
        physical: row.physical,
        mbti: row.mbti,
        anythingElse: row.anything_else,
      }));
      storage = "supabase";
    } else {
      // Fallback to in-memory
      submissions = [...memoryStore].reverse().slice(0, 50);
    }

    // Get total count
    let total = submissions.length;
    if (hasDb()) {
      const result = await getPool().query(`SELECT COUNT(*) FROM submissions`);
      total = parseInt(result.rows[0].count, 10);
    }

    return NextResponse.json({ total, submissions, storage });
  } catch (err) {
    console.error("Error reading submissions:", err);
    // Fall back to in-memory on error
    const recent = [...memoryStore].reverse().slice(0, 50);
    return NextResponse.json({
      total: memoryStore.length,
      submissions: recent,
      storage: "memory",
    });
  }
}
