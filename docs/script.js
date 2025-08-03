// Graduation Invitation JavaScript

// DOM Elements
const musicControl = document.getElementById('musicControl');
const musicIcon = document.getElementById('musicIcon');
const backgroundMusic = document.getElementById('backgroundMusic');
const rsvpForm = document.getElementById('rsvpForm');
const guestCountSelect = document.getElementById('guestCount');
const additionalNamesGroup = document.getElementById('additionalNamesGroup');

// State variables
let isMusicPlaying = false;
let currentUploadTarget = null;

// Variables del carrusel
let currentSlide = 0;
let carouselInterval;
let photos = []; // <-- Este arreglo contendrá las fotos activas (Cloudinary o default)

const CLOUDINARY_CLOUD_NAME = 'dhujr5kiz';
const CLOUDINARY_UPLOAD_PRESET = 'graduation-photos';
const CLOUDINARY_FOLDER = 'graduation-veronica';
// URL base para mostrar fotos
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/`;

// Fotos predeterminadas (puedes agregar URLs de tus fotos)
const defaultPhotos = [
    {
        url: './img/graduacion.png',
        title: 'Foto con Toga',
        description: 'El momento más esperado'
    },
    {
        url: './img/graduacion-2.png',
        title: 'Amigos Inseparables',
        description: 'Atardecer Inolvidable'
    },
    {
        url: './img/graduacion-3.png',
        title: 'Emma Watson',
        description: 'Una graduación mágica'
    },
];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeParticles();
    initializeCarousel();
    initializeCountdown();
    initializeMusicControl();
    initializeRSVPForm();
    initializeSmoothScrolling();
    initializeLeafletMap();
    addMagicalElements();
});

// Particles System
function initializeParticles() {
    const particlesContainer = document.getElementById('particles');

    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (6 + Math.random() * 4) + 's';

        particlesContainer.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 10000);
    }

    // Create particles continuously
    setInterval(createParticle, 800);
}

// Inicializar carrusel
function initializeCarousel() {
    loadCloudinaryPhotos(); // Cambiar esta línea
    generateQRCode();

    // Event listeners
    document.getElementById('prevBtn').addEventListener('click', () => changeSlide(-1));
    document.getElementById('nextBtn').addEventListener('click', () => changeSlide(1));
    document.getElementById('uploadBtn').addEventListener('click', openCloudinaryWidget);

    // Auto-play
    startAutoPlay();
}

// Cargar fotos desde Cloudinary - MÉTODO ALTERNATIVO
async function loadCloudinaryPhotos() {
    // Aquí podrías agregar IDs específicos de fotos que hayas subido
    const uploadedPhotoIds = [
        'graduation-veronica/b4lpjjeov8nse3hen1ea',
        'graduation-veronica/b4lpjjeov8nse3hen1ea',
    ];

    if (uploadedPhotoIds.length > 0) {
        photos = uploadedPhotoIds.map((id, index) => ({
            url: `${CLOUDINARY_BASE_URL}c_fit,q_auto,f_auto/${id}`,
            title: `Recuerdo ${index + 1}`,
            description: 'Momentos especiales de graduación'
        }));
        renderCarousel(photos);
    } else {
        photos = defaultPhotos; // Si no hay fotos subidas, usar las predeterminadas
        renderCarousel(defaultPhotos);
    }
}

function showUploadSuccess() {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message show';
    successMessage.innerHTML = `
        <i class="fas fa-check-circle"></i>
        ¡Foto subida exitosamente! Se mostrará en unos segundos.
    `;

    document.querySelector('.upload-section').appendChild(successMessage);

    setTimeout(() => {
        successMessage.remove();
    }, 4000);
}
// Función para renderizar el carrusel
function renderCarousel(photoArray) {
    photos = photoArray; // Actualizar el arreglo de fotos

    const track = document.getElementById('carouselTrack');
    const indicators = document.getElementById('carouselIndicators');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    // Mostrar estado de carga
    track.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #ffd700;"><i class="fas fa-spinner fa-spin"></i> Cargando fotos...</div>';
    indicators.innerHTML = '';

    // Simular un pequeño delay para mejor UX
    setTimeout(() => {
        track.innerHTML = '';

        photoArray.forEach((photo, index) => {
            // Crear slide con mejor manejo de errores
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.innerHTML = `
                <img src="${photo.url}" 
                     alt="${photo.title}" 
                     loading="lazy" 
                     onerror="this.onerror=null; this.src='https://placehold.co/800x400/191d34/ffd700?text=IMAGEN+NO+DISPONIBLE'">
                <div class="carousel-slide-info">
                    <h3>${photo.title}</h3>
                    <p>${photo.description}</p>
                </div>
            `;
            track.appendChild(slide);

            // Crear indicadores solo si hay más de una foto
            if (photoArray.length > 1) {
                const indicator = document.createElement('div');
                indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
                indicator.addEventListener('click', () => goToSlide(index));
                indicators.appendChild(indicator);
            }
        });

        // Mostrar u ocultar controles según la cantidad de fotos
        const hideControls = photoArray.length <= 1;
        prevBtn.style.display = hideControls ? 'none' : 'block';
        nextBtn.style.display = hideControls ? 'none' : 'block';
        indicators.style.display = hideControls ? 'none' : 'flex';
    }, 500);
}

// Abrir widget de Cloudinary
function openCloudinaryWidget() {
    cloudinary.openUploadWidget({
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        folder: CLOUDINARY_FOLDER,
        sources: ['local', 'camera'],
        multiple: true,
        maxFiles: 10,
        maxFileSize: 10000000,
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        cropping: true, // Permitir recorte
        croppingAspectRatio: 2, // Ratio 2:1 para el carousel
        theme: 'purple',
        styles: {
            palette: {
                window: '#1a1a2e',
                windowBorder: '#ffd700',
                tabIcon: '#ffd700',
                menuIcons: '#ffd700',
                textDark: '#000000',
                textLight: '#ffffff',
                link: '#ffd700',
                action: '#ffd700',
                inactiveTabIcon: '#555555',
                error: '#ff6b6b',
                inProgress: '#ffd700',
                complete: '#4caf50',
                sourceBg: '#16213e'
            }
        }
    }, (error, result) => {
        if (!error && result && result.event === "success") {
            console.log('Foto subida exitosamente:', result.info);

            // Recargar fotos después de un delay
            setTimeout(() => {
                loadCloudinaryPhotos();
                showUploadSuccess();
            }, 3000);
        }
    });
}

// Cambiar slide
function changeSlide(direction) {
    const totalSlides = photos.length;
    currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
    updateCarousel();
}

// Ir a slide específico
function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateCarousel();
}

// Actualizar carrusel
function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    const indicators = document.querySelectorAll('.carousel-indicator');

    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSlide);
    });

    // Reiniciar auto-play
    stopAutoPlay();
    startAutoPlay();
}

// Auto-play
function startAutoPlay() {
    carouselInterval = setInterval(() => {
        changeSlide(1);
    }, 4000); // Cambiar cada 4 segundos
}

function stopAutoPlay() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
    }
}

// Generar código QR
function generateQRCode() {
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';

    // URL que llevará al upload widget
    const uploadUrl = window.location.href + '?upload';

    try {
        const qr = qrcode(0, 'M');
        qr.addData(uploadUrl);
        qr.make();

        // Tamaño responsive del QR
        const isMobile = window.innerWidth <= 768;
        const qrSize = isMobile ? 3 : 4;

        qrContainer.innerHTML = qr.createImgTag(qrSize);

        const qrImg = qrContainer.querySelector('img');
        if (qrImg) {
            qrImg.style.width = '100%';
            qrImg.style.height = '100%';
            qrImg.style.borderRadius = '8px';
            qrImg.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            qrImg.style.margin = '0';
            qrImg.style.padding = '0';
        }
    } catch (error) {
        console.error('Error generando QR:', error);
        qrContainer.innerHTML = '<div style="padding: 10px; text-align: center; font-size: 24px;">📱</div>';
    }
}

// Countdown Timer
function initializeCountdown() {
    const eventDate = new Date('August 30, 2025 18:00:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = eventDate - now;

        if (distance < 0) {
            document.getElementById('countdown').innerHTML =
                '<div class="countdown-item"><span class="countdown-number">¡YA!</span><span class="countdown-label">Es Hoy</span></div>';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = days;
        document.getElementById('hours').textContent = hours;
        document.getElementById('minutes').textContent = minutes;
        document.getElementById('seconds').textContent = seconds;

        // Add pulsing effect when getting close
        if (days < 7) {
            document.querySelectorAll('.countdown-number').forEach(el => {
                el.style.animation = 'glow 1s ease-in-out infinite alternate';
            });
        }
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Music Control
function initializeMusicControl() {
    // Create audio context for better control
    backgroundMusic.volume = 0.3;

    musicControl.addEventListener('click', function () {
        if (isMusicPlaying) {
            backgroundMusic.pause();
            musicIcon.className = 'fas fa-volume-xmark';
            isMusicPlaying = false;
        } else {
            // User interaction required for autoplay
            backgroundMusic.play().then(() => {
                musicIcon.className = 'fas fa-music';
                isMusicPlaying = true;
            }).catch(e => {
                console.log('Audio play failed:', e);
                // Fallback: show play icon
                musicIcon.className = 'fas fa-exclamation-circle';
            });
        }
    });

    // Handle audio ended
    backgroundMusic.addEventListener('ended', function () {
        musicIcon.className = 'fas fa-volume-xmark';
        isMusicPlaying = false;
    });
}

// RSVP Form
function initializeRSVPForm() {
    // Show additional names field when more than 1 person
    guestCountSelect.addEventListener('change', function () {
        if (parseInt(this.value) > 1) {
            additionalNamesGroup.style.display = 'block';
            additionalNamesGroup.style.animation = 'fadeInUp 0.3s ease';
        } else {
            additionalNamesGroup.style.display = 'none';
        }
    });

    // Handle form submission
    rsvpForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('guestName').value,
            phone: document.getElementById('guestPhone').value,
            guestCount: document.getElementById('guestCount').value,
            additionalNames: document.getElementById('additionalNames').value,
            comments: document.getElementById('comments').value
        };

        sendWhatsAppMessage(formData);
    });
}

// WhatsApp Integration
function sendWhatsAppMessage(data) {
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;

    // Show loading state
    submitBtn.innerHTML = '<div class="loading"></div> Enviando...';
    submitBtn.disabled = true;

    // Format message
    let message = `🎓 *CONFIRMACIÓN DE ASISTENCIA - GRADUACIÓN* 🎓\n\n`;
    message += `👤 *Nombre:* ${data.name}\n`;
    message += `📱 *Teléfono:* ${data.phone}\n`;
    message += `👥 *Número de personas:* ${data.guestCount}\n`;

    if (data.additionalNames) {
        message += `📝 *Acompañantes:* ${data.additionalNames}\n`;
    }

    if (data.comments) {
        message += `💬 *Comentarios:* ${data.comments}\n`;
    }

    message += `\n✨ ¡Nos vemos en la celebración! ✨`;

    // Encode message for WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/524111032675?text=${encodedMessage}`;

    // Simulate processing time
    setTimeout(() => {
        // Open WhatsApp
        window.open(whatsappURL, '_blank');

        // Show success message
        showSuccessMessage();

        // Reset form
        rsvpForm.reset();
        additionalNamesGroup.style.display = 'none';

        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 1500);
}

