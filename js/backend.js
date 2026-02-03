/* ==========================================
   FlameMatch - Backend Completo
   Sistema di Dating con Firebase
   ========================================== */

// ==========================================
// MODULO AUTENTICAZIONE
// ==========================================

const FlameAuth = {
    
    // Stato utente corrente
    currentUser: null,
    userProfile: null,
    
    // Inizializza listener autenticazione
    init() {
        window.auth.onAuthStateChanged(async (user) => {
            if (user) {
                this.currentUser = user;
                this.userProfile = await FlameUsers.getProfile(user.uid);
                console.log('👤 Utente loggato:', user.email);
                this.onAuthChange(true);
            } else {
                this.currentUser = null;
                this.userProfile = null;
                console.log('👤 Utente non loggato');
                this.onAuthChange(false);
            }
        });
    },
    
    // Callback per cambio stato auth (da sovrascrivere)
    onAuthChange(isLoggedIn) {
        // Override this in your app
        document.dispatchEvent(new CustomEvent('authStateChanged', { 
            detail: { isLoggedIn, user: this.currentUser, profile: this.userProfile }
        }));
    },
    
    // Registrazione con email
    async signUp(email, password, userData) {
        try {
            // Crea account
            const result = await window.auth.createUserWithEmailAndPassword(email, password);
            const user = result.user;
            
            // Invia email di verifica
            await user.sendEmailVerification();
            
            // Crea profilo utente nel database
            await FlameUsers.createProfile(user.uid, {
                email: email,
                ...userData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                isVerified: false,
                isPremium: false,
                likes: [],
                dislikes: [],
                matches: [],
                settings: {
                    showMe: userData.gender === 'male' ? 'female' : 'male',
                    ageRange: { min: 18, max: 50 },
                    maxDistance: 50,
                    notifications: true
                }
            });
            
            return { success: true, user };
        } catch (error) {
            console.error('Errore registrazione:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    },
    
    // Login con email
    async signIn(email, password) {
        try {
            const result = await window.auth.signInWithEmailAndPassword(email, password);
            
            // Aggiorna ultimo accesso
            await FlameUsers.updateProfile(result.user.uid, {
                lastActive: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Errore login:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    },
    
    // Login con Google
    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('email');
            provider.addScope('profile');
            
            const result = await window.auth.signInWithPopup(provider);
            const user = result.user;
            
            // Controlla se è un nuovo utente
            if (result.additionalUserInfo.isNewUser) {
                await FlameUsers.createProfile(user.uid, {
                    email: user.email,
                    name: user.displayName || '',
                    photos: user.photoURL ? [user.photoURL] : [],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    isVerified: true,
                    isPremium: false,
                    needsOnboarding: true
                });
            } else {
                await FlameUsers.updateProfile(user.uid, {
                    lastActive: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            return { success: true, user, isNewUser: result.additionalUserInfo.isNewUser };
        } catch (error) {
            console.error('Errore Google login:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    },
    
    // Login con Facebook
    async signInWithFacebook() {
        try {
            const provider = new firebase.auth.FacebookAuthProvider();
            provider.addScope('email');
            provider.addScope('public_profile');
            
            const result = await window.auth.signInWithPopup(provider);
            const user = result.user;
            
            if (result.additionalUserInfo.isNewUser) {
                await FlameUsers.createProfile(user.uid, {
                    email: user.email,
                    name: user.displayName || '',
                    photos: user.photoURL ? [user.photoURL] : [],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    isVerified: true,
                    isPremium: false,
                    needsOnboarding: true
                });
            }
            
            return { success: true, user, isNewUser: result.additionalUserInfo.isNewUser };
        } catch (error) {
            console.error('Errore Facebook login:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    },
    
    // Logout
    async signOut() {
        try {
            if (this.currentUser) {
                await FlameUsers.updateProfile(this.currentUser.uid, {
                    lastActive: firebase.firestore.FieldValue.serverTimestamp(),
                    isOnline: false
                });
            }
            await window.auth.signOut();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // Reset password
    async resetPassword(email) {
        try {
            await window.auth.sendPasswordResetEmail(email);
            return { success: true };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    },
    
    // Aggiorna password
    async updatePassword(newPassword) {
        try {
            await this.currentUser.updatePassword(newPassword);
            return { success: true };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    },
    
    // Elimina account
    async deleteAccount() {
        try {
            const uid = this.currentUser.uid;
            
            // Elimina tutti i dati utente
            await FlameUsers.deleteAllUserData(uid);
            
            // Elimina account auth
            await this.currentUser.delete();
            
            return { success: true };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    },
    
    // Messaggi errore in italiano
    getErrorMessage(code) {
        const messages = {
            'auth/email-already-in-use': 'Questa email è già registrata',
            'auth/invalid-email': 'Email non valida',
            'auth/operation-not-allowed': 'Operazione non permessa',
            'auth/weak-password': 'La password deve avere almeno 6 caratteri',
            'auth/user-disabled': 'Account disabilitato',
            'auth/user-not-found': 'Utente non trovato',
            'auth/wrong-password': 'Password errata',
            'auth/too-many-requests': 'Troppi tentativi. Riprova più tardi',
            'auth/popup-closed-by-user': 'Login annullato',
            'auth/requires-recent-login': 'Effettua nuovamente il login'
        };
        return messages[code] || 'Errore sconosciuto';
    }
};


// ==========================================
// MODULO UTENTI E PROFILI
// ==========================================

const FlameUsers = {
    
    // Crea profilo utente
    async createProfile(uid, data) {
        console.log('📝 Creazione profilo per UID:', uid);
        try {
            console.log('🔄 Scrittura su Firestore...');
            await window.db.collection('users').doc(uid).set(data);
            console.log('✅ Profilo creato con successo!');
            return { success: true };
        } catch (error) {
            console.error('❌ Errore creazione profilo:', error.code, error.message);
            if (error.code === 'permission-denied') {
                console.error('🔒 PROBLEMA SECURITY RULES! Vai su Firebase Console → Firestore → Rules');
            }
            return { success: false, error: error.message };
        }
    },
    
    // Ottieni profilo utente
    async getProfile(uid) {
        console.log('📖 getProfile chiamato per UID:', uid);
        
        // Check if db is initialized
        if (!window.db) {
            console.error('❌ Firestore db non inizializzato!');
            return null;
        }
        console.log('✅ Firestore db OK');
        
        try {
            console.log('🔄 Creazione riferimento documento...');
            const docRef = window.db.collection('users').doc(uid);
            console.log('✅ Riferimento creato:', docRef.path);
            
            // Shorter timeout - 5 seconds
            let timeoutId;
            const timeoutPromise = new Promise((_, reject) => {
                timeoutId = setTimeout(() => {
                    console.error('⏰ TIMEOUT 5s! Firestore non risponde - possibile problema Security Rules');
                    reject(new Error('Timeout Firestore'));
                }, 5000);
            });
            
            console.log('🔄 Esecuzione query get()...');
            
            // Add .catch to query itself
            const queryPromise = docRef.get({ source: 'server' }).then(doc => {
                clearTimeout(timeoutId);
                console.log('📥 Query completata!');
                return doc;
            }).catch(err => {
                clearTimeout(timeoutId);
                console.error('❌ Errore nella query:', err.code, err.message);
                throw err;
            });
            
            console.log('⏳ In attesa risposta...');
            const doc = await Promise.race([queryPromise, timeoutPromise]);
            
            console.log('📥 Risposta ricevuta, exists:', doc.exists);
            
            if (doc.exists) {
                const data = doc.data();
                console.log('✅ Profilo trovato per:', uid, '- Nome:', data.name || 'N/A');
                return { id: doc.id, ...data };
            }
            console.log('⚠️ Profilo non esiste per UID:', uid);
            console.log('📝 Creerò un profilo di default...');
            return null;
        } catch (error) {
            console.error('❌ Errore lettura profilo:', error.message);
            // If timeout or permission error, return null so we can create profile
            return null;
        }
    },
    
    // Aggiorna profilo
    async updateProfile(uid, data) {
        try {
            await window.db.collection('users').doc(uid).update(data);
            return { success: true };
        } catch (error) {
            console.error('Errore aggiornamento profilo:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Carica foto profilo
    async uploadPhoto(uid, file, index = 0) {
        try {
            const storageRef = storage.ref(`users/${uid}/photos/photo_${index}`);
            
            // Comprimi immagine se necessario
            const compressedFile = await this.compressImage(file);
            
            // Upload
            const snapshot = await storageRef.put(compressedFile);
            const downloadURL = await snapshot.ref.getDownloadURL();
            
            // Aggiorna profilo con nuova foto
            const profile = await this.getProfile(uid);
            const photos = profile.photos || [];
            photos[index] = downloadURL;
            
            await this.updateProfile(uid, { photos });
            
            return { success: true, url: downloadURL };
        } catch (error) {
            console.error('Errore upload foto:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Comprimi immagine
    async compressImage(file, maxWidth = 1200, quality = 0.8) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    canvas.toBlob(resolve, 'image/jpeg', quality);
                };
            };
        });
    },
    
    // Elimina foto
    async deletePhoto(uid, index) {
        try {
            // Elimina da Storage
            const storageRef = storage.ref(`users/${uid}/photos/photo_${index}`);
            await storageRef.delete();
            
            // Aggiorna profilo
            const profile = await this.getProfile(uid);
            const photos = profile.photos || [];
            photos.splice(index, 1);
            
            await this.updateProfile(uid, { photos });
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // Ottieni profili per lo swipe (algoritmo di matching)
    async getProfilesToSwipe(currentUser, limit = 20) {
        try {
            const profile = await this.getProfile(currentUser.uid);
            if (!profile) return [];
            
            const settings = profile.settings || {};
            const alreadySwiped = [...(profile.likes || []), ...(profile.dislikes || [])];
            
            // Query base
            let query = window.db.collection('users')
                .where('gender', '==', settings.showMe || 'female')
                .limit(limit + alreadySwiped.length); // Prendiamo di più per filtrare
            
            const snapshot = await query.get();
            
            let profiles = [];
            snapshot.forEach(doc => {
                if (doc.id !== currentUser.uid && !alreadySwiped.includes(doc.id)) {
                    const data = doc.data();
                    // Filtra per età
                    if (data.age >= (settings.ageRange?.min || 18) && 
                        data.age <= (settings.ageRange?.max || 99)) {
                        profiles.push({ id: doc.id, ...data });
                    }
                }
            });
            
            // Ordina per ultimo accesso e limita
            profiles.sort((a, b) => {
                const aTime = a.lastActive?.toMillis() || 0;
                const bTime = b.lastActive?.toMillis() || 0;
                return bTime - aTime;
            });
            
            return profiles.slice(0, limit);
        } catch (error) {
            console.error('Errore caricamento profili:', error);
            return [];
        }
    },
    
    // Verifica profilo (admin)
    async verifyProfile(uid) {
        try {
            await this.updateProfile(uid, { 
                isVerified: true,
                verifiedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // Segnala profilo
    async reportProfile(reporterUid, reportedUid, reason, details = '') {
        try {
            await window.db.collection('reports').add({
                reporter: reporterUid,
                reported: reportedUid,
                reason: reason,
                details: details,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // Blocca utente
    async blockUser(uid, blockedUid) {
        try {
            await window.db.collection('users').doc(uid).update({
                blockedUsers: firebase.firestore.FieldValue.arrayUnion(blockedUid)
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // Elimina tutti i dati utente (GDPR)
    async deleteAllUserData(uid) {
        try {
            // Elimina profilo
            await window.db.collection('users').doc(uid).delete();
            
            // Elimina foto
            const photosRef = storage.ref(`users/${uid}/photos`);
            const photos = await photosRef.listAll();
            await Promise.all(photos.items.map(photo => photo.delete()));
            
            // Elimina messaggi
            const messagesQuery = await window.db.collection('messages')
                .where('participants', 'array-contains', uid)
                .get();
            const batch = window.db.batch();
            messagesQuery.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            
            // Elimina matches
            const matchesQuery = await window.db.collection('matches')
                .where('users', 'array-contains', uid)
                .get();
            const batch2 = window.db.batch();
            matchesQuery.forEach(doc => batch2.delete(doc.ref));
            await batch2.commit();
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};


// ==========================================
// MODULO MATCHING
// ==========================================

const FlameMatch = {
    
    // Registra un Like
    async like(currentUid, targetUid) {
        try {
            // Aggiungi ai likes
            await window.db.collection('users').doc(currentUid).update({
                likes: firebase.firestore.FieldValue.arrayUnion(targetUid)
            });
            
            // Registra lo swipe
            await window.db.collection('swipes').add({
                from: currentUid,
                to: targetUid,
                type: 'like',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Incrementa likesReceived sul profilo target (per Esplora Popolari)
            await window.db.collection('users').doc(targetUid).update({
                likesReceived: firebase.firestore.FieldValue.increment(1)
            }).catch(() => {
                // Se il campo non esiste, crealo
                window.db.collection('users').doc(targetUid).set({
                    likesReceived: 1
                }, { merge: true });
            });
            
            // Controlla se c'è match
            const targetProfile = await FlameUsers.getProfile(targetUid);
            if (targetProfile && targetProfile.likes && targetProfile.likes.includes(currentUid)) {
                // È un match!
                await this.createMatch(currentUid, targetUid);
                return { success: true, isMatch: true };
            }
            
            return { success: true, isMatch: false };
        } catch (error) {
            console.error('Errore like:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Registra un Super Like
    async superLike(currentUid, targetUid) {
        try {
            // Controlla limiti (1 super like gratuito al giorno)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const superLikesQuery = await window.db.collection('swipes')
                .where('from', '==', currentUid)
                .where('type', '==', 'superlike')
                .where('timestamp', '>=', firebase.firestore.Timestamp.fromDate(today))
                .get();
            
            const profile = await FlameUsers.getProfile(currentUid);
            const maxSuperLikes = profile.isPremium ? 5 : 1;
            
            if (superLikesQuery.size >= maxSuperLikes) {
                return { success: false, error: 'Hai esaurito i Super Like di oggi' };
            }
            
            // Aggiungi ai likes
            await window.db.collection('users').doc(currentUid).update({
                likes: firebase.firestore.FieldValue.arrayUnion(targetUid)
            });
            
            // Registra lo swipe
            await window.db.collection('swipes').add({
                from: currentUid,
                to: targetUid,
                type: 'superlike',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Incrementa likesReceived sul profilo target (Super Like vale +3)
            await window.db.collection('users').doc(targetUid).update({
                likesReceived: firebase.firestore.FieldValue.increment(3)
            }).catch(() => {
                window.db.collection('users').doc(targetUid).set({
                    likesReceived: 3
                }, { merge: true });
            });
            
            // Notifica l'utente del super like
            await FlameNotifications.send(targetUid, {
                type: 'superlike',
                fromUser: currentUid,
                message: 'Qualcuno ti ha mandato un Super Like! 💙'
            });
            
            // Controlla se c'è match
            const targetProfile = await FlameUsers.getProfile(targetUid);
            if (targetProfile && targetProfile.likes && targetProfile.likes.includes(currentUid)) {
                await this.createMatch(currentUid, targetUid);
                return { success: true, isMatch: true };
            }
            
            return { success: true, isMatch: false };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // Registra un Dislike (Nope)
    async dislike(currentUid, targetUid) {
        try {
            await window.db.collection('users').doc(currentUid).update({
                dislikes: firebase.firestore.FieldValue.arrayUnion(targetUid)
            });
            
            await window.db.collection('swipes').add({
                from: currentUid,
                to: targetUid,
                type: 'dislike',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // Crea un match
    async createMatch(user1, user2) {
        try {
            const matchId = [user1, user2].sort().join('_');
            
            // Crea documento match
            await window.db.collection('matches').doc(matchId).set({
                users: [user1, user2],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastMessage: null,
                lastMessageTime: null
            });
            
            // Aggiorna entrambi i profili
            await window.db.collection('users').doc(user1).update({
                matches: firebase.firestore.FieldValue.arrayUnion(user2)
            });
            await window.db.collection('users').doc(user2).update({
                matches: firebase.firestore.FieldValue.arrayUnion(user1)
            });
            
            // Invia notifiche
            await FlameNotifications.send(user1, {
                type: 'match',
                withUser: user2,
                message: 'Hai un nuovo match! 🔥'
            });
            await FlameNotifications.send(user2, {
                type: 'match',
                withUser: user1,
                message: 'Hai un nuovo match! 🔥'
            });
            
            return { success: true, matchId };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // Ottieni tutti i match di un utente
    async getMatches(uid) {
        try {
            const snapshot = await window.db.collection('matches')
                .where('users', 'array-contains', uid)
                .orderBy('lastMessageTime', 'desc')
                .get();
            
            const matches = [];
            for (const doc of snapshot.docs) {
                const data = doc.data();
                const otherUserId = data.users.find(u => u !== uid);
                console.log('🔍 Cercando profilo partner:', otherUserId);
                
                const otherUser = await FlameUsers.getProfile(otherUserId);
                
                // Skip match se l'utente non esiste più
                if (!otherUser) {
                    console.warn('⚠️ Utente partner non trovato:', otherUserId);
                    continue;
                }
                
                matches.push({
                    matchId: doc.id,
                    user: otherUser,
                    lastMessage: data.lastMessage,
                    lastMessageTime: data.lastMessageTime,
                    createdAt: data.createdAt
                });
            }
            
            return matches;
        } catch (error) {
            console.error('Errore caricamento match:', error);
            return [];
        }
    },
    
    // Rimuovi match (unmatch)
    async unmatch(currentUid, matchedUid) {
        try {
            const matchId = [currentUid, matchedUid].sort().join('_');
            
            // Elimina match
            await window.db.collection('matches').doc(matchId).delete();
            
            // Rimuovi dai matches di entrambi
            await window.db.collection('users').doc(currentUid).update({
                matches: firebase.firestore.FieldValue.arrayRemove(matchedUid)
            });
            await window.db.collection('users').doc(matchedUid).update({
                matches: firebase.firestore.FieldValue.arrayRemove(currentUid)
            });
            
            // Elimina conversazione
            const messagesQuery = await window.db.collection('messages')
                .where('matchId', '==', matchId)
                .get();
            const batch = window.db.batch();
            messagesQuery.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};


// ==========================================
// MODULO CHAT
// ==========================================

const FlameChat = {
    
    // Listener attivo
    unsubscribe: null,
    
    // Invia messaggio
    async sendMessage(matchId, fromUid, text, type = 'text') {
        try {
            // Crea messaggio
            const messageRef = await window.db.collection('messages').add({
                matchId: matchId,
                from: fromUid,
                text: text,
                type: type, // text, image, gif
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                read: false
            });
            
            // Aggiorna ultimo messaggio nel match
            await window.db.collection('matches').doc(matchId).update({
                lastMessage: text.substring(0, 50),
                lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Invia notifica push
            const [user1, user2] = matchId.split('_');
            const toUid = user1 === fromUid ? user2 : user1;
            await FlameNotifications.send(toUid, {
                type: 'message',
                fromUser: fromUid,
                matchId: matchId,
                preview: text.substring(0, 50)
            });
            
            return { success: true, messageId: messageRef.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // Invia immagine
    async sendImage(matchId, fromUid, file) {
        try {
            // Upload immagine
            const storageRef = storage.ref(`chats/${matchId}/${Date.now()}`);
            const snapshot = await storageRef.put(file);
            const imageUrl = await snapshot.ref.getDownloadURL();
            
            // Invia come messaggio
            return await this.sendMessage(matchId, fromUid, imageUrl, 'image');
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // Carica messaggi (con paginazione)
    async loadMessages(matchId, limit = 50, lastDoc = null) {
        try {
            let query = window.db.collection('messages')
                .where('matchId', '==', matchId)
                .orderBy('timestamp', 'desc')
                .limit(limit);
            
            if (lastDoc) {
                query = query.startAfter(lastDoc);
            }
            
            const snapshot = await query.get();
            const messages = [];
            
            snapshot.forEach(doc => {
                messages.push({ id: doc.id, ...doc.data() });
            });
            
            return {
                messages: messages.reverse(),
                lastDoc: snapshot.docs[snapshot.docs.length - 1],
                hasMore: snapshot.size === limit
            };
        } catch (error) {
            return { messages: [], hasMore: false };
        }
    },
    
    // Ascolta nuovi messaggi in tempo reale
    listenToMessages(matchId, callback) {
        // Rimuovi listener precedente
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        
        this.unsubscribe = window.db.collection('messages')
            .where('matchId', '==', matchId)
            .orderBy('timestamp', 'desc')
            .limit(1)
            .onSnapshot(snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        const message = { id: change.doc.id, ...change.doc.data() };
                        callback(message);
                    }
                });
            });
        
        return this.unsubscribe;
    },
    
    // Ferma ascolto messaggi
    stopListening() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    },
    
    // Segna messaggi come letti
    async markAsRead(matchId, currentUid) {
        try {
            const query = await window.db.collection('messages')
                .where('matchId', '==', matchId)
                .where('read', '==', false)
                .get();
            
            const batch = window.db.batch();
            query.forEach(doc => {
                const data = doc.data();
                if (data.from !== currentUid) {
                    batch.update(doc.ref, { read: true });
                }
            });
            
            await batch.commit();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // Conta messaggi non letti
    async getUnreadCount(uid) {
        try {
            const profile = await FlameUsers.getProfile(uid);
            const matches = profile?.matches || [];
            
            let totalUnread = 0;
            
            for (const matchedUid of matches) {
                const matchId = [uid, matchedUid].sort().join('_');
                const query = await window.db.collection('messages')
                    .where('matchId', '==', matchId)
                    .where('from', '!=', uid)
                    .where('read', '==', false)
                    .get();
                totalUnread += query.size;
            }
            
            return totalUnread;
        } catch (error) {
            return 0;
        }
    },
    
    // Elimina messaggio
    async deleteMessage(messageId, currentUid) {
        try {
            const doc = await window.db.collection('messages').doc(messageId).get();
            if (doc.exists && doc.data().from === currentUid) {
                await window.db.collection('messages').doc(messageId).delete();
                return { success: true };
            }
            return { success: false, error: 'Non autorizzato' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};


// ==========================================
// MODULO NOTIFICHE
// ==========================================

const FlameNotifications = {
    
    // Invia notifica (salva nel database)
    async send(uid, data) {
        try {
            await window.db.collection('notifications').add({
                userId: uid,
                ...data,
                read: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // Ottieni notifiche utente
    async getNotifications(uid, limit = 50) {
        try {
            const snapshot = await window.db.collection('notifications')
                .where('userId', '==', uid)
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();
            
            const notifications = [];
            snapshot.forEach(doc => {
                notifications.push({ id: doc.id, ...doc.data() });
            });
            
            return notifications;
        } catch (error) {
            return [];
        }
    },
    
    // Segna come letta
    async markAsRead(notificationId) {
        try {
            await window.db.collection('notifications').doc(notificationId).update({
                read: true
            });
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },
    
    // Segna tutte come lette
    async markAllAsRead(uid) {
        try {
            const query = await window.db.collection('notifications')
                .where('userId', '==', uid)
                .where('read', '==', false)
                .get();
            
            const batch = window.db.batch();
            query.forEach(doc => batch.update(doc.ref, { read: true }));
            await batch.commit();
            
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },
    
    // Richiedi permesso notifiche push (browser)
    async requestPushPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    }
};


// ==========================================
// MODULO PREMIUM
// ==========================================

const FlamePremium = {
    
    // Piani disponibili
    plans: {
        'gold_monthly': {
            id: 'gold_monthly',
            name: 'Gold Mensile',
            price: 14.99,
            period: 'month',
            features: ['like_illimitati', 'vedi_chi_ti_piace', '5_super_like', 'boost_mensile']
        },
        'gold_yearly': {
            id: 'gold_yearly',
            name: 'Gold Annuale',
            price: 99.99,
            period: 'year',
            features: ['like_illimitati', 'vedi_chi_ti_piace', '5_super_like', 'boost_mensile']
        },
        'platinum_monthly': {
            id: 'platinum_monthly',
            name: 'Platinum Mensile',
            price: 24.99,
            period: 'month',
            features: ['tutto_gold', 'messaggi_prima_match', 'super_like_illimitati', 'boost_settimanale']
        }
    },
    
    // Attiva abbonamento (da collegare a Stripe/PayPal)
    async subscribe(uid, planId) {
        try {
            const plan = this.plans[planId];
            if (!plan) {
                return { success: false, error: 'Piano non valido' };
            }
            
            // Qui andrà integrato Stripe/PayPal
            // Per ora simuliamo l'attivazione
            
            const expiresAt = new Date();
            if (plan.period === 'month') {
                expiresAt.setMonth(expiresAt.getMonth() + 1);
            } else {
                expiresAt.setFullYear(expiresAt.getFullYear() + 1);
            }
            
            await FlameUsers.updateProfile(uid, {
                isPremium: true,
                premiumPlan: planId,
                premiumExpiresAt: firebase.firestore.Timestamp.fromDate(expiresAt)
            });
            
            // Registra transazione
            await window.db.collection('transactions').add({
                userId: uid,
                planId: planId,
                amount: plan.price,
                currency: 'EUR',
                status: 'completed',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },
    
    // Controlla stato abbonamento
    async checkSubscription(uid) {
        try {
            const profile = await FlameUsers.getProfile(uid);
            if (!profile) return { isPremium: false };
            
            if (profile.isPremium && profile.premiumExpiresAt) {
                const expiresAt = profile.premiumExpiresAt.toDate();
                if (expiresAt > new Date()) {
                    return {
                        isPremium: true,
                        plan: this.plans[profile.premiumPlan],
                        expiresAt: expiresAt
                    };
                } else {
                    // Abbonamento scaduto
                    await FlameUsers.updateProfile(uid, { isPremium: false });
                    return { isPremium: false, expired: true };
                }
            }
            
            return { isPremium: false };
        } catch (error) {
            return { isPremium: false };
        }
    },
    
    // Annulla abbonamento
    async cancelSubscription(uid) {
        try {
            await FlameUsers.updateProfile(uid, {
                premiumAutoRenew: false
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};


// ==========================================
// MODULO STATISTICHE (Analytics)
// ==========================================

const FlameAnalytics = {
    
    // Traccia evento
    async track(uid, event, data = {}) {
        try {
            await window.db.collection('analytics').add({
                userId: uid,
                event: event,
                data: data,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userAgent: navigator.userAgent,
                platform: navigator.platform
            });
        } catch (error) {
            console.error('Errore tracking:', error);
        }
    },
    
    // Statistiche utente
    async getUserStats(uid) {
        try {
            const profile = await FlameUsers.getProfile(uid);
            
            // Conta swipes ricevuti
            const likesReceived = await window.db.collection('swipes')
                .where('to', '==', uid)
                .where('type', '==', 'like')
                .get();
            
            const superLikesReceived = await window.db.collection('swipes')
                .where('to', '==', uid)
                .where('type', '==', 'superlike')
                .get();
            
            return {
                totalLikes: profile?.likes?.length || 0,
                totalDislikes: profile?.dislikes?.length || 0,
                totalMatches: profile?.matches?.length || 0,
                likesReceived: likesReceived.size,
                superLikesReceived: superLikesReceived.size,
                profileViews: profile?.profileViews || 0
            };
        } catch (error) {
            return null;
        }
    }
};


// ==========================================
// INIZIALIZZAZIONE
// ==========================================

// FlameAuth.init() non viene chiamato automaticamente
// per evitare conflitti con app-real.js che gestisce il flusso auth

// Esporta moduli globalmente
window.FlameAuth = FlameAuth;
window.FlameUsers = FlameUsers;
window.FlameMatch = FlameMatch;
window.FlameChat = FlameChat;
window.FlameNotifications = FlameNotifications;
window.FlamePremium = FlamePremium;
window.FlameAnalytics = FlameAnalytics;

console.log('🔥 FlameMatch Backend caricato');
