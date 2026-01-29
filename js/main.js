/* ==========================================
   FlameMatch - Main JavaScript
   ========================================== */

// ==========================================
// Demo Profiles Data
// ==========================================
const profiles = [
    {
        name: 'Sofia',
        age: 26,
        distance: '3 km',
        bio: 'Amo viaggiare, la fotografia e le serate con gli amici 📸✈️',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500',
        verified: true,
        willMatch: true
    },
    {
        name: 'Giulia',
        age: 24,
        distance: '5 km',
        bio: 'Amante della musica e del buon cibo 🎵🍕',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500',
        verified: true,
        willMatch: false
    },
    {
        name: 'Martina',
        age: 28,
        distance: '2 km',
        bio: 'Personal trainer | Yoga lover | Positive vibes only ✨',
        image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500',
        verified: true,
        willMatch: true
    },
    {
        name: 'Chiara',
        age: 25,
        distance: '8 km',
        bio: 'Architetto di giorno, chef di notte 🏠👩‍🍳',
        image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500',
        verified: false,
        willMatch: false
    },
    {
        name: 'Elena',
        age: 27,
        distance: '1 km',
        bio: 'Libro + caffè = felicità ☕📚',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
        verified: true,
        willMatch: true
    },
    {
        name: 'Alessia',
        age: 23,
        distance: '4 km',
        bio: 'Studentessa di medicina | Amante degli animali 🐕',
        image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=500',
        verified: true,
        willMatch: false
    },
    {
        name: 'Valentina',
        age: 29,
        distance: '6 km',
        bio: 'Marketing manager | Viaggi | Vino 🍷',
        image: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=500',
        verified: true,
        willMatch: true
    },
    {
        name: 'Francesca',
        age: 26,
        distance: '3 km',
        bio: 'Artista | Sognatrice | Anima libera 🎨',
        image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500',
        verified: false,
        willMatch: false
    }
];

// State
let currentHeroIndex = 0;
let currentDemoIndex = 0;
let demoLikes = 0;
let demoSuperLikes = 0;
let demoMatches = 0;
let swipeHistory = [];
let currentPhotoSlot = 0;
let uploadedPhotos = [];
let currentTestimonial = 0;

// ==========================================
// Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initHeroCards();
    initDemoCards();
    initScrollAnimations();
    initNavbarScroll();
    initPasswordStrength();
    initBioCounter();
    showCookieBanner();
    initCounters();
});

// ==========================================
// Hero Swipe Cards
// ==========================================
function initHeroCards() {
    const container = document.getElementById('heroSwipeCards');
    if (!container) return;
    
    renderHeroCard();
}

function renderHeroCard() {
    const container = document.getElementById('heroSwipeCards');
    if (!container) return;
    
    const profile = profiles[currentHeroIndex % profiles.length];
    
    container.innerHTML = `
        <div class="swipe-card" id="heroCard">
            <img src="${profile.image}" alt="${profile.name}">
            <div class="swipe-card-info">
                <h3>${profile.name}, ${profile.age} ${profile.verified ? '<i class="fas fa-check-circle verified"></i>' : ''}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${profile.distance} da te</p>
            </div>
        </div>
    `;
}

function heroSwipe(direction) {
    const card = document.getElementById('heroCard');
    if (!card) return;
    
    if (direction === 'left') {
        card.style.transform = 'translateX(-150%) rotate(-30deg)';
    } else if (direction === 'right') {
        card.style.transform = 'translateX(150%) rotate(30deg)';
    } else {
        card.style.transform = 'scale(1.1)';
        setTimeout(() => {
            card.style.transform = '';
        }, 300);
        return;
    }
    
    card.style.opacity = '0';
    
    setTimeout(() => {
        currentHeroIndex++;
        renderHeroCard();
    }, 300);
}

// ==========================================
// Demo Swipe Cards
// ==========================================
function initDemoCards() {
    const container = document.getElementById('demoCards');
    if (!container) return;
    
    renderDemoCards();
}

