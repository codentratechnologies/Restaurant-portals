import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAVGGggNNGq4zUsulCNx2wsz1CAlg55i4s",
  authDomain: "dineos-123.firebaseapp.com",
  databaseURL: "https://dineos-123-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dineos-123"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const rtdb = getDatabase(app);

async function run() {
  await signInWithEmailAndPassword(auth, 'codentratechnologies@gmail.com', 'codentra@123');
  const snap = await get(ref(rtdb, 'employee/IjrrNmUTrlSP2qsK47DcCLNZSI22/BR003'));
  console.log(JSON.stringify(snap.val(), null, 2));
  process.exit(0);
}

run();
