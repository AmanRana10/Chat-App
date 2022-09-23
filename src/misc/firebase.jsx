import firebase from 'firebase/app';
import 'firebase/auth'
import 'firebase/database';
import 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCYjNi-ndsk0CijIfXuz66ou67vULBFaNw',
  authDomain: 'chat-app-a72ed.firebaseapp.com',
  projectId: 'chat-app-a72ed',
  storageBucket: 'chat-app-a72ed.appspot.com',
  messagingSenderId: '858599470362',
  appId: '1:858599470362:web:55c7eea42826cd6210e8a3',
};

const app = firebase.initializeApp(firebaseConfig);
export const auth = app.auth();
export const database = app.database();
export const storage = app.storage();