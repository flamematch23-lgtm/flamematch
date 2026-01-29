# 📧 Guida Setup EmailJS per FlameMatch

Questa guida ti aiuta a configurare l'invio automatico di email di benvenuto ai nuovi utenti.

## 🚀 Passaggi Setup

### 1. Crea Account EmailJS (Gratuito)

1. Vai su **https://www.emailjs.com/**
2. Clicca **Sign Up Free**
3. Puoi registrarti con Google (usa flamematch23@gmail.com)

**Piano Gratuito include:**
- 200 email/mese
- 2 template
- Illimitati contatti

---

### 2. Crea Email Service

1. Nella dashboard EmailJS, vai su **Email Services**
2. Clicca **Add New Service**
3. Seleziona **Gmail** (o altro provider)
4. Clicca **Connect Account** e autorizza con **flamematch23@gmail.com**
5. Dai un nome: `service_flamematch`
6. Clicca **Create Service**

📝 **Annota il Service ID** (es: `service_abc123`)

---

### 3. Crea Email Template

1. Vai su **Email Templates**
2. Clicca **Create New Template**
3. Configura così:

#### Subject (Oggetto):
```
🔥 Benvenuto su FlameMatch, {{to_name}}!
```

#### Content (HTML):
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background: #1a1a2e; color: #fff; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 20px; padding: 40px; }
        .logo { text-align: center; font-size: 48px; margin-bottom: 20px; }
        .title { color: #ff416c; font-size: 28px; text-align: center; margin-bottom: 20px; }
        .content { font-size: 16px; line-height: 1.6; color: #e0e0e0; }
        .features { background: rgba(255,65,108,0.1); border-radius: 15px; padding: 20px; margin: 20px 0; }
        .feature { padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .feature:last-child { border-bottom: none; }
        .feature-icon { font-size: 24px; margin-right: 10px; }
        .cta-button { display: block; width: 200px; margin: 30px auto; padding: 15px 30px; background: linear-gradient(135deg, #ff416c, #ff4b2b); color: white; text-decoration: none; text-align: center; border-radius: 30px; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🔥</div>
        <h1 class="title">Benvenuto su FlameMatch!</h1>
        
        <div class="content">
            <p>Ciao <strong>{{to_name}}</strong>,</p>
            
            <p>Grazie per esserti registrato su <strong>FlameMatch</strong>! 🎉</p>
            
            <p>Sei pronto a trovare la tua anima gemella? Ecco cosa puoi fare:</p>
            
            <div class="features">
                <div class="feature">
                    <span class="feature-icon">💫</span>
                    <strong>Scopri</strong> - Esplora profili e swipa per trovare match
                </div>
                <div class="feature">
                    <span class="feature-icon">🎤</span>
                    <strong>Voice Vibe</strong> - Registra il tuo audio introduttivo
                </div>
                <div class="feature">
                    <span class="feature-icon">🎮</span>
                    <strong>Icebreaker Games</strong> - Rompi il ghiaccio con giochi divertenti
                </div>
                <div class="feature">
                    <span class="feature-icon">📹</span>
                    <strong>Video Date</strong> - Videochiamate sicure con i tuoi match
                </div>
                <div class="feature">
                    <span class="feature-icon">✅</span>
                    <strong>Verifica AI</strong> - Profili verificati per la tua sicurezza
                </div>
            </div>
            
            <a href="{{app_url}}" class="cta-button">Inizia Ora 🔥</a>
            
            <p>Buona fortuna nella ricerca dell'amore! ❤️</p>
            
            <p>Il Team FlameMatch</p>
        </div>
        
        <div class="footer">
            <p>© {{current_year}} FlameMatch - Tutti i diritti riservati</p>
            <p>Questa email è stata inviata a {{to_email}}</p>
        </div>
    </div>
</body>
</html>
```

4. Salva il template con nome: `template_welcome`

📝 **Annota il Template ID** (es: `template_xyz789`)

---

### 4. Ottieni Public Key

1. Vai su **Account** → **General**
2. Trova **Public Key** nella sezione API Keys

📝 **Annota la Public Key** (es: `aBcDeFgHiJkLmNoP`)

---

### 5. Configura FlameMatch

Apri il file `js/emailjs-config.js` e inserisci i tuoi valori:

```javascript
const EMAILJS_CONFIG = {
    publicKey: 'LA_TUA_PUBLIC_KEY',         // Es: 'aBcDeFgHiJkLmNoP'
    serviceId: 'IL_TUO_SERVICE_ID',         // Es: 'service_abc123'
    welcomeTemplateId: 'IL_TUO_TEMPLATE_ID' // Es: 'template_xyz789'
};
```

---

### 6. Deploy e Test

1. Deploya i file aggiornati su GitHub Pages
2. Registra un nuovo utente di test
3. Verifica che l'email arrivi nella inbox

---

## 🔍 Troubleshooting

### Email non arriva
- Controlla la cartella SPAM
- Verifica che i valori in `emailjs-config.js` siano corretti
- Controlla la console del browser per errori

### Errore "Service not found"
- Verifica il Service ID sia corretto
- Assicurati che il servizio sia connesso e attivo

### Errore "Template not found"
- Verifica il Template ID sia corretto
- Assicurati che il template sia salvato

### Limite raggiunto (200/mese)
- Considera upgrade a piano Basic ($9/mese = 1000 email)
- Oppure usa servizio alternativo (SendGrid, Mailgun)

---

## 📊 Variabili Template Disponibili

| Variabile | Valore |
|-----------|--------|
| `{{to_email}}` | Email dell'utente |
| `{{to_name}}` | Nome dell'utente |
| `{{app_name}}` | "FlameMatch" |
| `{{app_url}}` | URL del sito |
| `{{current_year}}` | Anno corrente |

---

## 🎯 Email Aggiuntive (Opzionale)

Puoi creare altri template per:
- **Match notification** - "Hai un nuovo match con {{match_name}}!"
- **Message notification** - "{{sender_name}} ti ha inviato un messaggio"
- **Weekly digest** - Riepilogo settimanale attività

---

Fatto con ❤️ per FlameMatch
