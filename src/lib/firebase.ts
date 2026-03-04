import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfEmqIsmh3BTVcMSmlgGxdm4VOmBVEDV4",
  authDomain: "enter-tech-pos.firebaseapp.com",
  projectId: "enter-tech-pos",
  storageBucket: "enter-tech-pos.firebasestorage.app",
  messagingSenderId: "590016852699",
  appId: "1:590016852699:web:0e395bc3ef3df876a112fe",
  measurementId: "G-QVY1Z9CQYT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
y
