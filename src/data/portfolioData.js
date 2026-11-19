// Shared editorial data for both routes. Asset paths are relative to the site root.
(function () {
  "use strict";
  window.PortfolioData = {
  "profile": {
    "name": "Amenallah Boulakamine",
    "tagline": "Bachelor Programmation Informatique — 2e année | Recherche d’alternance en développement",
    "portrait": "./images/hahi.jpg",
    "badges": [
      "Développement Web",
      "JavaScript",
      "HTML/CSS"
    ],
    "links": [
      {
        "label": "CV",
        "type": "cv"
      },
      {
        "label": "LinkedIn",
        "profileKey": "linkedin"
      },
      {
        "label": "GitHub",
        "profileKey": "github"
      }
    ],
    "email": "amenallahboulakamine0@gmail.com",
    "phone": "0745336254",
    "github": "https://github.com/amenallahboulakamine0-web",
    "linkedin": "https://www.linkedin.com/in/amenallah-boulakamine"
  },
  "cv": {
    "label": "Télécharger le CV",
    "href": "images/CV_Amenallah_Boulakamine.pdf",
    "filename": "CV_Amenallah_Boulakamine.pdf"
  },
  "recruitment": {
    "contract": "Alternance",
    "role": "Développement, idéalement full-stack",
    "location": "Île-de-France",
    "cta": "Alternance en développement · Île-de-France"
  },
  "about": {
    "title": "À propos de moi",
    "subtitle": "Découvrez mon parcours, ma passion pour le développement et mes objectifs professionnels",
    "heading": "Du développement web aux systèmes",
    "paragraphs": [
      "En deuxième année de Bachelor Programmation Informatique à l’École 89, je recherche une alternance en développement en Île-de-France pour contribuer aux projets d’une équipe et progresser dans la pratique.",
      "Lors de mon stage chez WeDoConsulting, de juin à août 2026, j’ai travaillé sur un module de facturation électronique pour Odoo 19 : export XML TEIF, suivi des exports et signature électronique.",
      "Mes projets couvrent le web en JavaScript, la programmation système et réseau en C, et l’administration Linux. Je privilégie le full-stack et reste ouvert aux autres missions de développement en alternance."
    ]
  },
  "experience": {
    "title": "Mon expérience",
    "subtitle": "Développement backend en environnement professionnel",
    "items": [
      {
        "title": "Stagiaire développeur Odoo · WeDoConsulting",
        "meta": "Juin – août 2026 · Télétravail · Grombalia, Tunisie",
        "summary": "Portage et réimplémentation d’un module de facturation électronique d’Odoo 18 vers Odoo 19, sans accès au code source précédent.",
        "tags": [
          "Python / Odoo 19",
          "XML TEIF v1.9",
          "XMLDSIG / RSA-SHA256"
        ],
        "achievements": [
          "Développement de teif_invoice_export : exports XML individuels et groupés en ZIP",
          "Suivi des exports, régénération XML et filtres de recherche dans l’interface Odoo",
          "Signature avec certificats X.509 et validation automatisée de 27 contrôles XPath"
        ]
      }
    ]
  },
  "skills": {
    "title": "Mes compétences",
    "subtitle": "Technologies pratiquées en formation, en projet et en stage",
    "groups": [
      {
        "title": "Développement web",
        "items": [
          {
            "label": "HTML5 / CSS3",
            "icon": "images/skills/html5.svg"
          },
          {
            "label": "JavaScript (ES6+)",
            "icon": "images/skills/javascript.svg"
          },
          {
            "label": "PHP",
            "icon": "images/skills/php.svg"
          },
          {
            "label": "MySQL",
            "icon": "images/skills/mysql.svg"
          },
          {
            "label": "API REST",
            "icon": "images/skills/fastapi.svg"
          }
        ]
      },
      {
        "title": "Backend & données",
        "items": [
          {
            "label": "Python",
            "icon": "images/skills/python.svg"
          },
          {
            "label": "Odoo 19",
            "icon": "images/skills/odoo.svg"
          },
          {
            "label": "PostgreSQL",
            "icon": "images/skills/postgresql.svg"
          },
          {
            "label": "XML / lxml",
            "icon": "images/skills/xml.svg"
          },
          {
            "label": "Merise",
            "icon": "images/skills/diagramsdotnet.svg"
          }
        ]
      },
      {
        "title": "Systèmes & programmation",
        "items": [
          {
            "label": "Langage C",
            "icon": "images/skills/c.svg"
          },
          {
            "label": "C#",
            "icon": "images/skills/csharp.svg"
          },
          {
            "label": "Rust",
            "icon": "images/skills/rust.svg"
          },
          {
            "label": "Linux",
            "icon": "images/skills/linux.svg"
          },
          {
            "label": "Bash / Shell",
            "icon": "images/skills/gnubash.svg"
          },
          {
            "label": "Sockets BSD",
            "icon": "images/skills/socketdotio.svg"
          }
        ]
      },
      {
        "title": "Outils & infrastructure",
        "items": [
          {
            "label": "Git / GitHub",
            "icon": "images/skills/git.svg"
          },
          {
            "label": "Docker / VirtualBox",
            "icon": "images/skills/docker.svg"
          },
          {
            "label": "Makefile",
            "icon": "images/skills/gnu.svg"
          },
          {
            "label": "DBeaver / Figma",
            "icon": "images/skills/dbeaver.svg"
          },
          {
            "label": "TCP/IP / SSH",
            "icon": "images/skills/openssh.svg"
          },
          {
            "label": "nftables / fail2ban",
            "icon": "images/skills/linuxfoundation.svg"
          }
        ]
      }
    ]
  },
  "projects": {
    "title": "Mes projets",
    "subtitle": "Une sélection de travaux en développement web, en C et en infrastructure",
    "items": [
      {
        "id": "sky-island",
        "title": "Sky Island Portfolio",
        "context": "Projet interactif · Expérience optionnelle",
        "featured": true,
        "image": {"src": "public/sky-island.webp", "alt": "Vue du minigolf en 3D sur l’île flottante de Sky Island"},
        "tags": [
          "JavaScript",
          "Three.js",
          "Physique",
          "Optimisation du rendu"
        ],
        "description": "Un portfolio sur une île flottante en 3D, à explorer à pied et à travers sept parcours de mini-golf",
        "skills": "Simulation physique sur un plan, rendu 3D et organisation des géométries pour réduire les appels de dessin",
        "details": [
          "Moteur de golf personnalisé : rebonds, pentes, obstacles mobiles et zones de danger",
          "Monde voxel avec géométries statiques regroupées et cubes instanciés",
          "Chargement du moteur 3D uniquement sur la page dédiée, avec commandes clavier et tactiles"
        ],
        "links": [
          {
            "label": "Explorer Sky Island",
            "route": "island"
          }
        ]
      },
      {
        "id": "pokedex",
        "title": "Pokédex SPA",
        "context": "Projet web",
        "image": {
          "src": "images/pokedex-cover.webp",
          "alt": ""
        },
        "tags": [
          "JavaScript",
          "API REST",
          "Modules ES6"
        ],
        "description": "Une application pour rechercher des Pokémon et composer une équipe conservée entre les visites",
        "skills": "Intégration d’API, gestion de l’état et séparation du code entre API, interface et navigation",
        "details": [
          "Navigation entre Pokédex et équipe sans rechargement",
          "Recherche avec temporisation, filtre par type et cache des réponses API",
          "Équipe limitée à six Pokémon distincts, enregistrée dans localStorage"
        ],
        "links": [
          {
            "label": "Voir le code sur GitHub",
            "href": "https://github.com/amenallahboulakamine0-web/Pokedex-SPA"
          }
        ]
      },
      {
        "id": "chat",
        "title": "Clavardage TCP",
        "context": "Projet en C",
        "image": {
          "src": "images/chat-cover.svg",
          "alt": "Illustration du fonctionnement d’un chat TCP"
        },
        "tags": [
          "C",
          "Sockets BSD",
          "Linux"
        ],
        "description": "Un serveur de chat TCP multi-clients sous Linux",
        "skills": "Programmation réseau et gestion des échanges entre plusieurs clients",
        "details": [
          "Gestion de connexions simultanées",
          "Commandes /nick et /wisp pour les pseudonymes et messages privés",
          "Commandes /list et /kick pour gérer les utilisateurs connectés"
        ],
        "links": []
      },
      {
        "id": "debian",
        "title": "Infrastructure réseau Debian",
        "context": "Projet systèmes & réseaux",
        "image": {
          "src": "images/debian-cover.svg",
          "alt": "Illustration d’une infrastructure réseau Debian"
        },
        "tags": [
          "Debian",
          "nftables",
          "SSH"
        ],
        "description": "Une infrastructure de quatre machines virtuelles Debian sur un réseau privé",
        "skills": "Configuration Linux, compréhension des réseaux et mise en place de protections",
        "details": [
          "Réseau interne, IP forwarding et accès SSH",
          "Pare-feu et NAT avec nftables ; protection SSH avec fail2ban",
          "Services DHCP, DNS interne et journalisation centralisée"
        ],
        "links": []
      },
      {
        "id": "maze",
        "title": "Maze Solver",
        "context": "Projet académique en C",
        "image": {
          "src": "images/maze-cover.webp",
          "alt": ""
        },
        "tags": [
          "C",
          "Algorithmique",
          "Mémoire"
        ],
        "description": "Un programme de résolution de labyrinthe en C",
        "skills": "Décomposition d’un problème algorithmique et manipulation de structures en C",
        "details": [
          "Lecture de fichiers et représentation matricielle",
          "Parcours de grille et gestion des coordonnées et déplacements",
          "Gestion de la mémoire"
        ],
        "links": []
      },
      {
        "id": "printf",
        "title": "Printf",
        "context": "Projet académique en C",
        "image": {
          "src": "images/printf-cover.webp",
          "alt": ""
        },
        "tags": [
          "C",
          "stdarg",
          "Criterion"
        ],
        "description": "Une réimplémentation de printf selon la norme E89",
        "skills": "Parsing, fonctions variadiques et démarche de test",
        "details": [
          "Utilisation de write, malloc et free",
          "Arguments variadiques et parsing dynamique des formats",
          "Suite de tests unitaires avec Criterion"
        ],
        "links": []
      }
    ]
  },
  "certificates": {
    "title": "Mes Certificats",
    "subtitle": "Mes certifications et formations en développement web",
    "items": [
      {
        "title": "Responsive Web Design",
        "description": "Certification validant mes compétences en développement front-end avec HTML et CSS",
        "image": "./images/ec2.png",
        "link": {
          "label": "Voir le certificat en plein écran",
          "href": "./images/ec2.png"
        }
      },
      {
        "title": "Javascript Algorithms and Data Structures",
        "description": "Formation approfondie en JavaScript, incluant les concepts avancés et les bonnes pratiques",
        "image": "./images/cerrtif.png",
        "link": {
          "label": "Voir le certificat en plein écran",
          "href": "./images/cerrtif.png"
        }
      }
    ]
  },
  "contact": {
    "title": "Contactez-moi",
    "subtitle": "Vous recrutez un développeur en alternance en Île-de-France ? Contactez-moi pour en discuter.",
    "links": [
      {
        "label": "LinkedIn",
        "profileKey": "linkedin"
      },
      {
        "label": "GitHub",
        "profileKey": "github"
      }
    ]
  },
  "education": [
    {
      "school": "École 89 — École Deep Tech",
      "qualification": "Bachelor Programmation Informatique",
      "location": "Paris",
      "dates": "2025 – en cours",
      "year": 2
    },
    {
      "school": "Lycée de Grombalia",
      "qualification": "Baccalauréat Sciences Techniques",
      "location": "Tunisie",
      "dates": "2021 – 2025"
    }
  ],
  "languages": [
    {
      "name": "Arabe",
      "level": "Langue maternelle"
    },
    {
      "name": "Anglais",
      "level": "C1"
    },
    {
      "name": "Français",
      "level": "B2"
    },
    {
      "name": "Allemand",
      "level": "A1"
    }
  ],
  "methodology": [
    "POO",
    "Algorithmique",
    "Résolution de problèmes",
    "Tests",
    "Travail en équipe"
  ],
  "additionalProjects": [
    {
      "title": "Cash Register",
      "href": "https://amenallahboulakamine0-web.github.io/cash-register/"
    },
    {
      "title": "Démineur",
      "href": "https://amenallahboulakamine0-web.github.io/demo/"
    },
    {
      "title": "Piano Tiles",
      "href": "https://amenallahboulakamine0-web.github.io/piano-tiles/"
    }
  ],
  "interactive": {
    "cta": "Explore my portfolio in 3D",
    "subtitle": "Optional interactive experience",
    "projectId": "sky-island"
  },
  "island": {
    "stations": [
      {
        "section": "about",
        "title": "À propos"
      },
      {
        "section": "skills",
        "title": "Compétences"
      },
      {
        "section": "projects",
        "title": "Projets"
      },
      {
        "section": "experience",
        "title": "Expérience"
      },
      {
        "section": "education",
        "title": "Formation"
      },
      {
        "section": "languages",
        "title": "Langues & Méthode"
      },
      {
        "section": "contact",
        "title": "Contact"
      }
    ]
  }
};
})();
