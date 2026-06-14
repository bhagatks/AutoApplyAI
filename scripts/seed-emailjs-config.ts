/**
 * Seed appConfig/emailJs for client-side support report delivery.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json \
 *   EMAILJS_SERVICE_ID=service_xxx \
 *   EMAILJS_TEMPLATE_ID=template_xxx \
 *   EMAILJS_PUBLIC_KEY=your_public_key \
 *   npx tsx scripts/seed-emailjs-config.ts
 */
import { readFileSync } from 'node:fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.VITE_FIREBASE_PROJECT_ID ||
  'autoapplyai-3e61d';

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  if (credentialsPath) {
    const serviceAccount = JSON.parse(readFileSync(credentialsPath, 'utf8'));
    return initializeApp({ credential: cert(serviceAccount), projectId });
  }
  return initializeApp({ projectId });
}

async function main() {
  const serviceId = process.env.EMAILJS_SERVICE_ID?.trim();
  const templateId = process.env.EMAILJS_TEMPLATE_ID?.trim();
  const publicKey = process.env.EMAILJS_PUBLIC_KEY?.trim();

  const supportEmail = process.env.SUPPORT_EMAIL?.trim();

  if (!serviceId || !templateId || !publicKey) {
    throw new Error('Set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, and EMAILJS_PUBLIC_KEY.');
  }

  const db = getFirestore(getAdminApp());
  await db.doc('appConfig/emailJs').set(
    {
      ...(supportEmail ? { email: supportEmail } : {}),
      serviceId,
      templateId,
      publicKey,
      status: true,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  console.log(`Seeded appConfig/emailJs on project ${projectId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
