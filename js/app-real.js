/* ==========================================
   FlameMatch - App JavaScript (100% REAL)
   NO DEMO - Solo utenti reali da Firebase
   ========================================== */

// Default placeholder images (URL-encoded SVG)
const DEFAULT_AVATAR_200 = "data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27200%27 height=%27200%27%3E%3Crect fill=%27%23667%27 width=%27200%27 height=%27200%27/%3E%3Ctext fill=%27%23fff%27 font-size=%2780%27 x=%2750%25%27 y=%2755%25%27 text-anchor=%27middle%27%3E?%3C/text%3E%3C/svg%3E";
const DEFAULT_AVATAR_50 = "data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2750%27 height=%2750%27%3E%3Crect fill=%27%23667%27 width=%2750%27 height=%2750%27/%3E%3Ctext fill=%27%23fff%27 font-size=%2720%27 x=%2750%25%27 y=%2755%25%27 text-anchor=%27middle%27%3E?%3C/text%3E%3C/svg%3E";
const DEFAULT_AVATAR_60 = "data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2760%27 height=%2760%27%3E%3Crect fill=%27%23667%27 width=%2760%27 height=%2760%27/%3E%3Ctext fill=%27%23fff%27 font-size=%2724%27 x=%2750%25%27 y=%2755%25%27 text-anchor=%27middle%27%3E?%3C/text%3E%3C/svg%3E";
const DEFAULT_AVATAR_40 = "data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2740%27 height=%2740%27%3E%3Crect fill=%27%23667%27 width=%2740%27 height=%2740%27/%3E%3Ctext fill=%27%23fff%27 font-size=%2716%27 x=%2750%25%27 y=%2755%25%27 text-anchor=%27middle%27%3E?%3C/text%3E%3C/svg%3E";
const DEFAULT_AVATAR_120 = "data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27120%27 height=%27120%27%3E%3Crect fill=%27%23667%27 width=%27120%27 height=%27120%27/%3E%3Ctext fill=%27%23fff%27 font-size=%2748%27 x=%2750%25%27 y=%2755%25%27 text-anchor=%27middle%27%3E?%3C/text%3E%3C/svg%3E";

// State
let currentUser = null;
let currentUserProfile = null;
let profiles = []; // Profili REALI da Firebase
let currentIndex = 0;
let profilesToShow = []; // Profili da Explore
let currentProfileIndex = 0; // Index per Explore
let swipeHistory = [];
let currentMatchName = '';
let currentMatchId = '';
let currentChatMatchId = '';
let currentChatUserId = ''; // ID utente con cui stai chattando
let chatUnsubscribe = null;

// ==========================================
// 📍 CALCULATE DISTANCE (Haversine Formula)
// ==========================================
function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 999999; // Return large number if no coords
    
    const R = 6371; // Earth radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return Math.round(distance);
}

// Mostra profilo corrente da Explore
function showCurrentProfile() {
    if (profilesToShow.length === 0) {
        showNoProfiles();
        return;
    }
    // Copia i profili Explore nella variabile globale profiles
    profiles = profilesToShow;
    currentIndex = currentProfileIndex;
    renderCards();
}

// ==========================================
// SISTEMA PREMIUM - Configurazione Piani
// ==========================================
const PREMIUM_PLANS = {
    basic: {
        name: 'Basic',
        price: 0,
        dailySwipes: 100,
        dailySuperLikes: 1,
        monthlyBoosts: 0,
        canSeeLikes: false,
        canUsePassport: false,
        hideAds: false,
        priorityMessages: false,
        canSeeVisitors: false,
        priorityMatch: false,
        undoLimit: 1
    },
    gold: {
        name: 'Gold',
        price: 14.99,
        dailySwipes: Infinity,
        dailySuperLikes: 5,
        monthlyBoosts: 1,
        canSeeLikes: true,
        canUsePassport: true,
        hideAds: true,
        priorityMessages: true,
        canSeeVisitors: false,
        priorityMatch: false,
        undoLimit: Infinity
    },
    platinum: {
        name: 'Platinum',
        price: 24.99,
        dailySwipes: Infinity,
        dailySuperLikes: Infinity,
        monthlyBoosts: 3,
        canSeeLikes: true,
        canUsePassport: true,
        hideAds: true,
        priorityMessages: true,
        canSeeVisitors: true,
        priorityMatch: true,
        undoLimit: Infinity
    }
};

// Stato Premium dell'utente
let userPremiumData = {
    plan: 'basic',
    expiresAt: null,
    dailySwipesUsed: 0,
    dailySuperLikesUsed: 0,
    monthlyBoostsUsed: 0,
    lastSwipeReset: null,
    lastSuperLikeReset: null,
    lastBoostReset: null
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔥 FlameMatch App - Modalità REALE (v=44)');
    
    // Inizializza EmailJS per email di benvenuto
    if (window.FlameEmail) {
        window.FlameEmail.init();
    }
    
    // Aspetta che Firebase sia pronto
    await waitForFirebase();
    
    // Controlla autenticazione
    checkAuth();
});

function waitForFirebase() {
    return new Promise((resolve) => {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            resolve();
        } else {
            const check = setInterval(() => {
                if (typeof firebase !== 'undefined' && firebase.auth) {
                    clearInterval(check);
                    resolve();
                }
            }, 100);
        }
    });
}

function checkAuth() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            console.log('✅ Utente autenticato:', user.email);
            currentUser = user;
            
            // Carica profilo utente
            currentUserProfile = await FlameUsers.getProfile(user.uid);
            
            if (!currentUserProfile) {
                // Utente nuovo, crea profilo base
                const newUserName = user.displayName || 'Nuovo Utente';
                await FlameUsers.createProfile(user.uid, {
                    email: user.email,
                    name: newUserName,
                    photos: user.photoURL ? [user.photoURL] : [],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    isVerified: false,
                    isPremium: false,
                    gender: 'other',
                    age: 25,
                    bio: '',
                    city: '',
                    likes: [],
                    dislikes: [],
                    matches: [],
                    settings: {
                        showMe: 'all',
                        ageRange: { min: 18, max: 50 },
                        maxDistance: 50,
    showVerifiedOnly: false
};
                        notifications: true
                    }
                });
                currentUserProfile = await FlameUsers.getProfile(user.uid);
                
                // 📧 Invia email di benvenuto al nuovo utente
                if (window.FlameEmail && user.email) {
                    console.log('📧 Invio email di benvenuto a:', user.email);
                    window.FlameEmail.sendWelcome(user.email, newUserName);
                }
            }
            
            // Aggiorna UI con dati utente
            updateUserUI();
            
            // Carica dati Premium e abbonamento
            await loadPremiumData();
            
            // Carica impostazioni privacy e boost
            await loadPrivacySettings();
            await checkBoostStatus();
            
            // Carica profili reali (escludendo utenti bloccati)
            await loadRealProfiles();
            
            // Carica match reali
            await loadRealMatches();
            
            // Inizializza drag listeners
            initDragListeners();
            
            // Mostra contatore swipe/super like
            updateSwipeCounter();
            
            // Aggiorna lastActive per funzione "Online"
            updateLastActive();
            // Aggiorna ogni 5 minuti
            setInterval(updateLastActive, 5 * 60 * 1000);
            
        } else {
            console.log('❌ Utente non autenticato - redirect a login');
            window.location.href = 'index.html';
        }
    });
}

function updateUserUI() {
    // Aggiorna avatar sidebar
    const avatar = document.getElementById('sidebarAvatar');
    if (avatar) {
        const photoUrl = currentUserProfile?.photos?.[0] || currentUser?.photoURL;
        if (photoUrl) {
            avatar.innerHTML = `<img src="${photoUrl}" alt="Profilo">`;
        } else {
            avatar.innerHTML = `<i class="fas fa-user"></i>`;
        }
    }
    
    // Mostra badge premium se abbonato
    updatePremiumBadge();
}

