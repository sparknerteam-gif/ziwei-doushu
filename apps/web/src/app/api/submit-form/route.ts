import { NextResponse } from "next/server";
import { put, list, del } from "@vercel/blob";

// ── Storage ──
// Primary: In-memory (fast, always works while instance is warm)
// Persistent: Vercel Blob (survives cold starts — requires BLOB_READ_WRITE_TOKEN env var)
// Fallback: localStorage on the client (set by form page on successful submit)

const BLOB_PREFIX = "kismet-submissions/";
const BLOB_KEY = "kismet-submissions/data.json";

const memoryStore: Record<string, unknown>[] = [];

// ── Blob helpers ──

function hasBlob(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

async function readFromBlob(): Promise<Record<string, unknown>[]> {
  if (!hasBlob()) return [];
  try {
    const { blobs } = await list({ prefix: BLOB_PREFIX });
    if (blobs.length === 0) return [];
    // Find the latest data blob
    const dataBlob = blobs
      .filter((b) => b.pathname.endsWith(".json"))
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())[0];
    if (!dataBlob) return [];
    const res = await fetch(dataBlob.url);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeToBlob(submissions: Record<string, unknown>[]): Promise<void> {
  if (!hasBlob()) return;
  try {
    // Clean up old blobs (keep storage tidy)
    const { blobs } = await list({ prefix: BLOB_PREFIX });
    if (blobs.length > 5) {
      // Delete oldest blobs, keep the 5 most recent
      const toDelete = blobs
        .sort((a, b) => a.uploadedAt.getTime() - b.uploadedAt.getTime())
        .slice(0, blobs.length - 5);
      await Promise.all(toDelete.map((b) => del(b.url)));
    }
    // Write new blob with timestamp to avoid collisions
    const key = `kismet-submissions/data-${Date.now()}.json`;
    await put(key, JSON.stringify(submissions), {
      access: "private",
      contentType: "application/json",
    });
    console.log(`✓ Blob saved: ${key} (${submissions.length} submissions)`);
  } catch (err) {
    console.error("✗ Blob write failed:", err);
  }
}

// ── Cold-start recovery ──
// Called once per instance lifecycle — restores from Blob into memory
let restorePromise: Promise<void> | null = null;

async function restoreFromBlob(): Promise<void> {
  if (memoryStore.length > 0) return; // Already have data
  if (restorePromise) return restorePromise; // Already restoring

  restorePromise = (async () => {
    const blobData = await readFromBlob();
    if (blobData.length > 0) {
      memoryStore.push(...blobData);
      console.log(`✓ Restored ${blobData.length} submissions from Blob`);
    }
    restorePromise = null;
  })();

  return restorePromise;
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

    // Store in-memory (primary)
    memoryStore.push(submission);

    // Persist to Blob (async, non-blocking)
    writeToBlob(memoryStore).catch((err) =>
      console.error("Blob persist failed:", err)
    );

    // Console log (visible in Vercel Logs — always works as backup)
    console.log("═══════════════════════════════════════");
    console.log("📥 NEW KISMET FORM SUBMISSION");
    console.log("═══════════════════════════════════════");
    console.log("Date:", submission.submittedAt);
    console.log("Email:", submission.email);
    console.log("Social:", submission.socialHandle);
    console.log("Interest:", submission.interestArea);
    console.log("---");
    console.log(
      "DOB:",
      submission.birthDate,
      "| City:",
      submission.birthCity
    );
    console.log(
      "Time:",
      submission.birthTimeAccuracy,
      "| Exact:",
      submission.exactBirthTime || "n/a",
      "| Part:",
      submission.partOfDay || "n/a"
    );
    console.log("Gender:", submission.gender);
    console.log("---");
    console.log(
      "Event:",
      (submission.lifeEvent1 as string).substring(0, 100) + "..."
    );
    console.log("MBTI:", submission.mbti || "n/a");
    console.log("Siblings:", submission.siblings || "n/a");
    console.log("Physical:", submission.physical || "n/a");
    console.log("═══════════════════════════════════════\n");

    return NextResponse.json({ success: true, submission });
  } catch (err) {
    console.error("❌ Form submission error:", err);
    return NextResponse.json(
      { error: "Failed to process submission. Please try again." },
      { status: 500 }
    );
  }
}

// ── GET — view submissions (protected by simple key for MVP) ──
// Usage: /api/submit-form?key=kismet-admin-2026
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");

    if (key !== "kismet-admin-2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Restore from Blob if memory is empty (cold start)
    await restoreFromBlob();

    // Return submissions (most recent first, last 50)
    const recent = [...memoryStore].reverse().slice(0, 50);

    return NextResponse.json({
      total: memoryStore.length,
      submissions: recent,
      storage: hasBlob() ? "blob" : "memory",
    });
  } catch (err) {
    console.error("Error reading submissions:", err);
    return NextResponse.json(
      { error: "Failed to read submissions" },
      { status: 500 }
    );
  }
}
