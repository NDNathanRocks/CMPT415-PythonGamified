// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics"
import { getAuth } from "firebase/auth"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY + "",
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN + "",
//   databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL + "",
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID + "",
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET + "",
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID + "",
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID + "",
//   measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID + ""
// };

const firebaseConfig = {
  apiKey: "AIzaSyCZHelNd3y56AWo6Vr0rqV5ySqMeTsX1ro",
  authDomain: "cmpt415-gamification-python.firebaseapp.com",
  projectId: "cmpt415-gamification-python",
  storageBucket: "cmpt415-gamification-python.appspot.com",
  messagingSenderId: "483635001897",
  appId: "1:483635001897:web:42d28a3534a24d0da8fa38",
  measurementId: "G-6CX378KB9K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)


let analytics;

// Initialize databases
const db = getFirestore(app)

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app)

// //Email login
// export const signupEmail = (email, password) => {
//   return createUserWithEmailAndPassword(auth, email, password);
// };

// //Email sign up
// export const loginEmail = (email, password) => {
//   return signInWithEmailAndPassword(auth, email, password);
// };

if (app.name && typeof window !== 'undefined') {
  analytics = getAnalytics(app)
}

module.exports.auth = auth
module.exports.db = db