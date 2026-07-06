// 1. Initialize Firebase App
firebase.initializeApp(firebaseConfig);

// 2. Initialize Firestore & Auth
const db = firebase.firestore();
const auth = firebase.auth();

// 3. Enable Offline Persistence (so the booking form works offline!)
db.enablePersistence()
  .then(() => console.log("Firestore offline persistence enabled"))
  .catch((err) => console.warn("Persistence failed:", err));

// 4. (Optional) Log auth state changes to the console for debugging
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("✅ Admin is logged in:", user.email);
  } else {
    console.log("👤 No admin logged in.");
  }
});