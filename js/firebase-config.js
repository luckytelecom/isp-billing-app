// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA06NK1Y33rmvGHGgyk4isek5GNd7t56is",
  authDomain: "isp-billing-app-a4ce9.firebaseapp.com",
  projectId: "isp-billing-app-a4ce9",
  storageBucket: "isp-billing-app-a4ce9.firebasestorage.app",
  messagingSenderId: "331467133325",
  appId: "1:331467133325:web:289aabb566b27358bd2dc4",
  measurementId: "G-5CPGLRJ8QK"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Export Firebase services
window.auth = auth;

window.db = db;

