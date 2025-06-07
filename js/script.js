// ===== DOCUMENT READY =====
$(document).ready(function() {
    initializeApp();
});

// ===== MAIN INITIALIZATION =====
function initializeApp() {
    initializeEnvelopeInteraction();
    initializeModals();
    initializeActionButtons();
    initializeAnimations();
    initializeAccessibility();
}

// ===== ENVELOPE INTERACTION =====
function initializeEnvelopeInteraction() {
    const $button = $('#openEnvelopeButton');
    const $valentines = $('.valentines');
    const $clickIndicator = $('.click-indicator');
    const $closeCardButton = $('#closeCardButton');

    // Prevent default scroll behavior when envelope is open
    $valentines.on('touchmove', function(event) {
        if ($valentines.hasClass('open')) {
            event.preventDefault();
        }
    }, { passive: false });

    // Prevent mouse wheel scroll when envelope is open
    $valentines.on('wheel', function(event) {
        if ($valentines.hasClass('open')) {
            event.preventDefault();
        }
    }, { passive: false });

    // Prevent all scroll behaviors when envelope is open
    $valentines.on('scroll', function(event) {
        if ($valentines.hasClass('open')) {
            event.preventDefault();
            this.scrollTop = 0;
        }
    });

    // Prevent default scroll on the document when envelope is open
    $(document).on('scroll touchmove wheel', function(event) {
        if ($valentines.hasClass('open')) {
            event.preventDefault();
            window.scrollTo(0, 0);
        }
    });

    // Mobile-specific touch handling
    let touchStartY = 0;
    let touchEndY = 0;

    $valentines.on('touchstart', function(event) {
        if ($valentines.hasClass('open')) {
            touchStartY = event.touches[0].clientY;
        }
    }, { passive: true });

    $valentines.on('touchmove', function(event) {
        if ($valentines.hasClass('open')) {
            touchEndY = event.touches[0].clientY;
            const touchDiff = touchEndY - touchStartY;
            
            // Prevent any touch movement that could cause scroll
            if (Math.abs(touchDiff) > 0) {
                event.preventDefault();
            }
        }
    }, { passive: false });

    $valentines.on('touchend', function(event) {
        if ($valentines.hasClass('open')) {
            touchStartY = 0;
            touchEndY = 0;
        }
    }, { passive: true });

    // Open envelope on click
    $valentines.on('click', function(event) {
        // Prevent button click from triggering envelope click
        if ($(event.target).is('#openEnvelopeButton') || $(event.target).closest('#openEnvelopeButton').length) {
            return;
        }

        if (!$valentines.hasClass('open')) {
            openEnvelope();
        }
    });

    // Close envelope on button click
    $button.on('click', function(event) {
        event.stopPropagation();
        if ($valentines.hasClass('open')) {
            closeEnvelope();
        }
    });

    // Keyboard accessibility
    $valentines.on('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (!$valentines.hasClass('open')) {
                openEnvelope();
            }
        }
    });

    // Close envelope on new close button click
    $closeCardButton.on('click', function(event) {
        event.stopPropagation(); // Prevent click from propagating to envelope
        if ($valentines.hasClass('open')) {
            closeEnvelope();
        }
    });

    // Keyboard accessibility for close button
    $closeCardButton.on('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if ($valentines.hasClass('open')) {
                closeEnvelope();
            }
        }
    });

    // Functions for opening and closing
    function openEnvelope() {
        const $button = $('#openEnvelopeButton'); // Old button - keep for reference if needed elsewhere, but its direct click handler is removed
        const $valentines = $('.valentines');
        const $clickIndicator = $('.click-indicator');
        const $closeCardButton = $('#closeCardButton');

        $valentines.addClass('open');
        
        // Hide old button, show new one (CSS handles hiding old wrapper)
        $closeCardButton.show(); // Make sure it's visible when card is open

        $clickIndicator.fadeOut(300);
        
        // Add focus to card for accessibility
        setTimeout(() => {
            $('.card').attr('tabindex', '0').focus();
        }, 700);

        // Track interaction
        trackEvent('envelope_opened');
    }

    function closeEnvelope() {
        const $button = $('#openEnvelopeButton'); // Old button
        const $valentines = $('.valentines');
        const $clickIndicator = $('.click-indicator');
        const $closeCardButton = $('#closeCardButton');

        $valentines.removeClass('open');
        
        // Hide new button
        $closeCardButton.hide();

        setTimeout(() => {
            $clickIndicator.fadeIn(300);
            
            // Return focus to envelope
            $valentines.focus();
        }, 400);

        // Track interaction
        trackEvent('envelope_closed');
    }
}

