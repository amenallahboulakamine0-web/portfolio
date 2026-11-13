const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

const backToTopBtn = document.querySelector('.back-to-top');
if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('active');
        } else {
            backToTopBtn.classList.remove('active');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}


function showWelcomeAchievement() {
    if (sessionStorage.getItem('achievement_shown')) {
        return;
    }

    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-icon">🚀</div>
        <div class="achievement-content">
            <div class="achievement-title">Achievement unlocked !</div>
            <div class="achievement-name"> Welcome to my portolio!</div>
            <div class="achievement-desc">first visit to my portfolio</div>
        </div>
        <div class="achievement-progress"></div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    createAchievementParticles();

    sessionStorage.setItem('achievement_shown', 'true');

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 5000);
}

function createAchievementParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'achievement-particles';
    document.body.appendChild(particlesContainer);

    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'achievement-particle';

        particlesContainer.appendChild(particle);

        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 80;
        const duration = 1000 + Math.random() * 600;

        particle.animate([
            {
                transform: 'translate(0, 0) scale(1)',
                opacity: 1
            },
            {
                transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
                opacity: 0
            }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.2, 0, 0.8, 1)'
        });
    }

    setTimeout(() => {
        particlesContainer.remove();
    }, 1200);
}
function createFloatingShapes() {
    const headerContainer = document.querySelector('header .container');
    if (!headerContainer) return; // Fallback in case header isn't on page

    const container = document.createElement('div');
    container.className = 'bg-shapes-container';
    
    // Inject the spawner directly INTO the header void
    headerContainer.prepend(container);

    const shapeCount = 100; // Kept low for clean performance and subtlety
    const shapeTypes = ['shape-square', 'shape-circle', 'shape-pill', 'shape-triangle'];

    for (let i = 0; i < shapeCount; i++) {
        const shape = document.createElement('div');
        
        const randomType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        shape.className = `floating-shape ${randomType}`;
        const size = Math.random() * 60 + 30;
        const left = Math.random() * 100; 
        const duration = Math.random() * 25 + 15; 
        const delay = Math.random() * 20; 

        if (randomType === 'shape-pill') {
            shape.style.width = `${size * 1.8}px`;
            shape.style.height = `${size * 0.6}px`;
        } else {
            shape.style.width = `${size}px`;
            shape.style.height = `${size}px`;
        }

        shape.style.left = `${left}vw`;
        shape.style.animationDuration = `${duration}s`;
        shape.style.animationDelay = `-${delay}s`; 

        container.appendChild(shape);
    }
}
function createHeaderShapes() {
    const header = document.querySelector('header');
    if (!header) return;

    const container = document.createElement('div');
    container.className = 'header-shapes-container';
    header.prepend(container);

    const types = ['shape-square', 'shape-circle', 'shape-pill', 'shape-triangle'];

    for (let i = 0; i < 12; i++) {
        const shape = document.createElement('div');
        const type = types[Math.floor(Math.random() * types.length)];
        shape.className = `floating-shape ${type}`;

        const size = Math.random() * 60 + 30;
        shape.style.width = type === 'shape-pill' ? `${size * 2}px` : `${size}px`;
        shape.style.height = type === 'shape-pill' ? `${size / 2}px` : `${size}px`;
        
        shape.style.left = `${Math.random() * 100}%`;
        shape.style.animationDuration = `${Math.random() * 10 + 15}s`;
        shape.style.animationDelay = `-${Math.random() * 20}s`;

        container.appendChild(shape);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    createHeaderShapes();
});

// This works for both the home page header and the internship header
function spawnHeaderShapes() {
    const header = document.querySelector('header .container') || document.querySelector('.internship-header-wrapper');
    if (!header) return;

    const container = document.createElement('div');
    container.className = 'header-shapes-container';
    header.prepend(container);

    const types = ['shape-square', 'shape-circle', 'shape-pill', 'shape-triangle'];

    for (let i = 0; i < 10; i++) {
        const shape = document.createElement('div');
        const type = types[Math.floor(Math.random() * types.length)];
        shape.className = `floating-shape ${type}`;
        
        const size = Math.random() * 50 + 20;
        shape.style.width = type === 'shape-pill' ? `${size * 2}px` : `${size}px`;
        shape.style.height = type === 'shape-pill' ? `${size / 2}px` : `${size}px`;
        
        shape.style.left = `${Math.random() * 100}%`;
        shape.style.animationDuration = `${Math.random() * 15 + 20}s`;
        shape.style.animationDelay = `-${Math.random() * 20}s`;

        container.appendChild(shape);
    }
}

document.addEventListener('DOMContentLoaded', spawnHeaderShapes);