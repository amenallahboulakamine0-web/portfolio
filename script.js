const projectData = {
    "pokedex": {
        "title": "Pokédex - Single Page Application",
        "description": "Développement d'une application SPA permettant de naviguer et rechercher des Pokémon dynamiquement. Le projet se concentre sur la consommation d'API REST, la manipulation asynchrone et le rendu dynamique.",
        "tags": ["JavaScript", "Fetch API", "DOM", "CSS Grid"],
        "challenges": [
            "Gestion des appels asynchrones avec `fetch` et `async/await`",
            "Manipulation du DOM pour l'affichage dynamique des cartes sans rechargement",
            "Implémentation d'une barre de recherche avec filtrage en temps réel sur le jeu de données"
        ]
    },
    "cat": {
            "title": "Clone de la commande UNIX `cat`",
            "description": "Reproduction du comportement de l'utilitaire système `cat` en C. Le programme gère la lecture séquentielle de fichiers ou de l'entrée standard et supporte les options d'affichage spécifiques.",
            "tags": ["C", "System Calls", "Buffer", "File Descriptors"],
            "challenges": [
                "Gestion bas niveau des I/O (appels systèmes `open`, `read`, `write`)",
                "Manipulation des descripteurs de fichiers (fichiers vs `stdin`)",
                "Parsing des arguments et gestion des flags (`-h`, `-E` pour les fins de ligne, `-T` pour les tabulations)",
                "Gestion robuste des erreurs via `errno` et `strerror`"
            ],
            "constraints": `
                <h5><i class="fas fa-exclamation-triangle"></i> Project Constraints & Rules</h5>
                <p><strong>Contexte :</strong> Projet individuel (1.5 semaine) à l'École 89.</p>
                <ul style="margin-top:5px; padding-left:20px;">
                    <li><strong>Fonctions Autorisées :</strong> Strictement limitées aux appels système (open, close, read, write) et gestion mémoire (malloc, free). Fonctions de la lib standard (stdio) interdites.</li>
                    <li><strong>Compilation :</strong> Flags stricts <code>-Wall -Wextra -Werror</code>.</li>
                    <li><strong>Architecture :</strong> Gestion propre des buffers pour optimiser les appels système.</li>
                </ul>
            `,
            "codingStyle": "E89 Coding Standard (Norme stricte)"
        },

        "maze": {
            "title": "Maze Solver (Résolution de Labyrinthe)",
            "description": "Programme en C capable de lire une carte, de valider sa structure et de trouver la sortie. Implémentation de deux algorithmes de résolution : suivi de mur et recherche du plus court chemin.",
            "tags": ["C", "Algorithmique", "Gestion Mémoire", "BFS"],
            "challenges": [
                "Parsing de fichier vers un buffer et conversion de coordonnées 2D en index linéaire",
                "Implémentation de la règle de la main gauche (suivi de murs)",
                "Algorithme de propagation (type Flood Fill/BFS) pour calculer le chemin le plus court (distance modulo 10)",
                "Gestion stricte de la mémoire (`malloc`/`free`) sans fuites (Valgrind)"
            ],
            "constraints": `
                <h5><i class="fas fa-ruler-combined"></i> Project Constraints & Rules</h5>
                <p><strong>Contexte :</strong> Projet individuel (2 semaines) à l'École 89.</p>
                <ul style="margin-top:5px; padding-left:20px;">
                    <li><strong>Algorithmique :</strong> Interdiction de modifier la structure de la carte invalide (doit être rectangulaire).</li>
                    <li><strong>Mémoire :</strong> Conversion obligatoire des coordonnées (x,y) en index unique (1D array).</li>
                    <li><strong>Interdictions :</strong> Aucune fonction externe hors appels système de base.</li>
                </ul>
            `,
            "codingStyle": "E89 Coding Standard (Norme stricte)"
        },
        
        "printf": {
            "title": "Custom Printf (stu_dprintf)",
            "description": "Ré-implémentation de la fonction `dprintf` de la bibliothèque standard C. Le programme écrit une chaîne formatée directement sur un descripteur de fichier spécifique en gérant divers spécificateurs et conversions de base.",
            "tags": ["C", "Fonctions Variadiques", "Parsing", "Criterion (Tests)"],
            "challenges": [
                "Utilisation des macros variadiques (`va_start`, `va_arg`, `va_end`) pour gérer un nombre indéfini d'arguments",
                "Parsing dynamique de la chaîne de format pour identifier et traiter les spécificateurs (`%c`, `%s`, `%d`, `%p`, `%x`, `%b`, `%o`, `%%`) ainsi que le flag `+`",
                "Implémentation d'algorithmes de conversion de bases (binaire, octal, décimal, hexadécimal)",
                "Mise en place de tests unitaires complets via le framework Criterion pour valider chaque format"
            ],
            "constraints": `
                <h5><i class="fas fa-exclamation-triangle"></i> Project Constraints & Rules</h5>
                <p><strong>Contexte :</strong> Projet E89 (2 à 3 semaines, 1-2 personnes).</p>
                <ul style="margin-top:5px; padding-left:20px;">
                    <li><strong>Fonctions Autorisées :</strong> Uniquement <code>write</code>, <code>malloc</code>, <code>free</code> et les macros <code>stdarg</code>. Toute autre fonction est interdite.</li>
                    <li><strong>Livrables :</strong> Bibliothèque statique (<code>printf.a</code>) et binaire de tests (<code>ut.out</code>).</li>
                    <li><strong>Architecture :</strong> Makefile obligatoire avec règles <code>all, clean, fclean, re</code>. Structure de dossiers stricte (src, include, test).</li>
                </ul>
            `,
            "codingStyle": "E89 Coding Standard (Norme stricte, pénalités par faute)"
        },

        "cash": {
            "title": "Cash Register Algorithm",
            "description": "Algorithme de rendu de monnaie optimisé. Le but est de retourner la monnaie exacte en utilisant le moins de billets et pièces possible depuis un tiroir-caisse défini.",
            "tags": ["JavaScript", "Algorithme Glouton", "Logique", "Précision"],
            "challenges": [
                "Implémentation d'un algorithme glouton (Greedy Algorithm) pour optimiser le rendu",
                "Gestion de la précision des nombres flottants en JavaScript (problème du 0.1 + 0.2)",
                "Mise à jour dynamique de l'état du tiroir-caisse (State Management)"
            ]
        },
        "bdd": {
                "title": "Système de Gestion d'Établissement Scolaire (SGBD)",
                "description": "Conception et implémentation d'une base de données relationnelle complexe pour gérer un établissement scolaire complet : utilisateurs (élèves, profs, tuteurs), scolarité (cours, emploi du temps), assiduité et évaluations.",
                "tags": ["MySQL 8", "SQL Avancé","InnoDB"],
                "challenges": [
                    "Modélisation de relations complexes (Many-to-Many pour tuteurs/élèves, messagerie interne)",
                    "Gestion stricte de l'intégrité des données (Foreign Keys, triggers `ON DELETE CASCADE/SET NULL`)",
                    "Écriture de 20 requêtes analytiques complexes (Calcul taux d'assiduité, moyennes pondérées, détection élèves à risque)",
                    "Génération d'un jeu de données de test réaliste (>50 élèves, planning, notes)"
                ],
                "constraints": `
                    <h5><i class="fas fa-database"></i> Project Constraints & Rules</h5>
                    <p><strong>Contexte :</strong> Projet individuel (4 semaines) à l'École 89.</p>
                    <ul style="margin-top:5px; padding-left:20px;">
                        <li><strong>Moteur :</strong> MySQL 8, Engine InnoDB, Charset utf8mb4.</li>
                        <li><strong>Conventions :</strong> Nommage strict en <code>snake_case</code>, Clés primaires obligatoires sur toutes les tables.</li>
                        <li><strong>Livrables :</strong> Script DDL complet, Jeu de données de test (>50 étudiants) et 20 requêtes d'extraction de données.</li>
                    </ul>
                `,
            },
        "demo": {
            "title": "Jeu du Démineur",
            "description": "Récréation du célèbre jeu de logique. Le joueur doit découvrir des cases sans faire exploser de mines, en s'aidant des indices numériques.",
            "tags": ["JavaScript", "Algorithme", "Events", "Matrice 2D"],
            "challenges": [
                "Génération aléatoire de la grille et placement des mines",
                "Algorithme de propagation récursif (Flood Fill) pour dévoiler les cases vides adjacentes",
                "Gestion différenciée des événements souris (clic gauche pour révéler, clic droit pour marquer)"
            ]
        },
        "piano": {
            "title": "Piano Tiles Clone",
            "description": "Jeu d'arcade rythmique où le joueur doit cliquer sur des tuiles noires défilantes. Test de réflexes et gestion précise du timing.",
            "tags": ["JavaScript", "DOM", "Performance", "Audio"],
            "challenges": [
                "Optimisation de la boucle de jeu pour un défilement fluide (`requestAnimationFrame`)",
                "Gestion des collisions et de la latence des clics",
                "Logique d'accélération progressive du jeu et calcul du score"
            ]
        }
};

