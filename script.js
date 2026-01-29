// --- PROJECT DATA (For Modals) ---
const projectData = {
    "pokedex": {
        title: "Application Pokédex",
        description: "Une Single Page Application (SPA) qui permet de parcourir la liste des Pokémon. L'objectif était de maîtriser la consommation d'API REST et la manipulation dynamique du DOM.",
        tags: ["JavaScript", "Fetch API", "CSS Grid", "Async/Await"],
        challenges: [
            "Gestion des appels asynchrones avec Fetch",
            "Mise en place d'une barre de recherche filtrant les résultats en temps réel",
            "Affichage responsive des cartes Pokémon"
        ]
    },
    "cat": {
        title: "Clone de la commande 'cat'",
        description: "Reproduction fidèle du comportement de l'outil système UNIX 'cat'. Ce projet m'a permis de comprendre la gestion des fichiers et des entrées/sorties standards en C.",
        tags: ["Langage C", "System Calls", "Buffer Management"],
        challenges: [
            "Lecture optimisée via buffer pour éviter la latence",
            "Gestion des erreurs (fichier introuvable, permissions)",
            "Implémentation des flags -E (fin de ligne) et -n (numérotation)"
        ]
    },
    "maze": {
        title: "Maze Solver (Labyrinthe)",
        description: "Programme capable de lire un fichier map, de vérifier sa validité et de trouver le chemin de sortie le plus court.",
        tags: ["Langage C", "Algorithmique", "Parsing"],
        challenges: [
            "Validation de la map (bords fermés, une seule entrée/sortie)",
            "Implémentation de l'algorithme 'Main gauche' (Left-hand rule)",
            "Gestion de l'allocation mémoire dynamique"
        ]
    },
    "cash": {
        title: "Cash Register Algorithm",
        description: "Un défi algorithmique consistant à calculer le rendu de monnaie optimal à partir d'un fond de caisse défini.",
        tags: ["JavaScript", "Logique", "Maths"],
        challenges: [
            "Gestion des imprécisions des nombres flottants en JS",
            "Algorithme glouton pour rendre les plus grosses pièces en premier",
            "Mise à jour dynamique de l'état de la caisse"
        ]
    },
    "bdd": {
        title: "Architecture Base de Données",
        description: "Conception du modèle relationnel pour un système de gestion scolaire (élèves, notes, cours, profs).",
        tags: ["SQL", "MySQL", "Merise"],
        challenges: [
            "Définition des clés étrangères et des contraintes d'intégrité",
            "Normalisation des tables pour éviter la redondance",
            "Écriture de requêtes complexes (Jointures)"
        ]
    }
};

// --- MODAL LOGIC ---
const modal = document.getElementById('projectModal');
const closeBtn = document.querySelector('.close-modal');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalTags = document.getElementById('modalTags');
const modalChallenges = document.getElementById('modalChallenges');

// Open Modal
document.querySelectorAll('.btn-tech-details').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Find the closest project card to get the ID
        const card = e.target.closest('.project-card');
        const projectId = card.getAttribute('data-id');
        const data = projectData[projectId];

        if(data) {
            modalTitle.textContent = data.title;
            modalDesc.textContent = data.description;
            
            // Populate Tags
            modalTags.innerHTML = data.tags.map(tag => 
                `<span style="background:#eef2ff; color:#4361ee; padding:4px 8px; border-radius:4px; font-size:0.8em; margin-right:5px; font-weight:600;">${tag}</span>`
            ).join('');

            // Populate Challenges
            modalChallenges.innerHTML = data.challenges.map(c => `<li>${c}</li>`).join('');
            
            modal.style.display = "block";
        }
    });
});

// Close Modal
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => {
    if (e.target == modal) modal.style.display = "none";
}


// --- MOBILE MENU ---
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  // Simple check to change icon based on state if desired
});


// --- SCROLL EFFECTS ---
window.addEventListener('scroll', () => {
  const backToTopBtn = document.querySelector('.back-to-top');
  if (window.scrollY > 500) {
    backToTopBtn.classList.add('active');
  } else {
    backToTopBtn.classList.remove('active');
  }
});

document.querySelector('.back-to-top').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

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
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(showWelcomeAchievement, 1000);
});