// ===== MODAL FUNCTIONALITY =====
function initializeModals() {
    const modals = {
        location: '#locationModal',
        gift: '#giftModal'
    };

    // Modal triggers
    $('#locationButton').on('click', () => openModal(modals.location));
    
    // Modify gift list button to open URL
    $('#giftListButton').on('click', function() {
        const giftListUrl = 'https://gui1336.github.io/happy-home-gifts-list/';
        window.open(giftListUrl, '_blank');
        trackEvent('gift_list_external_opened');
    });

    // Close modal events
    $('.modal .close').on('click', function() {
        closeModal($(this).closest('.modal'));
    });

    // Close modal on outside click
    $('.modal').on('click', function(event) {
        if (event.target === this) {
            closeModal($(this));
        }
    });

    // Close modal on escape key
    $(document).on('keydown', function(event) {
        if (event.key === 'Escape') {
            $('.modal:visible').each(function() {
                closeModal($(this));
            });
        }
    });

    function openModal(modalSelector) {
        const $modal = $(modalSelector);
        $modal.fadeIn(300);
        $modal.find('.modal-content').css('animation', 'modalSlideIn 0.4s ease-out');
        
        // Focus trap for accessibility
        $modal.find('.close').focus();
        
        // Prevent body scroll
        $('body').addClass('modal-open');
        
        // Track modal opening
        const modalType = modalSelector.includes('location') ? 'location' : 'gift_list';
        trackEvent(`modal_opened_${modalType}`);
    }

    function closeModal($modal) {
        $modal.fadeOut(300);
        
        // Re-enable body scroll
        $('body').removeClass('modal-open');
        
        // Return focus to trigger button
        const modalId = $modal.attr('id');
        if (modalId === 'locationModal') {
            $('#locationButton').focus();
        } else if (modalId === 'giftModal') {
            $('#giftListButton').focus();
        }
    }
}

// ===== ACTION BUTTONS =====
function initializeActionButtons() {
    // Confirm presence button
    $('#confirmButton').on('click', function() {
        handleConfirmPresence();
    });

    // Add loading states to buttons
    $('.action-btn').on('click', function() {
        const $btn = $(this);
        const originalText = $btn.html();
        
        $btn.addClass('loading').html('<i class="fas fa-spinner fa-spin"></i> Carregando...');
        
        setTimeout(() => {
            $btn.removeClass('loading').html(originalText);
        }, 1000);
    });
}

// ===== EXTERNAL LINKS =====
function openGoogleMaps() {
    const address = encodeURIComponent("23°12'11.3\"S 47°18'57.2\"W");
    const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    window.open(url, '_blank');
    trackEvent('google_maps_opened');
}

function openWaze() {
    const latitude = -23.203139; // Decimal latitude for 23°12'11.3"S
    const longitude = -47.315889; // Decimal longitude for 47°18'57.2"W
    const url = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
    window.open(url, '_blank');
    trackEvent('waze_opened');
}

function openGiftList() {
    // Replace with actual gift list URL
    const url = 'https://exemplo.com/lista-presentes';
    window.open(url, '_blank');
    trackEvent('gift_list_external_opened');
}

// ===== CONFIRM PRESENCE =====
function handleConfirmPresence() {
    const phoneNumber = '5511997192991'; // Replace with actual WhatsApp number
    const message = encodeURIComponent(
        'Olá! Gostaria de confirmar minha presença no Chá de Casa Nova da Geovana e Guilherme no dia 12/07/2025.'
    );
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    
    // Show confirmation dialog
    if (confirm('Você será redirecionado para o WhatsApp para confirmar sua presença. Deseja continuar?')) {
        window.open(whatsappUrl, '_blank');
        trackEvent('whatsapp_confirm_opened');
    }
}

// ===== ANIMATIONS =====
function initializeAnimations() {
    // Floating elements animation
    createFloatingElements();
    
    // Smooth scroll for card content
    $('.card').on('scroll', function() {
        const scrollTop = $(this).scrollTop();
        const maxScroll = this.scrollHeight - this.clientHeight;
        const scrollPercent = scrollTop / maxScroll;
        
        // Parallax effect for decorative elements
        $('.card-decoration').css('transform', `translateY(${scrollPercent * 20}px)`);
    });

    // Intersection Observer for animations
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe card elements
        $('.detail-item, .action-btn, .rsvp-item').each(function() {
            observer.observe(this);
        });
    }
}

function createFloatingElements() {
    // Create additional floating particles
    const particles = ['💕', '🏠', '✨', '💍', '🌸'];
    const container = $('.background-elements');
    
    particles.forEach((particle, index) => {
        const $particle = $('<div>')
            .addClass('floating-particle')
            .text(particle)
            .css({
                position: 'absolute',
                fontSize: '1.5rem',
                opacity: '0.1',
                animation: `float ${4 + index}s ease-in-out infinite`,
                animationDelay: `${index * 0.8}s`,
                top: `${Math.random() * 80}%`,
                left: `${Math.random() * 80}%`,
                pointerEvents: 'none'
            });
        
        container.append($particle);
    });
}

