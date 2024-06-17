// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD2KZR144BAB6mcubkjwingG7CVcgHQXa0",
  authDomain: "visofrontendtask.firebaseapp.com",
  projectId: "visofrontendtask",
  storageBucket: "visofrontendtask.appspot.com",
  messagingSenderId: "1069241187230",
  appId: "1:1069241187230:web:e97506c530ce50cf52348f",
  measurementId: "G-0TQ0WM1J3G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };