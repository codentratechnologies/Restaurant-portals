import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';
import fs from 'fs';

const firebaseConfig = {
  apiKey: "AIzaSyAVGGggNNGq4zUsulCNx2wsz1CAlg55i4s",
  authDomain: "dineos-123.firebaseapp.com",
  databaseURL: "https://dineos-123-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dineos-123",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function extract() {
  const snapshot = await get(ref(db, 'employee'));
  if (!snapshot.exists()) return;

  const data = snapshot.val();
  const usersForAuth = [];
  
  // To avoid duplicate emails in Auth, keep a Set
  const emailsSeen = new Set();

  for (const adminUid in data) {
    const branches = data[adminUid];
    if (typeof branches === 'object') {
      for (const branchCode in branches) {
        const employees = branches[branchCode];
        if (typeof employees === 'object') {
          for (const empUid in employees) {
            const emp = employees[empUid];
            if (emp.email && emp.password) {
              const email = emp.email.toLowerCase();
              if (!emailsSeen.has(email)) {
                emailsSeen.add(email);
                
                // Convert HEX string to Base64 for Firebase Auth Import
                const base64Hash = Buffer.from(emp.password, 'hex').toString('base64');
                
                usersForAuth.push({
                  localId: empUid, // Use their existing RTDB ID
                  email: email,
                  displayName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
                  passwordHash: base64Hash
                });
              }
            }
          }
        }
      }
    }
  }

  // Format exactly how Firebase CLI expects it
  const exportFormat = {
    users: usersForAuth
  };

  fs.writeFileSync('users_for_firebase_auth.json', JSON.stringify(exportFormat, null, 2));
  console.log(`Saved ${usersForAuth.length} unique users to users_for_firebase_auth.json!`);
  process.exit(0);
}

extract().catch(console.error);
