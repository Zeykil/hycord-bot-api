import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Inicializa lendo o arquivo service-account.json
// (Você deve baixar isso do console do Firebase)
const serviceAccount = JSON.parse(readFileSync('./service-account.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const db = admin.firestore();