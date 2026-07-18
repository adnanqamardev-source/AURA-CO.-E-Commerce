import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Recursively purges undefined and function fields from any object or array
 * to ensure compatibility with Firestore.
 */
export function sanitizeFirestoreData(data: any): any {
  if (data === null) {
    return null;
  }
  if (data === undefined) {
    return undefined;
  }
  if (typeof data === "function") {
    return undefined;
  }
  if (Array.isArray(data)) {
    return data
      .map(item => sanitizeFirestoreData(item))
      .filter(item => item !== undefined);
  }
  if (data instanceof Date) {
    return data.toISOString();
  }
  if (typeof data === "object") {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      const val = data[key];
      const cleanedVal = sanitizeFirestoreData(val);
      if (cleanedVal !== undefined) {
        cleaned[key] = cleanedVal;
      }
    }
    return cleaned;
  }
  return data;
}

