import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, update } from 'firebase/database';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envConfig = dotenv.parse(fs.readFileSync(resolve(__dirname, '.env')));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function migrate() {
  const usersRef = ref(db, 'admin_users');
  const snapshot = await get(usersRef);
  if (snapshot.exists()) {
    const data = snapshot.val();
    const updates = {};
    for (const uid in data) {
      const user = data[uid];
      if (user.name) {
        updates[`${uid}/authorized_person_name`] = user.name;
        updates[`${uid}/name`] = null; // remove old name
      }
      if (user.restaurant_name === undefined) {
        updates[`${uid}/restaurant_name`] = "";
      }
    }
    if (Object.keys(updates).length > 0) {
      console.log('Applying updates:', updates);
      await update(usersRef, updates);
      console.log('Migration successful.');
    } else {
      console.log('No updates needed.');
    }
  } else {
    console.log('No admin_users found.');
  }
  process.exit(0);
}

migrate().catch(console.error);