const modal = document.getElementById('projectModal');
if (modal) {
    const closeBtn = document.querySelector('.close-modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const modalTags = document.getElementById('modalTags');
    const modalChallenges = document.getElementById('modalChallenges');
    
    const modalBubble = document.getElementById('modalBubble');
    const modalStyle = document.getElementById('modalStyle');

    document.querySelectorAll('.btn-tech-details').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.project-card');
            const projectId = card.getAttribute('data-id');
            const data = projectData[projectId];

            if (data) {
                modalTitle.textContent = data.title;
                modalDesc.textContent = data.description;
                modalTags.innerHTML = data.tags.map(tag =>
                    `<span style="background:#eef2ff; color:#4361ee; padding:4px 8px; border-radius:4px; font-size:0.8em; margin-right:5px; font-weight:600;">${tag}</span>`
                ).join('');
                modalChallenges.innerHTML = data.challenges.map(c => `<li>${c}</li>`).join('');

                if (data.constraints) {
                    modalBubble.innerHTML = data.constraints;
                    modalBubble.style.display = "block";
                } else {
                    modalBubble.style.display = "none";
                }

                if (data.codingStyle) {
                    modalStyle.innerHTML = `Coding Style Used: <a href="https://git.ecole-89.com/eriizu/coding_style/src/branch/main/norm.md" target="_blank">${data.codingStyle} <i class="fas fa-external-link-alt"></i></a>`;
                    modalStyle.style.display = "block";
                } else {
                    modalStyle.style.display = "none";
                }
                document.body.style.overflow = 'hidden';
                modal.style.display = "block";
            }
        });
    });

    const closeModal = () => {
        modal.style.display = "none";
        document.body.style.overflow = '';
    };

    if (closeBtn) {
        closeBtn.onclick = closeModal;
    }

    window.onclick = (e) => {
        if (e.target == modal) closeModal();
    }
}
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

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(showWelcomeAchievement, 1000);
});