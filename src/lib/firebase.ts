import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  updateDoc
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import app, { auth } from '../firebase';

// Use custom databaseId if defined in config
let db: ReturnType<typeof getFirestore>;

try {
  if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    }, firebaseConfig.firestoreDatabaseId);
  } else {
    db = getFirestore(app);
  }
} catch (e) {
  db = getFirestore(app);
}

// Ensure anonymous authentication so Firestore security rules work seamlessly
export const ensureAuth = async () => {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (err) {
      console.warn('[Firebase] Anonymous sign-in warning:', err);
    }
  }
  return auth.currentUser;
};

export { app, db, auth };

/**
 * Firestore Helper Services for SynDx
 */
export const FIRESTORE_COLLECTIONS = {
  CASES: 'syndx_cases',
  ADR_SIGNALS: 'syndx_adr_signals',
  AUDIT_LOGS: 'syndx_audit_logs',
  DOCTOR_REVIEWS: 'syndx_doctor_reviews'
};

// Sync case to Firestore
export async function syncCaseToFirestore(caseData: any) {
  try {
    await ensureAuth();
    const id = caseData.id || caseData.caseId || `case-${Date.now()}`;
    const docRef = doc(db, FIRESTORE_COLLECTIONS.CASES, id);
    await setDoc(docRef, {
      ...caseData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('[Firestore] Error saving case:', err);
    return false;
  }
}

// Sync Doctor Review to Firestore
export async function syncDoctorReviewToFirestore(reviewData: any) {
  try {
    await ensureAuth();
    const id = reviewData.id || `doc-${Date.now()}`;
    const docRef = doc(db, FIRESTORE_COLLECTIONS.DOCTOR_REVIEWS, id);
    await setDoc(docRef, {
      ...reviewData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('[Firestore] Error saving doctor review:', err);
    return false;
  }
}

// Update Doctor Review Status in Firestore
export async function updateDoctorReviewInFirestore(id: string, updateData: any) {
  try {
    await ensureAuth();
    const docRef = doc(db, FIRESTORE_COLLECTIONS.DOCTOR_REVIEWS, id);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.error('[Firestore] Error updating doctor review:', err);
    return false;
  }
}

// Sync Audit Block to Firestore
export async function syncAuditBlockToFirestore(blockData: any) {
  try {
    await ensureAuth();
    const id = `block-${blockData.blockNumber || Date.now()}`;
    const docRef = doc(db, FIRESTORE_COLLECTIONS.AUDIT_LOGS, id);
    await setDoc(docRef, {
      ...blockData,
      createdAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('[Firestore] Error saving audit block:', err);
    return false;
  }
}

// Real-time listener for Doctor Reviews
export function subscribeDoctorReviews(callback: (reviews: any[]) => void) {
  ensureAuth();
  const q = query(collection(db, FIRESTORE_COLLECTIONS.DOCTOR_REVIEWS));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => doc.data());
    if (items.length > 0) {
      callback(items);
    }
  }, (error) => {
    console.warn('[Firestore] Doctor reviews subscription error:', error);
  });
}

// Real-time listener for Audit Logs
export function subscribeAuditLogs(callback: (logs: any[]) => void) {
  ensureAuth();
  const q = query(collection(db, FIRESTORE_COLLECTIONS.AUDIT_LOGS));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => doc.data());
    if (items.length > 0) {
      callback(items);
    }
  }, (error) => {
    console.warn('[Firestore] Audit logs subscription error:', error);
  });
}
