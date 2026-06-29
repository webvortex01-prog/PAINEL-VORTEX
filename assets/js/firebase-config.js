
const firebaseConfig = {
  apiKey: "AIzaSyC-3WEldLETS0VQET2d3DNzLiQQAGm-ynA",
  authDomain: "vortex-01-6cf24.firebaseapp.com",
  projectId: "vortex-01-6cf24",
  storageBucket: "vortex-01-6cf24.firebasestorage.app",
  messagingSenderId: "605504555456",
  appId: "1:605504555456:web:0ee5372dc659a6a51d6025"
};

// Inicializa o Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
// Inicializa o banco de dados (Firestore)
const db = firebase.firestore();