// Success Message
function showSuccessMessage() {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message show';
    successMessage.innerHTML = `
        <i class="fas fa-check-circle"></i>
        ¡Confirmación enviada! Te hemos redirigido a WhatsApp para completar el proceso.
    `;

    document.querySelector('.rsvp-form').appendChild(successMessage);

    setTimeout(() => {
        successMessage.remove();
    }, 5000);
}

// Smooth Scrolling between sections
function initializeSmoothScrolling() {
    let isScrolling = false;
    const container = document.querySelector('.container');

    container.addEventListener('scroll', function () {
        if (isScrolling) return;

        const currentSection = getCurrentVisibleSection();
        const sections = document.querySelectorAll('.section');
        const section = sections[currentSection];

        // Verificar si la sección actual está completamente visible
        if (section && isSectionFullyVisible(section)) {
            // La sección está completamente visible, permitir scroll normal
            return;
        }
    });

    // Manejar wheel events para el scroll tipo Apple
    document.addEventListener('wheel', function (e) {
        if (isScrolling) return;

        const sections = document.querySelectorAll('.section');
        const currentSection = getCurrentVisibleSection();
        const section = sections[currentSection];

        // Si la sección actual no está completamente visible, permitir scroll normal
        if (section && !isSectionFullyVisible(section)) {
            return;
        }

        // Solo hacer scroll tipo Apple si la sección está completamente visible
        e.preventDefault();

        if (e.deltaY > 0 && currentSection < sections.length - 1) {
            // Scroll down
            isScrolling = true;
            sections[currentSection + 1].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            setTimeout(() => isScrolling = false, 1200);
        } else if (e.deltaY < 0 && currentSection > 0) {
            // Scroll up
            isScrolling = true;
            sections[currentSection - 1].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            setTimeout(() => isScrolling = false, 1200);
        }
    }, { passive: false });
}

