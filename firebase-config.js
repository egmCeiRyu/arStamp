// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAM88d_Qu-_FFDf-NF7Ckk0eYYYKAZA3pU",
  authDomain: "stamp-edfc5.firebaseapp.com",
  projectId: "stamp-edfc5",
  storageBucket: "stamp-edfc5.firebasestorage.app",
  messagingSenderId: "522739532414",
  appId: "1:522739532414:web:047e4168251b5542ce8e2f",
  measurementId: "G-2EVLH3GZNS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);