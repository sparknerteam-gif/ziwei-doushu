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

// ── GET — view submissions (protected by key for MVP) ──
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");

    if (key !== "kismet-admin-2026") {
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
