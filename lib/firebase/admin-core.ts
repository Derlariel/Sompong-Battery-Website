import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const appName = "sompong-battery-server";

export function isFirebaseAdminConfigured() {
  return Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
}

export function getFirebaseAdminApp(): App {
  if (!isFirebaseAdminConfigured()) throw new Error("Firebase Admin environment variables are incomplete.");
  const existing = getApps().find(app => app.name === appName);
  if (existing) return getApp(appName);
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  }, appName);
}

export function firebaseAdminAuth() { return getAuth(getFirebaseAdminApp()); }
export function firestore() { return getFirestore(getFirebaseAdminApp()); }