function renderDemoCards() {
    const container = document.getElementById('demoCards');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Render next 3 cards (stacked)
    for (let i = 2; i >= 0; i--) {
        const index = (currentDemoIndex + i) % profiles.length;
        const profile = profiles[index];
        const isTop = i === 0;
        
        const card = document.createElement('div');
        card.className = 'demo-card';
        card.style.zIndex = 3 - i;
        card.style.transform = `scale(${1 - i * 0.05}) translateY(${i * 10}px)`;
        card.style.opacity = isTop ? 1 : 0.7 - i * 0.2;
        
        if (isTop) {
            card.id = 'topDemoCard';
            card.setAttribute('data-index', index);
            initDragListeners(card);
        }
        
        card.innerHTML = `
            <img src="${profile.image}" alt="${profile.name}" draggable="false">
            <div class="demo-card-overlay">
                <h4>${profile.name}, ${profile.age} ${profile.verified ? '<i class="fas fa-check-circle verified"></i>' : ''}</h4>
                <p class="location"><i class="fas fa-map-marker-alt"></i> ${profile.distance} da te</p>
                <p class="bio">${profile.bio}</p>
            </div>
            <div class="like-indicator">LIKE</div>
            <div class="nope-indicator">NOPE</div>
            <div class="super-indicator">SUPER</div>
        `;
        
        container.appendChild(card);
    }
}

function initDragListeners(card) {
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;
    
    const onStart = (e) => {
        isDragging = true;
        startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
        card.style.transition = 'none';
    };
    
    const onMove = (e) => {
        if (!isDragging) return;
        
        currentX = (e.type === 'mousemove' ? e.clientX : e.touches[0].clientX) - startX;
        currentY = (e.type === 'mousemove' ? e.clientY : e.touches[0].clientY) - startY;
        
        const rotate = currentX * 0.1;
        card.style.transform = `translateX(${currentX}px) translateY(${currentY}px) rotate(${rotate}deg)`;
        
        // Show indicators
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
    };
    
    const onEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        
        card.style.transition = 'transform 0.3s ease';
        
        if (currentX > 100) {
            demoSwipe('right');
        } else if (currentX < -100) {
            demoSwipe('left');
        } else if (currentY < -100) {
            demoSwipe('super');
        } else {
            card.style.transform = '';
            const indicators = card.querySelectorAll('.like-indicator, .nope-indicator, .super-indicator');
            indicators.forEach(i => i.style.opacity = 0);
        }
        
        currentX = 0;
        currentY = 0;
    };
    
    card.addEventListener('mousedown', onStart);
    card.addEventListener('touchstart', onStart, { passive: true });
    
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: true });
    
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);
}

function demoSwipe(direction) {
    const card = document.getElementById('topDemoCard');
    if (!card) return;
    
    const index = parseInt(card.getAttribute('data-index'));
    const profile = profiles[index];
    
    // Save to history
    swipeHistory.push({
        index: currentDemoIndex,
        profile: profile
    });
    
    // Enable undo button
    document.getElementById('undoBtn').disabled = false;
    
    // Animate card
    card.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
    
    if (direction === 'left') {
        card.style.transform = 'translateX(-150%) rotate(-30deg)';
        card.querySelector('.nope-indicator').style.opacity = 1;
    } else if (direction === 'right') {
        card.style.transform = 'translateX(150%) rotate(30deg)';
        card.querySelector('.like-indicator').style.opacity = 1;
        demoLikes++;
        document.getElementById('likesCount').textContent = demoLikes;
        
        // Check for match
        if (profile.willMatch) {
            setTimeout(() => showMatch(profile), 500);
        }
    } else if (direction === 'super') {
        card.style.transform = 'translateY(-150%) scale(1.1)';
        card.querySelector('.super-indicator').style.opacity = 1;
        demoSuperLikes++;
        document.getElementById('superLikesCount').textContent = demoSuperLikes;
        
        // Super likes always match
        setTimeout(() => showMatch(profile), 500);
    }
    
    card.style.opacity = '0';
    
    setTimeout(() => {
        currentDemoIndex++;
        renderDemoCards();
    }, 300);
}

function undoSwipe() {
    if (swipeHistory.length === 0) return;
    
    const last = swipeHistory.pop();
    currentDemoIndex = last.index;
    renderDemoCards();
    
    if (swipeHistory.length === 0) {
        document.getElementById('undoBtn').disabled = true;
    }
    
    showNotification('Swipe annullato! 🔄', 'success');
}

function showMatch(profile) {
    demoMatches++;
    document.getElementById('matchesCount').textContent = demoMatches;
    
    document.getElementById('matchProfileImg').src = profile.image;
    document.getElementById('matchName').textContent = profile.name;
    
    openModal('matchModal');
}

function showBoostInfo() {
    showNotification('🚀 Boost attivato! Il tuo profilo sarà più visibile per 30 minuti', 'success');
}

// ==========================================
// Modal Functions
// ==========================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Chiudi video modal e ferma il video
function closeVideoModal() {
    const video = document.getElementById('introVideo');
    if (video) {
        video.pause();
        video.currentTime = 0;
    }
    closeModal('videoModal');
}

// Close modal on outside click (only on direct modal background click)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal') && e.target === e.currentTarget) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Prevent modal content clicks from closing
document.querySelectorAll('.modal-content').forEach(content => {
    content.addEventListener('click', (e) => {
        e.stopPropagation();
    });
});

// Prevent scroll on modal backdrop from scrolling page
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('wheel', (e) => {
        const content = modal.querySelector('.modal-content');
        if (content) {
            const isScrollable = content.scrollHeight > content.clientHeight;
            const atTop = content.scrollTop === 0;
            const atBottom = content.scrollTop + content.clientHeight >= content.scrollHeight;
            
            if (!isScrollable || (e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
                e.preventDefault();
            }
        }
    }, { passive: false });
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }
});

// ==========================================
// Navigation
// ==========================================
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const icon = document.getElementById('menuIcon');
    
    menu.classList.toggle('active');
    
    if (menu.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
}

function closeMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const icon = document.getElementById('menuIcon');
    
    menu.classList.remove('active');
    icon.classList.remove('fa-times');
    icon.classList.add('fa-bars');
}

function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ==========================================
// Form Handlers
// ==========================================
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail')?.value || '';
    const password = document.getElementById('loginPassword')?.value || '';
    
    if (!email || !password) {
        showNotification('Inserisci email e password', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const result = await FlameAuth.signIn(email, password);
        hideLoading();
        
        if (result.success) {
            closeModal('loginModal');
            showNotification('Bentornato! 🎉', 'success');
            
            // Redirect to app
            setTimeout(() => {
                window.location.href = 'app.html';
            }, 1000);
        } else {
            showNotification(result.error || 'Credenziali non valide', 'error');
        }
    } catch (error) {
        hideLoading();
        console.error('Login error:', error);
        showNotification('Errore durante il login. Riprova.', 'error');
    }
}

async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('forgotEmail')?.value || '';
    
    if (!email) {
        showNotification('Inserisci la tua email', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const result = await FlameAuth.resetPassword(email);
        hideLoading();
        
        if (result.success) {
            closeModal('forgotModal');
            showNotification('Email inviata! Controlla la tua casella di posta 📧', 'success');
        } else {
            showNotification(result.error || 'Errore nell\'invio dell\'email', 'error');
        }
    } catch (error) {
        hideLoading();
        showNotification('Email inviata! Controlla la tua casella di posta 📧', 'success');
        closeModal('forgotModal');
    }
}

function handleContact(e) {
    e.preventDefault();
    showLoading();
    
    setTimeout(() => {
        hideLoading();
        closeModal('contactModal');
        showNotification('Messaggio inviato! Ti risponderemo presto 📨', 'success');
        e.target.reset();
    }, 1500);
}

// Registration Steps
let currentRegisterStep = 1;

