// Firebase Messaging Service Worker
// FlameMatch Push Notifications

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Firebase configuration
firebase.initializeApp({
    apiKey: "AIzaSyAlfAWchgu9DrRwm84_Xyvq-EvRPDNtsfA",
    authDomain: "flamematch-abfe1.firebaseapp.com",
    projectId: "flamematch-abfe1",
    storageBucket: "flamematch-abfe1.firebasestorage.app",
    messagingSenderId: "735091137774",
    appId: "1:735091137774:web:ae0f85d59c9f2d3c8d1e2f"
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Background message received:', payload);
    
    const notificationTitle = payload.notification?.title || 'FlameMatch';
    const notificationOptions = {
        body: payload.notification?.body || 'Hai una nuova notifica!',
        icon: '/logo.png',
        badge: '/logo.png',
        vibrate: [200, 100, 200],
        tag: payload.data?.type || 'flamematch-notification',
        data: payload.data,
        actions: getActionsForType(payload.data?.type),
        requireInteraction: payload.data?.type === 'match'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Get notification actions based on type
function getActionsForType(type) {
    switch(type) {
        case 'match':
            return [
                { action: 'chat', title: '💬 Chatta', icon: '/logo.png' },
                { action: 'view', title: '👀 Vedi Profilo', icon: '/logo.png' }
            ];
        case 'message':
            return [
                { action: 'reply', title: '↩️ Rispondi', icon: '/logo.png' }
            ];
        case 'like':
            return [
                { action: 'view', title: '👀 Scopri Chi', icon: '/logo.png' }
            ];
        default:
            return [];
    }
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event);
    event.notification.close();

    const data = event.notification.data || {};
    let urlToOpen = '/app.html';

    if (event.action === 'chat' || event.action === 'reply') {
        urlToOpen = `/app.html?view=chat&matchId=${data.matchId}`;
    } else if (event.action === 'view') {
        if (data.type === 'match' || data.type === 'like') {
            urlToOpen = `/app.html?view=likes`;
        }
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // If app is already open, focus it
                for (const client of clientList) {
                    if (client.url.includes('/app.html') && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Otherwise open new window
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Install event
self.addEventListener('install', (event) => {
    console.log('[SW] Service Worker installed');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('[SW] Service Worker activated');
    event.waitUntil(clients.claim());
});
