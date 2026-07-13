const firebaseConfig = {
  apiKey: "AIzaSyC_0RfbPhYfU44zOtwT_8xCviKem25LYgg",
  authDomain: "escala-audio.firebaseapp.com",
  projectId: "escala-audio",
  storageBucket: "escala-audio.firebasestorage.app",
  messagingSenderId: "213044166301",
  appId: "1:213044166301:web:9569b66b9f46ba958b9e74"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();