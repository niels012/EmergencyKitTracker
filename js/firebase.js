const firebaseConfig = {
  apiKey: "AIzaSyAaIEEIALUnT35JHU8pm9kvAr4A67qnJDw",
  authDomain: "emrg-kit.firebaseapp.com",
  projectId: "emrg-kit",
  storageBucket: "emrg-kit.firebasestorage.app",
  messagingSenderId: "878308250393",
  appId: "1:878308250393:web:6addfc35c619c0609d6b88"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();