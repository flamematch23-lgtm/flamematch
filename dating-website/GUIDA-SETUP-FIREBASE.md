# 🔥 Guida Completa: Configurare Firebase per FlameMatch

Questa guida ti accompagnerà passo passo nella configurazione di Firebase per rendere FlameMatch completamente funzionante con utenti reali.

---

## 📋 Indice

1. [Creare un Progetto Firebase](#1-creare-un-progetto-firebase)
2. [Configurare l'Autenticazione](#2-configurare-lautenticazione)
3. [Configurare Firestore Database](#3-configurare-firestore-database)
4. [Configurare Storage](#4-configurare-storage)
5. [Ottenere le Credenziali](#5-ottenere-le-credenziali)
6. [Configurare le Regole di Sicurezza](#6-configurare-le-regole-di-sicurezza)
7. [Test del Sistema](#7-test-del-sistema)
8. [Andare in Produzione](#8-andare-in-produzione)

---

## 1. Creare un Progetto Firebase

### Passo 1: Accedi a Firebase Console
1. Vai su [console.firebase.google.com](https://console.firebase.google.com/)
2. Accedi con il tuo account Google

### Passo 2: Crea un Nuovo Progetto
1. Clicca su **"Aggiungi progetto"**
2. Nome del progetto: `flamematch` (o il nome che preferisci)
3. Abilita Google Analytics (consigliato)
4. Seleziona o crea un account Analytics
5. Clicca **"Crea progetto"**

⏳ Attendi che il progetto venga creato (circa 30 secondi)

---

## 2. Configurare l'Autenticazione

### Passo 1: Vai su Authentication
1. Nel menu laterale, clicca su **"Build"** → **"Authentication"**
2. Clicca **"Inizia"**

### Passo 2: Abilita i Provider di Accesso

#### Email/Password
1. Clicca su **"Email/Password"**
2. Abilita **"Email/Password"**
3. Abilita anche **"Link email (accesso senza password)"** (opzionale)
4. Clicca **"Salva"**

#### Google
1. Clicca su **"Google"**
2. Abilita il provider
3. Inserisci il nome pubblico del progetto: `FlameMatch`
4. Inserisci la tua email come email di supporto
5. Clicca **"Salva"**

#### Facebook (Opzionale)
1. Clicca su **"Facebook"**
2. Abilita il provider
3. Vai su [developers.facebook.com](https://developers.facebook.com) e crea un'app
4. Copia App ID e App Secret da Facebook
5. Incollali in Firebase
6. Copia l'URI di reindirizzamento OAuth da Firebase e aggiungilo su Facebook
7. Clicca **"Salva"**

#### Apple (Opzionale - per iOS)
1. Clicca su **"Apple"**
2. Segui le istruzioni per configurare Sign in with Apple

---

## 3. Configurare Firestore Database

### Passo 1: Crea il Database
1. Nel menu laterale, clicca su **"Build"** → **"Firestore Database"**
2. Clicca **"Crea database"**
3. Seleziona la modalità:
   - **Modalità produzione** (consigliata per andare live)
4. Seleziona la posizione del server:
   - `europe-west1` (Belgio) - consigliato per l'Italia
5. Clicca **"Attiva"**

### Passo 2: Struttura delle Collezioni

Il backend creerà automaticamente queste collezioni:

```
📁 users/
   └── {userId}/
       ├── email
       ├── name
       ├── age
       ├── gender
       ├── bio
       ├── photos[]
       ├── location
       ├── likes[]
       ├── dislikes[]
       ├── matches[]
       ├── settings{}
       ├── isPremium
       ├── isVerified
       ├── createdAt
       └── lastActive

📁 matches/
   └── {matchId}/
       ├── users[]
       ├── createdAt
       ├── lastMessage
       └── lastMessageTime

📁 messages/
   └── {messageId}/
       ├── matchId
       ├── from
       ├── text
       ├── type
       ├── timestamp
       └── read

📁 swipes/
   └── {swipeId}/
       ├── from
       ├── to
       ├── type
       └── timestamp

📁 reports/
   └── {reportId}/
       ├── reporter
       ├── reported
       ├── reason
       ├── details
       ├── status
       └── createdAt

📁 notifications/
   └── {notificationId}/
       ├── userId
       ├── type
       ├── message
       ├── read
       └── createdAt
```

---

## 4. Configurare Storage

### Passo 1: Attiva Storage
1. Nel menu laterale, clicca su **"Build"** → **"Storage"**
2. Clicca **"Inizia"**
3. Seleziona la modalità:
   - **Modalità produzione**
4. Seleziona la stessa posizione del Firestore
5. Clicca **"Fine"**

### Passo 2: Struttura delle Cartelle

Lo storage avrà questa struttura:
```
📁 users/
   └── {userId}/
       └── photos/
           ├── photo_0
           ├── photo_1
           └── ...

📁 chats/
   └── {matchId}/
       └── {timestamp}_image
```

---

## 5. Ottenere le Credenziali

### Passo 1: Registra un'App Web
1. Vai su **Impostazioni progetto** (⚙️ in alto a sinistra)
2. Scorri fino a **"Le tue app"**
3. Clicca sull'icona **Web** (`</>`)
4. Nome app: `FlameMatch Web`
5. ✅ Abilita **"Configura anche Firebase Hosting"** (opzionale)
6. Clicca **"Registra app"**

### Passo 2: Copia le Credenziali
Vedrai un codice simile a questo:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD.....................",
  authDomain: "flamematch-xxxxx.firebaseapp.com",
  projectId: "flamematch-xxxxx",
  storageBucket: "flamematch-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

### Passo 3: Inserisci le Credenziali nel Progetto
1. Apri il file `js/firebase-config.js`
2. Sostituisci i valori placeholder con le tue credenziali:

```javascript
const firebaseConfig = {
    apiKey: "LA_TUA_API_KEY",
    authDomain: "IL_TUO_PROGETTO.firebaseapp.com",
    projectId: "IL_TUO_PROJECT_ID",
    storageBucket: "IL_TUO_PROGETTO.appspot.com",
    messagingSenderId: "IL_TUO_SENDER_ID",
    appId: "IL_TUO_APP_ID"
};
```

---

## 6. Configurare le Regole di Sicurezza

### Regole Firestore

Vai su **Firestore Database** → **Regole** e incolla:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Funzione helper: utente autenticato
    function isAuth() {
      return request.auth != null;
    }
    
    // Funzione helper: proprietario del documento
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // UTENTI
    match /users/{userId} {
      // Chiunque autenticato può leggere i profili pubblici
      allow read: if isAuth();
      
      // Solo il proprietario può creare/modificare il proprio profilo
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);
      allow delete: if isOwner(userId);
    }
    
    // MATCHES
    match /matches/{matchId} {
      // Solo i partecipanti possono leggere
      allow read: if isAuth() && 
        request.auth.uid in resource.data.users;
      
      // Creazione match tramite backend
      allow create: if isAuth();
      
      // Solo i partecipanti possono aggiornare
      allow update: if isAuth() && 
        request.auth.uid in resource.data.users;
      
      // Solo i partecipanti possono eliminare
      allow delete: if isAuth() && 
        request.auth.uid in resource.data.users;
    }
    
    // MESSAGGI
    match /messages/{messageId} {
      // Solo i partecipanti del match possono leggere
      allow read: if isAuth();
      
      // Solo utenti autenticati possono inviare
      allow create: if isAuth() && 
        request.resource.data.from == request.auth.uid;
      
      // Solo il mittente può modificare
      allow update: if isAuth() && 
        resource.data.from == request.auth.uid;
      
      // Solo il mittente può eliminare
      allow delete: if isAuth() && 
        resource.data.from == request.auth.uid;
    }
    
    // SWIPES
    match /swipes/{swipeId} {
      allow read: if isAuth() && 
        resource.data.from == request.auth.uid;
      allow create: if isAuth() && 
        request.resource.data.from == request.auth.uid;
    }
    
    // SEGNALAZIONI
    match /reports/{reportId} {
      allow create: if isAuth();
      allow read: if false; // Solo admin
    }
    
    // NOTIFICHE
    match /notifications/{notificationId} {
      allow read: if isAuth() && 
        resource.data.userId == request.auth.uid;
      allow update: if isAuth() && 
        resource.data.userId == request.auth.uid;
      allow create: if isAuth();
    }
    
    // TRANSAZIONI
    match /transactions/{transactionId} {
      allow read: if isAuth() && 
        resource.data.userId == request.auth.uid;
    }
    
    // ANALYTICS (solo scrittura)
    match /analytics/{docId} {
      allow create: if isAuth();
    }
  }
}
```

Clicca **"Pubblica"**

### Regole Storage

Vai su **Storage** → **Regole** e incolla:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Foto profilo utenti
    match /users/{userId}/photos/{photo} {
      // Chiunque autenticato può vedere le foto
      allow read: if request.auth != null;
      
      // Solo il proprietario può caricare/eliminare
      allow write: if request.auth != null && 
        request.auth.uid == userId &&
        request.resource.size < 10 * 1024 * 1024 && // Max 10MB
        request.resource.contentType.matches('image/.*');
    }
    
    // Immagini chat
    match /chats/{matchId}/{image} {
      // Tutti gli autenticati possono leggere
      allow read: if request.auth != null;
      
      // Solo utenti autenticati possono caricare
      allow write: if request.auth != null &&
        request.resource.size < 5 * 1024 * 1024 && // Max 5MB
        request.resource.contentType.matches('image/.*');
    }
  }
}
```

Clicca **"Pubblica"**

---

## 7. Test del Sistema

### Passo 1: Aggiungi Firebase SDK alle Pagine HTML

Aggiungi questi script **prima** dei tuoi script personalizzati in `index.html` e `app.html`:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-storage-compat.js"></script>

<!-- FlameMatch Backend -->
<script src="js/firebase-config.js"></script>
<script src="js/backend.js"></script>
```

### Passo 2: Testa l'Autenticazione

1. Apri la console del browser (F12)
2. Prova a registrarti:

```javascript
// Registrazione
const result = await FlameAuth.signUp('test@email.com', 'password123', {
    name: 'Test User',
    age: 25,
    gender: 'male'
});
console.log(result);
```

### Passo 3: Testa il Database

```javascript
// Carica profili
const profiles = await FlameUsers.getProfilesToSwipe(FlameAuth.currentUser);
console.log(profiles);
```

---

## 8. Andare in Produzione

### Checklist Pre-Lancio

- [ ] Credenziali Firebase inserite correttamente
- [ ] Regole di sicurezza configurate
- [ ] Domini autorizzati in Authentication
- [ ] Privacy Policy e Termini di Servizio aggiornati
- [ ] Test completo di tutte le funzionalità
- [ ] Backup automatici Firestore abilitati

### Autorizza il Tuo Dominio

1. Vai su **Authentication** → **Settings** → **Domini autorizzati**
2. Clicca **"Aggiungi dominio"**
3. Inserisci il tuo dominio (es. `flamematch.it`, `www.flamematch.it`)
4. Se usi Netlify: `tuo-sito.netlify.app`

### Attiva i Backup

1. Vai su **Firestore Database** → **Backup**
2. Configura backup giornalieri automatici

### Monitoring

1. Vai su **Firebase Console** → **Analytics** per vedere le statistiche
2. Usa **Performance Monitoring** per monitorare le prestazioni
3. Configura **Crashlytics** per tracciare gli errori

---

## 💰 Costi Firebase

### Piano Gratuito (Spark)
- ✅ 1GB Storage
- ✅ 50k letture/giorno Firestore
- ✅ 20k scritture/giorno Firestore
- ✅ 10k autenticazioni/mese
- ✅ Perfetto per iniziare!

### Piano a Consumo (Blaze)
- 💳 Paga solo quello che usi
- 📈 Scala automaticamente
- 🎁 Include ancora il tier gratuito

**Consiglio:** Inizia con il piano gratuito. Passa a Blaze quando raggiungi i limiti.

---

## 🆘 Risoluzione Problemi

### Errore: "Firebase not defined"
→ Controlla che gli script Firebase siano caricati prima di `backend.js`

### Errore: "Permission denied"
→ Controlla le regole di sicurezza Firestore/Storage

### Errore: "Auth domain not whitelisted"
→ Aggiungi il dominio in Authentication → Settings → Domini autorizzati

### Google Sign-In non funziona
→ Verifica che il dominio sia autorizzato e che l'OAuth consent screen sia configurato

---

## 📞 Supporto

- [Documentazione Firebase](https://firebase.google.com/docs)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
- [Firebase Community](https://firebase.google.com/community)

---

**Buona fortuna con FlameMatch! 🔥❤️**
