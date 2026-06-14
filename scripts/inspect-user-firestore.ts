/**
 * One-off read of a user's Firestore data (admin SDK).
 * Usage: GOOGLE_APPLICATION_CREDENTIALS=... FIREBASE_PROJECT_ID=autoapplyai-3e61d npx tsx scripts/inspect-user-firestore.ts 4dobereCQ8Xfr0cq5kzMww13uuH3
 */
import { readFileSync } from 'node:fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const userId = process.argv[2];
if (!userId) {
  console.error('Usage: npx tsx scripts/inspect-user-firestore.ts <userId>');
  process.exit(1);
}

const projectId =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.VITE_FIREBASE_PROJECT_ID ||
  process.env.GCLOUD_PROJECT;

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  if (credentialsPath) {
    const serviceAccount = JSON.parse(readFileSync(credentialsPath, 'utf8'));
    return initializeApp({ credential: cert(serviceAccount), projectId });
  }
  return initializeApp({ projectId });
}

function summarize(obj: unknown, maxLen = 120): unknown {
  if (typeof obj === 'string') {
    return obj.length > maxLen ? `${obj.slice(0, maxLen)}… (${obj.length} chars)` : obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => summarize(item, maxLen));
  }
  if (obj && typeof obj === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      out[k] = summarize(v, maxLen);
    }
    return out;
  }
  return obj;
}

async function main() {
  const db = getFirestore(getAdminApp());
  const userRef = db.collection('users').doc(userId);

  console.log(`\n=== users/${userId} ===\n`);

  const userDataSnap = await userRef.collection('userData').get();
  console.log(`userData/ (${userDataSnap.size} docs)`);
  for (const doc of userDataSnap.docs) {
    const data = doc.data();
    console.log(`\n--- userData/${doc.id} ---`);
    if (doc.id === 'userData' && data.parsedResume) {
      const { parsedResume, geminiApiKey, ...rest } = data as Record<string, unknown>;
      console.log(JSON.stringify({ ...rest, geminiApiKey: geminiApiKey ? '[REDACTED]' : undefined }, null, 2));
      const pr = parsedResume as Record<string, unknown>;
      console.log('parsedResume summary:', JSON.stringify({
        firstName: pr.firstName,
        lastName: pr.lastName,
        email: pr.email,
        role: pr.role,
        city: pr.city,
        state: pr.state,
        competencyCount: Array.isArray(pr.competencies) ? pr.competencies.length : 0,
        competencies: Array.isArray(pr.competencies) ? pr.competencies.slice(0, 8) : [],
        skillCount: Array.isArray(pr.skills) ? pr.skills.length : 0,
        skills: Array.isArray(pr.skills) ? pr.skills.slice(0, 12) : [],
        experienceCount: Array.isArray(pr.experience) ? pr.experience.length : 0,
        experienceTitles: Array.isArray(pr.experience)
          ? (pr.experience as Array<{ title?: string; company?: string }>).map((e) => `${e.title} @ ${e.company}`)
          : [],
        educationCount: Array.isArray(pr.education) ? pr.education.length : 0,
        summary: summarize(pr.summary),
      }, null, 2));
    } else if (doc.id === 'userCompetencies') {
      console.log(JSON.stringify({
        catalogRefs: data.catalogRefs,
        catalogRefCount: Array.isArray(data.catalogRefs) ? data.catalogRefs.length : 0,
        custom: data.custom,
        customCount: Array.isArray(data.custom) ? data.custom.length : 0,
        updatedAt: data.updatedAt,
      }, null, 2));
    } else if (doc.id === 'userSkills') {
      console.log(JSON.stringify({
        catalogRefs: data.catalogRefs,
        catalogRefCount: Array.isArray(data.catalogRefs) ? data.catalogRefs.length : 0,
        custom: data.custom,
        customCount: Array.isArray(data.custom) ? data.custom.length : 0,
        updatedAt: data.updatedAt,
      }, null, 2));
    } else {
      console.log(JSON.stringify(summarize(data), null, 2));
    }
  }

  const jobsSnap = await userRef.collection('jobs').orderBy('date', 'desc').limit(10).get();
  console.log(`\njobs/ (${jobsSnap.size} docs shown, max 10)`);
  for (const doc of jobsSnap.docs) {
    const data = doc.data();
    console.log(`\n--- jobs/${doc.id} ---`);
    console.log(JSON.stringify({
      resumeId: data.resumeId,
      jobTitle: data.jobTitle,
      companyName: data.companyName,
      jobUrl: data.jobUrl,
      status: data.status,
      date: data.date,
      atsScore: data.atsScore,
      keywords: data.keywords,
      summary: summarize(data.summary),
      competencies: summarize(data.competencies),
      analysis: summarize(data.analysis),
      coverLetter: summarize(data.coverLetter),
      pdfPath: data.pdfPath,
      clPdfPath: data.clPdfPath,
      error: data.error,
      jobDescription: summarize(data.jobDescription, 80),
    }, null, 2));
  }

  const resumesSnap = await userRef.collection('resumes').orderBy('createdAt', 'desc').limit(10).get();
  console.log(`\nresumes/ (${resumesSnap.size} docs shown, max 10)`);
  for (const doc of resumesSnap.docs) {
    const data = doc.data();
    console.log(`\n--- resumes/${doc.id} ---`);
    console.log(JSON.stringify({
      jobId: data.jobId,
      baseVersion: data.baseVersion,
      jobTitle: data.jobTitle,
      companyName: data.companyName,
      status: data.status,
      atsScore: data.atsScore,
      aiProvider: data.aiProvider,
      aiModel: data.aiModel,
      keywords: data.keywords,
      summary: summarize(data.summary),
      competencies: summarize(data.competencies),
      coverLetter: summarize(data.coverLetter),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }, null, 2));
  }

  const legacyCompSnap = await userRef.collection('coreCompetencies').limit(3).get();
  if (!legacyCompSnap.empty) {
    console.log(`\n⚠ legacy users/${userId}/coreCompetencies/ still has ${legacyCompSnap.size}+ docs (deprecated)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
