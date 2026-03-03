// firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyBw4VYLEeFeG4Z2qJC56iPzzuAzlIkmErc",
  authDomain: "ri5-5b642.firebaseapp.com",
  databaseURL: "https://ri5-5b642-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ri5-5b642",
  storageBucket: "ri5-5b642.firebasestorage.app",
  messagingSenderId: "889154598385",
  appId: "1:889154598385:web:1d4e7dad605a42c1c60050"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);