// ===== ACCESSIBILITY =====
function initializeAccessibility() {
    // Add ARIA attributes
    $('.valentines').attr({
        'role': 'button',
        'tabindex': '0',
        'aria-label': 'Clique para abrir o convite de chá de casa nova'
    });

    $('.card').attr({
        'role': 'dialog',
        'aria-modal': 'true',
        'aria-labelledby': 'card-title'
    });

    $('.card-title').attr('id', 'card-title');

    // Focus management
    $('.action-btn').on('focus', function() {
        $(this).addClass('focused');
    }).on('blur', function() {
        $(this).removeClass('focused');
    });

    // High contrast mode detection
    if (window.matchMedia('(prefers-contrast: high)').matches) {
        $('body').addClass('high-contrast');
    }

    // Reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        $('body').addClass('reduced-motion');
    }
}

// ===== UTILITIES =====
function trackEvent(eventName, eventData = {}) {
    // Analytics tracking (replace with your preferred analytics service)
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            event_category: 'wedding_invitation',
            event_label: 'cha_casa_nova',
            ...eventData
        });
    }
    
    // Console log for development
    console.log(`Event tracked: ${eventName}`, eventData);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== RESPONSIVE UTILITIES =====
function handleResize() {
    const windowWidth = $(window).width();
    
    // Adjust modal size on mobile
    if (windowWidth < 768) {
        $('.modal-content').css('margin', '5% auto');
    } else {
        $('.modal-content').css('margin', '10% auto');
    }
    
    // Adjust card position on small screens
    if (windowWidth < 480) {
        $('.card').css('max-height', '90vh');
    }
}

// ===== EVENT BINDINGS =====
$(window).on('resize', debounce(handleResize, 250));

// ===== LOADING COMPLETE =====
$(window).on('load', function() {
    // Hide loading screen if exists
    $('.loading-screen').fadeOut(500);
    
    // Initialize performance monitoring
    if ('performance' in window) {
        const loadTime = performance.now();
        trackEvent('page_load_time', { load_time: Math.round(loadTime) });
    }
    
    // Initialize service worker for offline functionality
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(function(error) {
            console.log('Service Worker registration failed:', error);
        });
    }
});

// ===== ERROR HANDLING =====
window.addEventListener('error', function(event) {
    console.error('JavaScript error:', event.error);
    trackEvent('javascript_error', {
        error_message: event.error.message,
        error_stack: event.error.stack
    });
});

// ===== TOUCH GESTURES (for mobile) =====
let touchStartY = 0;
let touchEndY = 0;

$('.card').on('touchstart', function(e) {
    touchStartY = e.changedTouches[0].screenY;
});

$('.card').on('touchend', function(e) {
    touchEndY = e.changedTouches[0].screenY;
    const swipeDistance = touchStartY - touchEndY;
    
    // Close card on swipe down (only if at top of scroll)
    if (swipeDistance < -100 && $(this).scrollTop() === 0) {
        if ($('.valentines').hasClass('open')) {
            $('#openEnvelopeButton').click();
        }
    }
});

// ===== COPY TO CLIPBOARD FUNCTIONALITY =====
function copyToClipboard(text, successMessage = 'Copiado!') {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(successMessage);
        }).catch(() => {
            fallbackCopyTextToClipboard(text, successMessage);
        });
    } else {
        fallbackCopyTextToClipboard(text, successMessage);
    }
}

function fallbackCopyTextToClipboard(text, successMessage) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast(successMessage);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        showToast('Erro ao copiar');
    }
    
    document.body.removeChild(textArea);
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, duration = 3000) {
    // Remove existing toasts
    $('.toast').remove();
    
    const $toast = $('<div>')
        .addClass('toast')
        .text(message)
        .css({
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '25px',
            fontSize: '14px',
            zIndex: '9999',
            opacity: '0',
            transition: 'opacity 0.3s ease'
        });
    
    $('body').append($toast);
    
    // Animate in
    setTimeout(() => $toast.css('opacity', '1'), 100);
    
    // Animate out
    setTimeout(() => {
        $toast.css('opacity', '0');
        setTimeout(() => $toast.remove(), 300);
    }, duration);
}

// ===== SHARE FUNCTIONALITY =====
function shareInvitation() {
    if (navigator.share) {
        navigator.share({
            title: 'Chá de Casa Nova - Geovana & Guilherme',
            text: 'Você está convidado para o nosso Chá de Casa Nova!',
            url: window.location.href
        }).then(() => {
            trackEvent('invitation_shared', { method: 'native' });
        }).catch((error) => {
            console.log('Error sharing:', error);
        });
    } else {
        // Fallback: copy URL to clipboard
        copyToClipboard(window.location.href, 'Link copiado! Compartilhe com seus amigos.');
        trackEvent('invitation_shared', { method: 'clipboard' });
    }
}

// ===== INITIALIZE SHARE BUTTON (if needed) =====
if ($('#shareButton').length) {
    $('#shareButton').on('click', shareInvitation);
}