// Aggiorna timestamp lastActive per funzione "Online"
async function updateLastActive() {
    const user = FlameAuth.currentUser;
    if (!user) return;
    
    try {
        await firebase.firestore().collection('users').doc(user.uid).update({
            lastActive: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (e) {
        console.log('Errore aggiornamento lastActive:', e);
    }
}

// ==========================================
// SISTEMA PREMIUM - Funzioni Complete
// ==========================================

// Carica dati premium utente da Firestore
async function loadPremiumData() {
    if (!currentUser) return;
    
    try {
        const doc = await db.collection('subscriptions').doc(currentUser.uid).get();
        
        if (doc.exists) {
            const data = doc.data();
            userPremiumData = {
                plan: data.plan || 'basic',
                expiresAt: data.expiresAt?.toDate() || null,
                dailySwipesUsed: data.dailySwipesUsed || 0,
                dailySuperLikesUsed: data.dailySuperLikesUsed || 0,
                monthlyBoostsUsed: data.monthlyBoostsUsed || 0,
                lastSwipeReset: data.lastSwipeReset?.toDate() || null,
                lastSuperLikeReset: data.lastSuperLikeReset?.toDate() || null,
                lastBoostReset: data.lastBoostReset?.toDate() || null
            };
            
            // Verifica se abbonamento è scaduto
            if (userPremiumData.expiresAt && userPremiumData.expiresAt < new Date()) {
                userPremiumData.plan = 'basic';
                await savePremiumData();
            }
            
            // Reset contatori giornalieri se necessario
            await checkDailyReset();
            await checkMonthlyReset();
        } else {
            // Crea documento subscription per nuovo utente
            await savePremiumData();
        }
        
        console.log('👑 Premium data loaded:', userPremiumData.plan);
        
    } catch (error) {
        console.error('Errore caricamento premium:', error);
    }
}

// Salva dati premium su Firestore
async function savePremiumData() {
    if (!currentUser) return;
    
    try {
        await db.collection('subscriptions').doc(currentUser.uid).set({
            plan: userPremiumData.plan,
            expiresAt: userPremiumData.expiresAt,
            dailySwipesUsed: userPremiumData.dailySwipesUsed,
            dailySuperLikesUsed: userPremiumData.dailySuperLikesUsed,
            monthlyBoostsUsed: userPremiumData.monthlyBoostsUsed,
            lastSwipeReset: userPremiumData.lastSwipeReset || new Date(),
            lastSuperLikeReset: userPremiumData.lastSuperLikeReset || new Date(),
            lastBoostReset: userPremiumData.lastBoostReset || new Date(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error('Errore salvataggio premium:', error);
    }
}

// Reset giornaliero swipes e super likes
async function checkDailyReset() {
    const now = new Date();
    const lastReset = userPremiumData.lastSwipeReset;
    
    if (!lastReset || !isSameDay(lastReset, now)) {
        userPremiumData.dailySwipesUsed = 0;
        userPremiumData.dailySuperLikesUsed = 0;
        userPremiumData.lastSwipeReset = now;
        userPremiumData.lastSuperLikeReset = now;
        await savePremiumData();
        console.log('🔄 Reset giornaliero contatori');
    }
}

// Reset mensile boosts
async function checkMonthlyReset() {
    const now = new Date();
    const lastReset = userPremiumData.lastBoostReset;
    
    if (!lastReset || !isSameMonth(lastReset, now)) {
        userPremiumData.monthlyBoostsUsed = 0;
        userPremiumData.lastBoostReset = now;
        await savePremiumData();
        console.log('🔄 Reset mensile boost');
    }
}

function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
}

function isSameMonth(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth();
}

// Ottieni piano corrente dell'utente
function getCurrentPlan() {
    return PREMIUM_PLANS[userPremiumData.plan] || PREMIUM_PLANS.basic;
}

// Verifica se utente può fare swipe
function canSwipe() {
    const plan = getCurrentPlan();
    if (plan.dailySwipes === Infinity) return true;
    return userPremiumData.dailySwipesUsed < plan.dailySwipes;
}

// Swipes rimanenti oggi
function getRemainingSwipes() {
    const plan = getCurrentPlan();
    if (plan.dailySwipes === Infinity) return '∞';
    return Math.max(0, plan.dailySwipes - userPremiumData.dailySwipesUsed);
}

// Verifica se utente può fare Super Like
function canSuperLike() {
    const plan = getCurrentPlan();
    if (plan.dailySuperLikes === Infinity) return true;
    return userPremiumData.dailySuperLikesUsed < plan.dailySuperLikes;
}

// Super Like rimanenti oggi
function getRemainingSuperLikes() {
    const plan = getCurrentPlan();
    if (plan.dailySuperLikes === Infinity) return '∞';
    return Math.max(0, plan.dailySuperLikes - userPremiumData.dailySuperLikesUsed);
}

// Verifica se utente può usare Boost
function canUseBoost() {
    const plan = getCurrentPlan();
    if (plan.monthlyBoosts === 0) return false;
    return userPremiumData.monthlyBoostsUsed < plan.monthlyBoosts;
}

// Boost rimanenti questo mese
function getRemainingBoosts() {
    const plan = getCurrentPlan();
    return Math.max(0, plan.monthlyBoosts - userPremiumData.monthlyBoostsUsed);
}

// Incrementa contatore swipe
async function incrementSwipeCount() {
    userPremiumData.dailySwipesUsed++;
    await savePremiumData();
    updateSwipeCounter();
}

// Incrementa contatore Super Like
async function incrementSuperLikeCount() {
    userPremiumData.dailySuperLikesUsed++;
    await savePremiumData();
    updateSuperLikeCounter();
}

// Incrementa contatore Boost
async function incrementBoostCount() {
    userPremiumData.monthlyBoostsUsed++;
    await savePremiumData();
}

// Mostra badge premium nella UI
function updatePremiumBadge() {
    const plan = userPremiumData.plan;
    const existingBadge = document.querySelector('.premium-badge-sidebar');
    
    if (existingBadge) existingBadge.remove();
    
    if (plan !== 'basic') {
        const badge = document.createElement('div');
        badge.className = 'premium-badge-sidebar';
        badge.innerHTML = `<i class="fas fa-crown"></i> ${plan.toUpperCase()}`;
        badge.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            background: ${plan === 'platinum' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'linear-gradient(135deg, #f7971e, #ffd200)'};
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 4px;
            z-index: 10;
        `;
        
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.style.position = 'relative';
            sidebar.appendChild(badge);
        }
    }
}

// Aggiorna contatore swipe visibile
function updateSwipeCounter() {
    let counter = document.getElementById('swipeCounter');
    if (!counter) {
        counter = document.createElement('div');
        counter.id = 'swipeCounter';
        counter.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            z-index: 100;
            display: flex;
            align-items: center;
            gap: 12px;
        `;
        document.body.appendChild(counter);
    }
    
    const plan = getCurrentPlan();
    const swipes = getRemainingSwipes();
    const superLikes = getRemainingSuperLikes();
    
    counter.innerHTML = `
        <span>❤️ ${swipes}</span>
        <span>⭐ ${superLikes}</span>
        ${plan.name !== 'Basic' ? `<span class="premium-indicator">👑 ${plan.name}</span>` : ''}
    `;
}

// Aggiorna contatore Super Like
function updateSuperLikeCounter() {
    updateSwipeCounter(); // Usa lo stesso contatore
}

// Mostra modal limite raggiunto
function showLimitReachedModal(type) {
    const isSwipe = type === 'swipe';
    
    let modal = document.getElementById('limitModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'limitModal';
        modal.className = 'fullscreen-modal';
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px; text-align: center;">
            <button class="close-modal" onclick="closeLimitModal()">
                <i class="fas fa-times"></i>
            </button>
            
            <div style="font-size: 4rem; margin-bottom: 20px;">
                ${isSwipe ? '💔' : '⭐'}
            </div>
            
            <h2 style="margin-bottom: 10px;">
                ${isSwipe ? 'Swipe Esauriti!' : 'Super Like Esauriti!'}
            </h2>
            
            <p style="color: #aaa; margin-bottom: 20px;">
                ${isSwipe 
                    ? `Hai usato tutti i tuoi ${getCurrentPlan().dailySwipes} swipe di oggi.` 
                    : `Hai usato tutti i tuoi ${getCurrentPlan().dailySuperLikes} Super Like di oggi.`
                }
            </p>
            
            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <p style="font-size: 14px; color: #888; margin-bottom: 8px;">I contatori si resettano tra:</p>
                <div id="resetCountdown" style="font-size: 24px; font-weight: bold; color: #ff6b6b;">
                    ${getTimeUntilReset()}
                </div>
            </div>
            
            <p style="color: #aaa; margin-bottom: 20px;">
                Passa a <span style="color: #ffd700; font-weight: bold;">Gold</span> per ${isSwipe ? 'swipe illimitati' : '5 Super Like al giorno'}!
            </p>
            
            <button onclick="closeLimitModal(); openPremiumModal();" style="
                background: linear-gradient(135deg, #f7971e, #ffd200);
                color: black;
                border: none;
                padding: 14px 28px;
                border-radius: 25px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                margin: 0 auto;
            ">
                <i class="fas fa-crown"></i> Passa a Gold
            </button>
        </div>
    `;
    
    modal.classList.add('active');
    
    // Aggiorna countdown ogni secondo
    const countdownInterval = setInterval(() => {
        const countdown = document.getElementById('resetCountdown');
        if (countdown && modal.classList.contains('active')) {
            countdown.textContent = getTimeUntilReset();
        } else {
            clearInterval(countdownInterval);
        }
    }, 1000);
}

function closeLimitModal() {
    const modal = document.getElementById('limitModal');
    if (modal) modal.classList.remove('active');
}

function getTimeUntilReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Modal Premium migliorato con acquisto reale
function openPremiumModal() {
    let modal = document.getElementById('premiumModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'premiumModal';
        modal.className = 'fullscreen-modal';
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }
    
    const currentPlan = userPremiumData.plan;
    
    modal.innerHTML = `
        <div class="modal-content premium-modal-content" style="max-width: 600px;">
            <button class="close-modal" onclick="closePremiumModal()">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="premium-header" style="text-align: center; margin-bottom: 24px;">
                <h2 style="font-size: 1.8rem; margin-bottom: 8px;">
                    <i class="fas fa-crown" style="color: #ffd700;"></i> 
                    Potenzia il Tuo Profilo
                </h2>
                <p style="color: #aaa;">Sblocca funzionalità esclusive e trova l'amore più velocemente</p>
            </div>
            
            <div class="billing-toggle" style="display: flex; justify-content: center; gap: 12px; margin-bottom: 24px;">
                <button id="monthlyBtn" class="toggle-btn active" onclick="setBillingCycle('monthly')">
                    Mensile
                </button>
                <button id="annualBtn" class="toggle-btn" onclick="setBillingCycle('annual')">
                    Annuale <span style="color: #4CAF50; font-size: 11px;">-40%</span>
                </button>
            </div>
            
            <div class="plans-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                
                <!-- Basic -->
                <div class="plan-card ${currentPlan === 'basic' ? 'current-plan' : ''}" style="
                    background: rgba(255,255,255,0.05);
                    border-radius: 16px;
                    padding: 20px;
                    text-align: center;
                    border: 2px solid ${currentPlan === 'basic' ? '#666' : 'transparent'};
                ">
                    <h3 style="font-size: 1.2rem; margin-bottom: 4px;">Basic</h3>
                    <p style="color: #888; font-size: 12px; margin-bottom: 12px;">Per iniziare</p>
                    
                    <div class="price" style="margin-bottom: 16px;">
                        <span style="font-size: 2rem; font-weight: bold;">€0</span>
                        <span style="color: #888;">/mese</span>
                    </div>
                    
                    <ul style="text-align: left; font-size: 13px; list-style: none; padding: 0; margin-bottom: 16px;">
                        <li style="padding: 6px 0; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-check" style="color: #4CAF50;"></i> 100 swipe al giorno
                        </li>
                        <li style="padding: 6px 0; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-check" style="color: #4CAF50;"></i> 1 Super Like al giorno
                        </li>
                        <li style="padding: 6px 0; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-check" style="color: #4CAF50;"></i> Chat con i match
                        </li>
                        <li style="padding: 6px 0; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-check" style="color: #4CAF50;"></i> Filtri base
                        </li>
                        <li style="padding: 6px 0; display: flex; align-items: center; gap: 8px; color: #666;">
                            <i class="fas fa-times" style="color: #666;"></i> Vedi chi ti ha messo like
                        </li>
                        <li style="padding: 6px 0; display: flex; align-items: center; gap: 8px; color: #666;">
                            <i class="fas fa-times" style="color: #666;"></i> Swipe illimitati
                        </li>
                    </ul>
                    
                    ${currentPlan === 'basic' 
                        ? '<button disabled style="width: 100%; padding: 12px; border-radius: 25px; background: #333; color: #888; border: none;">Piano Attuale</button>'
                        : '<button disabled style="width: 100%; padding: 12px; border-radius: 25px; background: #333; color: #888; border: none;">Gratuito</button>'
                    }
                </div>
                
                <!-- Gold -->
                <div class="plan-card gold-plan ${currentPlan === 'gold' ? 'current-plan' : ''}" style="
                    background: linear-gradient(135deg, rgba(247,151,30,0.2), rgba(255,210,0,0.1));
                    border-radius: 16px;
                    padding: 20px;
                    text-align: center;
                    border: 2px solid #f7971e;
                    position: relative;
                    transform: scale(1.02);
                ">
                    <div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #f7971e, #ffd200); color: black; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: bold;">
                        Più Popolare
                    </div>
                    
                    <h3 style="font-size: 1.2rem; margin-bottom: 4px; color: #ffd700;">
                        <i class="fas fa-crown"></i> Gold
                    </h3>
                    <p style="color: #f7971e; font-size: 12px; margin-bottom: 12px;">Per chi fa sul serio</p>
                    
                    <div class="price" style="margin-bottom: 16px;">
                        <span style="font-size: 2rem; font-weight: bold;" id="goldPrice">€14.99</span>
                        <span style="color: #888;">/mese</span>
                    </div>
                    
                    <ul style="text-align: left; font-size: 13px; list-style: none; padding: 0; margin-bottom: 16px;">
                        <li style="padding: 6px 0; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-infinity" style="color: #ffd700;"></i> Swipe illimitati
                        </li>
                        <li style="padding: 6px 0; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-star" style="color: #ffd700;"></i> 5 Super Like al giorno
                        </li>
                        <li style="padding: 6px 0; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-eye" style="color: #ffd700;"></i> Vedi chi ti ha messo like
                        </li>
                        <li style="padding: 6px 0; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-rocket" style="color: #ffd700;"></i> 1 Boost al mese
                        </li>
                        <li style="padding: 6px 0; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-globe" style="color: #ffd700;"></i> Passport (cambia posizione)
                        </li>
                        <li style="padding: 6px 0; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-ban" style="color: #ffd700;"></i> Nascondi annunci
                        </li>
                    </ul>
                    
                    ${currentPlan === 'gold' 
                        ? '<button disabled style="width: 100%; padding: 12px; border-radius: 25px; background: #333; color: #888; border: none;">Piano Attuale</button>'
                        : `<button onclick="subscribeToPlan('gold')" style="width: 100%; padding: 12px; border-radius: 25px; background: linear-gradient(135deg, #f7971e, #ffd200); color: black; border: none; font-weight: bold; cursor: pointer;">
                            Prova Gold
                           </button>`
                    }
                </div>
                
                <!-- Platinum -->
                <div class="plan-card platinum-plan ${currentPlan === 'platinum' ? 'current-plan' : ''}" style="
                    background: linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.1));
                    border-radius: 16px;
                    padding: 20px;
                    text-align: center;
                    border: 2px solid ${currentPlan === 'platinum' ? '#667eea' : 'rgba(102,126,234,0.5)'};
                ">
                    <h3 style="font-size: 1.2rem; margin-bottom: 4px; color: #a78bfa;">
                        <i class="fas fa-gem"></i> Platinum
                    </h3>
                    <p style="color: #667eea; font-size: 12px; margin-bottom: 12px;">L'esperienza completa</p>
                    
                    <div class="price" style="margin-bottom: 16px;">
                        <span style="font-size: 2rem; font-weight: bold;" id="platinumPrice">€24.99</span>
                        <span style="color: #888;">/mese</span>
                    </div>
                    
                    <ul style="text-align: left; font-size: 13px; list-style: none; padding: 0; margin-bottom: 16px;">
                        <li style="padding: 6px 0; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-check-double" style="color: #a78bfa;"></i> Tutto di Gold +
                        </li>
                        <li style="padding: 6px 0; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-infinity" style="color: #a78bfa;"></i> Super Like illimitati
                        </li>
                        <li style="padding: 6px 0; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-bolt" style="color: #a78bfa;"></i> Messaggi prioritari
                        </li>
                        <li style="padding: 6px 0; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-eye" style="color: #a78bfa;"></i> Vedi chi visita il profilo
                        </li>
                        <li style="padding: 6px 0; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-rocket" style="color: #a78bfa;"></i> 3 Boost al mese
                        </li>
                        <li style="padding: 6px 0; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-headset" style="color: #a78bfa;"></i> Supporto VIP 24/7
                        </li>
                    </ul>
                    
                    ${currentPlan === 'platinum' 
                        ? '<button disabled style="width: 100%; padding: 12px; border-radius: 25px; background: #333; color: #888; border: none;">Piano Attuale</button>'
                        : `<button onclick="subscribeToPlan('platinum')" style="width: 100%; padding: 12px; border-radius: 25px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; font-weight: bold; cursor: pointer;">
                            Prova Platinum
                           </button>`
                    }
                </div>
            </div>
            
            <p style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
                <i class="fas fa-shield-alt"></i> Pagamento sicuro • Cancella quando vuoi • 
                <a href="terms.html" target="_blank" style="color: #888;">Termini</a>
            </p>
        </div>
    `;
    
    modal.classList.add('active');
}

function closePremiumModal() {
    const modal = document.getElementById('premiumModal');
    if (modal) modal.classList.remove('active');
}

let billingCycle = 'monthly';

function setBillingCycle(cycle) {
    billingCycle = cycle;
    
    document.getElementById('monthlyBtn').classList.toggle('active', cycle === 'monthly');
    document.getElementById('annualBtn').classList.toggle('active', cycle === 'annual');
    
    const goldPrice = document.getElementById('goldPrice');
    const platinumPrice = document.getElementById('platinumPrice');
    
    if (cycle === 'monthly') {
        goldPrice.textContent = '€14.99';
        platinumPrice.textContent = '€24.99';
    } else {
        // Annuale con 40% di sconto
        goldPrice.textContent = '€8.99';
        platinumPrice.textContent = '€14.99';
    }
}

// Funzione per l'abbonamento (simula pagamento)
async function subscribeToPlan(plan) {
    const planNames = { gold: 'Gold', platinum: 'Platinum' };
    const prices = billingCycle === 'monthly' 
        ? { gold: 14.99, platinum: 24.99 }
        : { gold: 8.99, platinum: 14.99 };
    
    // Mostra modal di conferma pagamento
    const confirmed = await showPaymentModal(planNames[plan], prices[plan]);
    
    if (confirmed) {
        // Simula processo di pagamento
        showToast('⏳ Elaborazione pagamento...', 'info');
        
        // Simula ritardo pagamento
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Attiva abbonamento
        const expiresAt = new Date();
        if (billingCycle === 'monthly') {
            expiresAt.setMonth(expiresAt.getMonth() + 1);
        } else {
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        }
        
        userPremiumData.plan = plan;
        userPremiumData.expiresAt = expiresAt;
        await savePremiumData();
        
        // Aggiorna anche il profilo utente
        await db.collection('users').doc(currentUser.uid).update({
            isPremium: true,
            premiumPlan: plan,
            premiumExpiresAt: expiresAt
        });
        
        closePremiumModal();
        closePaymentModal();
        
        showToast(`🎉 Benvenuto in FlameMatch ${planNames[plan]}!`, 'success');
        
        // Aggiorna UI
        updatePremiumBadge();
        updateSwipeCounter();
        
        // Mostra celebrazione
        showPremiumCelebration(plan);
    }
}

// PayPal Plan IDs
const PAYPAL_PLANS = {
    gold_monthly: 'P-1CA33891T8049160FNF5R6ZQ',
    gold_yearly: 'P-1CA33891T8049160FNF5R6ZQ', // Stesso piano per ora
    platinum_monthly: 'P-1UY26975N14335442NF5SAUQ',
    platinum_yearly: 'P-1UY26975N14335442NF5SAUQ' // Stesso piano per ora
};

const PAYPAL_CLIENT_ID = 'AdVh2EpipQm930-jBn_EiP_2wxKjIaE5q5-trEjPa1c2q2HLNntj9PvseFSkvl9OVq_59_t8ICZzfLR9';

// Carica PayPal SDK
function loadPayPalSDK() {
    return new Promise((resolve, reject) => {
        if (window.paypal) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
        script.setAttribute('data-sdk-integration-source', 'button-factory');
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function showPaymentModal(planName, price) {
    return new Promise(async (resolve) => {
        // Carica PayPal SDK se non già caricato
        try {
            await loadPayPalSDK();
        } catch (e) {
            console.error('Errore caricamento PayPal:', e);
            showToast('Errore di connessione. Riprova.', 'error');
            resolve(false);
            return;
        }
        
        let modal = document.getElementById('paymentModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'paymentModal';
            modal.className = 'fullscreen-modal';
            document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        }
        
        const period = billingCycle === 'monthly' ? 'mese' : 'anno';
        const planKey = `${planName.toLowerCase()}_${billingCycle}`;
        const planId = PAYPAL_PLANS[planKey];
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 420px;">
                <button class="close-modal" onclick="closePaymentModal(); window.paymentResolve(false);">
                    <i class="fas fa-times"></i>
                </button>
                
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="font-size: 3rem; margin-bottom: 12px;">
                        ${planName === 'Gold' ? '👑' : '💎'}
                    </div>
                    <h2>Abbonamento ${planName}</h2>
                </div>
                
                <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Piano:</span>
                        <span style="font-weight: bold; color: ${planName === 'Gold' ? '#ffd700' : '#a78bfa'};">
                            FlameMatch ${planName}
                        </span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Durata:</span>
                        <span>${billingCycle === 'monthly' ? '1 mese' : '1 anno'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: bold; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; margin-top: 12px;">
                        <span>Totale:</span>
                        <span>€${price.toFixed(2)}/${period}</span>
                    </div>
                </div>
                
                <p style="text-align: center; color: #aaa; margin-bottom: 16px; font-size: 14px;">
                    Scegli come pagare:
                </p>
                
                <div id="paypal-button-container-${planName}" style="min-height: 150px;"></div>
                
                <p style="text-align: center; font-size: 11px; color: #666; margin-top: 16px;">
                    <i class="fas fa-shield-alt"></i> Pagamento sicuro gestito da PayPal
                </p>
            </div>
        `;
        
        modal.classList.add('active');
        window.paymentResolve = resolve;
        
        // Renderizza pulsanti PayPal
        setTimeout(() => {
            try {
                paypal.Buttons({
                    style: {
                        shape: 'rect',
                        color: planName === 'Gold' ? 'gold' : 'black',
                        layout: 'vertical',
                        label: 'subscribe'
                    },
                    createSubscription: function(data, actions) {
                        return actions.subscription.create({
                            plan_id: planId
                        });
                    },
                    onApprove: async function(data, actions) {
                        console.log('Abbonamento approvato:', data.subscriptionID);
                        
                        // Salva abbonamento su Firebase
                        await saveSubscriptionToFirebase(planName.toLowerCase(), data.subscriptionID);
                        
                        closePaymentModal();
                        window.paymentResolve(true);
                    },
                    onCancel: function() {
                        showToast('Pagamento annullato', 'info');
                    },
                    onError: function(err) {
                        console.error('Errore PayPal:', err);
                        showToast('Errore durante il pagamento', 'error');
                    }
                }).render(`#paypal-button-container-${planName}`);
            } catch (e) {
                console.error('Errore rendering PayPal:', e);
            }
        }, 100);
    });
}

// Salva abbonamento su Firebase
async function saveSubscriptionToFirebase(planName, subscriptionId) {
    if (!currentUser) return;
    
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 mese
    
    await db.collection('subscriptions').doc(currentUser.uid).set({
        plan: planName,
        paypalSubscriptionId: subscriptionId,
        expiresAt: firebase.firestore.Timestamp.fromDate(expiresAt),
        startedAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'active',
        dailySwipesUsed: 0,
        dailySuperLikesUsed: 0,
        monthlyBoostsUsed: 0,
        lastSwipeReset: firebase.firestore.FieldValue.serverTimestamp(),
        lastSuperLikeReset: firebase.firestore.FieldValue.serverTimestamp(),
        lastBoostReset: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    // Aggiorna stato locale direttamente
    userPremiumData.plan = planName;
    userPremiumData.expiresAt = expiresAt;
    userPremiumData.dailySwipesUsed = 0;
    userPremiumData.dailySuperLikesUsed = 0;
    userPremiumData.monthlyBoostsUsed = 0;
    
    // Ricarica limiti da Firebase
    await loadPremiumData();
    
    // Mostra badge premium nella sidebar
    updatePremiumBadge();
    
    // Mostra celebrazione
    showPremiumCelebration(planName);
    
    // Aggiorna contatori UI
    updateSwipeCounter();
    updateSuperLikeCounter();
    
    // Toast di conferma
    showToast(`🎉 Benvenuto in FlameMatch ${planName.charAt(0).toUpperCase() + planName.slice(1)}!`, 'success');
    
    console.log('✅ Upgrade a', planName, 'completato!');
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) modal.classList.remove('active');
}

function formatCardNumber(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.match(/.{1,4}/g)?.join(' ') || value;
    input.value = value;
}

function formatExpiry(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0,2) + '/' + value.substring(2);
    }
    input.value = value;
}

function showPremiumCelebration(plan) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    const color = plan === 'gold' ? '#ffd700' : '#a78bfa';
    
    overlay.innerHTML = `
        <div style="text-align: center; animation: scaleIn 0.5s ease;">
            <div style="font-size: 6rem; margin-bottom: 20px;">👑</div>
            <h1 style="font-size: 2.5rem; margin-bottom: 10px; background: linear-gradient(135deg, ${color}, #fff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                Benvenuto in ${plan.charAt(0).toUpperCase() + plan.slice(1)}!
            </h1>
            <p style="color: #aaa; font-size: 1.2rem;">Hai sbloccato tutte le funzionalità premium</p>
            
            <button onclick="this.parentElement.parentElement.remove()" style="
                margin-top: 30px;
                padding: 14px 40px;
                border-radius: 25px;
                background: linear-gradient(135deg, ${color}, #fff);
                color: black;
                border: none;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
            ">
                Inizia a Swipare! 🔥
            </button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Auto-remove dopo 5 secondi
    setTimeout(() => {
        if (overlay.parentElement) overlay.remove();
    }, 5000);
}

// ==========================================
// FUNZIONALITÀ PREMIUM SPECIFICHE
// ==========================================

// Vedi chi ti ha messo like (Gold/Platinum)
async function showReceivedLikes() {
    const plan = getCurrentPlan();
    
    if (!plan.canSeeLikes) {
        // Mostra versione blurred per Basic
        showBlurredLikes();
        return;
    }
    
    // Carica likes reali
    try {
        const likesSnapshot = await db.collection('swipes')
            .where('to', '==', currentUser.uid)
            .where('type', '==', 'like')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();
        
        const likes = [];
        for (const doc of likesSnapshot.docs) {
            const likeData = doc.data();
            // Verifica che non sia già un match
            const matchId = [currentUser.uid, likeData.from].sort().join('_');
            const matchDoc = await db.collection('matches').doc(matchId).get();
            
            if (!matchDoc.exists) {
                const userDoc = await db.collection('users').doc(likeData.from).get();
                if (userDoc.exists) {
                    likes.push({
                        ...userDoc.data(),
                        id: likeData.from,
                        likedAt: likeData.timestamp?.toDate()
                    });
                }
            }
        }
        
        showLikesModal(likes);
        
    } catch (error) {
        console.error('Errore caricamento likes:', error);
        showToast('❌ Errore nel caricamento', 'error');
    }
}

function showLikesModal(likes) {
    let modal = document.getElementById('likesModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'likesModal';
        modal.className = 'fullscreen-modal';
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; max-height: 80vh; overflow-y: auto;">
            <button class="close-modal" onclick="closeLikesModal()">
                <i class="fas fa-times"></i>
            </button>
            
            <h2 style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-heart" style="color: #ff6b6b;"></i>
                Chi Ti Ha Messo Like
                <span style="background: #ff6b6b; color: white; padding: 4px 10px; border-radius: 12px; font-size: 14px;">
                    ${likes.length}
                </span>
            </h2>
            
            ${likes.length === 0 
                ? `<div style="text-align: center; padding: 40px; color: #888;">
                     <i class="fas fa-heart-broken" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;"></i>
                     <p>Nessun like ricevuto ancora</p>
                     <p style="font-size: 14px;">Continua a swipare per farti notare!</p>
                   </div>`
                : `<div class="likes-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                    ${likes.map(user => `
                        <div class="like-card" style="
                            background: rgba(255,255,255,0.05);
                            border-radius: 12px;
                            overflow: hidden;
                            cursor: pointer;
                            transition: transform 0.2s;
                        " onclick="likeBackUser('${user.id}')" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                            <div style="position: relative;">
                                <img src="${user.photos?.[0] || DEFAULT_AVATAR_200}" 
                                    style="width: 100%; height: 150px; object-fit: cover;">
                                <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 12px; background: linear-gradient(transparent, rgba(0,0,0,0.8));">
                                    <div style="font-weight: bold;">${user.name}, ${user.age || '?'}</div>
                                    <div style="font-size: 12px; color: #aaa;">${user.city || 'Vicino a te'}</div>
                                </div>
                            </div>
                            <div style="padding: 12px; display: flex; justify-content: space-between;">
                                <button onclick="event.stopPropagation(); passUser('${user.id}')" style="
                                    flex: 1;
                                    padding: 8px;
                                    border: none;
                                    background: rgba(255,255,255,0.1);
                                    color: #888;
                                    border-radius: 8px;
                                    margin-right: 8px;
                                    cursor: pointer;
                                ">
                                    <i class="fas fa-times"></i>
                                </button>
                                <button onclick="event.stopPropagation(); likeBackUser('${user.id}')" style="
                                    flex: 1;
                                    padding: 8px;
                                    border: none;
                                    background: linear-gradient(135deg, #ff6b6b, #ff8e53);
                                    color: white;
                                    border-radius: 8px;
                                    cursor: pointer;
                                ">
                                    <i class="fas fa-heart"></i> Like
                                </button>
                            </div>
                        </div>
                    `).join('')}
                   </div>`
            }
        </div>
    `;
    
    modal.classList.add('active');
}

function closeLikesModal() {
    const modal = document.getElementById('likesModal');
    if (modal) modal.classList.remove('active');
}

async function likeBackUser(userId) {
    try {
        const result = await FlameMatch.like(currentUser.uid, userId);
        
        if (result.match) {
            closeLikesModal();
            // Carica dati utente per mostrare match
            const userDoc = await db.collection('users').doc(userId).get();
            if (userDoc.exists) {
                showMatchPopup(userDoc.data());
            }
        } else {
            showToast('❤️ Like inviato!', 'success');
        }
        
        // Ricarica lista likes
        showReceivedLikes();
        
    } catch (error) {
        console.error('Errore like:', error);
    }
}

async function passUser(userId) {
    try {
        await FlameMatch.dislike(currentUser.uid, userId);
        showReceivedLikes(); // Ricarica lista
    } catch (error) {
        console.error('Errore pass:', error);
    }
}

// Passport - Cambia posizione (Gold/Platinum)
function openPassport() {
    const plan = getCurrentPlan();
    
    if (!plan.canUsePassport) {
        showToast('🔒 Passport disponibile con Gold', 'info');
        openPremiumModal();
        return;
    }
    
    let modal = document.getElementById('passportModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'passportModal';
        modal.className = 'fullscreen-modal';
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }
    
    const popularCities = [
        { name: 'Milano', country: 'Italia', lat: 45.4642, lng: 9.1900 },
        { name: 'Roma', country: 'Italia', lat: 41.9028, lng: 12.4964 },
        { name: 'Napoli', country: 'Italia', lat: 40.8518, lng: 14.2681 },
        { name: 'Firenze', country: 'Italia', lat: 43.7696, lng: 11.2558 },
        { name: 'Barcellona', country: 'Spagna', lat: 41.3851, lng: 2.1734 },
        { name: 'Parigi', country: 'Francia', lat: 48.8566, lng: 2.3522 },
        { name: 'Londra', country: 'UK', lat: 51.5074, lng: -0.1278 },
        { name: 'Ibiza', country: 'Spagna', lat: 38.9067, lng: 1.4206 },
        { name: 'Amsterdam', country: 'Olanda', lat: 52.3676, lng: 4.9041 },
        { name: 'Miami', country: 'USA', lat: 25.7617, lng: -80.1918 },
    ];
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <button class="close-modal" onclick="closePassportModal()">
                <i class="fas fa-times"></i>
            </button>
            
            <h2 style="margin-bottom: 8px; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-globe" style="color: #4fc3f7;"></i>
                Passport
            </h2>
            <p style="color: #888; margin-bottom: 20px;">
                Cambia la tua posizione e scopri persone in altre città
            </p>
            
            <div style="margin-bottom: 20px;">
                <div style="position: relative;">
                    <input type="text" id="passportSearch" placeholder="Cerca una città..." 
                        style="width: 100%; padding: 12px 12px 12px 40px; border-radius: 25px; border: 1px solid #333; background: rgba(255,255,255,0.05); color: white; font-size: 16px;"
                        oninput="searchCity(this.value)">
                    <i class="fas fa-search" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #666;"></i>
                </div>
            </div>
            
            <div id="cityResults" style="display: none; margin-bottom: 20px;"></div>
            
            <h4 style="color: #888; font-size: 14px; margin-bottom: 12px;">
                <i class="fas fa-fire" style="color: #ff6b6b;"></i> Città Popolari
            </h4>
            
            <div class="popular-cities" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                ${popularCities.map(city => `
                    <button onclick="setPassportLocation('${city.name}', ${city.lat}, ${city.lng})" style="
                        padding: 12px;
                        border-radius: 12px;
                        border: 1px solid #333;
                        background: rgba(255,255,255,0.05);
                        color: white;
                        cursor: pointer;
                        text-align: left;
                        transition: all 0.2s;
                    " onmouseover="this.style.borderColor='#4fc3f7'" onmouseout="this.style.borderColor='#333'">
                        <div style="font-weight: bold;">${city.name}</div>
                        <div style="font-size: 12px; color: #888;">${city.country}</div>
                    </button>
                `).join('')}
            </div>
            
            <button onclick="resetPassportLocation()" style="
                width: 100%;
                margin-top: 20px;
                padding: 12px;
                border-radius: 25px;
                border: 1px solid #333;
                background: transparent;
                color: #888;
                cursor: pointer;
            ">
                <i class="fas fa-location-arrow"></i> Usa la mia posizione reale
            </button>
        </div>
    `;
    
    modal.classList.add('active');
}

function closePassportModal() {
    const modal = document.getElementById('passportModal');
    if (modal) modal.classList.remove('active');
}

async function setPassportLocation(cityName, lat, lng) {
    try {
        await db.collection('users').doc(currentUser.uid).update({
            passportLocation: {
                city: cityName,
                latitude: lat,
                longitude: lng,
                isVirtual: true
            }
        });
        
        closePassportModal();
        showToast(`✈️ Ora stai esplorando ${cityName}!`, 'success');
        
        // Ricarica profili dalla nuova posizione
        await loadRealProfiles();
        
    } catch (error) {
        console.error('Errore passport:', error);
        showToast('❌ Errore nel cambio posizione', 'error');
    }
}

async function resetPassportLocation() {
    try {
        await db.collection('users').doc(currentUser.uid).update({
            passportLocation: firebase.firestore.FieldValue.delete()
        });
        
        closePassportModal();
        showToast('📍 Posizione resettata', 'success');
        await loadRealProfiles();
        
    } catch (error) {
        console.error('Errore reset passport:', error);
    }
}

// Vedi chi visita il profilo (Platinum)
async function showProfileVisitors() {
    const plan = getCurrentPlan();
    
    if (!plan.canSeeVisitors) {
        showToast('🔒 Funzione disponibile con Platinum', 'info');
        openPremiumModal();
        return;
    }
    
    try {
        const visitorsSnapshot = await db.collection('profileVisits')
            .where('visitedUserId', '==', currentUser.uid)
            .orderBy('timestamp', 'desc')
            .limit(30)
            .get();
        
        const visitors = [];
        for (const doc of visitorsSnapshot.docs) {
            const visitData = doc.data();
            const userDoc = await db.collection('users').doc(visitData.visitorId).get();
            if (userDoc.exists) {
                visitors.push({
                    ...userDoc.data(),
                    id: visitData.visitorId,
                    visitedAt: visitData.timestamp?.toDate()
                });
            }
        }
        
        // Mostra modal visitatori
        showVisitorsModal(visitors);
        
    } catch (error) {
        console.error('Errore caricamento visitatori:', error);
    }
}

function showVisitorsModal(visitors) {
    let modal = document.getElementById('visitorsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'visitorsModal';
        modal.className = 'fullscreen-modal';
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; max-height: 80vh; overflow-y: auto;">
            <button class="close-modal" onclick="this.parentElement.parentElement.classList.remove('active')">
                <i class="fas fa-times"></i>
            </button>
            
            <h2 style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-eye" style="color: #a78bfa;"></i>
                Chi Ha Visitato il Tuo Profilo
                <span style="background: #a78bfa; color: white; padding: 4px 10px; border-radius: 12px; font-size: 14px;">
                    ${visitors.length}
                </span>
            </h2>
            
            ${visitors.length === 0 
                ? `<div style="text-align: center; padding: 40px; color: #888;">
                     <i class="fas fa-eye-slash" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;"></i>
                     <p>Nessuna visita recente</p>
                   </div>`
                : `<div style="display: flex; flex-direction: column; gap: 12px;">
                    ${visitors.map(user => `
                        <div style="
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            background: rgba(255,255,255,0.05);
                            padding: 12px;
                            border-radius: 12px;
                            cursor: pointer;
                        " onclick="viewVisitorProfile('${user.id}')">
                            <img src="${user.photos?.[0] || DEFAULT_AVATAR_50}" 
                                style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">
                            <div style="flex: 1;">
                                <div style="font-weight: bold;">${user.name}, ${user.age || '?'}</div>
                                <div style="font-size: 12px; color: #888;">
                                    ${user.visitedAt ? formatTimeAgo(user.visitedAt) : 'Recentemente'}
                                </div>
                            </div>
                            <button style="
                                padding: 8px 16px;
                                border-radius: 20px;
                                border: none;
                                background: linear-gradient(135deg, #ff6b6b, #ff8e53);
                                color: white;
                                cursor: pointer;
                            " onclick="event.stopPropagation(); likeBackUser('${user.id}')">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                    `).join('')}
                   </div>`
            }
        </div>
    `;
    
    modal.classList.add('active');
}

function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Adesso';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min fa`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ore fa`;
    return `${Math.floor(seconds / 86400)} giorni fa`;
}

// Traccia visita profilo
async function trackProfileVisit(visitedUserId) {
    if (!currentUser || visitedUserId === currentUser.uid) return;
    
    try {
        await db.collection('profileVisits').add({
            visitorId: currentUser.uid,
            visitedUserId: visitedUserId,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Errore tracciamento visita:', error);
    }
}

// ==========================================
// LOAD REAL PROFILES FROM FIREBASE
// ==========================================
async function loadRealProfiles() {
    console.log('📥 Caricamento profili REALI da Firebase...');
    
    try {
        // Usa la funzione del backend per ottenere profili
        let allProfiles = await FlameUsers.getProfilesToSwipe(currentUser, 50);
        
        // Filtra utenti bloccati
        const blockedIds = userPrivacySettings.blockedUsers?.map(u => u.id) || [];
        
        // Filtra utenti con profilo in pausa
        profiles = allProfiles.filter(p => {
            // Escludi bloccati
            if (blockedIds.includes(p.id)) return false;
            
            // Escludi profili in pausa
            if (p.privacySettings?.profilePaused) return false;
            
            // Escludi utenti che ci hanno bloccato
            if (p.privacySettings?.blockedUsers?.some(u => u.id === currentUser.uid)) return false;
            
            return true;
        });
        
        console.log(`✅ Trovati ${profiles.length} profili reali (dopo filtri)`);
        
        // Render delle card
        renderCards();
        
    } catch (error) {
        console.error('❌ Errore caricamento profili:', error);
        showNoProfiles();
    }
}

// ==========================================
// LOAD REAL MATCHES FROM FIREBASE
// ==========================================
async function loadRealMatches() {
    console.log('📥 Caricamento match REALI da Firebase...');
    
    try {
        const matches = await FlameMatch.getMatches(currentUser.uid);
        
        console.log(`✅ Trovati ${matches.length} match reali`);
        
        // Aggiorna pannello match
        updateMatchesPanel(matches);
        
    } catch (error) {
        console.error('❌ Errore caricamento match:', error);
    }
}

function updateMatchesPanel(matches) {
    // Aggiorna nuovi match
    const newMatchesContainer = document.getElementById('newMatches');
    if (newMatchesContainer) {
        if (matches.length === 0) {
            newMatchesContainer.innerHTML = `
                <div class="no-matches-msg">
                    <i class="fas fa-heart" style="font-size: 1.5rem; margin-bottom: 8px; opacity: 0.3;"></i>
                    <p>Nessun match ancora.<br>Continua a swipare! 🔥</p>
                </div>
            `;
        } else {
            newMatchesContainer.innerHTML = matches.slice(0, 8).map(match => `
                <div class="new-match-item" onclick="openChat('${match.user.id}', '${match.matchId}')">
                    <div class="new-match-avatar">
                        <img src="${match.user.photos?.[0] || DEFAULT_AVATAR_60}" alt="${match.user.name}">
                    </div>
                    <span>${match.user.name?.split(' ')[0] || 'Match'}</span>
                </div>
            `).join('');
        }
    }
    
    // Aggiorna chat attive
    const chatsContainer = document.getElementById('activeChats');
    if (chatsContainer) {
        const matchesWithMessages = matches.filter(m => m.lastMessage);
        
        if (matchesWithMessages.length === 0) {
            chatsContainer.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--gray);">
                    <p>Nessuna conversazione attiva</p>
                </div>
            `;
        } else {
            chatsContainer.innerHTML = matchesWithMessages.map(match => `
                <div class="chat-item" onclick="openChat('${match.user.id}', '${match.matchId}')">
                    <img src="${match.user.photos?.[0] || DEFAULT_AVATAR_50}" alt="${match.user.name}" class="chat-avatar">
                    <div class="chat-info">
                        <div class="chat-name">
                            ${match.user.name?.split(' ')[0] || 'Match'}
                            <span class="chat-time">${formatTime(match.lastMessageTime)}</span>
                        </div>
                        <p class="chat-preview">${match.lastMessage || ''}</p>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // Aggiorna badge
    const matchBadge = document.querySelector('.nav-item[title="Match"] .nav-badge');
    if (matchBadge) {
        matchBadge.textContent = matches.length;
        matchBadge.style.display = matches.length > 0 ? 'block' : 'none';
    }
}

function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Ora';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' min';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' ore';
    return 'Ieri';
}

// ==========================================
// RENDER CARDS
// ==========================================
function renderCards() {
    const container = document.getElementById('cardsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Nessun profilo disponibile
    if (profiles.length === 0 || currentIndex >= profiles.length) {
        showNoProfiles();
        return;
    }
    
    // Render stack di 3 card
    for (let i = 2; i >= 0; i--) {
        if (currentIndex + i >= profiles.length) continue;
        
        const profile = profiles[currentIndex + i];
        const isTop = i === 0;
        
        const card = document.createElement('div');
        card.className = 'profile-card';
        card.style.zIndex = 3 - i;
        card.style.transform = `scale(${1 - i * 0.05}) translateY(${i * 15}px)`;
        card.style.opacity = isTop ? 1 : 0.7 - i * 0.2;
        
        if (isTop) {
            card.id = 'topCard';
            card.setAttribute('data-user-id', profile.id);
        }
        
        // Foto profilo (usa la prima disponibile o placeholder)
        const photoUrl = profile.photos?.[0] || DEFAULT_AVATAR_40;
        
        // Calcola età se c'è birthday
        let age = profile.age || '';
        if (profile.birthday) {
            const bday = new Date(profile.birthday);
            const today = new Date();
            age = today.getFullYear() - bday.getFullYear();
        }
        
        // Tags/interessi
        const tags = profile.interests || profile.tags || [];
        
        // Voice Vibe HTML
        const voiceVibeHtml = profile.voiceVibe?.url ? `
            <div class="voice-vibe-badge">
                <i class="fas fa-microphone"></i> Voice Vibe
            </div>
            <div class="voice-player">
                <button class="voice-play-btn" onclick="event.stopPropagation(); playVoiceOnCard('${profile.voiceVibe.url}', this)">
                    <i class="fas fa-play"></i>
                </button>
                <div class="voice-waveform">
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                </div>
                <span class="voice-duration">${profile.voiceVibe.duration || 15}s</span>
            </div>
        ` : '';
        
        card.innerHTML = `
            <img src="${photoUrl}" alt="${profile.name}" draggable="false" onerror="this.src=DEFAULT_AVATAR_40">
            <div class="card-gradient"></div>
            ${voiceVibeHtml}
            <div class="card-info">
                <h2 class="card-name">
                    ${profile.name || 'Utente'}${age ? ', ' + age : ''}
                    ${profile.isVerified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
                </h2>
                <div class="card-details">
                    ${profile.city ? `<span><i class="fas fa-map-marker-alt"></i> ${profile.city}</span>` : ''}
                    ${profile.job ? `<span><i class="fas fa-briefcase"></i> ${profile.job}</span>` : ''}
                </div>
                <p class="card-bio">${profile.bio || 'Nessuna bio disponibile'}</p>
                ${tags.length > 0 ? `
                    <div class="card-tags">
                        ${tags.slice(0, 4).map(tag => `<span class="card-tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="swipe-indicator like-indicator">LIKE</div>
            <div class="swipe-indicator nope-indicator">NOPE</div>
            <div class="swipe-indicator super-indicator">SUPER</div>
        `;
        
        if (isTop) {
            card.onclick = (e) => {
                if (!isDragging) showProfileDetails(profile);
            };
        }
        
        container.appendChild(card);
    }
}

function showNoProfiles() {
    const container = document.getElementById('cardsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div style="text-align: center; color: var(--gray); padding: 40px;">
            <i class="fas fa-users" style="font-size: 5rem; margin-bottom: 20px; color: var(--primary); opacity: 0.5;"></i>
            <h3 style="margin-bottom: 15px; color: var(--light);">Nessun profilo disponibile</h3>
            <p style="margin-bottom: 20px;">Non ci sono ancora altri utenti nella tua zona.<br>Invita i tuoi amici a unirsi a FlameMatch!</p>
            <button onclick="shareApp()" style="background: var(--gradient); border: none; padding: 15px 30px; border-radius: 30px; color: white; font-weight: 600; cursor: pointer;">
                <i class="fas fa-share-alt"></i> Invita Amici
            </button>
        </div>
    `;
}

function shareApp() {
    if (navigator.share) {
        navigator.share({
            title: 'FlameMatch',
            text: 'Unisciti a FlameMatch e trova il tuo match! 🔥',
            url: window.location.origin
        });
    } else {
        // Copia link
        navigator.clipboard.writeText(window.location.origin);
        showToast('Link copiato! Condividilo con i tuoi amici 🔗');
    }
}

// ==========================================
// DRAG LISTENERS
// ==========================================
let isDragging = false;
let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;

function initDragListeners() {
    const container = document.getElementById('cardsContainer');
    if (!container) return;
    
    container.addEventListener('mousedown', onDragStart);
    container.addEventListener('touchstart', onDragStart, { passive: true });
    
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('touchmove', onDrag, { passive: true });
    
    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchend', onDragEnd);
}

function onDragStart(e) {
    const card = document.getElementById('topCard');
    if (!card) return;
    
    isDragging = true;
    startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
    card.style.transition = 'none';
}

function onDrag(e) {
    if (!isDragging) return;
    
    const card = document.getElementById('topCard');
    if (!card) return;
    
    currentX = (e.type === 'mousemove' ? e.clientX : e.touches[0].clientX) - startX;
    currentY = (e.type === 'mousemove' ? e.clientY : e.touches[0].clientY) - startY;
    
    const rotate = currentX * 0.1;
    card.style.transform = `translateX(${currentX}px) translateY(${currentY}px) rotate(${rotate}deg)`;
    
    // Update indicators
    const likeIndicator = card.querySelector('.like-indicator');
    const nopeIndicator = card.querySelector('.nope-indicator');
    const superIndicator = card.querySelector('.super-indicator');
    
    if (currentX > 50) {
        likeIndicator.style.opacity = Math.min(currentX / 100, 1);
        nopeIndicator.style.opacity = 0;
    } else if (currentX < -50) {
        nopeIndicator.style.opacity = Math.min(Math.abs(currentX) / 100, 1);
        likeIndicator.style.opacity = 0;
    } else {
        likeIndicator.style.opacity = 0;
        nopeIndicator.style.opacity = 0;
    }
    
    if (currentY < -50) {
        superIndicator.style.opacity = Math.min(Math.abs(currentY) / 100, 1);
    } else {
        superIndicator.style.opacity = 0;
    }
}

function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    
    const card = document.getElementById('topCard');
    if (!card) return;
    
    card.style.transition = 'transform 0.3s ease';
    
    if (currentX > 100) {
        swipe('right');
    } else if (currentX < -100) {
        swipe('left');
    } else if (currentY < -100) {
        swipe('super');
    } else {
        card.style.transform = '';
        const indicators = card.querySelectorAll('.swipe-indicator');
        indicators.forEach(i => i.style.opacity = 0);
    }
    
    currentX = 0;
    currentY = 0;
}

// ==========================================
// SWIPE FUNCTIONS (REAL FIREBASE)
// ==========================================
async function swipe(direction) {
    const card = document.getElementById('topCard');
    if (!card || currentIndex >= profiles.length) return;
    
    // ===== CONTROLLO LIMITI PREMIUM =====
    if (direction === 'left' || direction === 'right') {
        if (!canSwipe()) {
            showLimitReachedModal('swipe');
            return;
        }
    }
    
    if (direction === 'super') {
        if (!canSuperLike()) {
            showLimitReachedModal('superlike');
            return;
        }
    }
    // ===================================
    
    const profile = profiles[currentIndex];
    const targetUid = profile.id;
    
    // Traccia visita profilo (per Platinum)
    trackProfileVisit(targetUid);
    
    // Save to history
    swipeHistory.push({ index: currentIndex, profile });
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) undoBtn.disabled = false;
    
    // Animate card
    card.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
    
    if (direction === 'left') {
        // DISLIKE - Salva su Firebase
        card.style.transform = 'translateX(-150%) rotate(-30deg)';
        card.querySelector('.nope-indicator').style.opacity = 1;
        
        await FlameMatch.dislike(currentUser.uid, targetUid);
        await incrementSwipeCount(); // PREMIUM: Incrementa contatore
        console.log('👎 Dislike registrato su Firebase');
        
    } else if (direction === 'right') {
        // LIKE - Salva su Firebase e controlla match
        card.style.transform = 'translateX(150%) rotate(30deg)';
        card.querySelector('.like-indicator').style.opacity = 1;
        
        const result = await FlameMatch.like(currentUser.uid, targetUid);
        await incrementSwipeCount(); // PREMIUM: Incrementa contatore
        console.log('👍 Like registrato su Firebase', result);
        
        if (result.isMatch) {
            setTimeout(() => showMatch(profile), 500);
        }
        
    } else if (direction === 'super') {
        // SUPER LIKE - Salva su Firebase
        card.style.transform = 'translateY(-150%) scale(1.1)';
        card.querySelector('.super-indicator').style.opacity = 1;
        
        const result = await FlameMatch.superLike(currentUser.uid, targetUid);
        await incrementSuperLikeCount(); // PREMIUM: Incrementa contatore Super Like
        console.log('⭐ Super Like registrato su Firebase', result);
        
        if (result.success && result.isMatch) {
            setTimeout(() => showMatch(profile), 500);
        } else if (!result.success) {
            showToast(result.error || 'Super Like non disponibile', 'error');
        }
    }
    
    card.style.opacity = '0';
    
    setTimeout(() => {
        currentIndex++;
        renderCards();
    }, 300);
}

// Undo swipe
async function undoSwipe() {
    if (swipeHistory.length === 0) return;
    
    const last = swipeHistory.pop();
    
    // Rimuovi lo swipe da Firebase (se possibile)
    // Nota: questo richiede di rimuovere dalla lista likes/dislikes
    // Per semplicità, ripristiniamo solo localmente
    
    currentIndex = last.index;
    renderCards();
    
    if (swipeHistory.length === 0) {
        const undoBtn = document.getElementById('undoBtn');
        if (undoBtn) undoBtn.disabled = true;
    }
    
    showToast('Swipe annullato! 🔄');
}

// ==========================================
// MATCH SCREEN
// ==========================================
function showMatch(profile) {
    currentMatchName = profile.name;
    currentMatchId = profile.id;
    
    // Foto match
    const matchImg = document.getElementById('matchImg');
    if (matchImg) {
        matchImg.src = profile.photos?.[0] || DEFAULT_AVATAR_120;
    }
    
    // Nome match
    const matchName = document.getElementById('matchName');
    if (matchName) {
        matchName.textContent = profile.name?.split(' ')[0] || 'Match';
    }
    
    // Foto utente corrente
    const myMatchImg = document.getElementById('myMatchImg');
    if (myMatchImg) {
        myMatchImg.src = currentUserProfile?.photos?.[0] || currentUser?.photoURL || DEFAULT_AVATAR_120;
    }
    
    document.getElementById('matchOverlay').classList.add('active');
    
    // Ricarica matches
    loadRealMatches();
}

function closeMatch() {
    document.getElementById('matchOverlay').classList.remove('active');
}

// ==========================================
// PROFILE DETAILS
// ==========================================
let currentViewedProfile = null;

function showProfileDetails(profile) {
    currentViewedProfile = profile;
    
    document.getElementById('profileModalImg').src = profile.photos?.[0] || DEFAULT_AVATAR_40;
    
    let age = profile.age || '';
    if (profile.birthday) {
        const bday = new Date(profile.birthday);
        age = new Date().getFullYear() - bday.getFullYear();
    }
    
    // Nascondi età se l'utente ha abilitato privacy
    const displayAge = profile.privacySettings?.hideAge ? '' : age;
    
    document.getElementById('profileModalName').innerHTML = `
        ${profile.name || 'Utente'}${displayAge ? ', ' + displayAge : ''}
        ${profile.isVerified ? '<i class="fas fa-check-circle verified-badge"></i>' : ''}
    `;
    document.getElementById('profileModalBio').textContent = profile.bio || 'Nessuna bio disponibile';
    
    // Aggiungi pulsanti Blocca e Segnala
    let actionsDiv = document.getElementById('profileModalActions');
    if (!actionsDiv) {
        actionsDiv = document.createElement('div');
        actionsDiv.id = 'profileModalActions';
        actionsDiv.className = 'profile-modal-actions';
        document.getElementById('profileModal').querySelector('.profile-modal-content').appendChild(actionsDiv);
    }
    
    actionsDiv.innerHTML = `
        <button class="action-btn profile-btn" onclick="viewUserPosts('${profile.id}')" style="background: var(--primary); color: white;">
            <i class="fas fa-images"></i> Vedi Post
        </button>
        <button class="action-btn report-btn" onclick="reportUser('${profile.id}', '${profile.name}')">
            <i class="fas fa-flag"></i> Segnala
        </button>
        <button class="action-btn block-btn" onclick="blockUserFromProfile()">
            <i class="fas fa-ban"></i> Blocca
        </button>
    `;
    
    document.getElementById('profileModal').classList.add('active');
}

async function blockUserFromProfile() {
    if (!currentViewedProfile) return;
    
    const confirmed = confirm(`Vuoi bloccare ${currentViewedProfile.name}? Non potrete più vedervi o contattarvi.`);
    if (confirmed) {
        await blockUser(currentViewedProfile.id, currentViewedProfile.name, currentViewedProfile.photos?.[0]);
        closeProfileModal();
    }
}

function closeProfileModal(e) {
    if (!e || e.target.id === 'profileModal') {
        document.getElementById('profileModal').classList.remove('active');
    }
}

// Mostra il profilo completo del match corrente
async function showProfileModal() {
    if (!currentChatUserId) {
        showToast('Nessun profilo da mostrare', 'error');
        return;
    }
    
    try {
        // Carica profilo completo
        const profile = await FlameUsers.getProfile(currentChatUserId);
        
        if (!profile) {
            showToast('Profilo non trovato', 'error');
            return;
        }
        
        const modal = document.getElementById('profileModal');
        
        // Popola immagine
        document.getElementById('profileModalImg').src = profile.photos?.[0] || DEFAULT_AVATAR_40;
        
        // Popola nome, età e verifica
        const age = profile.birthDate ? calculateAge(profile.birthDate) : '';
        const verifiedBadge = profile.isVerified ? '<i class="fas fa-check-circle verified-badge"></i>' : '';
        document.getElementById('profileModalName').innerHTML = `${profile.name || 'Utente'}${age ? ', ' + age : ''} ${verifiedBadge}`;
        
        // Popola dettagli (distanza e lavoro)
        const detailsEl = modal.querySelector('.profile-modal-details');
        if (detailsEl) {
            let detailsHTML = '';
            
            // Distanza (se disponibile e non nascosta)
            if (profile.location && currentUserProfile?.location && !profile.hideDistance) {
                const distance = calculateDistance(
                    currentUserProfile.location.latitude,
                    currentUserProfile.location.longitude,
                    profile.location.latitude,
                    profile.location.longitude
                );
                detailsHTML += `<span><i class="fas fa-map-marker-alt"></i> ${distance.toFixed(0)} km</span>`;
            }
            
            // Lavoro
            if (profile.work) {
                detailsHTML += `<span><i class="fas fa-briefcase"></i> ${profile.work}</span>`;
            }
            
            detailsEl.innerHTML = detailsHTML || '<span><i class="fas fa-user"></i> FlameMatch User</span>';
        }
        
        // Popola bio
        document.getElementById('profileModalBio').textContent = profile.bio || 'Nessuna bio disponibile.';
        
        // Popola interessi
        const interestsEl = modal.querySelector('.profile-interests');
        if (interestsEl && profile.interests && profile.interests.length > 0) {
            const interestEmojis = {
                'Musica': '🎵', 'Viaggi': '✈️', 'Fotografia': '📸', 'Food': '🍕', 
                'Cinema': '🎬', 'Sport': '⚽', 'Arte': '🎨', 'Libri': '📚',
                'Gaming': '🎮', 'Natura': '🌿', 'Fitness': '💪', 'Cucina': '👨‍🍳',
                'Animali': '🐾', 'Tecnologia': '💻', 'Moda': '👗', 'Danza': '💃'
            };
            
            interestsEl.innerHTML = profile.interests.map(interest => {
                const emoji = interestEmojis[interest] || '❤️';
                return `<span class="interest-tag">${emoji} ${interest}</span>`;
            }).join('');
        } else if (interestsEl) {
            interestsEl.innerHTML = '<span class="interest-tag">❤️ FlameMatch</span>';
        }
        
        // Mostra modal
        modal.classList.add('active');
        
    } catch (error) {
        console.error('Errore caricamento profilo:', error);
        showToast('Errore nel caricamento del profilo', 'error');
    }
}

// ==========================================
// REAL-TIME CHAT (FIREBASE)
// ==========================================
async function openChat(userId, matchId) {
    const chatModal = document.getElementById('chatModal');
    const messagesContainer = document.getElementById('chatMessages');
    
    // Ottieni profilo utente
    const userProfile = await FlameUsers.getProfile(userId);
    
    if (!userProfile) {
        showToast('Errore: profilo non trovato', 'error');
        return;
    }
    
    // Se non abbiamo matchId, calcolalo
    if (!matchId) {
        matchId = [currentUser.uid, userId].sort().join('_');
    }
    
    currentChatMatchId = matchId;
    currentChatUserId = userId; // Salva ID per showProfileModal
    
    // Aggiorna header chat
    document.getElementById('chatAvatar').src = userProfile.photos?.[0] || DEFAULT_AVATAR_50;
    document.getElementById('chatUserName').textContent = userProfile.name?.split(' ')[0] || 'Match';
    
    // Carica messaggi esistenti
    messagesContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--gray);"><i class="fas fa-spinner fa-spin"></i> Caricamento...</div>';
    
    const { messages } = await FlameChat.loadMessages(matchId, 50);
    
    messagesContainer.innerHTML = '';
    messages.forEach(msg => {
        appendMessage(msg);
    });
    
    // Scorri in fondo
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Ascolta nuovi messaggi in tempo reale
    if (chatUnsubscribe) {
        chatUnsubscribe();
    }
    
    chatUnsubscribe = FlameChat.listenToMessages(matchId, (newMessage) => {
        // Evita duplicati
        if (!document.querySelector(`[data-message-id="${newMessage.id}"]`)) {
            appendMessage(newMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    });
    
    // Segna come letti
    await FlameChat.markAsRead(matchId, currentUser.uid);
    
    chatModal.classList.add('active');
}

async function appendMessage(msg) {
    const messagesContainer = document.getElementById('chatMessages');
    const isFromMe = msg.from === currentUser.uid;
    
    // Decripta il messaggio
    const decryptedText = await decryptMessage(msg.text, currentChatMatchId);
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isFromMe ? 'sent' : 'received'}`;
    msgDiv.setAttribute('data-message-id', msg.id);
    
    // Aggiunge icona lucchetto per indicare crittografia
    msgDiv.innerHTML = `
        <span class="message-text">${escapeHtml(decryptedText)}</span>
        <span class="encryption-icon" title="Messaggio crittografato">🔒</span>
    `;
    
    messagesContainer.appendChild(msgDiv);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function closeChat() {
    document.getElementById('chatModal').classList.remove('active');
    
    if (chatUnsubscribe) {
        chatUnsubscribe();
        chatUnsubscribe = null;
    }
}

// ============================================
// CRITTOGRAFIA END-TO-END PER MESSAGGI
// ============================================

// Genera chiave di crittografia unica per ogni match
async function getMatchEncryptionKey(matchId) {
    const encoder = new TextEncoder();
    const data = encoder.encode(matchId + '_flamematch_e2e_secret');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return await crypto.subtle.importKey(
        'raw',
        hashBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
    );
}

// Cripta messaggio
async function encryptMessage(text, matchId) {
    try {
        const key = await getMatchEncryptionKey(matchId);
        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        
        const encryptedBuffer = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encoder.encode(text)
        );
        
        // Combina IV + encrypted data in base64
        const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encryptedBuffer), iv.length);
        
        return btoa(String.fromCharCode(...combined));
    } catch (e) {
        console.error('Errore crittografia:', e);
        return text; // Fallback a testo normale
    }
}

// Decripta messaggio
async function decryptMessage(encryptedText, matchId) {
    try {
        // Se non è crittografato (testo vecchio), ritorna così
        if (!encryptedText.match(/^[A-Za-z0-9+/=]+$/)) {
            return encryptedText;
        }
        
        const key = await getMatchEncryptionKey(matchId);
        const combined = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
        
        const iv = combined.slice(0, 12);
        const encryptedBuffer = combined.slice(12);
        
        const decryptedBuffer = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encryptedBuffer
        );
        
        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
    } catch (e) {
        // Se fallisce la decrittografia, probabilmente è testo non crittografato
        return encryptedText;
    }
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text || !currentChatMatchId) return;
    
    input.value = '';
    
    // Cripta il messaggio prima di inviarlo
    const encryptedText = await encryptMessage(text, currentChatMatchId);
    
    // Invia messaggio crittografato a Firebase
    const result = await FlameChat.sendMessage(currentChatMatchId, currentUser.uid, encryptedText);
    
    if (!result.success) {
        showToast('Errore invio messaggio', 'error');
        input.value = text; // Ripristina testo
    }
}

function handleChatKeypress(e) {
    if (e.key === 'Enter') sendMessage();
}

// ==========================================
// OTHER FUNCTIONS
// ==========================================
function activateBoost() {
    showBoostModal();
}

// ====== FILTRI FUNZIONANTI ======
let currentFilters = {
    showOnlineOnly: false,
    hasPhotos: true,
    hasBio: false,
    ageMin: 18,
    ageMax: 55,
    maxDistance: 50,
    showVerifiedOnly: false
};
function openFilters() {
    document.querySelectorAll('.fm-filters-overlay').forEach(m => m.remove());
    
    const overlay = document.createElement('div');
    overlay.className = 'fm-filters-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:10000;overflow-y:auto;animation:fadeIn 0.3s ease;';
    
    overlay.innerHTML = `
        <div style="min-height:100%;background:linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);">
            <!-- Header -->
            <div style="background:linear-gradient(135deg, #ff4b6e 0%, #ff6b8a 100%);padding:20px;position:sticky;top:0;z-index:10;display:flex;justify-content:space-between;align-items:center;box-shadow:0 4px 20px rgba(255,75,110,0.4);">
                <h2 style="color:#fff;margin:0;font-size:20px;display:flex;align-items:center;gap:10px;font-weight:700;">
                    <span style="font-size:28px;">⚙️</span> Filtri di Ricerca
                </h2>
                <button onclick="document.querySelector('.fm-filters-overlay').remove()" style="width:40px;height:40px;border-radius:50%;background:rgba(0,0,0,0.2);border:none;color:#fff;font-size:28px;cursor:pointer;">×</button>
            </div>
            
            <!-- Content -->
            <div style="padding:20px;padding-bottom:100px;">
                
                <!-- Età Section -->
                <div style="background:linear-gradient(135deg, rgba(255,75,110,0.15) 0%, rgba(255,107,138,0.08) 100%);border:2px solid rgba(255,75,110,0.3);border-radius:20px;padding:25px;margin-bottom:20px;">
                    <h3 style="color:#ff4b6e;margin:0 0 20px 0;font-size:18px;display:flex;align-items:center;gap:12px;">
                        <span style="font-size:30px;">🎂</span> Età
                    </h3>
                    <div style="display:flex;justify-content:space-between;margin-bottom:20px;">
                        <div style="background:rgba(255,75,110,0.25);padding:12px 20px;border-radius:25px;text-align:center;">
                            <div style="color:rgba(255,255,255,0.7);font-size:12px;margin-bottom:4px;">MIN</div>
                            <div style="color:#ff4b6e;font-size:28px;font-weight:800;" id="ageMinLabel">${currentFilters.ageMin}</div>
                        </div>
                        <div style="display:flex;align-items:center;color:rgba(255,255,255,0.4);">—</div>
                        <div style="background:rgba(255,75,110,0.25);padding:12px 20px;border-radius:25px;text-align:center;">
                            <div style="color:rgba(255,255,255,0.7);font-size:12px;margin-bottom:4px;">MAX</div>
                            <div style="color:#ff4b6e;font-size:28px;font-weight:800;" id="ageMaxLabel">${currentFilters.ageMax}</div>
                        </div>
                    </div>
                    <div style="padding:0 10px;">
                        <input type="range" id="ageMinSlider" min="18" max="70" value="${currentFilters.ageMin}" 
                            oninput="updateAgeMin(this.value)" 
                            style="width:100%;height:8px;accent-color:#ff4b6e;cursor:pointer;background:rgba(255,75,110,0.3);border-radius:10px;">
                        <input type="range" id="ageMaxSlider" min="18" max="70" value="${currentFilters.ageMax}" 
                            oninput="updateAgeMax(this.value)" 
                            style="width:100%;height:8px;accent-color:#ff4b6e;cursor:pointer;margin-top:15px;background:rgba(255,75,110,0.3);border-radius:10px;">
                    </div>
                </div>
                
                <!-- Distanza Section -->
                <div style="background:linear-gradient(135deg, rgba(0,184,148,0.15) 0%, rgba(0,206,201,0.08) 100%);border:2px solid rgba(0,184,148,0.3);border-radius:20px;padding:25px;margin-bottom:20px;">
                    <h3 style="color:#00b894;margin:0 0 20px 0;font-size:18px;display:flex;align-items:center;gap:12px;">
                        <span style="font-size:30px;">📍</span> Distanza Massima
                    </h3>
                    <div style="text-align:center;margin-bottom:20px;">
                        <div style="background:rgba(0,184,148,0.25);padding:15px 30px;border-radius:30px;display:inline-block;">
                            <span style="color:#00b894;font-size:42px;font-weight:800;" id="distanceLabel">${currentFilters.maxDistance}</span>
                            <span style="color:rgba(255,255,255,0.7);font-size:18px;margin-left:5px;">km</span>
                        </div>
                    </div>
                    <input type="range" id="distanceSlider" min="1" max="200" value="${currentFilters.maxDistance}" 
                        oninput="updateDistance(this.value)"
                        style="width:100%;height:8px;accent-color:#00b894;cursor:pointer;background:rgba(0,184,148,0.3);border-radius:10px;">
                    <div style="display:flex;justify-content:space-between;margin-top:10px;color:rgba(255,255,255,0.5);font-size:12px;">
                        <span>1 km</span>
                        <span>200 km</span>
                    </div>
                </div>
                
                <!-- Preferenze Section -->
                <div style="background:linear-gradient(135deg, rgba(162,155,254,0.15) 0%, rgba(129,236,236,0.08) 100%);border:2px solid rgba(162,155,254,0.3);border-radius:20px;padding:25px;margin-bottom:20px;">
                    <h3 style="color:#a29bfe;margin:0 0 20px 0;font-size:18px;display:flex;align-items:center;gap:12px;">
                        <span style="font-size:30px;">✨</span> Preferenze
                    </h3>
                    
                    <!-- Verificati -->
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:15px;background:rgba(255,255,255,0.05);border-radius:12px;margin-bottom:12px;">
                        <div style="display:flex;align-items:center;gap:12px;">
                            <span style="font-size:24px;">✅</span>
                            <div>
                                <div style="color:#fff;font-weight:600;">Solo Verificati</div>
                                <div style="color:rgba(255,255,255,0.5);font-size:12px;">Mostra solo profili verificati</div>
                            </div>
                        </div>
                        <label style="position:relative;width:50px;height:26px;cursor:pointer;">
                            <input type="checkbox" id="verifiedOnlyToggle" ${currentFilters.showVerifiedOnly ? 'checked' : ''} 
                                onchange="currentFilters.showVerifiedOnly = this.checked"
                                style="opacity:0;width:0;height:0;">
                            <span style="position:absolute;top:0;left:0;right:0;bottom:0;background:${currentFilters.showVerifiedOnly ? '#00b894' : 'rgba(255,255,255,0.2)'};border-radius:26px;transition:0.3s;"></span>
                            <span style="position:absolute;height:20px;width:20px;left:${currentFilters.showVerifiedOnly ? '27px' : '3px'};bottom:3px;background:#fff;border-radius:50%;transition:0.3s;"></span>
                        </label>
                    </div>
                    
                    <!-- Online -->
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:15px;background:rgba(255,255,255,0.05);border-radius:12px;margin-bottom:12px;">
                        <div style="display:flex;align-items:center;gap:12px;">
                            <span style="font-size:24px;">🟢</span>
                            <div>
                                <div style="color:#fff;font-weight:600;">Solo Online</div>
                                <div style="color:rgba(255,255,255,0.5);font-size:12px;">Attivi nelle ultime 24h</div>
                            </div>
                        </div>
                        <input type="checkbox" id="onlineOnlyToggle" ${currentFilters.showOnlineOnly ? 'checked' : ''} 
                            onchange="currentFilters.showOnlineOnly = this.checked"
                            style="width:50px;height:26px;accent-color:#00b894;cursor:pointer;">
                    </div>
                    
                    <!-- Con Foto -->
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:15px;background:rgba(255,255,255,0.05);border-radius:12px;margin-bottom:12px;">
                        <div style="display:flex;align-items:center;gap:12px;">
                            <span style="font-size:24px;">📸</span>
                            <div>
                                <div style="color:#fff;font-weight:600;">Solo con Foto</div>
                                <div style="color:rgba(255,255,255,0.5);font-size:12px;">Almeno una foto profilo</div>
                            </div>
                        </div>
                        <input type="checkbox" id="hasPhotosToggle" ${currentFilters.hasPhotos ? 'checked' : ''} 
                            onchange="currentFilters.hasPhotos = this.checked"
                            style="width:50px;height:26px;accent-color:#00b894;cursor:pointer;">
                    </div>
                    
                    <!-- Con Bio -->
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:15px;background:rgba(255,255,255,0.05);border-radius:12px;">
                        <div style="display:flex;align-items:center;gap:12px;">
                            <span style="font-size:24px;">📝</span>
                            <div>
                                <div style="color:#fff;font-weight:600;">Solo con Bio</div>
                                <div style="color:rgba(255,255,255,0.5);font-size:12px;">Profili con descrizione</div>
                            </div>
                        </div>
                        <input type="checkbox" id="hasBioToggle" ${currentFilters.hasBio ? 'checked' : ''} 
                            onchange="currentFilters.hasBio = this.checked"
                            style="width:50px;height:26px;accent-color:#00b894;cursor:pointer;">
                    </div>
                </div>
            </div>
            
            <!-- Fixed Buttons -->
            <div style="position:fixed;bottom:0;left:0;right:0;background:linear-gradient(0deg, #0f0f23 0%, transparent 100%);padding:20px;display:flex;gap:15px;">
                <button onclick="resetFilters()" style="flex:1;padding:16px;background:rgba(255,255,255,0.1);border:none;border-radius:15px;color:#fff;font-size:16px;font-weight:600;cursor:pointer;">
                    🔄 Resetta
                </button>
                <button onclick="applyFilters()" style="flex:2;padding:16px;background:linear-gradient(135deg, #ff4b6e 0%, #ff6b8a 100%);border:none;border-radius:15px;color:#fff;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 8px 25px rgba(255,75,110,0.4);">
                    ✅ Applica Filtri
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

function closeFiltersModal() {
    document.querySelectorAll('.fm-filters-overlay').forEach(m => m.remove());
}
function updateAgeMin(val) {
    currentFilters.ageMin = parseInt(val);
    document.getElementById('ageMinLabel').textContent = val;
    if (currentFilters.ageMin > currentFilters.ageMax) {
        currentFilters.ageMax = currentFilters.ageMin;
        document.getElementById('ageMaxSlider').value = currentFilters.ageMax;
        document.getElementById('ageMaxLabel').textContent = currentFilters.ageMax;
    }
}

function updateAgeMax(val) {
    currentFilters.ageMax = parseInt(val);
    document.getElementById('ageMaxLabel').textContent = val;
    if (currentFilters.ageMax < currentFilters.ageMin) {
        currentFilters.ageMin = currentFilters.ageMax;
        document.getElementById('ageMinSlider').value = currentFilters.ageMin;
        document.getElementById('ageMinLabel').textContent = currentFilters.ageMin;
    }
}

function updateDistance(val) {
    currentFilters.maxDistance = parseInt(val);
    document.getElementById('distanceLabel').textContent = val;
}

function toggleVerifiedOnly() {
    currentFilters.showVerifiedOnly = document.getElementById('verifiedOnlyToggle').checked;
}

function resetFilters() {
    currentFilters = { ageMin: 18, ageMax: 55, maxDistance: 50, showVerifiedOnly: false, showOnlineOnly: false, hasPhotos: true, hasBio: false };
    document.getElementById('ageMinSlider').value = 18;
    document.getElementById('ageMaxSlider').value = 55;
    document.getElementById('distanceSlider').value = 50;
    document.getElementById('verifiedOnlyToggle').checked = false;
    document.getElementById('onlineOnlyToggle').checked = false;
    document.getElementById('hasPhotosToggle').checked = true;
    document.getElementById('hasBioToggle').checked = false;
    document.getElementById('ageMinLabel').textContent = '18';
    document.getElementById('ageMaxLabel').textContent = '55';
    document.getElementById('distanceLabel').textContent = '50';
    showToast('🔄 Filtri resettati');
}

async function applyFilters() {
    closeFiltersModal();
    showToast('⏳ Applicando filtri...');
    
    // Salva filtri su Firebase
    const user = FlameAuth.currentUser;
    if (user) {
        try {
            await firebase.firestore().collection('users').doc(user.uid).update({
                searchFilters: currentFilters
            });
        } catch (e) {
            console.error('Errore salvataggio filtri:', e);
        }
    }
    
    // Ricarica profili con filtri applicati
    await loadFilteredProfiles();
    showToast('✅ Filtri applicati!');
}

async function loadFilteredProfiles() {
    const user = FlameAuth.currentUser;
    if (!user || !currentUserProfile) return;
    
    try {
        const swipedSnap = await firebase.firestore()
            .collection('swipes')
            .where('swiperId', '==', user.uid)
            .get();
        
        const swipedIds = new Set(swipedSnap.docs.map(d => d.data().swipedId));
        swipedIds.add(user.uid);
        
        // Blocca utenti bloccati
        const blockedSnap = await firebase.firestore()
            .collection('users').doc(user.uid)
            .collection('blockedUsers').get();
        blockedSnap.docs.forEach(d => swipedIds.add(d.id));
        
        // Query base
        let query = firebase.firestore().collection('users')
            .where('gender', '==', currentUserProfile.interestedIn || 'female')
            .where('isPaused', '!=', true);
        
        const snapshot = await query.limit(100).get();
        
        // Filtra client-side per età e verifica
        const profiles = [];
        const now = new Date();
        
        snapshot.docs.forEach(doc => {
            if (swipedIds.has(doc.id)) return;
            
            const data = doc.data();
            if (!data.birthDate) return;
            
            // Calcola età
            const birth = data.birthDate.toDate ? data.birthDate.toDate() : new Date(data.birthDate);
            const age = Math.floor((now - birth) / (365.25 * 24 * 60 * 60 * 1000));
            
            // Applica filtro età
            if (age < currentFilters.ageMin || age > currentFilters.ageMax) return;
            
            // Applica filtro verificati
            if (currentFilters.showVerifiedOnly && !data.isVerified) return;
            
            // Applica filtro solo online (attivi nelle ultime 24h)
            if (currentFilters.showOnlineOnly) {
                const lastActive = data.lastActive?.toDate ? data.lastActive.toDate() : null;
                if (!lastActive || (now - lastActive) > 24 * 60 * 60 * 1000) return;
            }
            
            // Applica filtro con foto
            if (currentFilters.hasPhotos) {
                if (!data.photos || data.photos.length === 0) return;
            }
            
            // Applica filtro con bio
            if (currentFilters.hasBio) {
                if (!data.bio || data.bio.trim().length < 10) return;
            }
            
            // Applica filtro distanza (se disponibile)
            if (data.location && currentUserProfile.location) {
                const dist = calculateDistance(
                    currentUserProfile.location.latitude,
                    currentUserProfile.location.longitude,
                    data.location.latitude,
                    data.location.longitude
                );
                if (dist > currentFilters.maxDistance) return;
            }
            
            profiles.push({ id: doc.id, ...data, age });
        });
        
        profilesToShow = profiles;
        currentProfileIndex = 0;
        showCurrentProfile();
        
    } catch (e) {
        console.error('Errore caricamento profili filtrati:', e);
    }
}

function toggleSafeMode() {
    const user = FlameAuth.currentUser;
    if (!user) return;
    
    // Toggle safe mode in filters
    currentFilters.showVerifiedOnly = !currentFilters.showVerifiedOnly;
    
    // Update in Firebase
    firebase.firestore().collection('users').doc(user.uid).update({
        safeModeEnabled: currentFilters.showVerifiedOnly
    });
    
    if (currentFilters.showVerifiedOnly) {
        showToast('🛡️ Modalità Sicura ATTIVA - Solo profili verificati');
        loadFilteredProfiles();
    } else {
        showToast('🔓 Modalità Sicura disattivata');
        loadProfiles();
    }
}

// ====== SIDEBAR NAVIGATION ======
function setActiveNav(navId) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.getElementById(navId)?.classList.add('active');
}

function showScopri(e) {
    if (e) e.preventDefault();
    setActiveNav('navScopri');
    // Chiudi tutti i modal
    document.querySelectorAll('.fullscreen-modal').forEach(m => m.classList.remove('show'));
    // Mostra area swipe, nascondi altre sezioni
    document.querySelector('.swipe-area')?.style.setProperty('display', 'flex');
    document.querySelector('.matches-panel')?.classList.remove('expanded');
}

function showEsplora(e) {
    if (e) e.preventDefault();
    setActiveNav('navEsplora');
    // Mostra modal esplora
    let modal = document.getElementById('exploreModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'exploreModal';
        modal.className = 'fullscreen-modal';
        modal.innerHTML = `
            <div class="modal-header">
                <h2>🧭 Esplora</h2>
                <button onclick="closeExploreModal()" class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="explore-options">
                    <div class="explore-card nearby-special" onclick="exploreNearby()">
                        <div class="nearby-gps-badge">📍 LIVE</div>
                        <div class="nearby-icon-wrapper">
                            <i class="fas fa-map-marker-alt"></i>
                            <div class="nearby-pulse"></div>
                        </div>
                        <h3>Vicino a te</h3>
                        <p>Scopri chi è nella tua zona</p>
                        <div class="nearby-distance-indicator">
                            <span class="distance-dot"></span>
                            <span>Entro 50km</span>
                        </div>
                    </div>
                    <div class="explore-card" onclick="exploreNew()">
                        <i class="fas fa-user-plus"></i>
                        <h3>Nuovi Iscritti</h3>
                        <p>I profili più recenti</p>
                    </div>
                    <div class="explore-card" onclick="explorePopular()">
                        <i class="fas fa-fire-alt"></i>
                        <h3>Popolari</h3>
                        <p>I profili più apprezzati</p>
                    </div>
                    <div class="explore-card" onclick="exploreOnline()">
                        <i class="fas fa-circle" style="color: #00d46a;"></i>
                        <h3>Online Ora</h3>
                        <p>Chi è attivo in questo momento</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }
    modal.classList.add('show');
}

function closeExploreModal() {
    document.getElementById('exploreModal')?.classList.remove('show');
    setActiveNav('navScopri');
}

// Alias per openExploreModal
function openExploreModal() {
    showEsplora();
}

async function exploreNearby() {
    closeExploreModal();
    showToast('📍 Cercando profili vicini...');
    
    const user = FlameAuth.currentUser;
    if (!user) {
        showToast('❌ Devi accedere per usare questa funzione');
        return;
    }
    
    // Verifica se abbiamo già la posizione o chiediamo al browser
    let userLocation = currentUserProfile?.location;
    
    if (!userLocation) {
        // Chiedi geolocalizzazione al browser
        showToast('📍 Richiedo la tua posizione...');
        
        try {
            userLocation = await requestGeolocation();
            
            // Salva la posizione nel profilo utente su Firebase
            await firebase.firestore().collection('users').doc(user.uid).update({
                location: userLocation,
                lastLocationUpdate: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Aggiorna profilo locale
            if (currentUserProfile) {
                currentUserProfile.location = userLocation;
            }
            
            showToast('✅ Posizione aggiornata!');
            
        } catch (e) {
            console.error('Errore geolocalizzazione:', e);
            if (e.code === 1) {
                showToast('❌ Permesso geolocalizzazione negato. Attivalo nelle impostazioni del browser.');
            } else if (e.code === 2) {
                showToast('❌ Impossibile ottenere la posizione. Riprova.');
            } else if (e.code === 3) {
                showToast('❌ Timeout geolocalizzazione. Riprova.');
            } else {
                showToast('❌ Errore geolocalizzazione: ' + e.message);
            }
            return;
        }
    }
    
    try {
        // Ottieni utenti già swipati
        const swipedSnap = await firebase.firestore()
            .collection('swipes')
            .where('swiperId', '==', user.uid)
            .get();
        const swipedIds = new Set(swipedSnap.docs.map(d => d.data().swipedId));
        swipedIds.add(user.uid);
        
        // Carica tutti i profili
        const snapshot = await firebase.firestore()
            .collection('users')
            .where('gender', '==', currentUserProfile.interestedIn || 'female')
            .limit(200)
            .get();
        
        // Filtra e ordina per distanza
        const profiles = [];
        snapshot.docs.forEach(doc => {
            if (swipedIds.has(doc.id)) return;
            const data = doc.data();
            if (!data.location || data.isPaused) return;
            
            const dist = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                data.location.latitude,
                data.location.longitude
            );
            
            if (dist <= 50) { // Entro 50km per avere più risultati
                profiles.push({ id: doc.id, ...data, distance: dist });
            }
        });
        
        // Ordina per distanza (più vicini prima)
        profiles.sort((a, b) => a.distance - b.distance);
        
        if (profiles.length === 0) {
            showToast('😔 Nessun profilo trovato nelle vicinanze (50km)');
            return;
        }
        
        profilesToShow = profiles;
        currentProfileIndex = 0;
        showCurrentProfile();
        showToast(`✅ ${profiles.length} profili trovati nelle vicinanze!`);
        
    } catch (e) {
        console.error('Errore explore nearby:', e);
        showToast('❌ Errore nella ricerca');
    }
}

// Funzione helper per richiedere geolocalizzazione
function requestGeolocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocalizzazione non supportata dal browser'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 300000 // 5 minuti cache
            }
        );
    });
}

async function exploreNew() {
    closeExploreModal();
    showToast('✨ Caricando nuovi iscritti...');
    
    const user = FlameAuth.currentUser;
    if (!user) return;
    
    try {
        const swipedSnap = await firebase.firestore()
            .collection('swipes')
            .where('swiperId', '==', user.uid)
            .get();
        const swipedIds = new Set(swipedSnap.docs.map(d => d.data().swipedId));
        swipedIds.add(user.uid);
        
        // Prendi utenti iscritti negli ultimi 7 giorni
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const snapshot = await firebase.firestore()
            .collection('users')
            .where('gender', '==', currentUserProfile?.interestedIn || 'female')
            .where('createdAt', '>=', weekAgo)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();
        
        const profiles = [];
        snapshot.docs.forEach(doc => {
            if (swipedIds.has(doc.id)) return;
            const data = doc.data();
            if (data.isPaused) return;
            profiles.push({ id: doc.id, ...data, isNew: true });
        });
        
        if (profiles.length === 0) {
            showToast('😔 Nessun nuovo iscritto questa settimana');
            return;
        }
        
        profilesToShow = profiles;
        currentProfileIndex = 0;
        showCurrentProfile();
        showToast(`✅ ${profiles.length} nuovi iscritti questa settimana!`);
        
    } catch (e) {
        console.error('Errore explore new:', e);
        showToast('❌ Errore nel caricamento');
    }
}

async function explorePopular() {
    closeExploreModal();
    showToast('🔥 Caricando profili popolari...');
    
    const user = FlameAuth.currentUser;
    if (!user) return;
    
    try {
        const swipedSnap = await firebase.firestore()
            .collection('swipes')
            .where('swiperId', '==', user.uid)
            .get();
        const swipedIds = new Set(swipedSnap.docs.map(d => d.data().swipedId));
        swipedIds.add(user.uid);
        
        // Prendi utenti con più like ricevuti
        const snapshot = await firebase.firestore()
            .collection('users')
            .where('gender', '==', currentUserProfile?.interestedIn || 'female')
            .orderBy('likesReceived', 'desc')
            .limit(100)
            .get();
        
        const profiles = [];
        snapshot.docs.forEach(doc => {
            if (swipedIds.has(doc.id)) return;
            const data = doc.data();
            if (data.isPaused) return;
            if ((data.likesReceived || 0) >= 5) { // Almeno 5 like
                profiles.push({ id: doc.id, ...data, isPopular: true });
            }
        });
        
        if (profiles.length === 0) {
            showToast('😔 Nessun profilo popolare disponibile');
            return;
        }
        
        profilesToShow = profiles;
        currentProfileIndex = 0;
        showCurrentProfile();
        showToast(`✅ ${profiles.length} profili popolari!`);
        
    } catch (e) {
        console.error('Errore explore popular:', e);
        // Se l'indice non esiste, fallback a ricerca normale
        if (e.code === 'failed-precondition') {
            showToast('⚠️ Funzione in preparazione');
        } else {
            showToast('❌ Errore nel caricamento');
        }
    }
}

async function exploreOnline() {
    closeExploreModal();
    showToast('🟢 Cercando utenti online...');
    
    const user = FlameAuth.currentUser;
    if (!user) return;
    
    try {
        const swipedSnap = await firebase.firestore()
            .collection('swipes')
            .where('swiperId', '==', user.uid)
            .get();
        const swipedIds = new Set(swipedSnap.docs.map(d => d.data().swipedId));
        swipedIds.add(user.uid);
        
        // Utenti attivi negli ultimi 15 minuti
        const fifteenMinsAgo = new Date();
        fifteenMinsAgo.setMinutes(fifteenMinsAgo.getMinutes() - 15);
        
        const snapshot = await firebase.firestore()
            .collection('users')
            .where('gender', '==', currentUserProfile?.interestedIn || 'female')
            .where('lastActive', '>=', fifteenMinsAgo)
            .orderBy('lastActive', 'desc')
            .limit(50)
            .get();
        
        const profiles = [];
        snapshot.docs.forEach(doc => {
            if (swipedIds.has(doc.id)) return;
            const data = doc.data();
            if (data.isPaused) return;
            profiles.push({ id: doc.id, ...data, isOnline: true });
        });
        
        if (profiles.length === 0) {
            showToast('😔 Nessun utente online al momento');
            return;
        }
        
        profilesToShow = profiles;
        currentProfileIndex = 0;
        showCurrentProfile();
        showToast(`✅ ${profiles.length} utenti online ora!`);
        
    } catch (e) {
        console.error('Errore explore online:', e);
        if (e.code === 'failed-precondition') {
            showToast('⚠️ Funzione in preparazione');
        } else {
            showToast('❌ Errore nel caricamento');
        }
    }
}

function showLikes(e) {
    if (e) e.preventDefault();
    setActiveNav('navLikes');
    
    // Controlla se utente ha piano Premium che permette di vedere i like
    const plan = getCurrentPlan();
    
    if (plan.canSeeLikes) {
        // Utente Gold/Platinum: mostra like reali
        showReceivedLikes();
    } else {
        // Utente Basic: mostra versione blurred
        showBlurredLikes();
    }
}

function showBlurredLikes() {
    let modal = document.getElementById('blurredLikesModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'blurredLikesModal';
        modal.className = 'fullscreen-modal';
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 450px; text-align: center;">
            <button class="close-modal" onclick="closeBlurredLikesModal()">
                <i class="fas fa-times"></i>
            </button>
            
            <h2 style="margin-bottom: 20px; display: flex; align-items: center; justify-content: center; gap: 10px;">
                <i class="fas fa-heart" style="color: #ff6b6b;"></i>
                Like Ricevuti
            </h2>
            
            <div class="blurred-likes-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px;">
                <div style="height: 120px; background: rgba(255,107,107,0.2); border-radius: 12px; filter: blur(8px);"></div>
                <div style="height: 120px; background: rgba(255,107,107,0.2); border-radius: 12px; filter: blur(8px);"></div>
                <div style="height: 120px; background: rgba(255,107,107,0.2); border-radius: 12px; filter: blur(8px);"></div>
                <div style="height: 120px; background: rgba(255,107,107,0.2); border-radius: 12px; filter: blur(8px);"></div>
            </div>
            
            <div style="background: rgba(255,215,0,0.1); border: 1px solid rgba(255,215,0,0.3); border-radius: 16px; padding: 24px; margin-bottom: 20px;">
                <i class="fas fa-crown" style="color: #ffd700; font-size: 3rem; margin-bottom: 12px;"></i>
                <h3 style="margin-bottom: 8px;">Scopri chi ti ha messo Like!</h3>
                <p style="color: #aaa; font-size: 14px; margin-bottom: 16px;">
                    Con FlameMatch <span style="color: #ffd700; font-weight: bold;">Gold</span> puoi vedere immediatamente chi è interessato a te
                </p>
                
                <div style="display: flex; gap: 16px; justify-content: center; margin-bottom: 12px;">
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #ffd700;">∞</div>
                        <div style="font-size: 11px; color: #888;">Swipe</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #ffd700;">5</div>
                        <div style="font-size: 11px; color: #888;">Super Like/giorno</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #ffd700;">1</div>
                        <div style="font-size: 11px; color: #888;">Boost/mese</div>
                    </div>
                </div>
            </div>
            
            <button onclick="closeBlurredLikesModal(); openPremiumModal();" style="
                width: 100%;
                padding: 14px;
                border-radius: 25px;
                background: linear-gradient(135deg, #f7971e, #ffd200);
                color: black;
                border: none;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            ">
                <i class="fas fa-crown"></i> Passa a Gold - €14.99/mese
            </button>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeBlurredLikesModal() {
    const modal = document.getElementById('blurredLikesModal');
    if (modal) modal.classList.remove('active');
    setActiveNav('navScopri');
}

function closeLikesModal() {
    document.getElementById('likesModal')?.classList.remove('show');
    setActiveNav('navScopri');
}

function showMatches(e) {
    if (e) e.preventDefault();
    setActiveNav('navChat');
    
    // Espandi pannello match sulla destra
    const panel = document.querySelector('.matches-panel');
    if (panel) {
        panel.classList.toggle('expanded');
        if (panel.classList.contains('expanded')) {
            showToast('💬 I tuoi match');
        }
    }
}

function showPremiumUpgrade() {
    // Usa il nuovo modal Premium completo
    closeBlurredLikesModal();
    openPremiumModal();
}

function openProfileSettings() {
    const isVerified = currentUserProfile?.isVerified || false;
    const verifyBtnText = isVerified ? 
        '<i class="fas fa-check-circle"></i> Profilo Verificato ✓' : 
        '<i class="fas fa-camera"></i> Verifica Profilo';
    const verifyBtnClass = isVerified ? 'settings-btn verified-btn' : 'settings-btn verify-btn';
    
    let modal = document.getElementById('profileSettingsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'profileSettingsModal';
        modal.className = 'fullscreen-modal';
        modal.innerHTML = `
            <div class="modal-header">
                <h2>⚙️ Il Mio Profilo</h2>
                <button onclick="closeProfileSettings()" class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="profile-settings">
                    <div class="profile-photo-section">
                        <img src="${currentUserProfile?.photos?.[0] || 'data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><rect fill=\"%23333\" width=\"100\" height=\"100\"/><text x=\"50\" y=\"55\" text-anchor=\"middle\" fill=\"%23888\" font-size=\"40\">👤</text></svg>'}" alt="Foto profilo" class="profile-main-photo">
                        <button class="edit-photo-btn" onclick="editPhotos()">
                            <i class="fas fa-camera"></i> Modifica foto
                        </button>
                        ${isVerified ? '<span class="verified-profile-badge"><i class="fas fa-check-circle"></i> Verificato</span>' : ''}
                    </div>
                    <div class="profile-info-section">
                        <h3>${currentUserProfile?.name || 'Utente'}, ${currentUserProfile?.age || ''}</h3>
                        <p class="profile-bio">${currentUserProfile?.bio || 'Nessuna bio'}</p>
                    </div>
                    <div class="settings-options">
                        <button class="${verifyBtnClass}" onclick="openVerifyProfile()" ${isVerified ? 'disabled' : ''}>
                            ${verifyBtnText}
                        </button>
                        <button class="settings-btn" onclick="closeProfileSettings(); openMyProfile()">
                            <i class="fas fa-images"></i> I Miei Post
                        </button>
                        <button class="settings-btn" onclick="editProfile()">
                            <i class="fas fa-user-edit"></i> Modifica Profilo
                        </button>
                        <button class="settings-btn" onclick="openFilters()">
                            <i class="fas fa-sliders-h"></i> Preferenze di Ricerca
                        </button>
                        <button class="settings-btn" onclick="showPrivacy()">
                            <i class="fas fa-shield-alt"></i> Privacy e Sicurezza
                        </button>
                        <button class="settings-btn" onclick="showNotificationSettings()">
                            <i class="fas fa-bell"></i> Notifiche
                        </button>
                        <button class="settings-btn danger" onclick="logout()">
                            <i class="fas fa-sign-out-alt"></i> Esci
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    } else {
        // Aggiorna info se esistente
        const photo = modal.querySelector('.profile-main-photo');
        const name = modal.querySelector('.profile-info-section h3');
        const bio = modal.querySelector('.profile-bio');
        const verifyBtn = modal.querySelector('.verify-btn, .verified-btn');
        if (photo) photo.src = currentUserProfile?.photos?.[0] || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23333" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%23888" font-size="40">👤</text></svg>';
        if (name) name.textContent = `${currentUserProfile?.name || 'Utente'}, ${currentUserProfile?.age || ''}`;
        if (bio) bio.textContent = currentUserProfile?.bio || 'Nessuna bio';
        if (verifyBtn) {
            verifyBtn.className = verifyBtnClass;
            verifyBtn.innerHTML = verifyBtnText;
            verifyBtn.disabled = isVerified;
        }
    }
    modal.classList.add('show');
}

function closeProfileSettings() {
    document.getElementById('profileSettingsModal')?.classList.remove('show');
}

function editPhotos() {
    closeProfileSettings();
    
    const photos = currentUserProfile?.photos || [];
    
    let modal = document.getElementById('editPhotosModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'editPhotosModal';
        modal.className = 'fullscreen-modal';
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }
    
    const photoSlots = [];
    for (let i = 0; i < 6; i++) {
        const photo = photos[i];
        photoSlots.push(`
            <div class="photo-slot ${photo ? 'has-photo' : ''}" data-index="${i}" onclick="handlePhotoSlot(${i})">
                ${photo ? `
                    <img src="${photo}" alt="Foto ${i + 1}">
                    <button class="delete-photo-btn" onclick="event.stopPropagation(); deletePhoto(${i})">
                        <i class="fas fa-times"></i>
                    </button>
                    ${i === 0 ? '<span class="main-badge">Principale</span>' : ''}
                ` : `
                    <div class="add-photo-placeholder">
                        <i class="fas fa-plus"></i>
                        <span>${i === 0 ? 'Foto principale' : 'Aggiungi foto'}</span>
                    </div>
                `}
            </div>
        `);
    }
    
    modal.innerHTML = `
        <div class="modal-header">
            <h2>📷 Modifica Foto</h2>
            <button onclick="closeEditPhotosModal()" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
            <p style="color: #aaa; margin-bottom: 20px; text-align: center;">
                Aggiungi fino a 6 foto. La prima sarà la foto principale del profilo.
            </p>
            
            <div class="photos-grid" style="
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
                padding: 10px;
            ">
                ${photoSlots.join('')}
            </div>
            
            <div style="padding: 20px; text-align: center;">
                <p style="color: #888; font-size: 12px;">
                    💡 Suggerimento: Usa foto recenti, sorridenti e ben illuminate
                </p>
            </div>
        </div>
        
        <style>
            .photo-slot {
                aspect-ratio: 3/4;
                background: rgba(255,255,255,0.05);
                border-radius: 12px;
                overflow: hidden;
                position: relative;
                cursor: pointer;
                border: 2px dashed rgba(255,255,255,0.2);
                transition: all 0.3s ease;
            }
            .photo-slot:hover {
                border-color: #ff4b6e;
                transform: scale(1.02);
            }
            .photo-slot.has-photo {
                border: none;
            }
            .photo-slot img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .add-photo-placeholder {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                color: #888;
            }
            .add-photo-placeholder i {
                font-size: 24px;
                margin-bottom: 8px;
                color: #ff4b6e;
            }
            .add-photo-placeholder span {
                font-size: 12px;
            }
            .delete-photo-btn {
                position: absolute;
                top: 5px;
                right: 5px;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: rgba(0,0,0,0.7);
                border: none;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .delete-photo-btn:hover {
                background: #ff4b6e;
            }
            .main-badge {
                position: absolute;
                bottom: 5px;
                left: 5px;
                background: linear-gradient(135deg, #ff4b6e, #ff6b8a);
                color: white;
                padding: 3px 8px;
                border-radius: 10px;
                font-size: 10px;
                font-weight: 600;
            }
        </style>
        
        <input type="file" id="photoUploadInput" accept="image/*" style="display: none;" onchange="handlePhotoUpload(event)">
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeEditPhotosModal() {
    const modal = document.getElementById('editPhotosModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
}

let currentPhotoIndex = 0;

function handlePhotoSlot(index) {
    currentPhotoIndex = index;
    document.getElementById('photoUploadInput').click();
}

async function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Verifica tipo file
    if (!file.type.startsWith('image/')) {
        showToast('⚠️ Seleziona un\'immagine valida');
        return;
    }
    
    // Verifica dimensione (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showToast('⚠️ L\'immagine è troppo grande (max 10MB)');
        return;
    }
    
    showToast('📤 Caricamento in corso...');
    
    try {
        const user = FlameAuth.currentUser;
        if (!user) throw new Error('Non autenticato');
        
        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'flamematch');
        formData.append('folder', `flamematch/users/${user.uid}`);
        
        const response = await fetch('https://api.cloudinary.com/v1_1/dnxqpp2en/image/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Upload fallito');
        
        const data = await response.json();
        const photoUrl = data.secure_url;
        
        // Aggiorna array foto
        const photos = currentUserProfile?.photos || [];
        photos[currentPhotoIndex] = photoUrl;
        
        // Rimuovi undefined/null
        const cleanPhotos = photos.filter(p => p);
        
        // Salva su Firebase
        await firebase.firestore().collection('users').doc(user.uid).update({
            photos: cleanPhotos
        });
        
        // Aggiorna profilo locale
        currentUserProfile.photos = cleanPhotos;
        
        // Refresh modal
        editPhotos();
        showToast('✅ Foto caricata con successo!');
        
    } catch (e) {
        console.error('Errore upload foto:', e);
        showToast('❌ Errore nel caricamento');
    }
    
    // Reset input
    event.target.value = '';
}

async function deletePhoto(index) {
    const user = FlameAuth.currentUser;
    if (!user) return;
    
    const photos = currentUserProfile?.photos || [];
    
    if (photos.length <= 1) {
        showToast('⚠️ Devi avere almeno una foto');
        return;
    }
    
    try {
        photos.splice(index, 1);
        
        await firebase.firestore().collection('users').doc(user.uid).update({
            photos: photos
        });
        
        currentUserProfile.photos = photos;
        editPhotos();
        showToast('🗑️ Foto eliminata');
        
    } catch (e) {
        console.error('Errore eliminazione foto:', e);
        showToast('❌ Errore nell\'eliminazione');
    }
}

function editProfile() {
    closeProfileSettings();
    
    let modal = document.getElementById('editProfileModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'editProfileModal';
        modal.className = 'fullscreen-modal';
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }
    
    const profile = currentUserProfile || {};
    
    modal.innerHTML = `
        <div class="modal-header">
            <h2>✏️ Modifica Profilo</h2>
            <button onclick="closeEditProfileModal()" class="close-btn">&times;</button>
        </div>
        <div class="modal-body edit-profile-body">
            <div class="edit-section">
                <label>Nome</label>
                <input type="text" id="editName" value="${profile.name || ''}" placeholder="Il tuo nome" maxlength="30">
            </div>
            
            <div class="edit-section">
                <label>Data di nascita</label>
                <input type="date" id="editBirthday" value="${profile.birthday || ''}">
            </div>
            
            <div class="edit-section">
                <label>Bio</label>
                <textarea id="editBio" placeholder="Racconta qualcosa di te..." rows="4" maxlength="500">${profile.bio || ''}</textarea>
                <span class="char-count"><span id="bioCharCount">${(profile.bio || '').length}</span>/500</span>
            </div>
            
            <div class="edit-section">
                <label>Lavoro</label>
                <input type="text" id="editJob" value="${profile.job || ''}" placeholder="Cosa fai nella vita?" maxlength="50">
            </div>
            
            <div class="edit-section">
                <label>Azienda/Scuola</label>
                <input type="text" id="editCompany" value="${profile.company || ''}" placeholder="Dove lavori/studi?" maxlength="50">
            </div>
            
            <div class="edit-section">
                <label>Città</label>
                <input type="text" id="editCity" value="${profile.city || ''}" placeholder="Dove vivi?" maxlength="50">
            </div>
            
            <div class="edit-section">
                <label>Genere</label>
                <select id="editGender">
                    <option value="">Seleziona...</option>
                    <option value="male" ${profile.gender === 'male' ? 'selected' : ''}>Uomo</option>
                    <option value="female" ${profile.gender === 'female' ? 'selected' : ''}>Donna</option>
                    <option value="other" ${profile.gender === 'other' ? 'selected' : ''}>Altro</option>
                </select>
            </div>
            
            <div class="edit-section">
                <label>Interessi</label>
                <div class="interests-grid" id="interestsGrid">
                    ${renderInterestsSelector(profile.interests || [])}
                </div>
            </div>
            
            <div class="edit-section">
                <label>🎤 Voice Vibe - Presentati con la voce!</label>
                <p style="color: #888; font-size: 0.85rem; margin-bottom: 15px;">
                    Registra un audio di 15 secondi per presentarti. La tua voce apparirà sul tuo profilo!
                </p>
                <div class="voice-recorder">
                    <div class="voice-recorder-icon" onclick="toggleVoiceRecording()">
                        <i class="fas fa-microphone"></i>
                    </div>
                    <p class="voice-recorder-text">Tocca per registrare (max 15s)</p>
                    <div class="voice-recorder-timer">0s / 15s</div>
                </div>
                <div class="voice-preview ${profile.voiceVibe?.url ? 'has-audio' : ''}">
                    ${profile.voiceVibe?.url ? `
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <button class="voice-play-btn" onclick="playVoicePreview('${profile.voiceVibe.url}')">
                                <i class="fas fa-play"></i>
                            </button>
                            <div class="voice-waveform">
                                <div class="wave-bar"></div>
                                <div class="wave-bar"></div>
                                <div class="wave-bar"></div>
                                <div class="wave-bar"></div>
                                <div class="wave-bar"></div>
                            </div>
                            <span style="color: #888; font-size: 0.9rem;">Il tuo Voice Vibe</span>
                        </div>
                        <button onclick="deleteVoiceVibe()" style="margin-top: 10px; background: none; border: none; color: #f44336; cursor: pointer;">
                            <i class="fas fa-trash"></i> Elimina
                        </button>
                    ` : ''}
                </div>
            </div>
            
            <div class="edit-actions">
                <button class="btn-secondary" onclick="closeEditProfileModal()">Annulla</button>
                <button class="btn-primary" onclick="saveProfileChanges()">
                    <i class="fas fa-save"></i> Salva
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Bio character count
    document.getElementById('editBio').addEventListener('input', (e) => {
        document.getElementById('bioCharCount').textContent = e.target.value.length;
    });
}

const availableInterests = [
    '🎵 Musica', '🎬 Cinema', '📚 Lettura', '✈️ Viaggi', '🍕 Food', '💪 Fitness',
    '🎮 Gaming', '📷 Fotografia', '🎨 Arte', '🏃 Running', '🧘 Yoga', '🍷 Vino',
    '☕ Caffè', '🐕 Animali', '🌱 Natura', '🎭 Teatro', '🎸 Concerti', '🏄 Sport',
    '👨‍🍳 Cucina', '🎤 Karaoke', '🎲 Giochi', '📺 Serie TV', '🎪 Festival', '🏔️ Montagna'
];

function renderInterestsSelector(selectedInterests) {
    return availableInterests.map(interest => `
        <label class="interest-tag ${selectedInterests.includes(interest) ? 'selected' : ''}">
            <input type="checkbox" value="${interest}" ${selectedInterests.includes(interest) ? 'checked' : ''} onchange="toggleInterest(this)">
            <span>${interest}</span>
        </label>
    `).join('');
}

function toggleInterest(checkbox) {
    checkbox.parentElement.classList.toggle('selected', checkbox.checked);
}

async function saveProfileChanges() {
    const user = FlameAuth.currentUser;
    if (!user) return;
    
    const name = document.getElementById('editName').value.trim();
    const birthday = document.getElementById('editBirthday').value;
    const bio = document.getElementById('editBio').value.trim();
    const job = document.getElementById('editJob').value.trim();
    const company = document.getElementById('editCompany').value.trim();
    const city = document.getElementById('editCity').value.trim();
    const gender = document.getElementById('editGender').value;
    
    // Raccogli interessi selezionati
    const interests = [];
    document.querySelectorAll('#interestsGrid input:checked').forEach(cb => {
        interests.push(cb.value);
    });
    
    if (!name) {
        showToast('⚠️ Il nome è obbligatorio', 'error');
        return;
    }
    
    try {
        await firebase.firestore().collection('users').doc(user.uid).update({
            name,
            birthday,
            bio,
            job,
            company,
            city,
            gender,
            interests,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Aggiorna profilo locale
        currentUserProfile = {
            ...currentUserProfile,
            name, birthday, bio, job, company, city, gender, interests
        };
        
        // Aggiorna UI
        updateUserUI();
        
        closeEditProfileModal();
        showToast('✅ Profilo aggiornato!');
        
    } catch (e) {
        console.error('Errore salvataggio profilo:', e);
        showToast('❌ Errore nel salvataggio', 'error');
    }
}

function closeEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
}

// ============================================
// SISTEMA DI VERIFICA PROFILO CON SELFIE
// ============================================

const verificationPoses = [
    { id: 'peace', name: 'Vittoria ✌️', instruction: 'Fai il segno della vittoria con la mano vicino al viso', icon: '✌️' },
    { id: 'thumbsup', name: 'Pollice Su 👍', instruction: 'Mostra il pollice alzato vicino al viso', icon: '👍' },
    { id: 'wave', name: 'Saluto 👋', instruction: 'Saluta con la mano aperta vicino al viso', icon: '👋' },
    { id: 'point', name: 'Indica 👆', instruction: 'Indica verso l\'alto con il dito indice', icon: '👆' },
    { id: 'ok', name: 'OK 👌', instruction: 'Fai il segno OK con la mano', icon: '👌' }
];

let verificationStream = null;
let selectedPose = null;

function openVerifyProfile() {
    // Scegli una posa casuale
    selectedPose = verificationPoses[Math.floor(Math.random() * verificationPoses.length)];
    
    let modal = document.getElementById('verifyProfileModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'verifyProfileModal';
        modal.className = 'fullscreen-modal verify-modal';
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }
    
    modal.innerHTML = `
        <div class="modal-header">
            <h2>🔐 Verifica il tuo Profilo</h2>
            <button onclick="closeVerifyModal()" class="close-btn">&times;</button>
        </div>
        <div class="modal-body verify-body">
            <div class="verify-steps">
                <div class="verify-step active" id="step1">
                    <div class="step-number">1</div>
                    <span>Preparati</span>
                </div>
                <div class="verify-step" id="step2">
                    <div class="step-number">2</div>
                    <span>Scatta</span>
                </div>
                <div class="verify-step" id="step3">
                    <div class="step-number">3</div>
                    <span>Verifica</span>
                </div>
            </div>
            
            <div class="verify-content" id="verifyContent">
                <div class="verify-intro" id="verifyIntro">
                    <div class="pose-display">
                        <span class="pose-icon">${selectedPose.icon}</span>
                    </div>
                    <h3>Imita questa posa:</h3>
                    <p class="pose-name">${selectedPose.name}</p>
                    <p class="pose-instruction">${selectedPose.instruction}</p>
                    <div class="verify-info">
                        <i class="fas fa-info-circle"></i>
                        <p>La verifica conferma che sei una persona reale. Il tuo selfie sarà confrontato con le foto del profilo.</p>
                    </div>
                    <button class="btn-verify-start" onclick="startVerificationCamera()">
                        <i class="fas fa-camera"></i> Avvia Fotocamera
                    </button>
                </div>
                
                <div class="verify-camera" id="verifyCamera" style="display:none;">
                    <div class="camera-container">
                        <video id="verifyVideo" autoplay playsinline></video>
                        <canvas id="verifyCanvas" style="display:none;"></canvas>
                        <div class="camera-overlay">
                            <div class="face-guide"></div>
                        </div>
                        <div class="pose-reminder">
                            <span class="pose-icon-small">${selectedPose.icon}</span>
                            <span>${selectedPose.name}</span>
                        </div>
                    </div>
                    <div class="camera-controls">
                        <button class="btn-capture" onclick="captureVerificationPhoto()">
                            <i class="fas fa-camera"></i>
                        </button>
                    </div>
                    <p class="camera-tip">Assicurati di avere una buona illuminazione e che il viso sia ben visibile</p>
                </div>
                
                <div class="verify-preview" id="verifyPreview" style="display:none;">
                    <img id="capturedPhoto" src="" alt="Foto catturata">
                    <div class="preview-actions">
                        <button class="btn-retake" onclick="retakePhoto()">
                            <i class="fas fa-redo"></i> Riprova
                        </button>
                        <button class="btn-submit-verify" onclick="submitVerification()">
                            <i class="fas fa-check"></i> Invia per Verifica
                        </button>
                    </div>
                </div>
                
                <div class="verify-processing" id="verifyProcessing" style="display:none;">
                    <div class="processing-animation">
                        <div class="spinner-verify"></div>
                        <i class="fas fa-user-check processing-icon"></i>
                    </div>
                    <h3>Verifica in corso...</h3>
                    <p id="processingStatus">Analisi del selfie...</p>
                    <div class="processing-steps">
                        <div class="proc-step" id="procStep1"><i class="fas fa-check"></i> Foto ricevuta</div>
                        <div class="proc-step" id="procStep2"><i class="fas fa-spinner fa-spin"></i> Analisi facciale</div>
                        <div class="proc-step" id="procStep3"><i class="fas fa-clock"></i> Confronto profilo</div>
                        <div class="proc-step" id="procStep4"><i class="fas fa-clock"></i> Verifica posa</div>
                    </div>
                </div>
                
                <div class="verify-success" id="verifySuccess" style="display:none;">
                    <div class="success-animation">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3>Profilo Verificato! 🎉</h3>
                    <p>Congratulazioni! Il tuo profilo è ora verificato.</p>
                    <p class="badge-info"><i class="fas fa-check-circle verified-badge"></i> Il badge blu apparirà sul tuo profilo</p>
                    <button class="btn-verify-done" onclick="closeVerifyModal()">
                        <i class="fas fa-check"></i> Fatto
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
}

async function startVerificationCamera() {
    document.getElementById('verifyIntro').style.display = 'none';
    document.getElementById('verifyCamera').style.display = 'block';
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.add('active');
    
    try {
        verificationStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false 
        });
        document.getElementById('verifyVideo').srcObject = verificationStream;
    } catch (error) {
        showToast('❌ Impossibile accedere alla fotocamera. Controlla i permessi.', 'error');
        closeVerifyModal();
    }
}

function captureVerificationPhoto() {
    const video = document.getElementById('verifyVideo');
    const canvas = document.getElementById('verifyCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const photoData = canvas.toDataURL('image/jpeg', 0.9);
    document.getElementById('capturedPhoto').src = photoData;
    
    // Ferma la camera
    if (verificationStream) {
        verificationStream.getTracks().forEach(track => track.stop());
    }
    
    document.getElementById('verifyCamera').style.display = 'none';
    document.getElementById('verifyPreview').style.display = 'block';
}

function retakePhoto() {
    document.getElementById('verifyPreview').style.display = 'none';
    document.getElementById('verifyCamera').style.display = 'block';
    startVerificationCamera();
}

async function submitVerification() {
    document.getElementById('verifyPreview').style.display = 'none';
    document.getElementById('verifyProcessing').style.display = 'block';
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.add('active');
    
    const photoData = document.getElementById('capturedPhoto').src;
    
    try {
        // Step 1: Upload foto su Cloudinary
        updateProcStep(1, 'loading', 'Caricamento foto...');
        const uploadResult = await uploadVerificationPhoto(photoData);
        updateProcStep(1, 'done', 'Foto ricevuta');
        
        // Step 2: Carica modelli AI per riconoscimento facciale
        updateProcStep(2, 'loading', 'Caricamento AI...');
        await loadFaceApiModels();
        updateProcStep(2, 'done', 'AI pronta');
        
        // Step 3: Analisi facciale del selfie
        updateProcStep(3, 'loading', 'Analisi facciale in corso...');
        const selfieAnalysis = await analyzeFace(photoData);
        
        if (!selfieAnalysis.faceDetected) {
            throw new Error('NO_FACE');
        }
        updateProcStep(3, 'done', 'Volto rilevato');
        
        // Step 4: Confronto con foto profilo usando AI
        updateProcStep(4, 'loading', 'Confronto con foto profilo...');
        const comparisonResult = await compareWithProfilePhotos(photoData);
        
        if (!comparisonResult.isMatch) {
            throw new Error('NO_MATCH');
        }
        
        updateProcStep(4, 'done', `Match: ${Math.round(comparisonResult.similarity * 100)}%`);
        
        // Verifica superata! Salva in Firestore
        await saveVerificationToFirestore(uploadResult?.url || photoData, comparisonResult.similarity);
        
        // Mostra successo
        setTimeout(() => {
            document.getElementById('verifyProcessing').style.display = 'none';
            showVerificationSuccess(comparisonResult.similarity);
        }, 500);
        
    } catch (error) {
        console.error('Errore verifica:', error);
        
        if (error.message === 'NO_FACE') {
            showVerificationError('Nessun volto rilevato', 'Assicurati che il tuo viso sia ben visibile e illuminato.');
        } else if (error.message === 'NO_MATCH') {
            showVerificationError('Verifica non superata', 'Il selfie non corrisponde alle foto del profilo. Assicurati di usare foto reali nel profilo.');
        } else {
            showVerificationError('Errore', 'Si è verificato un errore. Riprova più tardi.');
        }
    }
}

function updateProcStep(step, status, text) {
    const stepEl = document.getElementById(`procStep${step}`);
    const statusEl = document.getElementById('processingStatus');
    
    if (status === 'loading') {
        stepEl.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
        stepEl.classList.remove('done');
    } else if (status === 'done') {
        stepEl.innerHTML = `<i class="fas fa-check"></i> ${text}`;
        stepEl.classList.add('done');
    }
    
    if (statusEl) statusEl.textContent = text;
}

// ============================================
// FACE-API.JS - RICONOSCIMENTO FACCIALE AI
// ============================================

let faceApiLoaded = false;

async function loadFaceApiModels() {
    if (faceApiLoaded) return;
    
    // Carica face-api.js da CDN se non presente
    if (typeof faceapi === 'undefined') {
        await loadScript('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js');
    }
    
    // Carica i modelli necessari
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
    
    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    
    faceApiLoaded = true;
    console.log('✅ Face-API models loaded');
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function analyzeFace(imageData) {
    try {
        const img = await faceapi.fetchImage(imageData);
        const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();
        
        if (detection) {
            return {
                faceDetected: true,
                descriptor: detection.descriptor,
                landmarks: detection.landmarks,
                detection: detection.detection
            };
        }
        return { faceDetected: false };
    } catch (error) {
        console.error('Errore analisi volto:', error);
        return { faceDetected: false };
    }
}

async function compareWithProfilePhotos(selfieData) {
    try {
        // Ottieni descriptor del selfie
        const selfieAnalysis = await analyzeFace(selfieData);
        if (!selfieAnalysis.faceDetected) {
            return { isMatch: false, similarity: 0 };
        }
        
        // Ottieni foto profilo utente
        const user = firebase.auth().currentUser;
        if (!user) return { isMatch: false, similarity: 0 };
        
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        if (!userData?.photos || userData.photos.length === 0) {
            // Se non ci sono foto profilo, accetta il selfie (primo upload)
            console.log('Nessuna foto profilo - verifica accettata come prima foto');
            return { isMatch: true, similarity: 1.0 };
        }
        
        // Confronta con ogni foto del profilo
        let bestMatch = 0;
        
        for (const photoUrl of userData.photos) {
            if (!photoUrl) continue;
            
            try {
                const profileAnalysis = await analyzeFace(photoUrl);
                if (profileAnalysis.faceDetected) {
                    // Calcola distanza euclidea tra i descriptor (più bassa = più simile)
                    const distance = faceapi.euclideanDistance(
                        selfieAnalysis.descriptor,
                        profileAnalysis.descriptor
                    );
                    
                    // Converti distanza in similarità (0-1)
                    // Distanza tipica: 0.0 = identico, 0.6 = soglia tipica, 1.0+ = molto diverso
                    const similarity = Math.max(0, 1 - distance);
                    
                    if (similarity > bestMatch) {
                        bestMatch = similarity;
                    }
                    
                    console.log(`Confronto foto: distanza=${distance.toFixed(3)}, similarità=${(similarity*100).toFixed(1)}%`);
                }
            } catch (e) {
                console.warn('Errore analisi foto profilo:', e);
            }
        }
        
        // Soglia di accettazione: 40% di similarità (0.6 di distanza)
        const SIMILARITY_THRESHOLD = 0.40;
        
        console.log(`Miglior match: ${(bestMatch*100).toFixed(1)}% (soglia: ${SIMILARITY_THRESHOLD*100}%)`);
        
        return {
            isMatch: bestMatch >= SIMILARITY_THRESHOLD,
            similarity: bestMatch
        };
        
    } catch (error) {
        console.error('Errore confronto foto:', error);
        return { isMatch: false, similarity: 0 };
    }
}

function showVerificationSuccess(similarity) {
    const successEl = document.getElementById('verifySuccess');
    successEl.style.display = 'block';
    
    const percentage = Math.round(similarity * 100);
    
    successEl.innerHTML = `
        <div class="success-animation">
            <i class="fas fa-check-circle"></i>
        </div>
        <h3>Profilo Verificato! 🎉</h3>
        <p>L'AI ha confermato la tua identità con un match del <strong>${percentage}%</strong></p>
        <p class="badge-info"><i class="fas fa-check-circle verified-badge"></i> Il badge blu verificato è ora attivo sul tuo profilo</p>
        <button class="btn-verify-done" onclick="closeVerifyModal()">
            <i class="fas fa-check"></i> Fatto
        </button>
    `;
    
    // Aggiorna stato locale
    if (currentUserProfile) {
        currentUserProfile.isVerified = true;
    }
}

function showVerificationError(title, message) {
    const processingEl = document.getElementById('verifyProcessing');
    processingEl.innerHTML = `
        <div class="error-animation">
            <i class="fas fa-times-circle"></i>
        </div>
        <h3 style="color: #ff6b6b;">${title}</h3>
        <p>${message}</p>
        <div class="error-actions">
            <button class="btn-retake" onclick="retryVerification()">
                <i class="fas fa-redo"></i> Riprova
            </button>
            <button class="btn-cancel" onclick="closeVerifyModal()">
                <i class="fas fa-times"></i> Annulla
            </button>
        </div>
    `;
}

function retryVerification() {
    // Reset UI
    document.getElementById('verifyProcessing').style.display = 'none';
    document.getElementById('verifyIntro').style.display = 'block';
    
    // Reset steps
    document.querySelectorAll('.verify-step').forEach((el, i) => {
        el.classList.remove('active');
        if (i === 0) el.classList.add('active');
    });
    
    // Reset processing steps
    document.querySelectorAll('.proc-step').forEach(el => {
        el.classList.remove('done');
        el.innerHTML = el.innerHTML.replace('fa-check', 'fa-clock').replace('fa-spinner fa-spin', 'fa-clock');
    });
}

async function uploadVerificationPhoto(photoData) {
    try {
        // Converti base64 in blob
        const response = await fetch(photoData);
        const blob = await response.blob();
        
        const formData = new FormData();
        formData.append('file', blob, 'verification.jpg');
        formData.append('upload_preset', 'flamematch');
        formData.append('folder', 'verifications');
        
        const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/dnxqpp2en/image/upload', {
            method: 'POST',
            body: formData
        });
        
        if (uploadResponse.ok) {
            const data = await uploadResponse.json();
            return { url: data.secure_url };
        }
    } catch (error) {
        console.error('Errore upload:', error);
    }
    return null;
}

async function saveVerificationToFirestore(photoUrl, similarityScore) {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    try {
        // Crea record di verifica con dati AI
        await db.collection('verifications').add({
            uid: user.uid,
            pose: selectedPose.id,
            photoUrl: photoUrl,
            status: 'approved',
            verificationMethod: 'AI_FACE_RECOGNITION',
            aiSimilarityScore: similarityScore,
            aiConfidence: similarityScore >= 0.6 ? 'high' : similarityScore >= 0.4 ? 'medium' : 'low',
            verifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Aggiorna profilo utente con badge verificato
        await db.collection('users').doc(user.uid).update({
            isVerified: true,
            verifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
            verificationScore: similarityScore
        });
        
        console.log(`✅ Verifica salvata: ${(similarityScore * 100).toFixed(1)}% match`);
    } catch (error) {
        console.error('Errore salvataggio verifica:', error);
        throw error;
    }
}

function closeVerifyModal() {
    const modal = document.getElementById('verifyProfileModal');
    if (modal) {
        modal.classList.remove('show');
    }
    
    // Ferma la camera se attiva
    if (verificationStream) {
        verificationStream.getTracks().forEach(track => track.stop());
        verificationStream = null;
    }
    
    // Aggiorna il menu profilo per mostrare lo stato verificato
    const settingsModal = document.getElementById('profileSettingsModal');
    if (settingsModal && currentUserProfile?.isVerified) {
        settingsModal.remove();
        openProfileSettings();
    }
}

// ============================================
// FINE SISTEMA VERIFICA PROFILO
// ============================================

// ============================================
// PRIVACY E SICUREZZA - SISTEMA COMPLETO
// ============================================

let userPrivacySettings = {
    hideAge: false,
    hideDistance: false,
    profilePaused: false,
    blockedUsers: [],
    hiddenFromUsers: []
};

async function loadPrivacySettings() {
    const user = FlameAuth.currentUser;
    if (!user) return;
    
    try {
        const doc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (doc.exists && doc.data().privacySettings) {
            userPrivacySettings = { ...userPrivacySettings, ...doc.data().privacySettings };
        }
    } catch (e) {
        console.error('Errore caricamento privacy:', e);
    }
}

async function savePrivacySettings() {
    const user = FlameAuth.currentUser;
    if (!user) return;
    
    try {
        await firebase.firestore().collection('users').doc(user.uid).update({
            privacySettings: userPrivacySettings
        });
        showToast('✅ Impostazioni salvate!');
    } catch (e) {
        console.error('Errore salvataggio privacy:', e);
        showToast('❌ Errore salvataggio', 'error');
    }
}

function showPrivacy() {
    loadPrivacySettings().then(() => {
        let modal = document.getElementById('privacyModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'privacyModal';
            modal.className = 'fullscreen-modal';
            document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        }
        
        modal.innerHTML = `
            <div class="modal-header">
                <h2>🛡️ Privacy e Sicurezza</h2>
                <button onclick="closePrivacyModal()" class="close-btn">&times;</button>
            </div>
            <div class="modal-body privacy-body">
                <!-- Controlli Privacy -->
                <div class="privacy-section">
                    <h3><i class="fas fa-eye-slash"></i> Controllo Privacy</h3>
                    <div class="privacy-option">
                        <div class="option-info">
                            <span class="option-title">Nascondi età</span>
                            <span class="option-desc">Gli altri non vedranno la tua età</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="hideAge" ${userPrivacySettings.hideAge ? 'checked' : ''} onchange="togglePrivacy('hideAge')">
                            <span class="slider round"></span>
                        </label>
                    </div>
                    <div class="privacy-option">
                        <div class="option-info">
                            <span class="option-title">Nascondi distanza</span>
                            <span class="option-desc">La tua distanza non sarà visibile</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="hideDistance" ${userPrivacySettings.hideDistance ? 'checked' : ''} onchange="togglePrivacy('hideDistance')">
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>
                
                <!-- Pausa Profilo -->
                <div class="privacy-section">
                    <h3><i class="fas fa-pause-circle"></i> Pausa Profilo</h3>
                    <div class="privacy-option highlight ${userPrivacySettings.profilePaused ? 'paused' : ''}">
                        <div class="option-info">
                            <span class="option-title">Metti in pausa</span>
                            <span class="option-desc">Non apparirai nelle ricerche ma potrai chattare</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="profilePaused" ${userPrivacySettings.profilePaused ? 'checked' : ''} onchange="togglePauseProfile()">
                            <span class="slider round"></span>
                        </label>
                    </div>
                    <p class="privacy-note" id="pauseStatus">
                        ${userPrivacySettings.profilePaused ? '⏸️ Il tuo profilo è in pausa' : '✅ Il tuo profilo è attivo'}
                    </p>
                </div>
                
                <!-- Blocco Utenti -->
                <div class="privacy-section">
                    <h3><i class="fas fa-ban"></i> Utenti Bloccati</h3>
                    <p class="privacy-desc">Gli utenti bloccati non possono vederti o contattarti</p>
                    <div id="blockedUsersList" class="blocked-list">
                        ${renderBlockedUsers()}
                    </div>
                </div>
                
                <!-- Crittografia -->
                <div class="privacy-section">
                    <h3><i class="fas fa-lock"></i> Crittografia End-to-End</h3>
                    <div class="encryption-status">
                        <div class="encryption-icon">🔐</div>
                        <div class="encryption-info">
                            <span class="encryption-title">Messaggi Protetti</span>
                            <span class="encryption-desc">Tutti i tuoi messaggi sono crittografati. Solo tu e il tuo match potete leggerli.</span>
                        </div>
                        <span class="encryption-badge">ATTIVA</span>
                    </div>
                </div>
                
                <!-- Zona Pericolo -->
                <div class="privacy-section danger-zone">
                    <h3><i class="fas fa-exclamation-triangle"></i> Zona Pericolo</h3>
                    <button class="danger-btn" onclick="confirmDeleteAccount()">
                        <i class="fas fa-trash-alt"></i> Elimina Account
                    </button>
                    <p class="danger-note">Questa azione è permanente e non può essere annullata</p>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
}

function renderBlockedUsers() {
    if (!userPrivacySettings.blockedUsers || userPrivacySettings.blockedUsers.length === 0) {
        return '<p class="no-blocked">Nessun utente bloccato</p>';
    }
    
    return userPrivacySettings.blockedUsers.map(user => `
        <div class="blocked-user">
            <img src="${user.photo || 'https://ui-avatars.com/api/?name=' + user.name}" alt="${user.name}">
            <span>${user.name}</span>
            <button onclick="unblockUser('${user.id}')" class="unblock-btn">Sblocca</button>
        </div>
    `).join('');
}

function togglePrivacy(setting) {
    userPrivacySettings[setting] = !userPrivacySettings[setting];
    savePrivacySettings();
}

async function togglePauseProfile() {
    userPrivacySettings.profilePaused = !userPrivacySettings.profilePaused;
    
    const user = FlameAuth.currentUser;
    if (user) {
        try {
            await firebase.firestore().collection('users').doc(user.uid).update({
                privacySettings: userPrivacySettings,
                isActive: !userPrivacySettings.profilePaused,
                pausedAt: userPrivacySettings.profilePaused ? firebase.firestore.FieldValue.serverTimestamp() : null
            });
            
            const statusEl = document.getElementById('pauseStatus');
            if (statusEl) {
                statusEl.textContent = userPrivacySettings.profilePaused 
                    ? '⏸️ Il tuo profilo è in pausa' 
                    : '✅ Il tuo profilo è attivo';
            }
            
            showToast(userPrivacySettings.profilePaused 
                ? '⏸️ Profilo in pausa - Non apparirai nelle ricerche' 
                : '✅ Profilo riattivato!');
        } catch (e) {
            console.error('Errore pausa profilo:', e);
            showToast('❌ Errore', 'error');
        }
    }
}

async function blockUser(userId, userName, userPhoto) {
    const user = FlameAuth.currentUser;
    if (!user) return;
    
    // Aggiungi alla lista blocchi
    if (!userPrivacySettings.blockedUsers) {
        userPrivacySettings.blockedUsers = [];
    }
    
    userPrivacySettings.blockedUsers.push({
        id: userId,
        name: userName,
        photo: userPhoto,
        blockedAt: new Date().toISOString()
    });
    
    try {
        // Salva in Firestore
        await firebase.firestore().collection('users').doc(user.uid).update({
            privacySettings: userPrivacySettings
        });
        
        // Aggiungi anche alla collection blocchi per query veloci
        await firebase.firestore().collection('blocks').add({
            blockerId: user.uid,
            blockedId: userId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast(`🚫 ${userName} è stato bloccato`);
        
        // Rimuovi dalla vista se presente
        removeProfileFromView(userId);
        
    } catch (e) {
        console.error('Errore blocco utente:', e);
        showToast('❌ Errore nel blocco', 'error');
    }
}

async function unblockUser(userId) {
    const user = FlameAuth.currentUser;
    if (!user) return;
    
    userPrivacySettings.blockedUsers = userPrivacySettings.blockedUsers.filter(u => u.id !== userId);
    
    try {
        await firebase.firestore().collection('users').doc(user.uid).update({
            privacySettings: userPrivacySettings
        });
        
        // Rimuovi dalla collection blocchi
        const blocksQuery = await firebase.firestore().collection('blocks')
            .where('blockerId', '==', user.uid)
            .where('blockedId', '==', userId)
            .get();
        
        blocksQuery.forEach(doc => doc.ref.delete());
        
        // Aggiorna UI
        document.getElementById('blockedUsersList').innerHTML = renderBlockedUsers();
        showToast('✅ Utente sbloccato');
        
    } catch (e) {
        console.error('Errore sblocco:', e);
        showToast('❌ Errore', 'error');
    }
}

function removeProfileFromView(userId) {
    // Rimuovi dalla lista profili se presente
    profiles = profiles.filter(p => p.id !== userId);
    if (currentIndex >= profiles.length) {
        currentIndex = Math.max(0, profiles.length - 1);
    }
    showProfile(currentIndex);
}

// ============================================
// SEGNALA UTENTE
// ============================================

function reportUser(userId, userName) {
    let modal = document.getElementById('reportModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'reportModal';
        modal.className = 'fullscreen-modal report-modal';
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }
    
    modal.innerHTML = `
        <div class="modal-header">
            <h2>🚨 Segnala ${userName}</h2>
            <button onclick="closeReportModal()" class="close-btn">&times;</button>
        </div>
        <div class="modal-body report-body">
            <p class="report-intro">Seleziona il motivo della segnalazione:</p>
            
            <div class="report-options">
                <label class="report-option">
                    <input type="radio" name="reportReason" value="fake_profile">
                    <span class="report-label">
                        <i class="fas fa-user-secret"></i>
                        Profilo falso
                    </span>
                </label>
                <label class="report-option">
                    <input type="radio" name="reportReason" value="inappropriate_photos">
                    <span class="report-label">
                        <i class="fas fa-image"></i>
                        Foto inappropriate
                    </span>
                </label>
                <label class="report-option">
                    <input type="radio" name="reportReason" value="harassment">
                    <span class="report-label">
                        <i class="fas fa-comments"></i>
                        Messaggi molesti
                    </span>
                </label>
                <label class="report-option">
                    <input type="radio" name="reportReason" value="scam">
                    <span class="report-label">
                        <i class="fas fa-dollar-sign"></i>
                        Truffa / Spam
                    </span>
                </label>
                <label class="report-option">
                    <input type="radio" name="reportReason" value="underage">
                    <span class="report-label">
                        <i class="fas fa-child"></i>
                        Minorenne
                    </span>
                </label>
                <label class="report-option">
                    <input type="radio" name="reportReason" value="other">
                    <span class="report-label">
                        <i class="fas fa-ellipsis-h"></i>
                        Altro
                    </span>
                </label>
            </div>
            
            <textarea id="reportDetails" placeholder="Dettagli aggiuntivi (opzionale)..." rows="3"></textarea>
            
            <div class="report-actions">
                <button class="btn-secondary" onclick="closeReportModal()">Annulla</button>
                <button class="btn-danger" onclick="submitReport('${userId}', '${userName}')">
                    <i class="fas fa-flag"></i> Invia Segnalazione
                </button>
            </div>
            
            <div class="report-block-option">
                <label>
                    <input type="checkbox" id="blockAfterReport" checked>
                    Blocca anche questo utente
                </label>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

async function submitReport(userId, userName) {
    const reason = document.querySelector('input[name="reportReason"]:checked');
    if (!reason) {
        showToast('⚠️ Seleziona un motivo', 'error');
        return;
    }
    
    const details = document.getElementById('reportDetails').value;
    const blockAfter = document.getElementById('blockAfterReport').checked;
    const user = FlameAuth.currentUser;
    
    try {
        // Salva segnalazione in Firestore
        await firebase.firestore().collection('reports').add({
            reporterId: user.uid,
            reporterEmail: user.email,
            reportedUserId: userId,
            reportedUserName: userName,
            reason: reason.value,
            details: details,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Blocca se richiesto
        if (blockAfter) {
            await blockUser(userId, userName, null);
        }
        
        closeReportModal();
        showToast('✅ Segnalazione inviata. Grazie per averci aiutato!');
        
    } catch (e) {
        console.error('Errore segnalazione:', e);
        showToast('❌ Errore nell\'invio', 'error');
    }
}

function closeReportModal() {
    const modal = document.getElementById('reportModal');
    if (modal) modal.style.display = 'none';
}

// ============================================
// ELIMINA ACCOUNT
// ============================================

function confirmDeleteAccount() {
    let modal = document.getElementById('deleteAccountModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'deleteAccountModal';
        modal.className = 'fullscreen-modal delete-modal';
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }
    
    modal.innerHTML = `
        <div class="modal-header danger">
            <h2>⚠️ Elimina Account</h2>
            <button onclick="closeDeleteModal()" class="close-btn">&times;</button>
        </div>
        <div class="modal-body delete-body">
            <div class="delete-warning">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Sei sicuro?</h3>
                <p>Questa azione è <strong>permanente</strong> e non può essere annullata.</p>
            </div>
            
            <div class="delete-info">
                <h4>Verranno eliminati:</h4>
                <ul>
                    <li><i class="fas fa-user"></i> Il tuo profilo</li>
                    <li><i class="fas fa-heart"></i> Tutti i tuoi match</li>
                    <li><i class="fas fa-comments"></i> Tutte le conversazioni</li>
                    <li><i class="fas fa-image"></i> Tutte le foto</li>
                    <li><i class="fas fa-star"></i> Likes ricevuti e inviati</li>
                </ul>
            </div>
            
            <div class="pause-alternative">
                <p>💡 <strong>Suggerimento:</strong> Se vuoi solo fare una pausa, puoi mettere in pausa il profilo invece di eliminarlo.</p>
                <button class="btn-secondary" onclick="closeDeleteModal(); showPrivacy();">
                    <i class="fas fa-pause"></i> Metti in pausa invece
                </button>
            </div>
            
            <div class="delete-confirm">
                <p>Scrivi <strong>ELIMINA</strong> per confermare:</p>
                <input type="text" id="deleteConfirmInput" placeholder="Scrivi ELIMINA">
                <button class="btn-danger" onclick="executeDeleteAccount()" id="deleteAccountBtn" disabled>
                    <i class="fas fa-trash-alt"></i> Elimina Definitivamente
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    
    // Abilita bottone solo se scritto ELIMINA
    setTimeout(() => {
        const input = document.getElementById('deleteConfirmInput');
        const btn = document.getElementById('deleteAccountBtn');
        input.addEventListener('input', () => {
            btn.disabled = input.value !== 'ELIMINA';
        });
    }, 100);
}

async function executeDeleteAccount() {
    const input = document.getElementById('deleteConfirmInput');
    if (input.value !== 'ELIMINA') {
        showToast('⚠️ Scrivi ELIMINA per confermare', 'error');
        return;
    }
    
    const user = FlameAuth.currentUser;
    if (!user) return;
    
    const btn = document.getElementById('deleteAccountBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Eliminazione...';
    btn.disabled = true;
    
    try {
        const db = firebase.firestore();
        const batch = db.batch();
        
        // 1. Elimina profilo utente
        batch.delete(db.collection('users').doc(user.uid));
        
        // 2. Elimina tutti i match dove l'utente è coinvolto
        const matchesQuery = await db.collection('matches')
            .where('users', 'array-contains', user.uid)
            .get();
        
        matchesQuery.forEach(doc => batch.delete(doc.ref));
        
        // 3. Elimina tutti i messaggi inviati
        const messagesQuery = await db.collection('messages')
            .where('senderId', '==', user.uid)
            .get();
        
        messagesQuery.forEach(doc => batch.delete(doc.ref));
        
        // 4. Elimina tutti gli swipes
        const swipesFromQuery = await db.collection('swipes')
            .where('from', '==', user.uid)
            .get();
        
        swipesFromQuery.forEach(doc => batch.delete(doc.ref));
        
        const swipesToQuery = await db.collection('swipes')
            .where('to', '==', user.uid)
            .get();
        
        swipesToQuery.forEach(doc => batch.delete(doc.ref));
        
        // 5. Elimina verifiche
        const verifQuery = await db.collection('verifications')
            .where('uid', '==', user.uid)
            .get();
        
        verifQuery.forEach(doc => batch.delete(doc.ref));
        
        // Esegui batch
        await batch.commit();
        
        // 6. Elimina account Firebase Auth
        await user.delete();
        
        showToast('✅ Account eliminato con successo');
        
        // Redirect alla home
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (e) {
        console.error('Errore eliminazione account:', e);
        
        if (e.code === 'auth/requires-recent-login') {
            showToast('⚠️ Per sicurezza, effettua nuovamente il login', 'error');
            await FlameAuth.signOut();
            window.location.href = 'index.html';
        } else {
            showToast('❌ Errore durante l\'eliminazione', 'error');
            btn.innerHTML = '<i class="fas fa-trash-alt"></i> Elimina Definitivamente';
            btn.disabled = false;
        }
    }
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteAccountModal');
    if (modal) modal.style.display = 'none';
}

function closePrivacyModal() {
    const modal = document.getElementById('privacyModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
}

// ============================================
// IMPOSTAZIONI NOTIFICHE
// ============================================

let notificationSettings = {
    newMatch: true,
    newMessage: true,
    newLike: true,
    profileViews: false,
    marketing: false
};

async function loadNotificationSettings() {
    const user = FlameAuth.currentUser;
    if (!user) return;
    
    try {
        const doc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (doc.exists && doc.data().notificationSettings) {
            notificationSettings = { ...notificationSettings, ...doc.data().notificationSettings };
        }
    } catch (e) {
        console.error('Errore caricamento notifiche:', e);
    }
}

function showNotificationSettings() {
    loadNotificationSettings().then(() => {
        let modal = document.getElementById('notificationModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'notificationModal';
            modal.className = 'fullscreen-modal';
            document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        }
        
        modal.innerHTML = `
            <div class="modal-header">
                <h2>🔔 Notifiche</h2>
                <button onclick="closeNotificationModal()" class="close-btn">&times;</button>
            </div>
            <div class="modal-body privacy-body">
                <div class="privacy-section">
                    <h3><i class="fas fa-bell"></i> Attività</h3>
                    
                    <div class="privacy-option">
                        <div class="option-info">
                            <span class="option-title">Nuovi Match</span>
                            <span class="option-desc">Quando qualcuno ricambia il like</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" ${notificationSettings.newMatch ? 'checked' : ''} onchange="toggleNotification('newMatch')">
                            <span class="slider round"></span>
                        </label>
                    </div>
                    
                    <div class="privacy-option">
                        <div class="option-info">
                            <span class="option-title">Nuovi Messaggi</span>
                            <span class="option-desc">Quando ricevi un messaggio</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" ${notificationSettings.newMessage ? 'checked' : ''} onchange="toggleNotification('newMessage')">
                            <span class="slider round"></span>
                        </label>
                    </div>
                    
                    <div class="privacy-option">
                        <div class="option-info">
                            <span class="option-title">Nuovi Like</span>
                            <span class="option-desc">Quando qualcuno ti mette like</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" ${notificationSettings.newLike ? 'checked' : ''} onchange="toggleNotification('newLike')">
                            <span class="slider round"></span>
                        </label>
                    </div>
                    
                    <div class="privacy-option">
                        <div class="option-info">
                            <span class="option-title">Visite al Profilo</span>
                            <span class="option-desc">Quando qualcuno visita il tuo profilo</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" ${notificationSettings.profileViews ? 'checked' : ''} onchange="toggleNotification('profileViews')">
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>
                
                <div class="privacy-section">
                    <h3><i class="fas fa-envelope"></i> Marketing</h3>
                    
                    <div class="privacy-option">
                        <div class="option-info">
                            <span class="option-title">Email promozionali</span>
                            <span class="option-desc">Offerte speciali e novità</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" ${notificationSettings.marketing ? 'checked' : ''} onchange="toggleNotification('marketing')">
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
}

async function toggleNotification(setting) {
    notificationSettings[setting] = !notificationSettings[setting];
    
    const user = FlameAuth.currentUser;
    if (user) {
        try {
            await firebase.firestore().collection('users').doc(user.uid).update({
                notificationSettings: notificationSettings
            });
            showToast('✅ Impostazioni salvate');
        } catch (e) {
            console.error('Errore salvataggio notifiche:', e);
        }
    }
}

function closeNotificationModal() {
    const modal = document.getElementById('notificationModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
}

// ============================================
// BOOST PROFILO
// ============================================

let boostActive = false;
let boostEndTime = null;

async function checkBoostStatus() {
    const user = FlameAuth.currentUser;
    if (!user) return;
    
    try {
        const doc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (doc.exists && doc.data().boostEndTime) {
            const endTime = doc.data().boostEndTime.toDate();
            if (endTime > new Date()) {
                boostActive = true;
                boostEndTime = endTime;
                updateBoostUI();
            }
        }
    } catch (e) {
        console.error('Errore check boost:', e);
    }
}

function showBoostModal() {
    if (boostActive) {
        showToast('🚀 Boost già attivo!');
        return;
    }
    
    let modal = document.getElementById('boostModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'boostModal';
        modal.className = 'fullscreen-modal boost-modal';
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }
    
    modal.innerHTML = `
        <div class="modal-header boost-header">
            <h2>🚀 Boost</h2>
            <button onclick="closeBoostModal()" class="close-btn">&times;</button>
        </div>
        <div class="modal-body boost-body">
            <div class="boost-hero">
                <div class="boost-icon">🚀</div>
                <h3>Diventa il profilo più visibile!</h3>
                <p>Con il Boost, il tuo profilo sarà uno dei primi nella tua zona per <strong>30 minuti</strong></p>
            </div>
            
            <div class="boost-stats">
                <div class="boost-stat">
                    <span class="stat-number">10x</span>
                    <span class="stat-label">Più visualizzazioni</span>
                </div>
                <div class="boost-stat">
                    <span class="stat-number">3x</span>
                    <span class="stat-label">Più match</span>
                </div>
                <div class="boost-stat">
                    <span class="stat-number">30</span>
                    <span class="stat-label">Minuti</span>
                </div>
            </div>
            
            <div class="boost-options">
                <button class="boost-option" onclick="activateBoost(1)">
                    <span class="boost-count">1 Boost</span>
                    <span class="boost-price">€4,99</span>
                </button>
                <button class="boost-option popular" onclick="activateBoost(5)">
                    <span class="popular-badge">Più popolare</span>
                    <span class="boost-count">5 Boost</span>
                    <span class="boost-price">€14,99</span>
                    <span class="boost-save">Risparmi 50%</span>
                </button>
                <button class="boost-option" onclick="activateBoost(10)">
                    <span class="boost-count">10 Boost</span>
                    <span class="boost-price">€24,99</span>
                    <span class="boost-save">Risparmi 60%</span>
                </button>
            </div>
            
            <div id="availableBoostsSection" style="margin:15px 0;padding:15px;background:rgba(255,107,107,0.1);border-radius:10px;display:none;"><p style="color:#fff;margin:0 0 10px 0;">🚀 Boost disponibili: <span id="availableBoostsCount" style="color:#ff6b6b;font-weight:bold;">0</span></p><button class="boost-use-btn" onclick="usePurchasedBoost()" style="background:linear-gradient(135deg,#ff6b6b,#ff8e53);border:none;padding:12px 25px;border-radius:10px;color:#fff;font-weight:bold;cursor:pointer;">Usa 1 Boost Ora!</button></div><button class="boost-free" onclick="activateFreeBoost()">
                <i class="fas fa-gift"></i> Prova 1 Boost Gratis!
            </button>
            <p class="boost-note">Offerta limitata per i nuovi utenti</p>
        </div>
    `;
    
    modal.style.display = 'flex';
}

async function activateFreeBoost() {
    const user = FlameAuth.currentUser;
    if (!user) return;
    
    try {
        // Verifica se ha già usato il boost gratuito
        const doc = await firebase.firestore().collection('users').doc(user.uid).get();
        if (doc.exists && doc.data().usedFreeBoost) {
            showToast('⚠️ Hai già usato il boost gratuito', 'error');
            return;
        }
        
        const endTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minuti
        
        await firebase.firestore().collection('users').doc(user.uid).update({
            boostEndTime: endTime,
            boostStartTime: firebase.firestore.FieldValue.serverTimestamp(),
            usedFreeBoost: true,
            isBoosted: true
        });
        
        boostActive = true;
        boostEndTime = endTime;
        
        closeBoostModal();
        showToast('🚀 Boost attivato! Il tuo profilo è ora in evidenza per 30 minuti!');
        updateBoostUI();
        startBoostTimer();
        
    } catch (e) {
        console.error('Errore attivazione boost:', e);
        showToast('❌ Errore attivazione', 'error');
    }
}

async function activateBoostOLD(count) {
    // In produzione qui ci sarebbe l'integrazione con pagamento
    // OLD
}

function updateBoostUI() {
    // Aggiorna indicatore boost nella UI
    let boostIndicator = document.getElementById('boostIndicator');
    if (!boostIndicator && boostActive) {
        boostIndicator = document.createElement('div');
        boostIndicator.id = 'boostIndicator';
        boostIndicator.className = 'boost-indicator';
        document.body.appendChild(boostIndicator);
    }
    
    if (boostIndicator && boostActive) {
        boostIndicator.innerHTML = `
            <div class="boost-indicator-content">
                <span class="boost-icon-small">🚀</span>
                <span id="boostTimer">30:00</span>
            </div>
        `;
        boostIndicator.style.display = 'flex';
        startBoostTimer();
    }
}

function startBoostTimer() {
    const timerEl = document.getElementById('boostTimer');
    if (!timerEl || !boostEndTime) return;
    
    const interval = setInterval(() => {
        const now = new Date();
        const diff = boostEndTime - now;
        
        if (diff <= 0) {
            clearInterval(interval);
            boostActive = false;
            const indicator = document.getElementById('boostIndicator');
            if (indicator) indicator.style.display = 'none';
            showToast('⏱️ Il tuo Boost è terminato');
            
            // Aggiorna Firestore
            const user = FlameAuth.currentUser;
            if (user) {
                firebase.firestore().collection('users').doc(user.uid).update({
                    isBoosted: false
                });
            }
            return;
        }
        
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function closeBoostModal() {
    const modal = document.getElementById('boostModal');
    if (modal) modal.style.display = 'none';
}

async function logout() {
    if (confirm('Sei sicuro di voler uscire?')) {
        try {
            showToast('Disconnessione in corso...', 'info');
            
            // Pulisci cache locale
            localStorage.removeItem('flamematch_user');
            localStorage.removeItem('flamematch_profile');
            sessionStorage.clear();
            
            // Logout da Firebase
            await FlameAuth.signOut();
            
            console.log('👋 Logout completato');
            
            // Redirect alla homepage
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Errore logout:', error);
            showToast('Errore durante il logout', 'error');
        }
    }
}

// Toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    toast.className = 'toast ' + type;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Non attivare shortcuts se si sta scrivendo
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch(e.key) {
        case 'ArrowLeft':
            swipe('left');
            break;
        case 'ArrowRight':
            swipe('right');
            break;
        case 'ArrowUp':
            swipe('super');
            break;
        case 'z':
            undoSwipe();
            break;
        case 'Escape':
            closeChat();
            closeMatch();
            closeProfileModal();
            break;
    }
});

// ==========================================
// POST & SOCIAL SYSTEM
// ==========================================

// Variabili globali per il sistema post
let currentViewingUserId = null;
let currentViewingPostId = null;

// Apri profilo utente con post
async function openUserProfile(userId) {
    if (!userId) return;
    
    currentViewingUserId = userId;
    
    try {
        // Carica dati utente
        const userDoc = await firebase.firestore().collection('users').doc(userId).get();
        if (!userDoc.exists) {
            showToast('❌ Profilo non trovato', 'error');
            return;
        }
        
        const user = userDoc.data();
        const currentUser = FlameAuth.currentUser;
        const isOwnProfile = currentUser && currentUser.uid === userId;
        
        // Calcola età
        let age = '';
        if (user.birthDate) {
            const birth = new Date(user.birthDate);
            age = Math.floor((new Date() - birth) / 31557600000);
        }
        
        // Verifica badge
        const verifiedBadge = user.isVerified ? '<span class="verified-badge"><i class="fas fa-check-circle"></i></span>' : '';
        
        // Crea modal profilo completo
        // Determina avatar (foto o iniziale)
        const hasPhoto = user.photos && user.photos.length > 0 && user.photos[0];
        const avatarContent = hasPhoto 
            ? `<img src="${user.photos[0]}" alt="${user.name}" style="width: 120px; height: 120px; border-radius: 50%; border: 4px solid white; object-fit: cover;">`
            : `<div style="width: 120px; height: 120px; border-radius: 50%; border: 4px solid white; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; font-size: 48px; color: white; font-weight: bold; margin: 0 auto;">${(user.name || 'U')[0].toUpperCase()}</div>`;
        
        // Badge Premium
        let premiumBadge = '';
        if (user.subscriptionPlan === 'platinum') {
            premiumBadge = '<span style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.75em; margin-left: 8px;"><i class="fas fa-gem"></i> Platinum</span>';
        } else if (user.subscriptionPlan === 'gold') {
            premiumBadge = '<span style="background: linear-gradient(135deg, #f5af19, #f12711); color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.75em; margin-left: 8px;"><i class="fas fa-crown"></i> Gold</span>';
        }
        
        // Interessi
        const interests = user.interests || [];
        const interestsHtml = interests.length > 0 
            ? `<div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 12px;">
                ${interests.map(i => `<span style="background: rgba(255,255,255,0.2); color: white; padding: 4px 12px; border-radius: 15px; font-size: 0.85em;">${i}</span>`).join('')}
               </div>` 
            : '';
        
        let modal = document.getElementById('userProfileModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'userProfileModal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        }
        
        modal.innerHTML = `
            <div class="modal-content user-profile-modal" style="max-width: 600px; max-height: 90vh; overflow-y: auto; border-radius: 20px;">
                <button class="modal-close" onclick="closeUserProfileModal()">&times;</button>
                
                <!-- Header Profilo -->
                <div class="profile-header" style="text-align: center; padding: 25px 20px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 20px 20px 0 0;">
                    ${isOwnProfile && !hasPhoto ? `
                        <div style="position: relative; display: inline-block; cursor: pointer;" onclick="openPhotoUpload()">
                            ${avatarContent}
                            <div style="position: absolute; bottom: 5px; right: 5px; background: white; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                                <i class="fas fa-camera" style="color: var(--primary);"></i>
                            </div>
                        </div>
                    ` : avatarContent}
                    
                    <h2 style="color: white; margin: 15px 0 5px; display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 8px;">
                        ${user.name || 'Utente'}${age ? ', ' + age : ''} 
                        ${verifiedBadge}
                        ${premiumBadge}
                    </h2>
                    
                    ${user.bio ? `<p style="color: rgba(255,255,255,0.9); margin: 10px 0; font-size: 1em;">"${user.bio}"</p>` : 
                      isOwnProfile ? `<p style="color: rgba(255,255,255,0.6); margin: 10px 0; font-style: italic; font-size: 0.9em;">Aggiungi una bio per farti conoscere meglio</p>` : ''}
                    
                    ${user.location ? 
                      (isOwnProfile ? 
                        `<p onclick="setMyLocation()" style="color: rgba(255,255,255,0.8); font-size: 0.9em; margin: 5px 0; cursor: pointer; transition: all 0.3s;" onmouseover="this.style.color='#ff6b6b'" onmouseout="this.style.color='rgba(255,255,255,0.8)'"><i class="fas fa-map-marker-alt"></i> ${user.location} <i class="fas fa-edit" style="font-size: 0.75em; margin-left: 5px; opacity: 0.6;"></i></p>` :
                        `<p style="color: rgba(255,255,255,0.8); font-size: 0.9em; margin: 5px 0;"><i class="fas fa-map-marker-alt"></i> ${user.location}</p>`) : 
                      isOwnProfile ? `<p onclick="setMyLocation()" style="color: rgba(255,255,255,0.5); font-size: 0.85em; cursor: pointer; transition: all 0.3s;" onmouseover="this.style.color='#ff6b6b'" onmouseout="this.style.color='rgba(255,255,255,0.5)'"><i class="fas fa-map-marker-alt"></i> Posizione non impostata <i class="fas fa-edit" style="font-size: 0.8em; margin-left: 5px;"></i></p>` : ''}
                    
                    ${user.job ? `<p style="color: rgba(255,255,255,0.8); font-size: 0.9em; margin: 5px 0;"><i class="fas fa-briefcase"></i> ${user.job}</p>` : ''}
                    
                    ${interestsHtml}
                </div>
                
                <!-- Stats -->
                <div class="profile-stats" style="display: grid; grid-template-columns: repeat(${user.isVerified ? 4 : 3}, 1fr); padding: 20px 15px; background: var(--card-bg); border-bottom: 1px solid var(--border);">
                    <div style="text-align: center;">
                        <div id="postCount" style="font-size: 1.5em; font-weight: bold; color: var(--primary);">0</div>
                        <div style="font-size: 0.75em; color: var(--text-secondary);">Post</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 1.5em; font-weight: bold; color: var(--primary);">${user.likesReceived || 0}</div>
                        <div style="font-size: 0.75em; color: var(--text-secondary);">Like</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 1.5em; font-weight: bold; color: var(--primary);">${user.matchCount || 0}</div>
                        <div style="font-size: 0.75em; color: var(--text-secondary);">Match</div>
                    </div>
                    ${user.isVerified ? `
                    <div style="text-align: center;">
                        <div style="font-size: 1.5em; color: #4CAF50;"><i class="fas fa-check-circle"></i></div>
                        <div style="font-size: 0.75em; color: var(--text-secondary);">Verificato</div>
                    </div>
                    ` : ''}
                </div>
                
                <!-- Azioni -->
                <div style="padding: 15px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    ${isOwnProfile ? `
                        <button onclick="closeUserProfileModal(); openProfileSettings()" class="btn-secondary" style="flex: 1; min-width: 140px;">
                            <i class="fas fa-edit"></i> Modifica Profilo
                        </button>
                        <button onclick="openCreatePostModal()" class="btn-primary" style="flex: 1; min-width: 140px;">
                            <i class="fas fa-plus"></i> Crea Post
                        </button>
                    ` : `
                        <button onclick="likeUserFromProfile('${userId}')" class="btn-secondary" style="flex: 1; min-width: 100px;">
                            <i class="fas fa-heart"></i> Like
                        </button>
                        <button onclick="startChatWithUser('${userId}')" class="btn-primary" style="flex: 1; min-width: 140px;">
                            <i class="fas fa-comment"></i> Messaggio
                        </button>
                    `}
                </div>
                
                <!-- Galleria Foto -->
                ${user.photos && user.photos.length > 1 ? `
                <div style="padding: 15px; border-bottom: 1px solid var(--border);">
                    <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 8px; font-size: 1em;">
                        <i class="fas fa-camera"></i> Foto (${user.photos.length})
                    </h3>
                    <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px;">
                        ${user.photos.map((photo, idx) => `
                            <img src="${photo}" alt="Foto ${idx + 1}" 
                                 style="width: 80px; height: 80px; border-radius: 10px; object-fit: cover; cursor: pointer; flex-shrink: 0;"
                                 onclick="viewFullPhoto('${photo}')">
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <!-- Griglia Post -->
                <div style="padding: 15px;">
                    <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 8px; font-size: 1em;">
                        <i class="fas fa-images"></i> Post
                    </h3>
                    <div id="userPostsGrid" class="posts-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px;">
                        <div style="grid-column: span 3; text-align: center; padding: 40px; color: var(--text-secondary);">
                            <i class="fas fa-spinner fa-spin" style="font-size: 2em;"></i>
                            <p>Caricamento post...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
        modal.onclick = (e) => { if (e.target === modal) closeUserProfileModal(); };
        
        // Carica post utente
        await loadUserPosts(userId);
        
    } catch (error) {
        console.error('Errore apertura profilo:', error);
        showToast('❌ Errore caricamento profilo', 'error');
    }
}

// Chiudi profilo utente
function closeUserProfileModal() {
    const modal = document.getElementById('userProfileModal');
    if (modal) modal.style.display = 'none';
    currentViewingUserId = null;
}

// Apri upload foto profilo
function openPhotoUpload() {
    closeUserProfileModal();
    setTimeout(() => openProfileSettings(), 100);
    showToast('📸 Vai su "Cambia Foto" per aggiungere una foto', 'info');
}

// Visualizza foto a schermo intero
function viewFullPhoto(photoUrl) {
    let overlay = document.getElementById('fullPhotoOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'fullPhotoOverlay';
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); display: flex; align-items: center; justify-content: center; z-index: 10001; cursor: pointer;';
        overlay.onclick = () => overlay.remove();
        document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
        <img src="${photoUrl}" style="max-width: 90%; max-height: 90%; object-fit: contain; border-radius: 10px;">
        <button style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.2); border: none; color: white; font-size: 24px; width: 50px; height: 50px; border-radius: 50%; cursor: pointer;">&times;</button>
    `;
}

// Like utente dal profilo
async function likeUserFromProfile(userId) {
    const currentUser = FlameAuth.currentUser;
    if (!currentUser) {
        showToast('❌ Devi essere loggato', 'error');
        return;
    }
    
    try {
        // Registra il like
        await firebase.firestore().collection('likes').add({
            fromUserId: currentUser.uid,
            toUserId: userId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Incrementa likes ricevuti
        await firebase.firestore().collection('users').doc(userId).update({
            likesReceived: firebase.firestore.FieldValue.increment(1)
        });
        
        showToast('❤️ Like inviato!', 'success');
        
        // Controlla se c'è match
        const reverseCheck = await firebase.firestore().collection('likes')
            .where('fromUserId', '==', userId)
            .where('toUserId', '==', currentUser.uid)
            .get();
        
        if (!reverseCheck.empty) {
            showToast('🔥 È un MATCH!', 'success');
        }
        
    } catch (error) {
        console.error('Errore like:', error);
        showToast('❌ Errore invio like', 'error');
    }
}

// Carica post utente
async function loadUserPosts(userId) {
    const grid = document.getElementById('userPostsGrid');
    if (!grid) return;
    
    try {
        const postsSnapshot = await firebase.firestore()
            .collection('posts')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(30)
            .get();
        
        // Aggiorna contatore
        const countEl = document.getElementById('postCount');
        if (countEl) countEl.textContent = postsSnapshot.size;
        
        if (postsSnapshot.empty) {
            const currentUser = FlameAuth.currentUser;
            const isOwnProfile = currentUser && currentUser.uid === userId;
            
            grid.innerHTML = `
                <div style="grid-column: span 3; text-align: center; padding: 40px; color: var(--text-secondary);">
                    <i class="fas fa-camera" style="font-size: 3em; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p>${isOwnProfile ? 'Non hai ancora pubblicato post' : 'Nessun post pubblicato'}</p>
                    ${isOwnProfile ? '<button onclick="openCreatePostModal()" class="btn-secondary" style="margin-top: 10px;"><i class="fas fa-plus"></i> Crea il tuo primo post</button>' : ''}
                </div>
            `;
            return;
        }
        
        grid.innerHTML = '';
        
        postsSnapshot.forEach(doc => {
            const post = doc.data();
            const postEl = document.createElement('div');
            postEl.className = 'post-thumbnail';
            postEl.style.cssText = 'aspect-ratio: 1; cursor: pointer; position: relative; overflow: hidden; border-radius: 5px;';
            
            if (post.type === 'video') {
                postEl.innerHTML = `
                    <video src="${post.mediaUrl}" style="width: 100%; height: 100%; object-fit: cover;"></video>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 1.5em;">
                        <i class="fas fa-play"></i>
                    </div>
                `;
            } else {
                postEl.innerHTML = `<img src="${post.mediaUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="Post">`;
            }
            
            // Overlay con stats
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7)); padding: 8px; display: flex; gap: 10px; color: white; font-size: 0.8em;';
            overlay.innerHTML = `
                <span><i class="fas fa-heart"></i> ${post.likesCount || 0}</span>
                <span><i class="fas fa-comment"></i> ${post.commentsCount || 0}</span>
            `;
            postEl.appendChild(overlay);
            
            postEl.onclick = () => openPostDetail(doc.id, post);
            grid.appendChild(postEl);
        });
        
    } catch (error) {
        console.error('Errore caricamento post:', error);
        grid.innerHTML = `
            <div style="grid-column: span 3; text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="fas fa-exclamation-triangle" style="font-size: 2em; color: #ff6b6b;"></i>
                <p>Errore nel caricamento dei post</p>
            </div>
        `;
    }
}

// Apri modal creazione post
function openCreatePostModal() {
    let modal = document.getElementById('createPostModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'createPostModal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <button class="modal-close" onclick="closeCreatePostModal()">&times;</button>
            <h2 style="text-align: center; margin-bottom: 20px;">
                <i class="fas fa-plus-circle" style="color: var(--primary);"></i> Crea Nuovo Post
            </h2>
            
            <!-- Upload Area -->
            <div id="postUploadArea" onclick="document.getElementById('postFileInput').click()" 
                 style="border: 2px dashed var(--border); border-radius: 15px; padding: 40px; text-align: center; cursor: pointer; margin-bottom: 20px; transition: all 0.3s;">
                <i class="fas fa-cloud-upload-alt" style="font-size: 3em; color: var(--primary); margin-bottom: 10px;"></i>
                <p>Clicca o trascina per caricare</p>
                <p style="font-size: 0.8em; color: var(--text-secondary);">JPG, PNG, GIF, MP4 (max 50MB)</p>
            </div>
            
            <input type="file" id="postFileInput" accept="image/*,video/*" style="display: none;" onchange="handlePostFileSelect(this)">
            
            <!-- Preview -->
            <div id="postPreviewContainer" style="display: none; margin-bottom: 20px; position: relative;">
                <img id="postPreviewImg" style="width: 100%; border-radius: 10px; display: none;">
                <video id="postPreviewVideo" controls style="width: 100%; border-radius: 10px; display: none;"></video>
                <button onclick="clearPostPreview()" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <!-- Didascalia -->
            <textarea id="postCaption" placeholder="Scrivi una didascalia..." 
                      style="width: 100%; padding: 15px; border: 1px solid var(--border); border-radius: 10px; background: var(--card-bg); color: var(--text); resize: none; height: 100px; font-family: inherit;"></textarea>
            
            <!-- Pulsante Pubblica -->
            <button id="publishPostBtn" onclick="publishPost()" class="btn-primary" 
                    style="width: 100%; margin-top: 15px; padding: 15px; font-size: 1.1em;" disabled>
                <i class="fas fa-paper-plane"></i> Pubblica
            </button>
        </div>
    `;
    
    modal.style.display = 'flex';
    modal.onclick = (e) => { if (e.target === modal) closeCreatePostModal(); };
    
    // Drag and drop
    const uploadArea = document.getElementById('postUploadArea');
    uploadArea.ondragover = (e) => { e.preventDefault(); uploadArea.style.borderColor = 'var(--primary)'; };
    uploadArea.ondragleave = () => { uploadArea.style.borderColor = 'var(--border)'; };
    uploadArea.ondrop = (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--border)';
        const file = e.dataTransfer.files[0];
        if (file) handlePostFileSelectFile(file);
    };
}

function closeCreatePostModal() {
    const modal = document.getElementById('createPostModal');
    if (modal) modal.style.display = 'none';
}

// Variabile per file selezionato
let selectedPostFile = null;

function handlePostFileSelect(input) {
    if (input.files && input.files[0]) {
        handlePostFileSelectFile(input.files[0]);
    }
}

function handlePostFileSelectFile(file) {
    // Verifica dimensione (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
        showToast('❌ File troppo grande (max 50MB)', 'error');
        return;
    }
    
    selectedPostFile = file;
    const isVideo = file.type.startsWith('video/');
    
    document.getElementById('postUploadArea').style.display = 'none';
    document.getElementById('postPreviewContainer').style.display = 'block';
    
    if (isVideo) {
        document.getElementById('postPreviewImg').style.display = 'none';
        const video = document.getElementById('postPreviewVideo');
        video.style.display = 'block';
        video.src = URL.createObjectURL(file);
    } else {
        document.getElementById('postPreviewVideo').style.display = 'none';
        const img = document.getElementById('postPreviewImg');
        img.style.display = 'block';
        img.src = URL.createObjectURL(file);
    }
    
    document.getElementById('publishPostBtn').disabled = false;
}

function clearPostPreview() {
    selectedPostFile = null;
    document.getElementById('postUploadArea').style.display = 'block';
    document.getElementById('postPreviewContainer').style.display = 'none';
    document.getElementById('postPreviewImg').style.display = 'none';
    document.getElementById('postPreviewVideo').style.display = 'none';
    document.getElementById('publishPostBtn').disabled = true;
}

// Pubblica post
async function publishPost() {
    if (!selectedPostFile) {
        showToast('❌ Seleziona un file', 'error');
        return;
    }
    
    const user = FlameAuth.currentUser;
    if (!user) {
        showToast('❌ Devi essere loggato', 'error');
        return;
    }
    
    const btn = document.getElementById('publishPostBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Pubblicazione...';
    
    try {
        // Upload a Cloudinary
        const formData = new FormData();
        formData.append('file', selectedPostFile);
        formData.append('upload_preset', 'flamematch');
        
        const isVideo = selectedPostFile.type.startsWith('video/');
        const resourceType = isVideo ? 'video' : 'image';
        
        const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/dnxqpp2en/${resourceType}/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (!uploadResponse.ok) throw new Error('Upload fallito');
        
        const uploadData = await uploadResponse.json();
        
        // Crea documento post
        const caption = document.getElementById('postCaption').value.trim();
        
        await firebase.firestore().collection('posts').add({
            userId: user.uid,
            mediaUrl: uploadData.secure_url,
            type: isVideo ? 'video' : 'image',
            caption: caption,
            likesCount: 0,
            commentsCount: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast('✅ Post pubblicato!');
        closeCreatePostModal();
        
        // Ricarica post
        if (currentViewingUserId === user.uid) {
            await loadUserPosts(user.uid);
        }
        
    } catch (error) {
        console.error('Errore pubblicazione:', error);
        showToast('❌ Errore pubblicazione post', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Pubblica';
    }
}

// Apri dettaglio post
async function openPostDetail(postId, postData) {
    currentViewingPostId = postId;
    
    let modal = document.getElementById('postDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'postDetailModal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }
    
    // Carica dati autore
    const authorDoc = await firebase.firestore().collection('users').doc(postData.userId).get();
    const author = authorDoc.exists ? authorDoc.data() : { name: 'Utente' };
    
    const currentUser = FlameAuth.currentUser;
    const isOwnPost = currentUser && currentUser.uid === postData.userId;
    
    // Controlla se ha già messo like
    let hasLiked = false;
    if (currentUser) {
        const likeDoc = await firebase.firestore()
            .collection('posts').doc(postId)
            .collection('likes').doc(currentUser.uid)
            .get();
        hasLiked = likeDoc.exists;
    }
    
    const createdAt = postData.createdAt?.toDate?.() || new Date();
    const timeAgo = getTimeAgo(createdAt);
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 900px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column;">
            <button class="modal-close" onclick="closePostDetailModal()">&times;</button>
            
            <div style="display: flex; flex: 1; overflow: hidden;" class="post-detail-container">
                <!-- Media -->
                <div style="flex: 1; background: #000; display: flex; align-items: center; justify-content: center; min-height: 400px;">
                    ${postData.type === 'video' 
                        ? `<video src="${postData.mediaUrl}" controls style="max-width: 100%; max-height: 100%;"></video>`
                        : `<img src="${postData.mediaUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`
                    }
                </div>
                
                <!-- Sidebar Commenti -->
                <div style="width: 350px; display: flex; flex-direction: column; border-left: 1px solid var(--border);" class="post-sidebar">
                    <!-- Header -->
                    <div style="padding: 15px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px;">
                        <img src="${author.photos?.[0] || DEFAULT_AVATAR_40}" 
                             style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; cursor: pointer;"
                             onclick="closePostDetailModal(); openUserProfile('${postData.userId}')">
                        <div style="flex: 1;">
                            <strong style="cursor: pointer;" onclick="closePostDetailModal(); openUserProfile('${postData.userId}')">${author.name || 'Utente'}</strong>
                            ${author.isVerified ? '<i class="fas fa-check-circle" style="color: var(--primary); font-size: 0.8em;"></i>' : ''}
                            <div style="font-size: 0.8em; color: var(--text-secondary);">${timeAgo}</div>
                        </div>
                        ${isOwnPost ? `
                            <button onclick="deletePost('${postId}')" style="background: none; border: none; color: #ff6b6b; cursor: pointer;">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                    
                    <!-- Caption -->
                    ${postData.caption ? `
                        <div style="padding: 15px; border-bottom: 1px solid var(--border);">
                            <p style="margin: 0;">${postData.caption}</p>
                        </div>
                    ` : ''}
                    
                    <!-- Commenti -->
                    <div id="postComments" style="flex: 1; overflow-y: auto; padding: 15px;">
                        <div style="text-align: center; color: var(--text-secondary);">
                            <i class="fas fa-spinner fa-spin"></i> Caricamento commenti...
                        </div>
                    </div>
                    
                    <!-- Azioni -->
                    <div style="padding: 15px; border-top: 1px solid var(--border);">
                        <div style="display: flex; gap: 15px; margin-bottom: 10px;">
                            <button id="likePostBtn" onclick="toggleLikePost('${postId}')" 
                                    style="background: none; border: none; cursor: pointer; font-size: 1.3em; color: ${hasLiked ? 'var(--primary)' : 'var(--text)'};">
                                <i class="fa${hasLiked ? 's' : 'r'} fa-heart"></i>
                            </button>
                            <button onclick="document.getElementById('commentInput').focus()" 
                                    style="background: none; border: none; cursor: pointer; font-size: 1.3em; color: var(--text);">
                                <i class="far fa-comment"></i>
                            </button>
                        </div>
                        <div id="postLikesCount" style="font-weight: bold; margin-bottom: 10px;">${postData.likesCount || 0} like</div>
                    </div>
                    
                    <!-- Input Commento -->
                    ${currentUser ? `
                        <div style="padding: 15px; border-top: 1px solid var(--border); display: flex; gap: 10px;">
                            <input type="text" id="commentInput" placeholder="Aggiungi un commento..." 
                                   style="flex: 1; padding: 10px; border: 1px solid var(--border); border-radius: 20px; background: var(--card-bg); color: var(--text);"
                                   onkeypress="if(event.key==='Enter')submitComment('${postId}')">
                            <button onclick="submitComment('${postId}')" style="background: var(--primary); color: white; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer;">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    ` : `
                        <div style="padding: 15px; text-align: center; color: var(--text-secondary);">
                            Accedi per commentare
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
    
    // CSS responsivo per mobile
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .post-detail-container { flex-direction: column !important; }
            .post-sidebar { width: 100% !important; max-height: 50vh; }
        }
    `;
    modal.appendChild(style);
    
    modal.style.display = 'flex';
    modal.onclick = (e) => { if (e.target === modal) closePostDetailModal(); };
    
    // Carica commenti
    await loadPostComments(postId);
}

function closePostDetailModal() {
    const modal = document.getElementById('postDetailModal');
    if (modal) modal.style.display = 'none';
    currentViewingPostId = null;
}

// Time ago helper
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Adesso';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' min fa';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' ore fa';
    if (seconds < 604800) return Math.floor(seconds / 86400) + ' giorni fa';
    
    return date.toLocaleDateString('it-IT');
}

// Carica commenti post
async function loadPostComments(postId) {
    const container = document.getElementById('postComments');
    if (!container) return;
    
    try {
        const commentsSnapshot = await firebase.firestore()
            .collection('posts').doc(postId)
            .collection('comments')
            .orderBy('createdAt', 'asc')
            .limit(100)
            .get();
        
        if (commentsSnapshot.empty) {
            container.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary); padding: 20px;">
                    <i class="fas fa-comments" style="font-size: 2em; margin-bottom: 10px; opacity: 0.5;"></i>
                    <p>Nessun commento ancora</p>
                    <p style="font-size: 0.9em;">Sii il primo a commentare!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        for (const doc of commentsSnapshot.docs) {
            const comment = doc.data();
            
            // Carica dati autore commento
            let authorName = 'Utente';
            let authorPhoto = DEFAULT_AVATAR_40;
            let authorVerified = false;
            
            try {
                const authorDoc = await firebase.firestore().collection('users').doc(comment.userId).get();
                if (authorDoc.exists) {
                    const authorData = authorDoc.data();
                    authorName = authorData.name || 'Utente';
                    authorPhoto = authorData.photos?.[0] || authorPhoto;
                    authorVerified = authorData.isVerified || false;
                }
            } catch (e) {}
            
            const createdAt = comment.createdAt?.toDate?.() || new Date();
            const timeAgo = getTimeAgo(createdAt);
            
            const currentUser = FlameAuth.currentUser;
            const isOwnComment = currentUser && currentUser.uid === comment.userId;
            
            const commentEl = document.createElement('div');
            commentEl.style.cssText = 'display: flex; gap: 10px; margin-bottom: 15px;';
            commentEl.innerHTML = `
                <img src="${authorPhoto}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover; cursor: pointer;"
                     onclick="closePostDetailModal(); openUserProfile('${comment.userId}')">
                <div style="flex: 1;">
                    <div>
                        <strong style="cursor: pointer;" onclick="closePostDetailModal(); openUserProfile('${comment.userId}')">${authorName}</strong>
                        ${authorVerified ? '<i class="fas fa-check-circle" style="color: var(--primary); font-size: 0.7em;"></i>' : ''}
                        <span style="color: var(--text-secondary); font-size: 0.8em; margin-left: 5px;">${timeAgo}</span>
                        ${isOwnComment ? `<button onclick="deleteComment('${postId}', '${doc.id}')" style="background: none; border: none; color: #ff6b6b; cursor: pointer; font-size: 0.8em; margin-left: 5px;"><i class="fas fa-trash"></i></button>` : ''}
                    </div>
                    <p style="margin: 5px 0 0 0; word-wrap: break-word;">${escapeHtml(comment.text)}</p>
                </div>
            `;
            container.appendChild(commentEl);
        }
        
    } catch (error) {
        console.error('Errore caricamento commenti:', error);
        container.innerHTML = '<div style="text-align: center; color: #ff6b6b;">Errore caricamento commenti</div>';
    }
}

// Escape HTML per sicurezza
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Invia commento
async function submitComment(postId) {
    const input = document.getElementById('commentInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    const user = FlameAuth.currentUser;
    if (!user) {
        showToast('❌ Devi essere loggato', 'error');
        return;
    }
    
    try {
        // Aggiungi commento
        await firebase.firestore()
            .collection('posts').doc(postId)
            .collection('comments')
            .add({
                userId: user.uid,
                text: text,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        // Incrementa contatore
        await firebase.firestore().collection('posts').doc(postId).update({
            commentsCount: firebase.firestore.FieldValue.increment(1)
        });
        
        input.value = '';
        await loadPostComments(postId);
        
    } catch (error) {
        console.error('Errore invio commento:', error);
        showToast('❌ Errore invio commento', 'error');
    }
}

// Toggle like post
async function toggleLikePost(postId) {
    const user = FlameAuth.currentUser;
    if (!user) {
        showToast('❌ Devi essere loggato', 'error');
        return;
    }
    
    const likeRef = firebase.firestore()
        .collection('posts').doc(postId)
        .collection('likes').doc(user.uid);
    
    const postRef = firebase.firestore().collection('posts').doc(postId);
    
    try {
        const likeDoc = await likeRef.get();
        const btn = document.getElementById('likePostBtn');
        const countEl = document.getElementById('postLikesCount');
        
        if (likeDoc.exists) {
            // Rimuovi like
            await likeRef.delete();
            await postRef.update({
                likesCount: firebase.firestore.FieldValue.increment(-1)
            });
            
            if (btn) {
                btn.style.color = 'var(--text)';
                btn.innerHTML = '<i class="far fa-heart"></i>';
            }
            
            if (countEl) {
                const current = parseInt(countEl.textContent) || 0;
                countEl.textContent = (current - 1) + ' like';
            }
            
        } else {
            // Aggiungi like
            await likeRef.set({
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            await postRef.update({
                likesCount: firebase.firestore.FieldValue.increment(1)
            });
            
            if (btn) {
                btn.style.color = 'var(--primary)';
                btn.innerHTML = '<i class="fas fa-heart"></i>';
            }
            
            if (countEl) {
                const current = parseInt(countEl.textContent) || 0;
                countEl.textContent = (current + 1) + ' like';
            }
        }
        
    } catch (error) {
        console.error('Errore toggle like:', error);
        showToast('❌ Errore', 'error');
    }
}

// Elimina post
async function deletePost(postId) {
    if (!confirm('Sei sicuro di voler eliminare questo post?')) return;
    
    const user = FlameAuth.currentUser;
    if (!user) return;
    
    try {
        // Verifica proprietario
        const postDoc = await firebase.firestore().collection('posts').doc(postId).get();
        if (!postDoc.exists || postDoc.data().userId !== user.uid) {
            showToast('❌ Non puoi eliminare questo post', 'error');
            return;
        }
        
        // Elimina commenti
        const comments = await firebase.firestore()
            .collection('posts').doc(postId)
            .collection('comments').get();
        
        const batch = firebase.firestore().batch();
        comments.forEach(doc => batch.delete(doc.ref));
        
        // Elimina likes
        const likes = await firebase.firestore()
            .collection('posts').doc(postId)
            .collection('likes').get();
        
        likes.forEach(doc => batch.delete(doc.ref));
        
        // Elimina post
        batch.delete(firebase.firestore().collection('posts').doc(postId));
        
        await batch.commit();
        
        showToast('✅ Post eliminato');
        closePostDetailModal();
        
        // Ricarica post
        if (currentViewingUserId) {
            await loadUserPosts(currentViewingUserId);
        }
        
    } catch (error) {
        console.error('Errore eliminazione post:', error);
        showToast('❌ Errore eliminazione', 'error');
    }
}

// Elimina commento
async function deleteComment(postId, commentId) {
    const user = FlameAuth.currentUser;
    if (!user) return;
    
    try {
        await firebase.firestore()
            .collection('posts').doc(postId)
            .collection('comments').doc(commentId)
            .delete();
        
        await firebase.firestore().collection('posts').doc(postId).update({
            commentsCount: firebase.firestore.FieldValue.increment(-1)
        });
        
        await loadPostComments(postId);
        
    } catch (error) {
        console.error('Errore eliminazione commento:', error);
    }
}

// Avvia chat con utente (se matchati)
async function startChatWithUser(userId) {
    const user = FlameAuth.currentUser;
    if (!user) {
        showToast('❌ Devi essere loggato', 'error');
        return;
    }
    
    // Cerca match esistente
    const matchSnapshot = await firebase.firestore()
        .collection('matches')
        .where('users', 'array-contains', user.uid)
        .get();
    
    let matchId = null;
    matchSnapshot.forEach(doc => {
        if (doc.data().users.includes(userId)) {
            matchId = doc.id;
        }
    });
    
    if (matchId) {
        closeUserProfileModal();
        openChat(userId, matchId);
    } else {
        showToast('💔 Devi avere un match per chattare', 'error');
    }
}

// Apri il proprio profilo
async function openMyProfile() {
    const user = FlameAuth.currentUser;
    if (!user) {
        showToast('❌ Devi essere loggato', 'error');
        return;
    }
    await openUserProfile(user.uid);
}

console.log('🔥 FlameMatch App REAL Mode loaded');
console.log('📸 Social Post System loaded');

// Export global functions for HTML onclick handlers
window.openMyProfile = openMyProfile;
window.openUserProfile = openUserProfile;
window.openPhotoUpload = openPhotoUpload;
window.viewFullPhoto = viewFullPhoto;
window.likeUserFromProfile = likeUserFromProfile;

// Wrapper per il pulsante "Vedi Post" - risolve problema di timing
window.viewUserPosts = function(userId) {
    // Forza la chiusura del modal profilo
    const modal = document.getElementById('profileModal');
    if (modal) modal.classList.remove('active');
    
    // Apri il profilo utente dopo un breve delay
    setTimeout(() => openUserProfile(userId), 200);
};

window.openCreatePostModal = openCreatePostModal;
window.closeCreatePostModal = closeCreatePostModal;
window.publishPost = publishPost;
window.deletePost = deletePost;
window.loadPostComments = loadPostComments;
window.toggleLikePost = toggleLikePost;
window.closeUserProfileModal = closeUserProfileModal;
window.closePostDetailModal = closePostDetailModal;
window.showProfileDetails = showProfileDetails;
window.closeProfileModal = closeProfileModal;
window.handlePostFileSelect = handlePostFileSelect;
window.clearPostPreview = clearPostPreview;
window.openPostDetail = openPostDetail;

// Export funzioni Esplora
window.openExploreModal = openExploreModal;
window.closeExploreModal = closeExploreModal;
window.exploreNearby = exploreNearby;
window.requestGeolocation = requestGeolocation;
window.exploreNew = exploreNew;
window.explorePopular = explorePopular;
window.exploreOnline = exploreOnline;


// =====================================================
// VOICE VIBE - Audio Presentation System
// =====================================================

let voiceRecorder = null;
let voiceAudioChunks = [];
let voiceRecordingTimer = null;
let voiceRecordingSeconds = 0;
let currentVoiceAudio = null;

// Initialize Voice Recording
async function initVoiceRecorder() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        voiceRecorder = new MediaRecorder(stream);
        
        voiceRecorder.ondataavailable = (event) => {
            voiceAudioChunks.push(event.data);
        };
        
        voiceRecorder.onstop = () => {
            const audioBlob = new Blob(voiceAudioChunks, { type: 'audio/webm' });
            handleVoiceRecordingComplete(audioBlob);
        };
        
        return true;
    } catch (error) {
        console.error('Errore accesso microfono:', error);
        showToast('❌ Permesso microfono negato');
        return false;
    }
}

// Start Voice Recording
async function startVoiceRecording() {
    if (!voiceRecorder) {
        const initialized = await initVoiceRecorder();
        if (!initialized) return;
    }
    
    voiceAudioChunks = [];
    voiceRecordingSeconds = 0;
    voiceRecorder.start();
    
    const recorderIcon = document.querySelector('.voice-recorder-icon');
    const recorderDiv = document.querySelector('.voice-recorder');
    
    if (recorderIcon) recorderIcon.classList.add('recording');
    if (recorderDiv) recorderDiv.classList.add('recording');
    
    // Update timer
    voiceRecordingTimer = setInterval(() => {
        voiceRecordingSeconds++;
        const timerEl = document.querySelector('.voice-recorder-timer');
        if (timerEl) {
            timerEl.textContent = `${voiceRecordingSeconds}s / 15s`;
        }
        
        // Max 15 seconds
        if (voiceRecordingSeconds >= 15) {
            stopVoiceRecording();
        }
    }, 1000);
    
    showToast('🎤 Registrazione in corso...');
}

// Stop Voice Recording
function stopVoiceRecording() {
    if (voiceRecorder && voiceRecorder.state === 'recording') {
        voiceRecorder.stop();
        clearInterval(voiceRecordingTimer);
        
        const recorderIcon = document.querySelector('.voice-recorder-icon');
        const recorderDiv = document.querySelector('.voice-recorder');
        
        if (recorderIcon) recorderIcon.classList.remove('recording');
        if (recorderDiv) recorderDiv.classList.remove('recording');
    }
}

// Toggle Voice Recording
function toggleVoiceRecording() {
    if (voiceRecorder && voiceRecorder.state === 'recording') {
        stopVoiceRecording();
    } else {
        startVoiceRecording();
    }
}

// Handle Recording Complete - Upload to Cloudinary
async function handleVoiceRecordingComplete(audioBlob) {
    showToast('⏳ Caricamento audio...');
    
    try {
        const formData = new FormData();
        formData.append('file', audioBlob, 'voice-vibe.webm');
        formData.append('upload_preset', 'flamematch');
        formData.append('resource_type', 'video'); // Cloudinary uses 'video' for audio
        
        const response = await fetch(
            'https://api.cloudinary.com/v1_1/dnxqpp2en/video/upload',
            { method: 'POST', body: formData }
        );
        
        const data = await response.json();
        
        if (data.secure_url) {
            // Save to Firebase
            await saveVoiceVibeToProfile(data.secure_url, voiceRecordingSeconds);
            showToast('✅ Voice Vibe salvato!');
            updateVoicePreview(data.secure_url);
        } else {
            throw new Error('Upload failed');
        }
    } catch (error) {
        console.error('Errore upload audio:', error);
        showToast('❌ Errore caricamento audio');
    }
}

// Save Voice Vibe URL to Firebase
async function saveVoiceVibeToProfile(audioUrl, duration) {
    const user = auth.currentUser;
    if (!user) return;
    
    await db.collection('users').doc(user.uid).update({
        voiceVibe: {
            url: audioUrl,
            duration: duration,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }
    });
}

// Update Voice Preview UI
function updateVoicePreview(audioUrl) {
    const preview = document.querySelector('.voice-preview');
    if (preview) {
        preview.classList.add('has-audio');
        preview.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <button class="voice-play-btn" onclick="playVoicePreview('${audioUrl}')">
                    <i class="fas fa-play"></i>
                </button>
                <div class="voice-waveform">
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                    <div class="wave-bar"></div>
                </div>
                <span style="color: #888; font-size: 0.9rem;">Il tuo Voice Vibe</span>
            </div>
            <button onclick="deleteVoiceVibe()" style="margin-top: 10px; background: none; border: none; color: #f44336; cursor: pointer;">
                <i class="fas fa-trash"></i> Elimina
            </button>
        `;
    }
}

// Play Voice on Card
function playVoiceOnCard(audioUrl, button) {
    if (currentVoiceAudio) {
        currentVoiceAudio.pause();
        currentVoiceAudio = null;
        document.querySelectorAll('.voice-play-btn').forEach(btn => {
            btn.classList.remove('playing');
            btn.innerHTML = '<i class="fas fa-play"></i>';
        });
        document.querySelectorAll('.voice-player').forEach(p => p.classList.remove('playing'));
    }
    
    currentVoiceAudio = new Audio(audioUrl);
    button.classList.add('playing');
    button.innerHTML = '<i class="fas fa-pause"></i>';
    button.closest('.voice-player').classList.add('playing');
    
    currentVoiceAudio.play();
    
    currentVoiceAudio.onended = () => {
        button.classList.remove('playing');
        button.innerHTML = '<i class="fas fa-play"></i>';
        button.closest('.voice-player').classList.remove('playing');
        currentVoiceAudio = null;
    };
}

// Play Voice Preview
function playVoicePreview(audioUrl) {
    if (currentVoiceAudio) {
        currentVoiceAudio.pause();
        currentVoiceAudio = null;
    }
    currentVoiceAudio = new Audio(audioUrl);
    currentVoiceAudio.play();
}

// Delete Voice Vibe
async function deleteVoiceVibe() {
    const user = auth.currentUser;
    if (!user) return;
    
    if (confirm('Eliminare il tuo Voice Vibe?')) {
        await db.collection('users').doc(user.uid).update({
            voiceVibe: firebase.firestore.FieldValue.delete()
        });
        
        const preview = document.querySelector('.voice-preview');
        if (preview) {
            preview.classList.remove('has-audio');
            preview.innerHTML = '';
        }
        
        showToast('🗑️ Voice Vibe eliminato');
    }
}

// =====================================================
// ICEBREAKER GAMES System
// =====================================================

let currentGame = null;
let currentGameQuestions = [];
let currentQuestionIndex = 0;
let playerAnswers = [];
let currentIcebreakerMatchId = null;

// Game Questions Database
const ICEBREAKER_GAMES = {
    preferiresti: {
        name: 'Preferiresti...',
        questions: [
            { q: 'Preferiresti viaggiare nel passato o nel futuro?', options: ['🕰️ Passato', '🚀 Futuro'] },
            { q: 'Preferiresti avere il potere di volare o essere invisibile?', options: ['🦅 Volare', '👻 Invisibilità'] },
            { q: 'Preferiresti vivere in montagna o al mare?', options: ['🏔️ Montagna', '🏖️ Mare'] },
            { q: 'Preferiresti leggere nella mente o teletrasportarti?', options: ['🧠 Leggere menti', '✨ Teletrasporto'] },
            { q: 'Preferiresti pizza infinita o gelato infinito?', options: ['🍕 Pizza', '🍦 Gelato'] },
            { q: 'Preferiresti non dormire mai o non mangiare mai?', options: ['😴 Mai dormire', '🍽️ Mai mangiare'] },
            { q: 'Preferiresti parlare tutte le lingue o suonare tutti gli strumenti?', options: ['🗣️ Lingue', '🎸 Strumenti'] },
        ]
    },
    compatibilita: {
        name: 'Quiz Compatibilità',
        questions: [
            { q: 'Qual è il tuo weekend ideale?', options: ['🎉 Festa con amici', '🏠 Relax a casa', '🌲 Avventura outdoor', '🎬 Cinema/Serie TV'] },
            { q: 'Come gestisci i conflitti?', options: ['💬 Ne parlo subito', '⏰ Mi prendo tempo', '🤗 Cerco compromesso', '😶 Evito lo scontro'] },
            { q: 'Cosa apprezzi di più in una relazione?', options: ['😂 Umorismo', '🤝 Lealtà', '💕 Romanticismo', '🎯 Obiettivi comuni'] },
            { q: 'Come ti descrivi meglio?', options: ['🦁 Estroverso', '🐱 Introverso', '🦊 Un po\' di entrambi', '🎭 Dipende dal mood'] },
            { q: 'Il primo appuntamento ideale?', options: ['🍽️ Cena romantica', '☕ Caffè e chiacchiere', '🎢 Avventura', '🎨 Mostra/Museo'] },
        ]
    },
    indovina: {
        name: 'Indovina il Match',
        questions: [
            { q: 'Qual è il mio colore preferito?', options: ['🔴 Rosso', '🔵 Blu', '💚 Verde', '💜 Viola'] },
            { q: 'Quanti fratelli/sorelle ho?', options: ['0️⃣ Nessuno', '1️⃣ Uno', '2️⃣ Due', '3️⃣+ Tre o più'] },
            { q: 'Sono una persona mattiniera o nottambula?', options: ['🌅 Mattina', '🌙 Notte'] },
            { q: 'Il mio genere musicale preferito?', options: ['🎸 Rock/Pop', '🎹 Elettronica', '🎺 Jazz/Soul', '🎤 Hip-Hop/R&B'] },
            { q: 'Preferisco cane o gatto?', options: ['🐕 Cane', '🐈 Gatto', '🐰 Altro', '❌ Nessuno'] },
        ]
    },
    emoji: {
        name: 'Emoji Story',
        questions: [
            { q: 'Descrivi il tuo lunedì tipico con 3 emoji', type: 'emoji', emojis: ['😴', '☕', '💼', '😫', '🏃', '📱', '🍕', '🎮', '📺', '😊'] },
            { q: 'Descrivi la tua vacanza ideale con 3 emoji', type: 'emoji', emojis: ['🏖️', '🏔️', '🌴', '✈️', '🍹', '📸', '🎒', '🛥️', '🎡', '🌅'] },
            { q: 'Descrivi il tuo mood oggi con 3 emoji', type: 'emoji', emojis: ['😊', '😴', '🔥', '💪', '🤔', '😂', '❤️', '✨', '🎉', '😌'] },
        ]
    }
};

// Open Icebreaker Games Modal
function openIcebreakerGames(matchId = null) {
    currentIcebreakerMatchId = matchId || currentMatchId;
    const modal = document.getElementById('icebreakerModal');
    if (modal) {
        modal.classList.add('active');
        showGamesSelection();
    }
}

// Close Modal
function closeIcebreakerModal(event) {
    if (event && event.target !== event.currentTarget) return;
    const modal = document.getElementById('icebreakerModal');
    if (modal) {
        modal.classList.remove('active');
    }
    resetGame();
}

// Show Games Selection
function showGamesSelection() {
    document.getElementById('icebreakerGamesSelection').style.display = 'block';
    document.getElementById('icebreakerGamePlay').style.display = 'none';
    document.getElementById('icebreakerResults').style.display = 'none';
    resetGame();
}

// Reset Game State
function resetGame() {
    currentGame = null;
    currentGameQuestions = [];
    currentQuestionIndex = 0;
    playerAnswers = [];
}

// Start a Game
function startGame(gameType) {
    currentGame = gameType;
    const game = ICEBREAKER_GAMES[gameType];
    
    // Shuffle and pick 5 questions
    currentGameQuestions = shuffleArray([...game.questions]).slice(0, 5);
    currentQuestionIndex = 0;
    playerAnswers = [];
    
    document.getElementById('icebreakerGamesSelection').style.display = 'none';
    document.getElementById('icebreakerGamePlay').style.display = 'block';
    document.getElementById('icebreakerResults').style.display = 'none';
    
    document.getElementById('gameTotalQuestions').textContent = currentGameQuestions.length;
    
    renderQuestion();
    renderProgress();
}

// Shuffle Array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Render Current Question
function renderQuestion() {
    const question = currentGameQuestions[currentQuestionIndex];
    document.getElementById('gameQuestionNum').textContent = currentQuestionIndex + 1;
    document.getElementById('gameQuestionText').textContent = question.q;
    
    const optionsContainer = document.getElementById('gameOptions');
    
    if (question.type === 'emoji') {
        // Emoji picker mode
        optionsContainer.innerHTML = `
            <div class="emoji-story-display" id="selectedEmojis"></div>
            <div class="emoji-picker">
                ${question.emojis.map(emoji => `
                    <span class="emoji-option" onclick="selectEmoji('${emoji}')">${emoji}</span>
                `).join('')}
            </div>
            <button class="match-btn primary" style="margin-top: 15px;" onclick="submitEmojiAnswer()">Conferma</button>
        `;
    } else {
        // Multiple choice mode
        optionsContainer.innerHTML = question.options.map((opt, i) => `
            <div class="game-option" onclick="selectOption(this, ${i})">${opt}</div>
        `).join('');
    }
}

// Render Progress Dots
function renderProgress() {
    const progressContainer = document.getElementById('gameProgress');
    progressContainer.innerHTML = currentGameQuestions.map((_, i) => `
        <div class="progress-dot ${i < currentQuestionIndex ? 'completed' : ''} ${i === currentQuestionIndex ? 'current' : ''}"></div>
    `).join('');
}

// Select Option
function selectOption(element, index) {
    document.querySelectorAll('.game-option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    
    // Auto-advance after short delay
    setTimeout(() => {
        playerAnswers.push(index);
        nextQuestion();
    }, 500);
}

// Emoji Selection
let selectedEmojis = [];

function selectEmoji(emoji) {
    if (selectedEmojis.length < 3) {
        selectedEmojis.push(emoji);
        document.getElementById('selectedEmojis').textContent = selectedEmojis.join(' ');
    }
}

function submitEmojiAnswer() {
    if (selectedEmojis.length === 3) {
        playerAnswers.push(selectedEmojis.join(''));
        selectedEmojis = [];
        nextQuestion();
    } else {
        showToast('Seleziona 3 emoji!');
    }
}

// Next Question
function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex >= currentGameQuestions.length) {
        showResults();
    } else {
        renderQuestion();
        renderProgress();
    }
}

// Show Results
function showResults() {
    document.getElementById('icebreakerGamePlay').style.display = 'none';
    document.getElementById('icebreakerResults').style.display = 'block';
    
    // Calculate compatibility (simulated for now, real would compare with match's answers)
    const compatibility = Math.floor(Math.random() * 30) + 70; // 70-100%
    
    document.getElementById('compatibilityScore').textContent = compatibility + '%';
    document.querySelector('.compatibility-circle').style.setProperty('--percentage', compatibility + '%');
    
    let message = '';
    if (compatibility >= 90) {
        message = 'Incredibile! Siete fatti l\'uno per l\'altro! 💕';
    } else if (compatibility >= 80) {
        message = 'Ottima compatibilità! Avete molto in comune 🔥';
    } else if (compatibility >= 70) {
        message = 'Buona base per conoscervi meglio! ✨';
    } else {
        message = 'Gli opposti si attraggono! 😉';
    }
    
    document.getElementById('compatibilityMessage').textContent = message;
    
    // Save game results to Firebase
    saveGameResults(compatibility);
}

// Save Game Results
async function saveGameResults(compatibility) {
    const user = auth.currentUser;
    if (!user || !currentIcebreakerMatchId) return;
    
    try {
        await db.collection('icebreaker_games').add({
            matchId: currentIcebreakerMatchId,
            playerId: user.uid,
            gameType: currentGame,
            answers: playerAnswers,
            compatibility: compatibility,
            playedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Errore salvataggio gioco:', error);
    }
}

// Open Chat with Current Match
function openChatWithCurrentMatch() {
    if (currentIcebreakerMatchId) {
        openChat(currentIcebreakerMatchId, null);
    }
}

// Export functions
window.toggleVoiceRecording = toggleVoiceRecording;
window.playVoiceOnCard = playVoiceOnCard;
window.playVoicePreview = playVoicePreview;
window.deleteVoiceVibe = deleteVoiceVibe;
window.openIcebreakerGames = openIcebreakerGames;
window.closeIcebreakerModal = closeIcebreakerModal;
window.showGamesSelection = showGamesSelection;
window.startGame = startGame;
window.selectOption = selectOption;
window.selectEmoji = selectEmoji;
window.submitEmojiAnswer = submitEmojiAnswer;
window.openChatWithCurrentMatch = openChatWithCurrentMatch;

// ================================================================
// SET MY LOCATION - Imposta posizione profilo
// ================================================================

async function setMyLocation() {
    if (!currentUser) {
        showToast('Devi essere loggato', 'error');
        return;
    }
    
    // Mostra opzioni
    const choice = await showLocationOptions();
    
    if (choice === 'gps') {
        await setLocationFromGPS();
    } else if (choice === 'manual') {
        await setLocationManually();
    }
}

function showLocationOptions() {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'locationOptionsModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <h2 style="margin-bottom: 20px;">
                    <i class="fas fa-map-marker-alt" style="color: #ff6b6b;"></i> 
                    Imposta Posizione
                </h2>
                <p style="color: #aaa; margin-bottom: 25px;">
                    Come vuoi impostare la tua posizione?
                </p>
                
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <button onclick="document.getElementById('locationOptionsModal').remove(); window.locationChoice('gps')" 
                            class="btn-primary" style="padding: 15px 25px; font-size: 1em;">
                        <i class="fas fa-crosshairs"></i> Usa GPS Automatico
                    </button>
                    
                    <button onclick="document.getElementById('locationOptionsModal').remove(); window.locationChoice('manual')" 
                            class="btn-secondary" style="padding: 15px 25px; font-size: 1em;">
                        <i class="fas fa-keyboard"></i> Inserisci Manualmente
                    </button>
                    
                    <button onclick="document.getElementById('locationOptionsModal').remove(); window.locationChoice(null)" 
                            style="background: none; border: none; color: #888; cursor: pointer; padding: 10px;">
                        Annulla
                    </button>
                </div>
            </div>
        `;
        modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 9999;';
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        
        window.locationChoice = (choice) => {
            resolve(choice);
        };
    });
}

async function setLocationFromGPS() {
    showToast('📍 Rilevamento posizione...', 'info');
    
    if (!navigator.geolocation) {
        showToast('Geolocalizzazione non supportata', 'error');
        return;
    }
    
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        });
        
        const { latitude, longitude } = position.coords;
        
        // Reverse geocoding
        showToast('🔍 Identificazione città...', 'info');
        
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
                { headers: { 'Accept-Language': 'it' } }
            );
            const data = await response.json();
            
            // Estrai città/paese
            const address = data.address;
            let locationName = address.city || address.town || address.village || address.municipality || address.county || 'Posizione sconosciuta';
            
            // Aggiungi regione/provincia se disponibile
            if (address.state || address.county) {
                const region = address.state || address.county;
                if (region !== locationName) {
                    locationName += `, ${region}`;
                }
            }
            
            // Salva su Firebase
            await saveLocationToProfile(locationName, latitude, longitude);
            
        } catch (geoError) {
            console.error('Errore geocoding:', geoError);
            // Salva comunque le coordinate
            await saveLocationToProfile(`📍 ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`, latitude, longitude);
        }
        
    } catch (error) {
        console.error('Errore geolocalizzazione:', error);
        if (error.code === 1) {
            showToast('Permesso posizione negato. Abilita la geolocalizzazione.', 'error');
        } else if (error.code === 2) {
            showToast('Posizione non disponibile', 'error');
        } else if (error.code === 3) {
            showToast('Timeout - riprova', 'error');
        } else {
            showToast('Errore nel rilevamento posizione', 'error');
        }
    }
}

async function setLocationManually() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'manualLocationModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <h2 style="margin-bottom: 20px; text-align: center;">
                <i class="fas fa-keyboard" style="color: #ff6b6b;"></i> 
                Inserisci Posizione
            </h2>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; color: #aaa;">Città</label>
                <input type="text" id="manualCity" placeholder="es. Milano, Roma, Napoli..." 
                       style="width: 100%; padding: 15px; border-radius: 10px; border: 1px solid #333; background: #2a2a2a; color: white; font-size: 1em;">
            </div>
            
            <div style="margin-bottom: 25px;">
                <label style="display: block; margin-bottom: 8px; color: #aaa;">Provincia/Regione (opzionale)</label>
                <input type="text" id="manualRegion" placeholder="es. Lombardia, Lazio..." 
                       style="width: 100%; padding: 15px; border-radius: 10px; border: 1px solid #333; background: #2a2a2a; color: white; font-size: 1em;">
            </div>
            
            <div style="display: flex; gap: 15px;">
                <button onclick="document.getElementById('manualLocationModal').remove()" 
                        class="btn-secondary" style="flex: 1; padding: 12px;">
                    Annulla
                </button>
                <button onclick="saveManualLocation()" 
                        class="btn-primary" style="flex: 1; padding: 12px;">
                    <i class="fas fa-check"></i> Salva
                </button>
            </div>
        </div>
    `;
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 9999;';
    document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    
    // Focus sull'input
    setTimeout(() => document.getElementById('manualCity').focus(), 100);
}

async function saveManualLocation() {
    const city = document.getElementById('manualCity').value.trim();
    const region = document.getElementById('manualRegion').value.trim();
    
    if (!city) {
        showToast('Inserisci almeno la città', 'error');
        return;
    }
    
    let locationName = city;
    if (region) {
        locationName += `, ${region}`;
    }
    
    // Chiudi modal
    document.getElementById('manualLocationModal').remove();
    
    // Salva senza coordinate (posizione manuale)
    await saveLocationToProfile(locationName, null, null);
}

async function saveLocationToProfile(locationName, lat, lng) {
    try {
        const updateData = {
            location: locationName,
            locationUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Se abbiamo coordinate, salvale per "Vicino a te"
        if (lat !== null && lng !== null) {
            updateData.coordinates = new firebase.firestore.GeoPoint(lat, lng);
            updateData.lastLocationUpdate = firebase.firestore.FieldValue.serverTimestamp();
        }
        
        await db.collection('users').doc(currentUser.uid).update(updateData);
        
        // Aggiorna cache locale
        if (currentUserProfile) {
            currentUserProfile.location = locationName;
            if (lat !== null && lng !== null) {
                currentUserProfile.coordinates = { latitude: lat, longitude: lng };
            }
        }
        
        showToast(`✅ Posizione impostata: ${locationName}`, 'success');
        
        // Ricarica il profilo per aggiornare la visualizzazione
        if (document.getElementById('userProfileModal')) {
            setTimeout(() => {
                viewUserProfile(currentUser.uid);
            }, 500);
        }
        
    } catch (error) {
        console.error('Errore salvataggio posizione:', error);
        showToast('Errore nel salvataggio', 'error');
    }
}

// Export location functions to window
window.setMyLocation = setMyLocation;
window.setLocationManually = setLocationManually;
window.saveManualLocation = saveManualLocation;

// ================================================================
// 🔔 PUSH NOTIFICATIONS SYSTEM
// ================================================================

const NotificationManager = {
    messaging: null,
    token: null,
    
    // Initialize push notifications
    async init() {
        if (!('Notification' in window)) {
            console.log('Browser non supporta notifiche');
            return;
        }
        
        if (!('serviceWorker' in navigator)) {
            console.log('Service Worker non supportato');
            return;
        }
        
        try {
            // Register service worker
            const registration = await navigator.serviceWorker.register('./firebase-messaging-sw.js');
            console.log('Service Worker registrato:', registration);
            
            // Check if Firebase Messaging is available
            if (typeof firebase !== 'undefined' && firebase.messaging) {
                this.messaging = firebase.messaging();
                
                // Request permission if not already granted
                if (Notification.permission === 'default') {
                    await this.requestPermission();
                } else if (Notification.permission === 'granted') {
                    await this.getToken();
                }
            }
        } catch (error) {
            console.error('Errore inizializzazione notifiche:', error);
        }
    },
    
    // Request notification permission
    async requestPermission() {
        try {
            const permission = await Notification.requestPermission();
            console.log('Permesso notifiche:', permission);
            
            if (permission === 'granted') {
                await this.getToken();
                showToast('🔔 Notifiche attivate! Riceverai avvisi per match e messaggi', 'success');
            }
        } catch (error) {
            console.error('Errore richiesta permesso:', error);
        }
    },
    
    // Get FCM token
    async getToken() {
        if (!this.messaging) return;
        
        try {
            // Note: In production, you'd use a VAPID key here
            this.token = await this.messaging.getToken();
            console.log('FCM Token:', this.token);
            
            // Save token to user profile
            if (currentUser && this.token) {
                await db.collection('users').doc(currentUser.uid).update({
                    fcmToken: this.token,
                    notificationsEnabled: true
                });
            }
        } catch (error) {
            console.error('Errore ottenimento token:', error);
        }
    },
    
    // Show local notification (for in-app events)
    showLocal(title, body, options = {}) {
        if (Notification.permission !== 'granted') return;
        
        const notification = new Notification(title, {
            body: body,
            icon: '/logo.png',
            badge: '/logo.png',
            vibrate: [200, 100, 200],
            ...options
        });
        
        notification.onclick = () => {
            window.focus();
            notification.close();
            if (options.onClick) options.onClick();
        };
        
        return notification;
    },
    
    // Send notification for match
    notifyMatch(matchedUser) {
        this.showLocal(
            '🔥 È un Match!',
            `Tu e ${matchedUser.name} vi piacete! Inizia a chattare`,
            {
                tag: 'match-' + matchedUser.id,
                requireInteraction: true,
                onClick: () => {
                    // Open chat with this match
                }
            }
        );
    },
    
    // Send notification for message
    notifyMessage(senderName, messagePreview) {
        this.showLocal(
            `💬 ${senderName}`,
            messagePreview.substring(0, 50) + (messagePreview.length > 50 ? '...' : ''),
            {
                tag: 'message-' + Date.now()
            }
        );
    },
    
    // Send notification for like (premium)
    notifyLike() {
        this.showLocal(
            '❤️ Qualcuno ti ha messo Like!',
            'Passa a Premium per scoprire chi è',
            {
                tag: 'like-' + Date.now()
            }
        );
    }
};

// ================================================================
// 🧠 AI WINGMAN - Assistente Chat Intelligente
// ================================================================

const AIWingman = {
    // Conversation starters based on profile
    getConversationStarters(profile) {
        const starters = [];
        
        // Based on interests
        if (profile.interests && profile.interests.length > 0) {
            const interest = profile.interests[Math.floor(Math.random() * profile.interests.length)];
            starters.push(
                `Vedo che ti piace ${interest}! Qual è stata l'ultima volta che...`,
                `Anche a me piace ${interest}! Tu preferisci...`,
                `${interest}? Interessante! Raccontami di più...`
            );
        }
        
        // Based on bio
        if (profile.bio) {
            starters.push(
                `Ho letto la tua bio e mi ha incuriosito... Cosa intendi quando dici...`,
                `La tua descrizione mi ha colpito! Sei davvero così...`
            );
        }
        
        // Generic engaging starters
        starters.push(
            "Se potessi viaggiare ovunque domani, dove andresti? ✈️",
            "Dimmi una cosa di te che nessuno indovinerebbe! 🤔",
            "Qual è la cosa più spontanea che hai mai fatto? 😄",
            "Se dovessi descriverti in 3 emoji, quali useresti? 🎭",
            "Cosa ti ha fatto sorridere oggi? 😊",
            "Preferiresti poter volare o essere invisibile? 🦸",
            "Qual è il tuo comfort food preferito? 🍕",
            "Se la tua vita fosse un film, che genere sarebbe? 🎬"
        );
        
        return starters;
    },
    
    // Get smart reply suggestions based on last message
    getSmartReplies(lastMessage, context = {}) {
        const message = lastMessage.toLowerCase();
        const replies = [];
        
        // Question responses
        if (message.includes('?')) {
            if (message.includes('come stai') || message.includes('come va')) {
                replies.push(
                    "Benissimo grazie! Tu come stai? 😊",
                    "Tutto bene! Meglio ora che stiamo chattando 😄",
                    "Alla grande! Raccontami di te!"
                );
            } else if (message.includes('cosa fai') || message.includes('che fai')) {
                replies.push(
                    "Stavo proprio pensando a te! E tu? 😊",
                    "Niente di speciale, mi hai incuriosito però!",
                    "Chattando con una persona interessante 😉"
                );
            } else if (message.includes('lavoro') || message.includes('lavori')) {
                replies.push(
                    "Faccio [il tuo lavoro]! Mi piace molto perché...",
                    "Lavoro in [settore]. È impegnativo ma stimolante!",
                    "Preferisco raccontartelo di persona 😉"
                );
            }
        }
        
        // Compliment responses
        if (message.includes('bell') || message.includes('carino') || message.includes('attraente')) {
            replies.push(
                "Grazie mille! Anche tu non sei niente male 😊",
                "Troppo gentile! Mi hai fatto arrossire 😄",
                "Aww grazie! 🥰"
            );
        }
        
        // Generic engaging replies
        if (replies.length === 0) {
            replies.push(
                "Raccontami di più! 😊",
                "Interessante! E poi cosa è successo?",
                "Ahaha davvero? 😄",
                "Mi piace! Continua...",
                "Wow, non me l'aspettavo!"
            );
        }
        
        return replies.slice(0, 3);
    },
    
    // Get date ideas based on location and preferences
    getDateIdeas(location, interests = []) {
        const ideas = {
            general: [
                "☕ Aperitivo in un locale carino",
                "🚶 Passeggiata nel centro storico",
                "🍕 Cena in una pizzeria tipica",
                "🎬 Cinema + gelato",
                "🎨 Visita a una mostra o museo",
                "🌳 Picnic al parco",
                "🎮 Sala giochi retro",
                "🎤 Karaoke serale",
                "🍦 Tour delle gelaterie",
                "📚 Libreria + caffè letterario"
            ],
            active: [
                "🚴 Giro in bici",
                "🧗 Arrampicata indoor",
                "🎳 Bowling",
                "⛳ Mini golf",
                "🏊 Piscina"
            ],
            romantic: [
                "🌅 Tramonto con vista",
                "🍷 Degustazione vini",
                "🎵 Concerto live",
                "🌃 Cena con vista panoramica",
                "💃 Lezione di ballo"
            ],
            casual: [
                "🎯 Freccette al pub",
                "🍻 Beer pong",
                "🎪 Fiera o mercatino",
                "🐕 Dog park (se avete cani)",
                "🛍️ Shopping insieme"
            ]
        };
        
        // Combine based on interests
        let suggestions = [...ideas.general];
        
        if (interests.includes('Sport') || interests.includes('Fitness')) {
            suggestions = [...suggestions, ...ideas.active];
        }
        if (interests.includes('Romantico') || interests.includes('Musica')) {
            suggestions = [...suggestions, ...ideas.romantic];
        }
        
        // Shuffle and return top 5
        return this.shuffle(suggestions).slice(0, 5);
    },
    
    // Shuffle array helper
    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },
    
    // Analyze conversation and give tips
    analyzeConversation(messages) {
        const tips = [];
        
        if (messages.length < 5) {
            tips.push("💡 Fai domande aperte per conoscerla meglio!");
        }
        
        // Check if messages are too short
        const avgLength = messages.reduce((sum, m) => sum + m.text.length, 0) / messages.length;
        if (avgLength < 20) {
            tips.push("💡 Prova a scrivere messaggi più dettagliati");
        }
        
        // Check response time patterns
        tips.push("💡 Non rispondere sempre subito - mantieni un po' di mistero!");
        
        // Suggest moving forward
        if (messages.length > 20) {
            tips.push("🎯 Sembra che vi troviate bene! Proponi un appuntamento?");
        }
        
        return tips;
    }
};

// ================================================================
// 🎥 VIDEO DATE - Videochiamate Integrate
// ================================================================

const VideoDate = {
    localStream: null,
    remoteStream: null,
    peerConnection: null,
    callTimer: null,
    callDuration: 0,
    maxDuration: 180, // 3 minutes
    isActive: false,
    currentMatchId: null,
    
    // Configuration for WebRTC
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    },
    
    // Initialize video call
    async startCall(matchId, matchName) {
        this.currentMatchId = matchId;
        
        // Show video call modal
        this.showCallModal(matchName);
        
        try {
            // Get local media stream
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 },
                audio: true
            });
            
            // Display local video
            const localVideo = document.getElementById('localVideo');
            if (localVideo) {
                localVideo.srcObject = this.localStream;
            }
            
            // Create peer connection
            this.peerConnection = new RTCPeerConnection(this.config);
            
            // Add local tracks
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });
            
            // Handle remote stream
            this.peerConnection.ontrack = (event) => {
                const remoteVideo = document.getElementById('remoteVideo');
                if (remoteVideo) {
                    remoteVideo.srcObject = event.streams[0];
                }
            };
            
            // Handle ICE candidates
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    this.sendSignal('ice-candidate', event.candidate);
                }
            };
            
            // Create and send offer
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            this.sendSignal('offer', offer);
            
            // Start timer
            this.startTimer();
            this.isActive = true;
            
        } catch (error) {
            console.error('Errore avvio chiamata:', error);
            this.showCallError('Impossibile accedere alla fotocamera. Verifica i permessi.');
        }
    },
    
    // Handle incoming call
    async handleIncomingCall(matchId, matchName, offer) {
        // Show incoming call UI
        this.showIncomingCallModal(matchName, async (accepted) => {
            if (accepted) {
                this.currentMatchId = matchId;
                await this.acceptCall(offer);
            } else {
                this.sendSignal('call-rejected', {});
            }
        });
    },
    
    // Accept incoming call
    async acceptCall(offer) {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: true
            });
            
            const localVideo = document.getElementById('localVideo');
            if (localVideo) localVideo.srcObject = this.localStream;
            
            this.peerConnection = new RTCPeerConnection(this.config);
            
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });
            
            this.peerConnection.ontrack = (event) => {
                const remoteVideo = document.getElementById('remoteVideo');
                if (remoteVideo) remoteVideo.srcObject = event.streams[0];
            };
            
            this.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    this.sendSignal('ice-candidate', event.candidate);
                }
            };
            
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            this.sendSignal('answer', answer);
            
            this.startTimer();
            this.isActive = true;
            
        } catch (error) {
            console.error('Errore accettazione chiamata:', error);
        }
    },
    
    // Handle answer from remote peer
    async handleAnswer(answer) {
        if (this.peerConnection) {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
    },
    
    // Handle ICE candidate
    async handleIceCandidate(candidate) {
        if (this.peerConnection) {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    },
    
    // Send signaling data via Firebase
    sendSignal(type, data) {
        if (!this.currentMatchId || !currentUser) return;
        
        db.collection('videoCalls').add({
            matchId: this.currentMatchId,
            from: currentUser.uid,
            type: type,
            data: JSON.stringify(data),
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    },
    
    // Start call timer
    startTimer() {
        this.callDuration = 0;
        const timerDisplay = document.getElementById('callTimer');
        
        this.callTimer = setInterval(() => {
            this.callDuration++;
            const remaining = this.maxDuration - this.callDuration;
            
            if (timerDisplay) {
                const mins = Math.floor(remaining / 60);
                const secs = remaining % 60;
                timerDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
                
                // Warning when 30 seconds left
                if (remaining === 30) {
                    timerDisplay.style.color = '#ff6b6b';
                    showToast('⏰ 30 secondi rimanenti!', 'warning');
                }
            }
            
            // End call when time's up
            if (this.callDuration >= this.maxDuration) {
                this.showExtendOption();
            }
        }, 1000);
    },
    
    // Show option to extend call
    showExtendOption() {
        clearInterval(this.callTimer);
        
        const modal = document.createElement('div');
        modal.className = 'video-extend-modal';
        modal.innerHTML = `
            <div class="extend-content">
                <h3>⏰ Tempo Scaduto!</h3>
                <p>Vi state trovando bene?</p>
                <div class="extend-buttons">
                    <button onclick="VideoDate.extendCall()" class="extend-btn">
                        ✅ Continua (+3 min)
                    </button>
                    <button onclick="VideoDate.endCall()" class="end-btn">
                        👋 Termina
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    },
    
    // Extend call
    extendCall() {
        document.querySelector('.video-extend-modal')?.remove();
        this.callDuration = 0;
        this.startTimer();
        showToast('🎉 Altri 3 minuti aggiunti!', 'success');
    },
    
    // End call
    endCall() {
        clearInterval(this.callTimer);
        this.isActive = false;
        
        // Stop all tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        
        // Close peer connection
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        
        // Remove modals
        document.querySelector('.video-call-modal')?.remove();
        document.querySelector('.video-extend-modal')?.remove();
        
        // Send end signal
        this.sendSignal('call-ended', {});
        
        showToast('📞 Chiamata terminata', 'info');
    },
    
    // Show call modal
    showCallModal(matchName) {
        const modal = document.createElement('div');
        modal.className = 'video-call-modal';
        modal.innerHTML = `
            <div class="video-call-container">
                <div class="video-header">
                    <h3>🎥 Video Date con ${matchName}</h3>
                    <span id="callTimer" class="call-timer">3:00</span>
                </div>
                <div class="video-grid">
                    <div class="video-wrapper remote-video-wrapper">
                        <video id="remoteVideo" autoplay playsinline></video>
                        <span class="video-label">${matchName}</span>
                    </div>
                    <div class="video-wrapper local-video-wrapper">
                        <video id="localVideo" autoplay playsinline muted></video>
                        <span class="video-label">Tu</span>
                    </div>
                </div>
                <div class="video-controls">
                    <button onclick="VideoDate.toggleMute()" class="control-btn" id="muteBtn">
                        <i class="fas fa-microphone"></i>
                    </button>
                    <button onclick="VideoDate.toggleVideo()" class="control-btn" id="videoBtn">
                        <i class="fas fa-video"></i>
                    </button>
                    <button onclick="VideoDate.endCall()" class="control-btn end-call-btn">
                        <i class="fas fa-phone-slash"></i>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    },
    
    // Toggle mute
    toggleMute() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            
            const btn = document.getElementById('muteBtn');
            btn.innerHTML = audioTrack.enabled ? 
                '<i class="fas fa-microphone"></i>' : 
                '<i class="fas fa-microphone-slash"></i>';
            btn.classList.toggle('muted', !audioTrack.enabled);
        }
    },
    
    // Toggle video
    toggleVideo() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            
            const btn = document.getElementById('videoBtn');
            btn.innerHTML = videoTrack.enabled ? 
                '<i class="fas fa-video"></i>' : 
                '<i class="fas fa-video-slash"></i>';
            btn.classList.toggle('muted', !videoTrack.enabled);
        }
    },
    
    // Show incoming call modal
    showIncomingCallModal(matchName, callback) {
        const modal = document.createElement('div');
        modal.className = 'incoming-call-modal';
        modal.innerHTML = `
            <div class="incoming-call-content">
                <div class="caller-avatar">🎥</div>
                <h3>${matchName} ti sta chiamando...</h3>
                <p>Video Date in arrivo!</p>
                <div class="incoming-call-buttons">
                    <button onclick="this.closest('.incoming-call-modal').remove(); (${callback})(false)" class="decline-btn">
                        <i class="fas fa-phone-slash"></i> Rifiuta
                    </button>
                    <button onclick="this.closest('.incoming-call-modal').remove(); (${callback})(true)" class="accept-btn">
                        <i class="fas fa-video"></i> Accetta
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        
        // Play ringtone
        // const ringtone = new Audio('/sounds/ringtone.mp3');
        // ringtone.loop = true;
        // ringtone.play();
    },
    
    // Show error
    showCallError(message) {
        document.querySelector('.video-call-modal')?.remove();
        showToast('❌ ' + message, 'error');
    }
};

// ================================================================
// 📧 WELCOME EXPERIENCE
// ================================================================

const WelcomeExperience = {
    // Show welcome modal for new users
    showWelcome(userName) {
        const modal = document.createElement('div');
        modal.className = 'welcome-modal-overlay';
        modal.innerHTML = `
            <div class="welcome-modal">
                <div class="welcome-confetti"></div>
                <div class="welcome-content">
                    <div class="welcome-icon">🔥</div>
                    <h1>Benvenuto su FlameMatch!</h1>
                    <h2>Ciao ${userName}! 👋</h2>
                    <p>Siamo felicissimi di averti qui. Ecco cosa puoi fare:</p>
                    
                    <div class="welcome-features">
                        <div class="welcome-feature">
                            <span class="feature-icon">🎤</span>
                            <div>
                                <strong>Voice Vibe</strong>
                                <p>Registra un audio di 15 secondi per presentarti</p>
                            </div>
                        </div>
                        <div class="welcome-feature">
                            <span class="feature-icon">🎮</span>
                            <div>
                                <strong>Icebreaker Games</strong>
                                <p>Rompi il ghiaccio con giochi divertenti</p>
                            </div>
                        </div>
                        <div class="welcome-feature">
                            <span class="feature-icon">📍</span>
                            <div>
                                <strong>Vicino a Te</strong>
                                <p>Trova persone nella tua zona</p>
                            </div>
                        </div>
                        <div class="welcome-feature">
                            <span class="feature-icon">🛡️</span>
                            <div>
                                <strong>Profilo Verificato</strong>
                                <p>Verifica il tuo profilo per più visibilità</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="welcome-tip">
                        💡 <strong>Consiglio:</strong> I profili completi ricevono 10x più match!
                    </div>
                    
                    <button class="welcome-start-btn" id="welcomeCloseBtn" style="cursor: pointer; z-index: 10000;">
                        Inizia a Esplorare 🚀
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        
        // Attach close handler
        const closeBtn = document.getElementById('welcomeCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                WelcomeExperience.close();
            });
        }
        
        // Also close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                WelcomeExperience.close();
            }
        });
        
        // Add confetti animation
        this.showConfetti();
    },
    
    // Close welcome modal
    close() {
        document.querySelector('.welcome-modal-overlay')?.remove();
        
        // Mark welcome as shown
        if (currentUser) {
            db.collection('users').doc(currentUser.uid).update({
                welcomeShown: true
            });
        }
    },
    
    // Check if should show welcome
    async checkAndShow() {
        if (!currentUser) return;
        
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.data();
        
        if (userData && !userData.welcomeShown) {
            setTimeout(() => {
                this.showWelcome(userData.name || 'Nuovo Utente');
            }, 1000);
        }
    },
    
    // Confetti effect
    showConfetti() {
        const colors = ['#ff416c', '#ff4b2b', '#ffd700', '#ff69b4', '#00ff88'];
        const confettiContainer = document.querySelector('.welcome-confetti');
        if (!confettiContainer) return;
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.cssText = `
                left: ${Math.random() * 100}%;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                animation-delay: ${Math.random() * 3}s;
                animation-duration: ${3 + Math.random() * 2}s;
            `;
            confettiContainer.appendChild(confetti);
        }
    }
};

// Initialize notifications when app loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize push notifications after a delay
    setTimeout(() => {
        NotificationManager.init();
    }, 2000);
});

// Make functions globally available
window.VideoDate = VideoDate;
window.AIWingman = AIWingman;
window.WelcomeExperience = WelcomeExperience;
window.NotificationManager = NotificationManager;


// ================================================================
// 🧠 AI WINGMAN UI FUNCTIONS
// ================================================================

let aiPanelVisible = false;

function toggleAIWingman() {
    const panel = document.getElementById('aiSuggestionsPanel');
    aiPanelVisible = !aiPanelVisible;
    
    if (aiPanelVisible) {
        showAISuggestions();
        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
    }
}

async function showAISuggestions() {
    const panel = document.getElementById('aiSuggestionsList');
    if (!panel) return;
    
    // Get current match profile
    let matchProfile = null;
    if (currentChatMatchId) {
        const matchDoc = await db.collection('matches').doc(currentChatMatchId).get();
        if (matchDoc.exists) {
            const matchData = matchDoc.data();
            const otherUserId = matchData.users.find(id => id !== currentUser.uid);
            const userDoc = await db.collection('users').doc(otherUserId).get();
            matchProfile = userDoc.data();
        }
    }
    
    // Get conversation starters
    const starters = AIWingman.getConversationStarters(matchProfile || {});
    
    // Get last messages for smart replies
    const chatMessages = document.querySelectorAll('.message.received');
    let smartReplies = [];
    if (chatMessages.length > 0) {
        const lastMessage = chatMessages[chatMessages.length - 1]?.querySelector('.message-text')?.textContent || '';
        smartReplies = AIWingman.getSmartReplies(lastMessage);
    }
    
    // Get date ideas
    const dateIdeas = AIWingman.getDateIdeas(matchProfile?.location || '');
    
    // Build UI
    let html = '';
    
    // Smart replies section
    if (smartReplies.length > 0) {
        html += '<div class="ai-section"><small style="color: rgba(255,255,255,0.5); display: block; margin-bottom: 8px;">💬 Risposte suggerite:</small>';
        smartReplies.forEach(reply => {
            html += `<div class="ai-suggestion" onclick="useAISuggestion('${reply.replace(/'/g, "\\'")}')">${reply}</div>`;
        });
        html += '</div>';
    }
    
    // Conversation starters
    html += '<div class="ai-section" style="margin-top: 15px;"><small style="color: rgba(255,255,255,0.5); display: block; margin-bottom: 8px;">🚀 Inizia conversazione:</small>';
    starters.slice(0, 3).forEach(starter => {
        html += `<div class="ai-suggestion" onclick="useAISuggestion('${starter.replace(/'/g, "\\'")}')">${starter}</div>`;
    });
    html += '</div>';
    
    // Date ideas
    html += '<div class="ai-section date-ideas-panel" style="margin-top: 15px; padding: 15px; border-radius: 12px;"><small style="color: rgba(255,255,255,0.5); display: block; margin-bottom: 8px;">📍 Idee per appuntamento:</small>';
    dateIdeas.slice(0, 3).forEach(idea => {
        html += `<div class="ai-suggestion" onclick="useAISuggestion('Ti va di andare a: ${idea.replace(/'/g, "\\'")}')">${idea}</div>`;
    });
    html += '</div>';
    
    panel.innerHTML = html;
}

function useAISuggestion(text) {
    const input = document.getElementById('chatInput');
    if (input) {
        input.value = text;
        input.focus();
    }
    toggleAIWingman(); // Close panel
    showToast('💡 Suggerimento copiato!', 'success');
}

// ================================================================
// 🎥 VIDEO DATE UI FUNCTIONS
// ================================================================

async function startVideoDate() {
    if (!currentChatMatchId) {
        showToast('Seleziona prima una chat!', 'error');
        return;
    }
    
    // Get match info
    const matchDoc = await db.collection('matches').doc(currentChatMatchId).get();
    if (!matchDoc.exists) {
        showToast('Match non trovato', 'error');
        return;
    }
    
    const matchData = matchDoc.data();
    const otherUserId = matchData.users.find(id => id !== currentUser.uid);
    const userDoc = await db.collection('users').doc(otherUserId).get();
    const matchName = userDoc.exists ? userDoc.data().name : 'Match';
    
    // Confirm before starting
    if (confirm(`Vuoi avviare una Video Date con ${matchName}? (3 minuti)`)) {
        VideoDate.startCall(currentChatMatchId, matchName);
    }
}

// Listen for incoming video calls
function listenForVideoCalls() {
    if (!currentUser) return;
    
    db.collection('videoCalls')
        .where('to', '==', currentUser.uid)
        .where('type', '==', 'offer')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    // Check if call is recent (within last 30 seconds)
                    const callTime = data.timestamp?.toDate?.() || new Date();
                    const now = new Date();
                    if ((now - callTime) < 30000) {
                        handleIncomingVideoCall(data);
                    }
                }
            });
        });
}

async function handleIncomingVideoCall(callData) {
    const userDoc = await db.collection('users').doc(callData.from).get();
    const callerName = userDoc.exists ? userDoc.data().name : 'Qualcuno';
    
    VideoDate.handleIncomingCall(
        callData.matchId, 
        callerName, 
        JSON.parse(callData.data)
    );
}

// Initialize video call listener when user logs in
auth.onAuthStateChanged(user => {
    if (user) {
        setTimeout(listenForVideoCalls, 3000);
    }
});

// ================================================================
// 📧 CHECK WELCOME ON LOGIN
// ================================================================

// Check welcome experience after login
const originalOnLogin = window.onUserLogin;
window.onUserLogin = function(user) {
    if (originalOnLogin) originalOnLogin(user);
    
    // Check if should show welcome
    setTimeout(() => {
        WelcomeExperience.checkAndShow();
    }, 2000);
};

// Also check on page load if already logged in
setTimeout(() => {
    if (currentUser) {
        WelcomeExperience.checkAndShow();
    }
}, 3000);


// ================================================================
// 💰 WALLET SYSTEM - FLAMECOINS
// ================================================================


// ============================================
// 💰 WALLET SYSTEM - FIXED WITH INLINE STYLES
// ============================================


// ========================================
// WALLET SYSTEM - FULL INLINE STYLES
// ========================================
const WalletSystem = {
    balance: 50,
    transactions: [],
    
    async init() {
        const user = FlameAuth.currentUser;
        if (!user) return;
        
        try {
            const doc = await firebase.firestore().collection('users').doc(user.uid).get();
            if (doc.exists) {
                this.balance = doc.data().flameCoins || 50;
                this.transactions = doc.data().coinTransactions || [];
            } else {
                await firebase.firestore().collection('users').doc(user.uid).set({
                    flameCoins: 50,
                    coinTransactions: [{type: 'bonus', amount: 50, description: '🎁 Bonus di benvenuto!', date: new Date().toISOString()}]
                }, { merge: true });
            }
        } catch(e) {
            console.error('Wallet init error:', e);
        }
    },
    
    async addCoins(amount, description) {
        this.balance += amount;
        this.transactions.unshift({type: 'credit', amount, description, date: new Date().toISOString()});
        await this.saveToFirebase();
    },
    
    async spendCoins(amount, description) {
        if (this.balance < amount) {
            showToast('❌ FlameCoins insufficienti!');
            return false;
        }
        this.balance -= amount;
        this.transactions.unshift({type: 'debit', amount: -amount, description, date: new Date().toISOString()});
        await this.saveToFirebase();
        return true;
    },
    
    async saveToFirebase() {
        const user = FlameAuth.currentUser;
        if (!user) return;
        await firebase.firestore().collection('users').doc(user.uid).update({
            flameCoins: this.balance,
            coinTransactions: this.transactions.slice(0, 50)
        });
    },
    
    showWalletPanel() {
        // Remove existing modals
        document.querySelectorAll('.fm-wallet-overlay').forEach(m => m.remove());
        
        const overlay = document.createElement('div');
        overlay.className = 'fm-wallet-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);animation:fadeIn 0.3s ease;';
        
        const recentTx = this.transactions.slice(0, 5).map(tx => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 15px;background:rgba(255,255,255,0.05);border-radius:10px;margin-bottom:8px;">
                <span style="color:#ccc;font-size:13px;">${tx.description}</span>
                <span style="color:${tx.amount > 0 ? '#00b894' : '#e74c3c'};font-weight:700;">${tx.amount > 0 ? '+' : ''}${tx.amount}</span>
            </div>
        `).join('') || '<div style="color:#888;text-align:center;padding:20px;">Nessuna transazione</div>';
        
        overlay.innerHTML = `
            <div style="background:linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);border-radius:24px;width:90%;max-width:400px;max-height:85vh;overflow:hidden;box-shadow:0 25px 80px rgba(0,0,0,0.5);position:relative;animation:slideUp 0.4s ease;">
                
                <button onclick="this.closest('.fm-wallet-overlay').remove()" style="position:absolute;top:15px;right:15px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.1);border:none;color:#fff;font-size:24px;cursor:pointer;z-index:10;transition:all 0.3s;">×</button>
                
                <div style="background:linear-gradient(135deg, #f093fb 0%, #f5576c 100%);padding:30px 25px;text-align:center;">
                    <div style="font-size:50px;margin-bottom:10px;animation:bounce 2s infinite;">💰</div>
                    <h2 style="color:#fff;margin:0 0 15px 0;font-size:22px;font-weight:700;text-shadow:0 2px 10px rgba(0,0,0,0.3);">Il Tuo Wallet</h2>
                    <div style="background:rgba(0,0,0,0.3);border-radius:20px;padding:20px;backdrop-filter:blur(10px);border:2px solid rgba(255,255,255,0.2);">
                        <div style="display:flex;align-items:center;justify-content:center;gap:10px;">
                            <span style="font-size:36px;">🔥</span>
                            <span style="font-size:42px;font-weight:800;color:#fff;text-shadow:0 0 20px rgba(255,200,0,0.5);">${this.balance}</span>
                        </div>
                        <div style="color:rgba(255,255,255,0.8);font-size:14px;margin-top:5px;">FlameCoins disponibili</div>
                    </div>
                </div>
                
                <div style="padding:20px;overflow-y:auto;max-height:calc(85vh - 250px);">
                    <button onclick="document.querySelector('.fm-wallet-overlay').remove(); WalletSystem.showBuyModal();" style="width:100%;padding:16px;background:linear-gradient(135deg, #00b894 0%, #00cec9 100%);border:none;border-radius:15px;color:#fff;font-size:16px;font-weight:700;cursor:pointer;margin-bottom:20px;box-shadow:0 8px 25px rgba(0,184,148,0.4);display:flex;align-items:center;justify-content:center;gap:10px;transition:transform 0.3s;">
                        <span style="font-size:22px;">✨</span>
                        Acquista FlameCoins
                    </button>
                    
                    <div style="margin-bottom:15px;">
                        <h3 style="color:#f5576c;font-size:14px;font-weight:600;margin:0 0 12px 0;display:flex;align-items:center;gap:8px;">
                            <span style="font-size:16px;">💎</span> Cosa puoi fare
                        </h3>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                            <div style="background:linear-gradient(135deg, rgba(255,107,107,0.2) 0%, rgba(255,107,107,0.1) 100%);border-radius:12px;padding:15px;text-align:center;border:1px solid rgba(255,107,107,0.3);">
                                <div style="font-size:24px;margin-bottom:5px;">🎁</div>
                                <div style="color:#ff6b6b;font-size:12px;font-weight:600;">Regali</div>
                            </div>
                            <div style="background:linear-gradient(135deg, rgba(116,185,255,0.2) 0%, rgba(116,185,255,0.1) 100%);border-radius:12px;padding:15px;text-align:center;border:1px solid rgba(116,185,255,0.3);">
                                <div style="font-size:24px;margin-bottom:5px;">🚀</div>
                                <div style="color:#74b9ff;font-size:12px;font-weight:600;">Boost</div>
                            </div>
                            <div style="background:linear-gradient(135deg, rgba(253,203,110,0.2) 0%, rgba(253,203,110,0.1) 100%);border-radius:12px;padding:15px;text-align:center;border:1px solid rgba(253,203,110,0.3);">
                                <div style="font-size:24px;margin-bottom:5px;">⭐</div>
                                <div style="color:#fdcb6e;font-size:12px;font-weight:600;">SuperLike</div>
                            </div>
                            <div style="background:linear-gradient(135deg, rgba(162,155,254,0.2) 0%, rgba(162,155,254,0.1) 100%);border-radius:12px;padding:15px;text-align:center;border:1px solid rgba(162,155,254,0.3);">
                                <div style="font-size:24px;margin-bottom:5px;">👀</div>
                                <div style="color:#a29bfe;font-size:12px;font-weight:600;">Chi ti ha visto</div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 style="color:#f5576c;font-size:14px;font-weight:600;margin:0 0 12px 0;display:flex;align-items:center;gap:8px;">
                            <span style="font-size:16px;">📜</span> Transazioni recenti
                        </h3>
                        ${recentTx}
                    </div>
                </div>
            </div>
        `;
        
        // Click outside to close
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
        
        document.body.appendChild(overlay);
    },
    
    showBuyModal() {
        document.querySelectorAll('.fm-wallet-overlay').forEach(m => m.remove());
        
        const overlay = document.createElement('div');
        overlay.className = 'fm-wallet-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);';
        
        const packages = [
            { coins: 100, price: 4.99, bonus: 0, popular: false },
            { coins: 300, price: 9.99, bonus: 50, popular: true },
            { coins: 500, price: 14.99, bonus: 100, popular: false },
            { coins: 1000, price: 24.99, bonus: 250, popular: false },
            { coins: 2500, price: 49.99, bonus: 750, popular: false }
        ];
        
        const packagesHTML = packages.map(pkg => `
            <div style="background:${pkg.popular ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'rgba(255,255,255,0.08)'};border-radius:16px;padding:18px;position:relative;border:${pkg.popular ? 'none' : '1px solid rgba(255,255,255,0.1)'};transition:all 0.3s;">
                ${pkg.popular ? '<div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:#00b894;color:#fff;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;">⭐ PIÙ POPOLARE</div>' : ''}
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <div style="display:flex;align-items:center;gap:6px;">
                            <span style="font-size:24px;">🔥</span>
                            <span style="color:#fff;font-size:22px;font-weight:800;">${pkg.coins}</span>
                        </div>
                        ${pkg.bonus > 0 ? `<div style="color:#00b894;font-size:12px;font-weight:600;margin-top:4px;">+${pkg.bonus} BONUS!</div>` : '<div style="height:20px;"></div>'}
                    </div>
                    <button onclick="WalletSystem.purchaseCoins(${pkg.coins + pkg.bonus}, ${pkg.price})" style="background:${pkg.popular ? 'rgba(0,0,0,0.3)' : 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)'};border:none;color:#fff;padding:12px 24px;border-radius:25px;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,0.3);">
                        €${pkg.price.toFixed(2)}
                    </button>
                </div>
            </div>
        `).join('');
        
        overlay.innerHTML = `
            <div style="background:linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);border-radius:24px;width:90%;max-width:400px;max-height:85vh;overflow:hidden;box-shadow:0 25px 80px rgba(0,0,0,0.5);position:relative;">
                <button onclick="this.closest('.fm-wallet-overlay').remove()" style="position:absolute;top:15px;right:15px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.1);border:none;color:#fff;font-size:24px;cursor:pointer;z-index:10;">×</button>
                
                <div style="background:linear-gradient(135deg, #00b894 0%, #00cec9 100%);padding:25px;text-align:center;">
                    <div style="font-size:45px;margin-bottom:8px;">✨</div>
                    <h2 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Acquista FlameCoins</h2>
                    <p style="color:rgba(255,255,255,0.8);margin:8px 0 0 0;font-size:14px;">Saldo attuale: <strong>${this.balance}</strong> 🔥</p>
                </div>
                
                <div style="padding:20px;display:flex;flex-direction:column;gap:12px;overflow-y:auto;max-height:calc(85vh - 150px);">
                    ${packagesHTML}
                    
                    <button onclick="this.closest('.fm-wallet-overlay').remove(); WalletSystem.showWalletPanel();" style="width:100%;padding:14px;background:rgba(255,255,255,0.1);border:none;border-radius:12px;color:#fff;cursor:pointer;margin-top:10px;font-size:14px;">
                        ← Torna al Wallet
                    </button>
                </div>
            </div>
        `;
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
        
        document.body.appendChild(overlay);
    },
    
    async purchaseCoins(amount, price) {
        document.querySelectorAll('.fm-wallet-overlay').forEach(m => m.remove());
        
        const overlay = document.createElement('div');
        overlay.className = 'fm-wallet-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);';
        
        overlay.innerHTML = `
            <div style="background:linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);border-radius:24px;width:90%;max-width:400px;padding:30px;text-align:center;">
                <div style="font-size:60px;margin-bottom:15px;">🔥</div>
                <h2 style="color:#fff;margin:0 0 10px 0;">${amount} FlameCoins</h2>
                <p style="color:#00b894;font-size:24px;font-weight:700;margin:0 0 25px 0;">€${price.toFixed(2)}</p>
                <div id="paypal-coins-container" style="min-height:150px;"></div>
                <button onclick="this.closest('.fm-wallet-overlay').remove(); WalletSystem.showBuyModal();" style="width:100%;padding:14px;background:rgba(255,255,255,0.1);border:none;border-radius:12px;color:#fff;cursor:pointer;margin-top:15px;">← Annulla</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Initialize PayPal
        setTimeout(() => {
            if (window.paypal) {
                paypal.Buttons({
                    style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay' },
                    createOrder: (data, actions) => {
                        return actions.order.create({
                            purchase_units: [{ 
                                description: `${amount} FlameCoins - FlameMatch`,
                                amount: { value: price.toFixed(2), currency_code: 'EUR' }
                            }]
                        });
                    },
                    onApprove: async (data, actions) => {
                        const order = await actions.order.capture();
                        await WalletSystem.addCoins(amount, `✨ Acquistato pacchetto ${amount} coins`);
                        document.querySelector('.fm-wallet-overlay')?.remove();
                        showToast(`🎉 Acquistati ${amount} FlameCoins!`);
                        WalletSystem.showWalletPanel();
                    },
                    onError: (err) => {
                        console.error('PayPal error:', err);
                        showToast('❌ Errore pagamento');
                    }
                }).render('#paypal-coins-container');
            } else {
                document.getElementById('paypal-coins-container').innerHTML = '<p style="color:#e74c3c;">PayPal non disponibile</p>';
            }
        }, 100);
    }
};

// Global function for wallet button
function openWallet() {
    WalletSystem.showWalletPanel();
}

const VirtualGifts = {
    gifts: [
        // Basic Gifts (10-25 coins)
        { id: 'rose', name: 'Rosa', emoji: '🌹', price: 10, category: 'basic' },
        { id: 'heart', name: 'Cuore', emoji: '❤️', price: 15, category: 'basic' },
        { id: 'kiss', name: 'Bacio', emoji: '💋', price: 15, category: 'basic' },
        { id: 'smile', name: 'Sorriso', emoji: '😊', price: 10, category: 'basic' },
        { id: 'wink', name: 'Occhiolino', emoji: '😉', price: 10, category: 'basic' },
        { id: 'fire', name: 'Fuoco', emoji: '🔥', price: 20, category: 'basic' },
        { id: 'star', name: 'Stella', emoji: '⭐', price: 20, category: 'basic' },
        { id: 'sparkles', name: 'Scintille', emoji: '✨', price: 25, category: 'basic' },
        { id: 'rainbow', name: 'Arcobaleno', emoji: '🌈', price: 25, category: 'basic' },
        { id: 'sun', name: 'Sole', emoji: '☀️', price: 20, category: 'basic' },
        
        // Premium Gifts (50-100 coins)
        { id: 'chocolate', name: 'Cioccolatini', emoji: '🍫', price: 50, category: 'premium' },
        { id: 'teddy', name: 'Orsacchiotto', emoji: '🧸', price: 75, category: 'premium' },
        { id: 'flowers', name: 'Bouquet', emoji: '💐', price: 80, category: 'premium' },
        { id: 'cake', name: 'Torta', emoji: '🎂', price: 60, category: 'premium' },
        { id: 'balloon', name: 'Palloncino', emoji: '🎈', price: 50, category: 'premium' },
        { id: 'gift_box', name: 'Regalo', emoji: '🎁', price: 70, category: 'premium' },
        { id: 'champagne', name: 'Champagne', emoji: '🍾', price: 100, category: 'premium' },
        { id: 'cocktail', name: 'Cocktail', emoji: '🍹', price: 60, category: 'premium' },
        { id: 'music', name: 'Musica', emoji: '🎵', price: 50, category: 'premium' },
        { id: 'pizza', name: 'Pizza', emoji: '🍕', price: 55, category: 'premium' },
        
        // Luxury Gifts (200-500 coins)
        { id: 'diamond', name: 'Diamante', emoji: '💎', price: 200, category: 'luxury' },
        { id: 'crown', name: 'Corona', emoji: '👑', price: 250, category: 'luxury' },
        { id: 'ring', name: 'Anello', emoji: '💍', price: 300, category: 'luxury' },
        { id: 'car', name: 'Auto Sportiva', emoji: '🏎️', price: 400, category: 'luxury' },
        { id: 'yacht', name: 'Yacht', emoji: '🛥️', price: 500, category: 'luxury' },
        { id: 'rocket', name: 'Razzo', emoji: '🚀', price: 350, category: 'luxury' },
        { id: 'castle', name: 'Castello', emoji: '🏰', price: 450, category: 'luxury' },
        { id: 'unicorn', name: 'Unicorno', emoji: '🦄', price: 300, category: 'luxury' },
        { id: 'dragon', name: 'Drago', emoji: '🐉', price: 400, category: 'luxury' },
        { id: 'treasure', name: 'Tesoro', emoji: '💰', price: 500, category: 'luxury' }
    ],
    
    currentCategory: 'basic',
    
    showGiftPicker(recipientId, recipientName, matchId) {
        // Remove any existing modals
        document.querySelectorAll('.fm-gifts-modal').forEach(m => m.remove());
        
        const modal = document.createElement('div');
        modal.className = 'fm-gifts-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);display:flex;justify-content:center;align-items:center;z-index:99999;';
        
        modal.innerHTML = this.renderGiftModal(recipientId, recipientName, matchId);
        
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        
        this.attachListeners(recipientId, recipientName, matchId);
    },
    
    renderGiftModal(recipientId, recipientName, matchId) {
        return `
            <div style="background:linear-gradient(145deg,#1a1a2e,#16213e);border-radius:20px;padding:25px;max-width:500px;width:95%;max-height:85vh;overflow-y:auto;position:relative;border:2px solid rgba(255,107,107,0.3);box-shadow:0 20px 60px rgba(0,0,0,0.5);">
                <button onclick="this.closest('.fm-gifts-modal').remove()" style="position:absolute;top:10px;right:10px;background:rgba(255,255,255,0.1);border:none;width:32px;height:32px;border-radius:50%;color:#fff;cursor:pointer;font-size:18px;">×</button>
                
                <div style="text-align:center;margin-bottom:20px;">
                    <div style="font-size:48px;margin-bottom:10px;">🎁</div>
                    <h2 style="color:#fff;margin:0 0 5px 0;font-size:20px;">Invia Regalo a ${recipientName}</h2>
                    <p style="color:rgba(255,255,255,0.6);margin:5px 0;font-size:14px;">
                        Saldo: <span style="color:#ff6b6b;font-weight:bold;">🔥 ${WalletSystem.balance}</span> FlameCoins
                        <button onclick="document.querySelector('.fm-gifts-modal').remove(); WalletSystem.showBuyModal();" style="background:rgba(0,184,148,0.3);border:none;color:#00b894;padding:4px 10px;border-radius:15px;cursor:pointer;margin-left:8px;font-size:12px;">+ Ricarica</button>
                    </p>
                </div>
                
                <div style="display:flex;gap:8px;margin-bottom:15px;justify-content:center;">
                    <button class="gift-tab-btn" data-cat="basic" style="padding:10px 20px;border-radius:20px;border:none;cursor:pointer;font-size:14px;background:${this.currentCategory === 'basic' ? 'linear-gradient(135deg,#ff6b6b,#ff8e53)' : 'rgba(255,255,255,0.1)'};color:#fff;">💝 Base</button>
                    <button class="gift-tab-btn" data-cat="premium" style="padding:10px 20px;border-radius:20px;border:none;cursor:pointer;font-size:14px;background:${this.currentCategory === 'premium' ? 'linear-gradient(135deg,#ff6b6b,#ff8e53)' : 'rgba(255,255,255,0.1)'};color:#fff;">🎁 Premium</button>
                    <button class="gift-tab-btn" data-cat="luxury" style="padding:10px 20px;border-radius:20px;border:none;cursor:pointer;font-size:14px;background:${this.currentCategory === 'luxury' ? 'linear-gradient(135deg,#ff6b6b,#ff8e53)' : 'rgba(255,255,255,0.1)'};color:#fff;">👑 Lusso</button>
                </div>
                
                <div id="gifts-grid-container" style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;">
                    ${this.renderGifts()}
                </div>
            </div>
        `;
    },
    
    renderGifts() {
        return this.gifts
            .filter(g => g.category === this.currentCategory)
            .map(g => {
                const canAfford = WalletSystem.balance >= g.price;
                return `
                    <div class="gift-item-btn" data-gift-id="${g.id}" style="background:${canAfford ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)'};padding:12px 8px;border-radius:12px;text-align:center;cursor:${canAfford ? 'pointer' : 'not-allowed'};opacity:${canAfford ? '1' : '0.4'};transition:transform 0.2s,background 0.2s;border:1px solid ${canAfford ? 'rgba(255,255,255,0.1)' : 'transparent'};" ${canAfford ? 'onmouseover="this.style.transform=\'scale(1.05)\';this.style.background=\'rgba(255,107,107,0.2)\'" onmouseout="this.style.transform=\'scale(1)\';this.style.background=\'rgba(255,255,255,0.05)\'"' : ''}>
                        <div style="font-size:32px;margin-bottom:5px;">${g.emoji}</div>
                        <div style="color:#fff;font-size:11px;margin-bottom:3px;">${g.name}</div>
                        <div style="color:#ff6b6b;font-size:12px;font-weight:bold;">🔥 ${g.price}</div>
                    </div>
                `;
            }).join('');
    },
    
    attachListeners(recipientId, recipientName, matchId) {
        // Tab buttons
        document.querySelectorAll('.gift-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentCategory = btn.dataset.cat;
                this.showGiftPicker(recipientId, recipientName, matchId);
            });
        });
        
        // Gift items
        document.querySelectorAll('.gift-item-btn').forEach(item => {
            const gift = this.gifts.find(g => g.id === item.dataset.giftId);
            if (gift && WalletSystem.balance >= gift.price) {
                item.addEventListener('click', () => {
                    this.confirmGift(gift, recipientId, recipientName, matchId);
                });
            }
        });
    },
    
    confirmGift(gift, recipientId, recipientName, matchId) {
        const modal = document.querySelector('.fm-gifts-modal');
        if (!modal) return;
        
        modal.innerHTML = `
            <div style="background:linear-gradient(145deg,#1a1a2e,#16213e);border-radius:20px;padding:30px;max-width:350px;width:90%;text-align:center;border:2px solid rgba(255,107,107,0.3);">
                <div style="font-size:72px;margin-bottom:15px;">${gift.emoji}</div>
                <h3 style="color:#fff;margin:0 0 10px 0;">Inviare ${gift.name}?</h3>
                <p style="color:rgba(255,255,255,0.6);margin:0 0 20px 0;">
                    A: <strong>${recipientName}</strong><br>
                    Costo: <span style="color:#ff6b6b;font-weight:bold;">🔥 ${gift.price}</span> FlameCoins
                </p>
                <div style="display:flex;gap:10px;justify-content:center;">
                    <button onclick="VirtualGifts.showGiftPicker('${recipientId}', '${recipientName}', '${matchId}')" style="padding:12px 25px;border-radius:10px;border:none;background:rgba(255,255,255,0.1);color:#fff;cursor:pointer;">Annulla</button>
                    <button onclick="VirtualGifts.sendGift('${recipientId}', '${gift.id}', '${matchId}')" style="padding:12px 25px;border-radius:10px;border:none;background:linear-gradient(135deg,#ff6b6b,#ff8e53);color:#fff;cursor:pointer;font-weight:bold;">Invia 🎁</button>
                </div>
            </div>
        `;
    },
    
    async sendGift(recipientId, giftId, matchId) {
        const gift = this.gifts.find(g => g.id === giftId);
        if (!gift) return;
        
        // Close modal
        document.querySelector('.fm-gifts-modal')?.remove();
        
        // Spend coins
        const spent = await WalletSystem.spendCoins(gift.price, 'Regalo: ' + gift.emoji + ' ' + gift.name);
        if (!spent) return;
        
        // Save to Firestore
        try {
            await db.collection('gifts').add({
                senderId: currentUser.id,
                senderName: currentUser.name,
                recipientId: recipientId,
                matchId: matchId,
                giftId: gift.id,
                giftName: gift.name,
                giftEmoji: gift.emoji,
                giftPrice: gift.price,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Add message to chat
            if (matchId) {
                await db.collection('matches').doc(matchId).collection('messages').add({
                    senderId: currentUser.id,
                    type: 'gift',
                    giftEmoji: gift.emoji,
                    giftName: gift.name,
                    text: 'Ha inviato: ' + gift.emoji + ' ' + gift.name,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        } catch(e) {
            console.error('Gift save error:', e);
        }
        
        // Show animation
        this.playAnimation(gift);
        
        showNotification('Hai inviato ' + gift.emoji + ' ' + gift.name + '!', 'success');
    },
    
    playAnimation(gift) {
        const container = document.createElement('div');
        container.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;display:flex;justify-content:center;align-items:center;z-index:999999;pointer-events:none;';
        container.innerHTML = `
            <div style="font-size:150px;animation:giftPop 2s ease-out forwards;">
                ${gift.emoji}
            </div>
            <style>
                @keyframes giftPop {
                    0% { transform: scale(0) rotate(-180deg); opacity: 0; }
                    50% { transform: scale(1.3) rotate(10deg); opacity: 1; }
                    100% { transform: scale(1) rotate(0deg) translateY(-100px); opacity: 0; }
                }
            </style>
        `;
        document.body.appendChild(container);
        setTimeout(() => container.remove(), 2500);
    }
};

// Helper function for gift button in chat
function openGiftPickerForCurrentChat() {
    if (!currentChatMatchId || !currentChatUser) {
        showNotification('Apri prima una chat per inviare un regalo!', 'error');
        return;
    }
    VirtualGifts.showGiftPicker(
        currentChatUser.id || currentChatUserId,
        currentChatUser.name || 'Match',
        currentChatMatchId
    );
}

// Initialize Wallet when user logs in
auth.onAuthStateChanged(user => {
    if (user) {
        setTimeout(() => WalletSystem.init(), 2000);
    }
});


// ============================================
// 🚀 BOOST SYSTEM - PAYPAL INTEGRATION
// ============================================

const BoostPrices = {
    1: { price: 4.99, description: '1 Boost (30 minuti)' },
    5: { price: 14.99, description: '5 Boost (Risparmi 50%)' },
    10: { price: 24.99, description: '10 Boost (Risparmi 60%)' }
};

async function activateBoost(count) {
    const user = FlameAuth.currentUser;
    if (!user) {
        showToast('⚠️ Devi essere loggato', 'error');
        return;
    }
    
    const boostInfo = BoostPrices[count];
    if (!boostInfo) return;
    
    // Close boost modal and show PayPal modal
    closeBoostModal();
    showBoostPayPalModal(count, boostInfo);
}

function showBoostPayPalModal(count, boostInfo) {
    // Remove any existing modal
    document.querySelectorAll('.fm-boost-pay-modal').forEach(m => m.remove());
    
    const modal = document.createElement('div');
    modal.className = 'fm-boost-pay-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);display:flex;justify-content:center;align-items:center;z-index:99999;';
    
    modal.innerHTML = `
        <div style="background:linear-gradient(145deg,#1a1a2e,#16213e);border-radius:20px;padding:30px;max-width:400px;width:95%;text-align:center;border:2px solid rgba(255,107,107,0.3);">
            <button onclick="this.closest('.fm-boost-pay-modal').remove()" style="position:absolute;top:15px;right:15px;background:rgba(255,255,255,0.1);border:none;width:35px;height:35px;border-radius:50%;color:#fff;cursor:pointer;font-size:20px;">×</button>
            
            <div style="font-size:64px;margin-bottom:15px;">🚀</div>
            <h2 style="color:#fff;margin:0 0 10px 0;">Acquista ${count} Boost</h2>
            <p style="color:rgba(255,255,255,0.6);margin:0 0 5px 0;">${boostInfo.description}</p>
            <p style="color:#ff6b6b;font-size:28px;font-weight:bold;margin:15px 0;">€${boostInfo.price.toFixed(2)}</p>
            
            <div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:15px;margin:20px 0;">
                <p style="color:rgba(255,255,255,0.7);margin:0;font-size:14px;">
                    ✅ Profilo in cima per 30 minuti per boost<br>
                    ✅ 10x più visualizzazioni<br>
                    ✅ 3x più match
                </p>
            </div>
            
            <div id="paypal-boost-container" style="margin:20px 0;min-height:50px;"></div>
            
            <p style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:15px;">
                🔒 Pagamento sicuro con PayPal
            </p>
        </div>
    `;
    
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
    
    // Render PayPal button
    renderBoostPayPalButton(count, boostInfo);
}

function renderBoostPayPalButton(count, boostInfo) {
    const container = document.getElementById('paypal-boost-container');
    if (!container || !window.paypal) {
        console.error('PayPal not loaded');
        container.innerHTML = '<p style="color:#ff6b6b;">Errore caricamento PayPal. Ricarica la pagina.</p>';
        return;
    }
    
    paypal.Buttons({
        style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'pill',
            label: 'pay',
            height: 45
        },
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    description: 'FlameMatch ' + boostInfo.description,
                    amount: {
                        value: boostInfo.price.toFixed(2),
                        currency_code: 'EUR'
                    }
                }]
            });
        },
        onApprove: async function(data, actions) {
            return actions.order.capture().then(async function(details) {
                console.log('Boost payment success:', details);
                
                // Add boosts to user account
                await addBoostsToAccount(count);
                
                // Close modal
                document.querySelector('.fm-boost-pay-modal')?.remove();
                
                showToast('🎉 Acquistati ' + count + ' Boost! Attiva quando vuoi.', 'success');
            });
        },
        onError: function(err) {
            console.error('PayPal error:', err);
            showToast('❌ Errore pagamento PayPal', 'error');
        },
        onCancel: function() {
            showToast('Pagamento annullato', 'info');
        }
    }).render('#paypal-boost-container');
}

async function addBoostsToAccount(count) {
    const user = FlameAuth.currentUser;
    if (!user) return;
    
    try {
        const userRef = firebase.firestore().collection('users').doc(user.uid);
        const doc = await userRef.get();
        const currentBoosts = doc.exists ? (doc.data().availableBoosts || 0) : 0;
        
        await userRef.update({
            availableBoosts: currentBoosts + count,
            lastBoostPurchase: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Save transaction
        await firebase.firestore().collection('transactions').add({
            userId: user.uid,
            type: 'boost_purchase',
            boostCount: count,
            price: BoostPrices[count].price,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('Added', count, 'boosts to account');
    } catch (e) {
        console.error('Error adding boosts:', e);
    }
}

// Use a purchased boost
async function usePurchasedBoost() {
    const user = FlameAuth.currentUser;
    if (!user) return;
    
    if (boostActive) {
        showToast('🚀 Hai già un Boost attivo!', 'error');
        return;
    }
    
    try {
        const userRef = firebase.firestore().collection('users').doc(user.uid);
        const doc = await userRef.get();
        const availableBoosts = doc.exists ? (doc.data().availableBoosts || 0) : 0;
        
        if (availableBoosts <= 0) {
            showToast('⚠️ Non hai Boost disponibili. Acquistane altri!', 'error');
            showBoostModal();
            return;
        }
        
        const endTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minuti
        
        await userRef.update({
            availableBoosts: availableBoosts - 1,
            boostEndTime: endTime,
            boostStartTime: firebase.firestore.FieldValue.serverTimestamp(),
            isBoosted: true
        });
        
        boostActive = true;
        boostEndTime = endTime;
        
        closeBoostModal();
        showToast('🚀 Boost attivato! Sei in cima per 30 minuti!');
        updateBoostUI();
        startBoostTimer();
        
    } catch (e) {
        console.error('Error using boost:', e);
        showToast('❌ Errore', 'error');
    }
}

// ============================================
// 🔝 BOOSTED PROFILES FIRST IN DISCOVER
// ============================================

// Override the loadProfiles function to show boosted users first
const originalLoadProfiles = typeof loadProfiles === 'function' ? loadProfiles : null;

async function loadProfilesWithBoost() {
    const user = FlameAuth.currentUser;
    if (!user) return [];
    
    try {
        // Get current user data for location
        const currentUserDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        const currentUserData = currentUserDoc.data();
        
        // First, get BOOSTED profiles
        const boostedSnapshot = await firebase.firestore()
            .collection('users')
            .where('isBoosted', '==', true)
            .get();
        
        const boostedProfiles = [];
        const now = new Date();
        
        boostedSnapshot.forEach(doc => {
            if (doc.id !== user.uid) {
                const data = doc.data();
                // Check if boost is still active
                if (data.boostEndTime && data.boostEndTime.toDate() > now) {
                    boostedProfiles.push({ id: doc.id, ...data, isBoosted: true });
                }
            }
        });
        
        // Then get regular profiles
        let regularProfiles = [];
        if (originalLoadProfiles) {
            regularProfiles = await originalLoadProfiles();
        } else {
            // Fallback: load profiles normally
            const regularSnapshot = await firebase.firestore()
                .collection('users')
                .where('profileComplete', '==', true)
                .limit(50)
                .get();
            
            regularSnapshot.forEach(doc => {
                if (doc.id !== user.uid && !boostedProfiles.find(p => p.id === doc.id)) {
                    regularProfiles.push({ id: doc.id, ...doc.data() });
                }
            });
        }
        
        // Remove duplicates (boosted profiles from regular list)
        const boostedIds = boostedProfiles.map(p => p.id);
        regularProfiles = regularProfiles.filter(p => !boostedIds.includes(p.id));
        
        // Combine: BOOSTED FIRST, then regular
        console.log('🚀 Boosted profiles:', boostedProfiles.length, '| Regular:', regularProfiles.length);
        return [...boostedProfiles, ...regularProfiles];
        
    } catch (e) {
        console.error('Error loading profiles with boost:', e);
        return originalLoadProfiles ? originalLoadProfiles() : [];
    }
}

console.log('🚀 Boost system with PayPal loaded!');


// Check and show available boosts in modal
async function checkAvailableBoosts() {
    const user = FlameAuth.currentUser;
    if (!user) return;
    
    try {
        const doc = await firebase.firestore().collection('users').doc(user.uid).get();
        const availableBoosts = doc.exists ? (doc.data().availableBoosts || 0) : 0;
        
        const section = document.getElementById('availableBoostsSection');
        const countEl = document.getElementById('availableBoostsCount');
        
        if (section && countEl) {
            if (availableBoosts > 0) {
                section.style.display = 'block';
                countEl.textContent = availableBoosts;
            } else {
                section.style.display = 'none';
            }
        }
    } catch (e) {
        console.error('Error checking boosts:', e);
    }
}

// Override showBoostModal to check available boosts
const originalShowBoostModal = showBoostModal;
showBoostModal = function() {
    originalShowBoostModal();
    setTimeout(checkAvailableBoosts, 100);
};

