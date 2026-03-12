// src/firebase/admin.ts
// Firebase Admin SDK configuration

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  try {
    // Intentar cargar desde archivo JSON primero (desarrollo local)
    const serviceAccountPath = path.join(process.cwd(), 'service-account.json');

    if (fs.existsSync(serviceAccountPath)) {
      // Usar archivo JSON local
      const serviceAccount = JSON.parse(
        fs.readFileSync(serviceAccountPath, 'utf8')
      );

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: `${serviceAccount.project_id}.appspot.com`,
      });

      console.log('[Firebase Admin] Initialized with service-account.json');
    } else {
      // Usar variables de entorno (producción/Vercel)
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });

      console.log('[Firebase Admin] Initialized with environment variables');
    }
  } catch (error) {
    console.error('[Firebase Admin] Initialization error:', error);
  }
}

// Exportar instancias
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();

// Exportar el objeto auth para compatibilidad con código existente
export const auth = {
  verifyIdToken: async (token: string) => {
    try {
      return await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('[Firebase Admin] Error verifying token:', error);
      throw error;
    }
  },
  getUser: async (uid: string) => {
    try {
      return await adminAuth.getUser(uid);
    } catch (error) {
      console.error('[Firebase Admin] Error getting user:', error);
      throw error;
    }
  },
  verifySessionCookie: async (cookie: string, checkRevoked: boolean = true) => {
    try {
      return await adminAuth.verifySessionCookie(cookie, checkRevoked);
    } catch (error) {
      console.error('[Firebase Admin] Error verifying session cookie:', error);
      throw error;
    }
  },
};
