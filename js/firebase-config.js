/* ==========================================
   FlameMatch - Firebase Configuration
   ========================================== */

// Firebase configuration - CREDENZIALI REALI
const firebaseConfig = {
    apiKey: "AIzaSyAlfAWchgu9DrRwm84_Xyvq-EvRPDNtsfA",
    authDomain: "flamematch-abfe1.firebaseapp.com",
    projectId: "flamematch-abfe1",
    storageBucket: "flamematch-abfe1.firebasestorage.app",
    messagingSenderId: "972526979658",
    appId: "1:972526979658:web:63489121df65259552b4b3",
    measurementId: "G-0L4GWQX85H"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Imposta persistenza LOCAL per mantenere il login
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
        console.log('🔐 Persistenza sessione attivata (LOCAL)');
    })
    .catch((error) => {
        console.error('Errore persistenza:', error);
    });

// Enable persistence for offline support
db.enablePersistence().catch((err) => {
    if (err.code === 'failed-precondition') {
        console.log('Multiple tabs open, persistence enabled in one tab only');
    } else if (err.code === 'unimplemented') {
        console.log('Browser doesn\'t support persistence');
    }
});

console.log('🔥 FlameMatch Firebase inizializzato');