function nextRegisterStep(e, step) {
    e.preventDefault();
    
    // Validate current step
    if (step === 1) {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        
        if (!name || !email || password.length < 6) {
            showNotification('Compila tutti i campi (password min 6 caratteri)', 'error');
            return;
        }
    }
    
    if (step === 2) {
        const birthdate = document.getElementById('registerBirthdate').value;
        const gender = document.getElementById('registerGender').value;
        
        if (!birthdate || !gender) {
            showNotification('Compila tutti i campi obbligatori', 'error');
            return;
        }
        
        // Check age
        const age = calculateAge(new Date(birthdate));
        if (age < 18) {
            showNotification('Devi avere almeno 18 anni per registrarti', 'error');
            return;
        }
    }
    
    // Update steps UI
    document.querySelector(`.register-step[data-step="${step}"]`).classList.add('completed');
    document.querySelector(`.register-step[data-step="${step + 1}"]`).classList.add('active');
    
    // Switch forms
    document.getElementById(`registerStep${step}`).classList.remove('active');
    document.getElementById(`registerStep${step + 1}`).classList.add('active');
    
    currentRegisterStep = step + 1;
}

function prevRegisterStep(step) {
    document.querySelector(`.register-step[data-step="${step}"]`).classList.remove('active');
    document.querySelector(`.register-step[data-step="${step - 1}"]`).classList.remove('completed');
    
    document.getElementById(`registerStep${step}`).classList.remove('active');
    document.getElementById(`registerStep${step - 1}`).classList.add('active');
    
    currentRegisterStep = step - 1;
}

async function completeRegistration(e) {
    e.preventDefault();
    
    // Check terms
    if (!document.getElementById('termsCheck').checked) {
        showNotification('Devi accettare i termini di servizio', 'error');
        return;
    }
    
    // Check photos (ora opzionale per il primo test)
    // if (uploadedPhotos.length < 2) {
    //     showNotification('Aggiungi almeno 2 foto', 'error');
    //     return;
    // }
    
    // Get form data
    const name = document.getElementById('registerName')?.value || '';
    const email = document.getElementById('registerEmail')?.value || '';
    const password = document.getElementById('registerPassword')?.value || '';
    const birthday = document.getElementById('registerBirthday')?.value || '';
    const gender = document.querySelector('input[name="gender"]:checked')?.value || 'other';
    const bio = document.getElementById('registerBio')?.value || '';
    const city = document.getElementById('registerCity')?.value || '';
    
    // Validate required fields
    if (!name || !email || !password) {
        showNotification('Compila tutti i campi obbligatori', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('La password deve essere di almeno 6 caratteri', 'error');
        return;
    }
    
    showLoading();
    
    try {
        // Register with Firebase
        const result = await FlameAuth.signUp(email, password, {
            name: name,
            birthday: birthday,
            gender: gender,
            bio: bio,
            city: city,
            photos: uploadedPhotos
        });
        
        hideLoading();
        
        if (result.success) {
            closeModal('registerModal');
            showSuccessModal('Registrazione Completata! 🎉', 'Benvenuto in FlameMatch! Ti abbiamo inviato un\'email di verifica. Controlla la tua casella di posta.');
            resetRegistration();
        } else {
            showNotification(result.error || 'Errore durante la registrazione', 'error');
        }
    } catch (error) {
        hideLoading();
        console.error('Registration error:', error);
        showNotification('Errore durante la registrazione. Riprova.', 'error');
    }
}

function resetRegistration() {
    currentRegisterStep = 1;
    uploadedPhotos = [];
    
    document.querySelectorAll('.register-step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index === 0) step.classList.add('active');
    });
    
    document.querySelectorAll('.register-step-form').forEach((form, index) => {
        form.classList.remove('active');
        if (index === 0) form.classList.add('active');
        form.reset();
    });
    
    document.querySelectorAll('.photo-slot').forEach(slot => {
        slot.classList.remove('has-photo');
        slot.querySelector('.photo-preview').src = '';
    });
}

function calculateAge(birthday) {
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const m = today.getMonth() - birthday.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
        age--;
    }
    return age;
}

