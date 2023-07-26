import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyA7GarDkM5vEpWvusPXvaYEetdLJMU-Y78",
    authDomain: "weplaytogether-dev-394006.firebaseapp.com",
    projectId: "weplaytogether-dev-394006",
    storageBucket: "weplaytogether-dev-394006.appspot.com",
    messagingSenderId: "379209137395",
    appId: "1:379209137395:web:d8c84265498363f8204b86",
    measurementId: "G-6ZDC7C9V0Y"
};

firebase.initializeApp(firebaseConfig); //initialize firebase app 
module.exports = { firebase }; //export the app