// Función auxiliar para verificar si una sección está completamente visible
function isSectionFullyVisible(section) {
    const container = document.querySelector('.container');
    const containerRect = container.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();

    return (
        sectionRect.top >= containerRect.top &&
        sectionRect.bottom <= containerRect.bottom
    );
}

// Función auxiliar para obtener la sección más visible
function getCurrentVisibleSection() {
    const sections = document.querySelectorAll('.section');
    const container = document.querySelector('.container');
    const containerRect = container.getBoundingClientRect();

    let maxVisibleArea = 0;
    let currentSection = 0;

    sections.forEach((section, index) => {
        const sectionRect = section.getBoundingClientRect();
        const visibleTop = Math.max(sectionRect.top, containerRect.top);
        const visibleBottom = Math.min(sectionRect.bottom, containerRect.bottom);
        const visibleArea = Math.max(0, visibleBottom - visibleTop);

        if (visibleArea > maxVisibleArea) {
            maxVisibleArea = visibleArea;
            currentSection = index;
        }
    });

    return currentSection;
}

// Get current visible section
function getCurrentSection() {
    return getCurrentVisibleSection();
}


// Initialize Leaflet Map
function initializeLeafletMap() {
    // Coordenadas de Finca El Sol
    const lat = 20.478539;
    const lng = -100.975340;

    // Crear el mapa
    const map = L.map('leafletMap', {
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true
    }).setView([lat + 0.002, lng], 15);

    // Usar OpenStreetMap como base (se aplicará el filtro oscuro con CSS)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Crear marcador personalizado
    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: '<i class="fas fa-star"></i>',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    });

    // Agregar marcador
    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

    // Popup personalizado
    marker.bindPopup(`
        <div style="text-align: center; padding: 10px;">
            <h3 style="color: #ffd700; margin-bottom: 10px;">
                <i class="fas fa-map-marker-alt"></i> Finca El Sol
            </h3>
            <p style="margin-bottom: 8px;">
                <strong>Dirección:</strong><br>
                Eucalipto, El Fresno<br>
                Cortazar, Guanajuato
            </p>
            <p style="margin-bottom: 0;">
                <strong>Fecha:</strong> 30 de Agosto, 2025<br>
                <strong>Hora:</strong> 6:00 PM
            </p>
        </div>
    `);

    // Abrir popup automáticamente
    marker.openPopup();

    // Agregar efecto de zoom suave al cargar
    setTimeout(() => {
        map.setView([lat + 0.002, lng], 16, {
            animate: true,
            duration: 1.5
        });
    }, 1000);
}


