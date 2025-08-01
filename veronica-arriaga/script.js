// Graduation Invitation JavaScript

// DOM Elements
const musicControl = document.getElementById('musicControl');
const musicIcon = document.getElementById('musicIcon');
const backgroundMusic = document.getElementById('backgroundMusic');
const rsvpForm = document.getElementById('rsvpForm');
const guestCountSelect = document.getElementById('guestCount');
const additionalNamesGroup = document.getElementById('additionalNamesGroup');
const imageUpload = document.getElementById('imageUpload');

// State variables
let isMusicPlaying = false;
let currentUploadTarget = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeParticles();
    initializeCountdown();
    initializeMusicControl();
    initializeRSVPForm();
    initializeSmoothScrolling();
    initializeGallery();
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

// Countdown Timer
function initializeCountdown() {
    const eventDate = new Date('August 30, 2025 18:30:00').getTime();

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

// Gallery System
function initializeGallery() {
    imageUpload.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file && currentUploadTarget) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const placeholder = document.getElementById(currentUploadTarget);
                placeholder.innerHTML = `<img src="${e.target.result}" alt="Foto de graduación" class="gallery-image">`;
            };
            reader.readAsDataURL(file);
        }
    });
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
                <strong>Hora:</strong> 6:30 PM
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

// Open image upload
function openImageUpload(targetId) {
    currentUploadTarget = targetId;
    imageUpload.click();
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
        silhouette.style.right = '5%';
        silhouette.style.top = '20%';
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

// Make openImageUpload globally accessible
window.openImageUpload = openImageUpload;