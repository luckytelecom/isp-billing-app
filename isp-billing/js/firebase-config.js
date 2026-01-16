// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyYourAPIKeyHere",
    authDomain: "isp-billing-app-a4ce9.firebaseapp.com",
    projectId: "isp-billing-app-a4ce9",
    storageBucket: "isp-billing-app-a4ce9.appspot.com",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Export Firebase services
window.auth = auth;
window.db = db;