/* ==========================================
   FlameMatch - Cloudinary Configuration
   Upload immagini gratuito
   ========================================== */

const CLOUDINARY_CONFIG = {
    cloudName: 'dnxqpp2en',
    uploadPreset: 'flamematch',
    apiKey: '222111274299872'
};

// ==========================================
// MODULO UPLOAD IMMAGINI
// ==========================================

const FlameUpload = {
    
    // URL base per le immagini
    getImageUrl(publicId, options = {}) {
        const { width = 400, height = 400, crop = 'fill', quality = 'auto' } = options;
        return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/c_${crop},w_${width},h_${height},q_${quality}/${publicId}`;
    },
    
    // Upload immagine tramite widget
    openUploadWidget(callback, options = {}) {
        const defaultOptions = {
            cloudName: CLOUDINARY_CONFIG.cloudName,
            uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
            sources: ['local', 'camera'],
            multiple: false,
            maxFiles: 1,
            cropping: true,
            croppingAspectRatio: 1,
            croppingShowDimensions: true,
            resourceType: 'image',
            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            maxFileSize: 5000000, // 5MB
            styles: {
                palette: {
                    window: '#1a1a2e',
                    windowBorder: '#ff4757',
                    tabIcon: '#ff4757',
                    menuIcons: '#ff6b7a',
                    textDark: '#ffffff',
                    textLight: '#ffffff',
                    link: '#ff4757',
                    action: '#ff4757',
                    inactiveTabIcon: '#666666',
                    error: '#ff4757',
                    inProgress: '#ff4757',
                    complete: '#20bf55',
                    sourceBg: '#16162a'
                },
                fonts: {
                    default: null,
                    "'Poppins', sans-serif": {
                        url: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap",
                        active: true
                    }
                }
            },
            text: {
                it: {
                    or: "oppure",
                    back: "Indietro",
                    close: "Chiudi",
                    menu: {
                        files: "I miei file",
                        camera: "Fotocamera"
                    },
                    local: {
                        browse: "Sfoglia",
                        dd_title_single: "Trascina la tua foto qui",
                        dd_title_multi: "Trascina le tue foto qui",
                        drop_title_single: "Rilascia per caricare",
                        drop_title_multiple: "Rilascia per caricare"
                    },
                    crop: {
                        title: "Ritaglia",
                        crop_btn: "Ritaglia",
                        skip_btn: "Salta",
                        reset_btn: "Reset"
                    },
                    queue: {
                        title: "Foto caricate",
                        title_uploading: "Caricamento...",
                        done: "Fatto"
                    }
                }
            },
            language: 'it',
            ...options
        };
        
        if (typeof cloudinary !== 'undefined' && cloudinary.createUploadWidget) {
            const widget = cloudinary.createUploadWidget(defaultOptions, (error, result) => {
                if (!error && result && result.event === 'success') {
                    console.log('📸 Upload completato:', result.info);
                    callback(null, {
                        publicId: result.info.public_id,
                        url: result.info.secure_url,
                        thumbnailUrl: this.getImageUrl(result.info.public_id, { width: 150, height: 150 }),
                        width: result.info.width,
                        height: result.info.height
                    });
                } else if (error) {
                    console.error('❌ Errore upload:', error);
                    callback(error, null);
                }
            });
            widget.open();
        } else {
            // Fallback: upload manuale senza widget
            this.openManualUpload(callback);
        }
    },
    
    // Upload manuale (fallback)
    openManualUpload(callback) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const result = await this.uploadFile(file);
                    callback(null, result);
                } catch (error) {
                    callback(error, null);
                }
            }
        };
        input.click();
    },
    
    // Upload file diretto
    async uploadFile(file, onProgress) {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
            formData.append('cloud_name', CLOUDINARY_CONFIG.cloudName);
            
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`);
            
            // Progress
            if (onProgress) {
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percent = Math.round((e.loaded / e.total) * 100);
                        onProgress(percent);
                    }
                };
            }
            
            xhr.onload = () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    resolve({
                        publicId: response.public_id,
                        url: response.secure_url,
                        thumbnailUrl: this.getImageUrl(response.public_id, { width: 150, height: 150 }),
                        width: response.width,
                        height: response.height
                    });
                } else {
                    reject(new Error('Upload fallito'));
                }
            };
            
            xhr.onerror = () => reject(new Error('Errore di rete'));
            xhr.send(formData);
        });
    },
    
    // Elimina immagine (richiede backend per sicurezza)
    // Per ora le immagini rimangono su Cloudinary
    async deleteImage(publicId) {
        console.log('⚠️ Eliminazione immagini richiede backend server');
        return true;
    }
};

// ==========================================
// INTEGRAZIONE CON FIREBASE
// ==========================================

// Aggiorna foto profilo utente
async function updateUserProfilePhoto(photoUrl, publicId) {
    if (!FlameAuth.currentUser) {
        throw new Error('Utente non autenticato');
    }
    
    try {
        await db.collection('users').doc(FlameAuth.currentUser.uid).update({
            photoURL: photoUrl,
            photoPublicId: publicId,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Aggiorna anche in auth
        await FlameAuth.currentUser.updateProfile({ photoURL: photoUrl });
        
        console.log('✅ Foto profilo aggiornata');
        return true;
    } catch (error) {
        console.error('❌ Errore aggiornamento foto:', error);
        throw error;
    }
}

// Aggiungi foto alla galleria utente
async function addUserGalleryPhoto(photoUrl, publicId) {
    if (!FlameAuth.currentUser) {
        throw new Error('Utente non autenticato');
    }
    
    try {
        const userRef = db.collection('users').doc(FlameAuth.currentUser.uid);
        await userRef.update({
            gallery: firebase.firestore.FieldValue.arrayUnion({
                url: photoUrl,
                publicId: publicId,
                addedAt: new Date().toISOString()
            }),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Foto aggiunta alla galleria');
        return true;
    } catch (error) {
        console.error('❌ Errore aggiunta foto galleria:', error);
        throw error;
    }
}

console.log('🔥 FlameMatch Cloudinary configurato - Cloud:', CLOUDINARY_CONFIG.cloudName);
