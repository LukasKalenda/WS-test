// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAnmXIWRhHieEa2SSzWA75RfxGlZFojRz0",
  authDomain: "lukasweb-cb74f.firebaseapp.com",
  projectId: "lukasweb-cb74f",
  storageBucket: "lukasweb-cb74f.appspot.com",
  messagingSenderId: "895181121596",
  appId: "1:895181121596:web:1ed2a0bde3f08a5bebfb39",
  measurementId: "G-VS1B72MGQQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };