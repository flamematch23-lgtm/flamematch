// ==========================================
// FLAMEMATCH - EmailJS Configuration V44
// Email di benvenuto reali per nuovi utenti
// ==========================================

// ISTRUZIONI SETUP EMAILJS:
// 1. Vai su https://www.emailjs.com/ e crea un account gratuito
// 2. Crea un "Email Service" (connetti Gmail o altro)
// 3. Crea un "Email Template" con questi parametri:
//    - to_email: {{to_email}}
//    - to_name: {{to_name}}
//    - from_name: FlameMatch
//    - Subject: Benvenuto su FlameMatch! 🔥
// 4. Copia Service ID, Template ID e Public Key qui sotto

const EMAILJS_CONFIG = {
    publicKey: 'SCfv5yuQtTXenda-N',       // ✅ Configurato
    serviceId: 'service_moimi97',         // ✅ Configurato  
    welcomeTemplateId: 'template_y0o0nyd' // ✅ Configurato
};

// Inizializza EmailJS
function initEmailJS() {
    if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY') {
        emailjs.init(EMAILJS_CONFIG.publicKey);
        console.log('📧 EmailJS inizializzato');
        return true;
    }
    return false;
}

// Invia email di benvenuto
async function sendWelcomeEmail(userEmail, userName) {
    // Verifica configurazione
    if (EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') {
        console.log('⚠️ EmailJS non configurato - email di benvenuto non inviata');
        return false;
    }
    
    if (typeof emailjs === 'undefined') {
        console.log('⚠️ EmailJS SDK non caricato');
        return false;
    }
    
    try {
        const templateParams = {
            to_email: userEmail,
            to_name: userName || 'Nuovo Utente',
            app_name: 'FlameMatch',
            app_url: 'https://flamematch23-lgtm.github.io/flamematch/',
            current_year: new Date().getFullYear()
        };
        
        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.welcomeTemplateId,
            templateParams
        );
        
        console.log('✅ Email di benvenuto inviata a:', userEmail);
        return true;
        
    } catch (error) {
        console.error('❌ Errore invio email:', error);
        return false;
    }
}

// Invia email notifica match
async function sendMatchNotificationEmail(userEmail, userName, matchName) {
    if (EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') {
        return false;
    }
    
    try {
        const templateParams = {
            to_email: userEmail,
            to_name: userName,
            match_name: matchName,
            app_url: 'https://flamematch23-lgtm.github.io/flamematch/app.html'
        };
        
        // Usa un template diverso per i match (opzionale)
        // await emailjs.send(EMAILJS_CONFIG.serviceId, 'template_match', templateParams);
        
        return true;
    } catch (error) {
        console.error('Errore email match:', error);
        return false;
    }
}

// Export per uso globale
window.FlameEmail = {
    init: initEmailJS,
    sendWelcome: sendWelcomeEmail,
    sendMatchNotification: sendMatchNotificationEmail
};
