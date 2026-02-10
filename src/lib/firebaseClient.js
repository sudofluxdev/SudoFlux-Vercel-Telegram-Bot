import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBUckf3rVxEIGm3gCasxHeAPVK6mF4p-8w",
    authDomain: "botsudo-77b3a.firebaseapp.com",
    projectId: "botsudo-77b3a",
    storageBucket: "botsudo-77b3a.firebasestorage.app",
    messagingSenderId: "513270521901",
    appId: "1:513270521901:web:86b817dabae501a59798a4"
};

// Check if we have the API key (which we won't during build time without env vars)
let app, auth, db, googleProvider;

if (true) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
} else {
    // Return nulls or mocks during build time to prevent "auth/invalid-api-key" error
    console.warn("⚠️ Firebase Client: API Key not found. Skipping initialization (expected during build).");
    app = null;
    auth = null;
    db = null;
    googleProvider = null;
}

export { auth, db, googleProvider };
