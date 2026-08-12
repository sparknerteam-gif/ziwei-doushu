import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ── Storage ──
// Primary: Supabase PostgreSQL (via REST API — persistent, survives cold starts)
// Fallback: In-memory (when Supabase env vars are not set)

const memoryStore: Record<string, unknown>[] = [];

function hasSupabase(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ── One-time table setup ──
// Call: GET /api/submit-form?key=kismet-admin-2026&action=setup
async function setupTable(): Promise<{ success: boolean; message: string }> {
  if (!hasSupabase()) {
    return { success: false, message: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set" };
  }

  const supabase = getSupabase();

  // Use Supabase's raw SQL execution via the REST API
  // The service_role key allows DDL operations
  const response = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: "return=minimal",
      },
    }
  );

  // Try inserting a test row to check if table exists, then create it
  const sql = `
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
  `;

  try {
    // Use pg extension for raw SQL — Supabase exposes this via the REST API
    const res = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        },
        body: JSON.stringify({ query: sql }),
      }
    );

    if (res.ok) {
      return { success: true, message: "Table 'submissions' is ready" };
    }

    // Fallback: create tables by inserting test rows
    const { error } = await supabase.from("submissions").insert({
      submitted_at: new Date().toISOString(),
      birth_date: "_setup_",
      birth_city: "_setup_",
      birth_time_accuracy: "_setup_",
      gender: "_setup_",
      life_event1: "_setup_",
      email: "_setup_",
      social_handle: "_setup_",
      interest_area: "_setup_",
    });

    if (error && error.message.includes("does not exist")) {
      return {
        success: false,
        message: `Table does not exist. Please run the SQL in Supabase dashboard: ${process.env.SUPABASE_URL?.replace(".supabase.co", ".supabase.com/dashboard/project/default/sql/new")}. SQL: ${sql}`,
      };
    }

    // Clean up the test row if insert succeeded
    if (!error) {
      await supabase.from("submissions").delete().eq("email", "_setup_");

      // Also create purchases table
      const { error: purchErr } = await supabase.from("purchases").insert({
        payment_id: "_setup_" + Date.now(),
        email: "_setup_@kismet.app",
        product: "_setup_",
        amount: 0,
        questions_included: 0,
        questions_used: 0,
        purchased_at: new Date().toISOString(),
      });

      if (!purchErr) {
        await supabase.from("purchases").delete().eq("email", "_setup_@kismet.app");
      }

      return {
        success: true,
        message: "Table 'submissions' ready. Purchases table: " + (purchErr ? "needs manual creation" : "ready"),
      };
    }

    return { success: false, message: `Unexpected error: ${error.message}` };
  } catch (err) {
    return { success: false, message: `Setup failed: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// ── POST — submit form data ──
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const submittedAt = body.submittedAt || new Date().toISOString();

    const submission = {
      submitted_at: submittedAt,
      birth_date: body.birthDate || "",
      birth_city: body.birthCity || "",
      birth_time_accuracy: body.birthTimeAccuracy || "",
      exact_birth_time: body.exactBirthTime || null,
      part_of_day: body.partOfDay || null,
      gender: body.gender || "",
      life_event1: body.lifeEvent1 || "",
      life_event2: body.lifeEvent2 || null,
      life_event3: body.lifeEvent3 || null,
      email: body.email || "",
      social_handle: body.socialHandle || "",
      interest_area: body.interestArea || "",
      siblings: body.siblings || null,
      physical: body.physical || null,
      mbti: body.mbti || null,
      anything_else: body.anythingElse || null,
    };

    // Console log (always works as backup)
    console.log("═══════════════════════════════════════");
    console.log("📥 NEW KISMET FORM SUBMISSION");
    console.log("═══════════════════════════════════════");
    console.log("Date:", submission.submitted_at);
    console.log("Email:", submission.email);
    console.log("Social:", submission.social_handle);
    console.log("Interest:", submission.interest_area);
    console.log("---");
    console.log("DOB:", submission.birth_date, "| City:", submission.birth_city);
    console.log("Time:", submission.birth_time_accuracy, "| Exact:", submission.exact_birth_time || "n/a");
    console.log("Gender:", submission.gender);
    console.log("---");
    console.log("Event:", (submission.life_event1 as string).substring(0, 100) + "...");
    console.log("MBTI:", submission.mbti || "n/a");
    console.log("═══════════════════════════════════════\n");

    if (hasSupabase()) {
      const supabase = getSupabase();
      const { error } = await supabase.from("submissions").insert(submission);

      if (error) {
        console.error("⚠ Supabase insert error:", error.message);
        console.error("  Full:", JSON.stringify(error));
        console.log("  → Falling back to in-memory storage");
        memoryStore.push(submission);
      } else {
        console.log("✓ Saved to Supabase PostgreSQL");
      }
    } else {
      console.log("⚠ Saved to memory only (Supabase env vars not set)");
      memoryStore.push(submission);
    }

    // Return the client-safe format
    return NextResponse.json({
      success: true,
      submission: {
        submittedAt: submission.submitted_at,
        birthDate: submission.birth_date,
        birthCity: submission.birth_city,
        birthTimeAccuracy: submission.birth_time_accuracy,
        exactBirthTime: submission.exact_birth_time,
        partOfDay: submission.part_of_day,
        gender: submission.gender,
        lifeEvent1: submission.life_event1,
        lifeEvent2: submission.life_event2,
        lifeEvent3: submission.life_event3,
        email: submission.email,
        socialHandle: submission.social_handle,
        interestArea: submission.interest_area,
        siblings: submission.siblings,
        physical: submission.physical,
        mbti: submission.mbti,
        anythingElse: submission.anything_else,
      },
    });
  } catch (err) {
    console.error("❌ Form submission error:", err);
    return NextResponse.json(
      { error: "Failed to process submission. Please try again." },
      { status: 500 }
    );
  }
}

// ── Password check ──
function checkPassword(request: Request): boolean {
  // Read from Authorization: Bearer <password>
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return false;
  const password = auth.slice(7);

  // Check against env var (must be set in Vercel)
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected) {
    console.error("DASHBOARD_PASSWORD env var is not set!");
    return false;
  }
  return password === expected;
}

// ── GET — view submissions (password-protected) ──
// Usage: GET /api/submit-form?action=list  with  Authorization: Bearer <password>
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    // ── One-time setup: create the submissions table (uses old key for compat) ──
    if (url.searchParams.get("action") === "setup") {
      const key = url.searchParams.get("key");
      if (key !== "kismet-admin-2026") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const result = await setupTable();
      return NextResponse.json(result);
    }

    // ── Feedback collection (public, no auth needed) ──
    if (url.searchParams.get("action") === "feedback") {
      const feedbackData = {
        submittedAt: url.searchParams.get("submittedAt") || new Date().toISOString(),
        chartRef: url.searchParams.get("chartRef") || "",
        claim: url.searchParams.get("claim") || "",
        chartAnchor: url.searchParams.get("chartAnchor") || "",
        clientFeedback: url.searchParams.get("clientFeedback") || "",
        readingId: url.searchParams.get("readingId") || "",
      };
      console.log("📊 FEEDBACK:", JSON.stringify(feedbackData));

      if (hasSupabase()) {
        const supabase = getSupabase();
        const { error } = await supabase.from("feedback").insert(feedbackData);
        if (error) {
          console.error("⚠ Feedback save error:", error.message);
        } else {
          console.log("✓ Feedback saved to Supabase");
        }
      }

      return NextResponse.json({ success: true, message: "Feedback received. Thank you." });
    }

    // ── List submissions (requires password) ──
    if (!checkPassword(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let submissions: Record<string, unknown>[] = [];
    let total = 0;
    let storage = "memory";

    if (hasSupabase()) {
      const supabase = getSupabase();

      // Get total count
      const { count } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true });

      if (count !== null) {
        total = count;

        // Get recent submissions
        const { data, error } = await supabase
          .from("submissions")
          .select("*")
          .order("submitted_at", { ascending: false })
          .limit(50);

        if (!error && data) {
          submissions = data.map((row: Record<string, unknown>) => ({
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
        } else if (error) {
          console.error("⚠ Supabase select error:", error.message);
        }
      }
    }

    // Fallback to in-memory if Supabase returned no results
    if (submissions.length === 0 && memoryStore.length > 0) {
      submissions = [...memoryStore].reverse().slice(0, 50);
      total = memoryStore.length;
      storage = "memory";
    }

    return NextResponse.json({ total, submissions, storage });
  } catch (err) {
    console.error("Error reading submissions:", err);
    const recent = [...memoryStore].reverse().slice(0, 50);
    return NextResponse.json({
      total: memoryStore.length,
      submissions: recent,
      storage: "memory",
    });
  }
}