// Add magical Disney-inspired elements
function addMagicalElements() {
    // Add sparkles on hover for interactive elements
    const interactiveElements = document.querySelectorAll('.detail-card, .gallery-item, .timeline-item');

    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function () {
            createSparkle(this);
        });
    });

    // Add princess silhouettes as background elements
    addPrincessSilhouettes();

    // Animate elements on scroll
    observeElements();
}

// Create sparkle effect
function createSparkle(element) {
    const sparkle = document.createElement('div');
    sparkle.className = 'magic-sparkle';
    sparkle.innerHTML = '✨';
    sparkle.style.position = 'absolute';
    sparkle.style.left = Math.random() * 100 + '%';
    sparkle.style.top = Math.random() * 100 + '%';

    element.style.position = 'relative';
    element.appendChild(sparkle);

    setTimeout(() => {
        if (sparkle.parentNode) {
            sparkle.parentNode.removeChild(sparkle);
        }
    }, 2000);
}

// Add princess silhouettes
function addPrincessSilhouettes() {
    const sections = document.querySelectorAll('.section');
    const totalIcons = 10; // icon-1.png hasta icon-10.png

    sections.forEach((section, index) => {
        const silhouette = document.createElement('img');
        silhouette.className = 'princess-silhouette';
        const iconIndex = (index % totalIcons) + 1; // icon-1.png a icon-10.png
        silhouette.src = `img/icon-${iconIndex}.png`;
        silhouette.alt = `Princess icon ${iconIndex}`;
        silhouette.style.position = 'absolute';

        section.appendChild(silhouette);

    });
}


