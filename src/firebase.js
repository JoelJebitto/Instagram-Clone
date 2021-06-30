import firebase from "firebase";

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyCeYYsatSH8sqlDV_n-dbzbCDOG6-7ULs0",
    authDomain: "instagram-clone-react-7d3da.firebaseapp.com",
    projectId: "instagram-clone-react-7d3da",
    storageBucket: "instagram-clone-react-7d3da.appspot.com",
    messagingSenderId: "122592695359",
    appId: "1:122592695359:web:9bcb9c7242d20a6706948a",
    measurementId: "G-HMRFDVNH9T"
})

const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage()


export {db, storage, auth};