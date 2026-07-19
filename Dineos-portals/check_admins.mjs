import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAVGGggNNGq4zUsulCNx2wsz1CAlg55i4s",
  authDomain: "dineos-123.firebaseapp.com",
  databaseURL: "https://dineos-123-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dineos-123",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function checkAdmins() {
  const snapshot = await get(ref(db, 'admin_users'));
  const employeesSnap = await get(ref(db, 'employee'));
  
  if (snapshot.exists()) {
    console.log("Admin Users in RTDB:");
    const admins = snapshot.val();
    const emps = employeesSnap.val() || {};
    
    for (const uid in admins) {
      console.log(`\nAdmin UID: ${uid}`);
      console.log(`Email: ${admins[uid].email}`);
      console.log(`Has Employees? ${!!emps[uid]}`);
    }
  } else {
    console.log("No admin users found in RTDB.");
  }
  process.exit(0);
}

checkAdmins().catch(console.error);