// Intersection Observer for animations
function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    // Observe timeline items, gallery items, and detail cards
    document.querySelectorAll('.timeline-item, .gallery-item, .detail-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// Utility Functions

// Format phone number for WhatsApp
function formatPhoneNumber(phone) {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Add country code if not present
    if (!cleaned.startsWith('52')) {
        return '52' + cleaned;
    }
    return cleaned;
}

// Validate form data
function validateForm(data) {
    const errors = [];

    if (!data.name.trim()) {
        errors.push('El nombre es requerido');
    }

    if (!data.phone.trim()) {
        errors.push('El teléfono es requerido');
    } else if (data.phone.replace(/\D/g, '').length < 10) {
        errors.push('El teléfono debe tener al menos 10 dígitos');
    }

    if (!data.guestCount) {
        errors.push('Debe seleccionar el número de personas');
    }

    return errors;
}

// Show error messages
function showErrors(errors) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        ${errors.join('<br>')}
    `;

    const form = document.querySelector('.rsvp-form');
    form.insertBefore(errorDiv, form.firstChild);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Add CSS for error messages
const style = document.createElement('style');
style.textContent = `
    .error-message {
        background: linear-gradient(45deg, #f44336, #e57373);
        color: white;
        padding: 1rem;
        border-radius: 10px;
        margin-bottom: 1rem;
        text-align: center;
        animation: slideIn 0.3s ease;
    }
`;
document.head.appendChild(style);

// Touch gestures for mobile
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function (e) {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', function (e) {
    touchEndY = e.changedTouches[0].screenY;
    handleGesture();
});

function handleGesture() {
    const threshold = 50; // Minimum distance for swipe
    const diff = touchStartY - touchEndY;

    if (Math.abs(diff) > threshold) {
        const sections = document.querySelectorAll('.section');
        const currentSection = getCurrentSection();

        if (diff > 0 && currentSection < sections.length - 1) {
            // Swipe up - go to next section
            sections[currentSection + 1].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        } else if (diff < 0 && currentSection > 0) {
            // Swipe down - go to previous section
            sections[currentSection - 1].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// Keyboard navigation
document.addEventListener('keydown', function (e) {
    const sections = document.querySelectorAll('.section');
    const currentSection = getCurrentSection();

    switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
            e.preventDefault();
            if (currentSection < sections.length - 1) {
                sections[currentSection + 1].scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            break;

        case 'ArrowUp':
        case 'PageUp':
            e.preventDefault();
            if (currentSection > 0) {
                sections[currentSection - 1].scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            break;

        case 'Home':
            e.preventDefault();
            sections[0].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            break;

        case 'End':
            e.preventDefault();
            sections[sections.length - 1].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            break;
    }
});

// Detectar si llegan con ?upload en la URL
window.addEventListener('load', function () {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('upload')) {
        // Scroll a la sección de upload
        const uploadSection = document.getElementById('upload');
        if (uploadSection) {
            uploadSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Abrir automáticamente el widget después de un segundo
            setTimeout(() => {
                openCloudinaryWidget();
            }, 1000);
        }
    }
});