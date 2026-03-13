// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAaIEEIALUnT35JHU8pm9kvAr4A67qnJDw",
  authDomain: "emrg-kit.firebaseapp.com",
  projectId: "emrg-kit",
  storageBucket: "emrg-kit.firebasestorage.app",
  messagingSenderId: "878308250393",
  appId: "1:878308250393:web:6addfc35c619c0609d6b88",
  measurementId: "G-WMS90RQP58"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);