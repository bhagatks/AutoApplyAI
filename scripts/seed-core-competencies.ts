/**
 * One-time seed for the global coreCompetencies/ Firestore collection.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json \
 *   FIREBASE_PROJECT_ID=autoapplyai-3e61d \
 *   npm run seed:competencies
 */
import { readFileSync } from 'node:fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { SEED_CORE_COMPETENCIES } from '../src/shared/core-competencies-seed';
import { slugifyCompetencyTitle } from '../src/shared/competency-catalog';

const projectId =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.VITE_FIREBASE_PROJECT_ID ||
  process.env.GCLOUD_PROJECT;

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!projectId) {
  console.error('Set FIREBASE_PROJECT_ID or VITE_FIREBASE_PROJECT_ID');
  process.exit(1);
}

function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  if (credentialsPath) {
    const serviceAccount = JSON.parse(readFileSync(credentialsPath, 'utf8'));
    return initializeApp({
      credential: cert(serviceAccount),
      projectId,
    });
  }

  return initializeApp({ projectId });
}

async function main() {
  const db = getFirestore(getAdminApp());
  const now = new Date().toISOString();
  const BATCH_SIZE = 450;
  let batch = db.batch();
  let batchCount = 0;
  let total = 0;

  for (const seed of SEED_CORE_COMPETENCIES) {
    const id = slugifyCompetencyTitle(seed.title);
    const ref = db.collection('coreCompetencies').doc(id);
    batch.set(
      ref,
      {
        title: seed.title,
        category: seed.category,
        createdAt: now,
      },
      { merge: true }
    );
    batchCount++;
    total++;

    if (batchCount >= BATCH_SIZE) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`Seeded ${total} documents into coreCompetencies/ (project: ${projectId})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
