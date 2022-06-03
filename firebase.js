// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCt0tUeM6_KM_4rfyV3O312e8IroGCIr3I",
  authDomain: "wordle-8a91b.firebaseapp.com",
  projectId: "wordle-8a91b",
  storageBucket: "wordle-8a91b.appspot.com",
  messagingSenderId: "991226068737",
  appId: "1:991226068737:web:671b44a40d753328a56500",
  measurementId: "G-88BCF0S0MT"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
// // export { db, firebase };
 export { firebase, db };