// ==========================================
// Photo Upload
// ==========================================
function triggerPhotoUpload(slot) {
    currentPhotoSlot = slot;
    document.getElementById('photoInput').click();
}

function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showNotification('Seleziona un file immagine', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const slots = document.querySelectorAll('.photo-slot');
        const slot = slots[currentPhotoSlot];
        
        slot.classList.add('has-photo');
        slot.querySelector('.photo-preview').src = event.target.result;
        
        uploadedPhotos[currentPhotoSlot] = event.target.result;
    };
    reader.readAsDataURL(file);
    
    e.target.value = '';
}

// ==========================================
// Password Strength
// ==========================================
function initPasswordStrength() {
    const passwordInput = document.getElementById('registerPassword');
    if (!passwordInput) return;
    
    passwordInput.addEventListener('input', (e) => {
        const password = e.target.value;
        const strength = checkPasswordStrength(password);
        const strengthDiv = document.getElementById('passwordStrength');
        
        strengthDiv.innerHTML = `<div class="strength-bar ${strength}"></div>`;
    });
}

function checkPasswordStrength(password) {
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    
    const score = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (score >= 3 && password.length >= 10) return 'strong';
    if (score >= 2) return 'medium';
    return 'weak';
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// ==========================================
// Bio Counter
// ==========================================
function initBioCounter() {
    const bioInput = document.getElementById('registerBio');
    if (!bioInput) return;
    
    bioInput.addEventListener('input', (e) => {
        document.getElementById('bioCount').textContent = e.target.value.length;
    });
}

// ==========================================
// Social Login
// ==========================================
async function socialLogin(provider) {
    showLoading();
    
    try {
        let result;
        
        if (provider.toLowerCase() === 'google') {
            result = await FlameAuth.signInWithGoogle();
        } else {
            // Facebook e Apple richiedono configurazione aggiuntiva
            hideLoading();
            showNotification(`Login con ${provider} sarà disponibile presto!`, 'info');
            return;
        }
        
        hideLoading();
        
        if (result && result.success) {
            closeModal('loginModal');
            closeModal('registerModal');
            showNotification(`Accesso con ${provider} completato! 🎉`, 'success');
            
            // Redirect to app
            setTimeout(() => {
                window.location.href = 'app.html';
            }, 1000);
        } else {
            showNotification(result?.error || `Errore durante l'accesso con ${provider}`, 'error');
        }
    } catch (error) {
        hideLoading();
        console.error('Social login error:', error);
        showNotification(`Errore durante l'accesso con ${provider}`, 'error');
    }
}

// ==========================================
// Testimonials Slider
// ==========================================
function nextTestimonial() {
    const cards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.testimonial-dots .dot');
    
    cards[currentTestimonial].classList.remove('active');
    dots[currentTestimonial].classList.remove('active');
    
    currentTestimonial = (currentTestimonial + 1) % cards.length;
    
    cards[currentTestimonial].classList.add('active');
    dots[currentTestimonial].classList.add('active');
}

function prevTestimonial() {
    const cards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.testimonial-dots .dot');
    
    cards[currentTestimonial].classList.remove('active');
    dots[currentTestimonial].classList.remove('active');
    
    currentTestimonial = (currentTestimonial - 1 + cards.length) % cards.length;
    
    cards[currentTestimonial].classList.add('active');
    dots[currentTestimonial].classList.add('active');
}

function goToTestimonial(index) {
    const cards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.testimonial-dots .dot');
    
    cards[currentTestimonial].classList.remove('active');
    dots[currentTestimonial].classList.remove('active');
    
    currentTestimonial = index;
    
    cards[currentTestimonial].classList.add('active');
    dots[currentTestimonial].classList.add('active');
}

// Auto-advance testimonials
setInterval(() => {
    if (document.visibilityState === 'visible') {
        nextTestimonial();
    }
}, 5000);

// ==========================================
// Pricing Toggle
// ==========================================
function togglePricing() {
    const toggle = document.getElementById('pricingToggle');
    const amounts = document.querySelectorAll('.pricing-price .amount');
    const monthlyLabel = document.getElementById('monthlyLabel');
    const yearlyLabel = document.getElementById('yearlyLabel');
    
    amounts.forEach(amount => {
        if (toggle.checked) {
            amount.textContent = amount.dataset.yearly;
            monthlyLabel.classList.remove('active');
            yearlyLabel.classList.add('active');
        } else {
            amount.textContent = amount.dataset.monthly;
            monthlyLabel.classList.add('active');
            yearlyLabel.classList.remove('active');
        }
    });
}

// ==========================================
// FAQ Accordion
// ==========================================
function toggleFaq(button) {
    const item = button.parentElement;
    const isActive = item.classList.contains('active');
    
    // Close all
    document.querySelectorAll('.faq-item').forEach(faq => {
        faq.classList.remove('active');
    });
    
    // Open clicked if wasn't active
    if (!isActive) {
        item.classList.add('active');
    }
}

// ==========================================
// Newsletter
// ==========================================
function subscribeNewsletter(e) {
    e.preventDefault();
    
    const email = e.target.querySelector('input').value;
    
    showLoading();
    
    setTimeout(() => {
        hideLoading();
        showNotification('Iscrizione completata! Grazie per esserti iscritto 💌', 'success');
        e.target.reset();
    }, 1000);
}

// ==========================================
// Cookie Banner
// ==========================================
function showCookieBanner() {
    const accepted = localStorage.getItem('cookiesAccepted');
    if (!accepted) {
        setTimeout(() => {
            document.getElementById('cookieBanner').classList.add('show');
        }, 2000);
    }
}

function acceptCookies() {
    localStorage.setItem('cookiesAccepted', 'true');
    document.getElementById('cookieBanner').classList.remove('show');
    showNotification('Preferenze salvate! 🍪', 'success');
}

// ==========================================
// Notifications
// ==========================================
function showNotification(message, type = 'success') {
    const toast = document.getElementById('notificationToast');
    const messageEl = document.getElementById('notificationMessage');
    const icon = toast.querySelector('i');
    
    messageEl.textContent = message;
    toast.className = 'notification-toast ' + type;
    
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// ==========================================
// Loading
// ==========================================
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

// ==========================================
// Success Modal
// ==========================================
function showSuccessModal(title, message) {
    document.getElementById('successTitle').textContent = title;
    document.getElementById('successMessage').textContent = message;
    openModal('successModal');
}

// ==========================================
// Scroll Animations
// ==========================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ==========================================
// Counter Animation
// ==========================================
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(counter) {
    const target = parseInt(counter.dataset.target);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const update = () => {
        current += step;
        if (current < target) {
            counter.textContent = formatNumber(Math.floor(current));
            requestAnimationFrame(update);
        } else {
            counter.textContent = formatNumber(target);
        }
    };
    
    update();
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(0) + 'M+';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(0) + 'K+';
    }
    return num + '+';
}

// ==========================================
// Smooth Scroll
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ==========================================
// Keyboard Shortcuts for Demo
// ==========================================
document.addEventListener('keydown', (e) => {
    // Only when demo section is visible
    const demoSection = document.getElementById('demo');
    if (!demoSection) return;
    
    const rect = demoSection.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (!isVisible) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            demoSwipe('left');
            break;
        case 'ArrowRight':
            demoSwipe('right');
            break;
        case 'ArrowUp':
            demoSwipe('super');
            break;
        case 'z':
        case 'Z':
            undoSwipe();
            break;
    }
});

// ==========================================
// Preload Images
// ==========================================
function preloadImages() {
    profiles.forEach(profile => {
        const img = new Image();
        img.src = profile.image;
    });
}

preloadImages();

// ==========================================
// Service Worker Registration (PWA Ready)
// ==========================================
if ('serviceWorker' in navigator) {
    // Service worker can be added for PWA functionality
    // navigator.serviceWorker.register('/sw.js');
}

console.log('🔥 FlameMatch loaded successfully!');
