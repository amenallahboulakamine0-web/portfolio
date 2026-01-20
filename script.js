const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
  });
});

window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a');
  
  let current = '';
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    
    if (scrollY >= (sectionTop - 200)) {
      current = section.getAttribute('id');
    }
  });
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

function animateSkills() {
  const skillBars = document.querySelectorAll('.skill-progress');
  
  skillBars.forEach(bar => {
    const width = bar.getAttribute('data-width');
    bar.style.width = `${width}%`;
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
            <div class="achievement-name"> Welcome brazar!</div>
            <div class="achievement-desc">first visit to my portfolio</div>
        </div>
        <div class="achievement-progress"></div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    createAchievementParticles();
    
    playAchievementSound();
    
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
        const duration = 600 + Math.random() * 600;
        
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

function playAchievementSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(showWelcomeAchievement, 1000);
});

const skillsSection = document.querySelector('#skills');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateSkills();
    }
  });
}, { threshold: 0.3 });

observer.observe(skillsSection);

const backToTopBtn = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    backToTopBtn.classList.add('active');
  } else {
    backToTopBtn.classList.remove('active');
  }
});

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const subject = document.getElementById('subject').value;
  const message = document.getElementById('message').value;
  
  
  alert(`Merci ${name} ! Votre message a été envoyé avec succès. Je vous répondrai dès que possible.`);
  
  contactForm.reset();
});

window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const parallax = document.querySelector('header');
  const rate = scrolled * 0.5;
  
  parallax.style.transform = `translate3d(0px, ${rate}px, 0px)`;
});

const animateOnScroll = () => {
  const elements = document.querySelectorAll('.skill-category, .project-card, .certificate-card');
  
  elements.forEach(element => {
    const elementTop = element.getBoundingClientRect().top;
    const elementVisible = 150;
    
    if (elementTop < window.innerHeight - elementVisible) {
      element.classList.add('animate');
    }
  });
};

window.addEventListener('scroll', animateOnScroll);

document.addEventListener('DOMContentLoaded', () => {
  animateOnScroll();
});

