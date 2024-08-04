// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDj0QGY88ff6jVz7LoUe0h0iZbZoolZYVE",
  authDomain: "inventory-management-18847.firebaseapp.com",
  projectId: "inventory-management-18847",
  storageBucket: "inventory-management-18847.appspot.com",
  messagingSenderId: "673389972915",
  appId: "1:673389972915:web:b251745159d4d634ff0fc6",
  measurementId: "G-3LFERJZP76"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore }