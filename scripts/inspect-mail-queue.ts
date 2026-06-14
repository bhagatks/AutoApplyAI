/**
 * Inspect support-report mail queue (admin SDK).
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json \
 *   npm run inspect:mail
 *
 * Optional: FIRESTORE_ENV=prod (default dev) — queries prod/v1/mail vs dev/v1/mail.
 */
import { readFileSync } from 'node:fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

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

function getMailCollectionPath(): string {
  const env = (process.env.FIRESTORE_ENV || 'dev').toLowerCase();
  return env === 'prod' ? 'prod/v1/mail' : 'dev/v1/mail';
}

function firestoreMailCollection(db: Firestore) {
  const [root, version, collection] = getMailCollectionPath().split('/');
  return db.collection(root).doc(version).collection(collection);
}

async function main() {
  const db = getFirestore(getAdminApp());

  console.log(`\n=== appConfig/emailJs (project: ${projectId}) ===\n`);
  const emailJsSnap = await db.doc('appConfig/emailJs').get();
  if (!emailJsSnap.exists) {
    console.log('MISSING — support reports will fail until seeded (npm run seed:emailjs) or env fallback is set.');
  } else {
    const data = emailJsSnap.data() ?? {};
    console.log(
      JSON.stringify(
        {
          email: data.email,
          serviceId: data.serviceId,
          templateId: data.templateId,
          publicKey: typeof data.publicKey === 'string' ? `${data.publicKey.slice(0, 4)}…` : undefined,
          status: data.status,
          updatedAt: data.updatedAt,
        },
        null,
        2
      )
    );
  }

  console.log(`\n=== appConfig/supportEmail (legacy fallback, project: ${projectId}) ===\n`);
  const cfgSnap = await db.doc('appConfig/supportEmail').get();
  if (!cfgSnap.exists) {
    console.log('Not present — OK if appConfig/emailJs.email is set.');
  } else {
    console.log(JSON.stringify(cfgSnap.data(), null, 2));
  }

  const mailPath = getMailCollectionPath();
  console.log(`\n=== ${mailPath}/ (latest 10, FIRESTORE_ENV=${process.env.FIRESTORE_ENV || 'dev'}) ===\n`);
  const mailSnap = await firestoreMailCollection(db).orderBy('createdAt', 'desc').limit(10).get();
  if (mailSnap.empty) {
    console.log('No documents — nothing has been queued yet.');
    return;
  }

  for (const doc of mailSnap.docs) {
    const data = doc.data();
    console.log(`--- ${doc.id} ---`);
    console.log(
      JSON.stringify(
        {
          to: data.to,
          subject: data.message?.subject,
          status: data.status,
          category: data.category,
          userId: data.userId,
          createdAt: data.createdAt,
          delivery: data.delivery ?? '(no delivery field — submit may still be in flight or failed before status sync)',
        },
        null,
        2
      )
    );
  }

  console.log(
    '\nDelivery status lives on each mail doc (status + delivery). EmailJS sends from the extension at submit time.'
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
