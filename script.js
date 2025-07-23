// ===== FIREFLIES ANIMATION REFACTORED (V2) =====

// Get the canvas element and its 2D rendering context
const canvas = document.getElementById('fireflies-bg');
const ctx = canvas.getContext('2d');

// Set initial canvas dimensions to match the window size
let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

// ===== ANIMATION CONSTANTS (V2) =====
const FIREFLY_COUNT = 125;
const FIREFLY_MIN_RADIUS = 8;
const FIREFLY_MAX_RADIUS = 10;
const FIREFLY_MIN_SPEED = 15; // Pixels per second
const FIREFLY_MAX_SPEED = 30; // Pixels per second
const GLOW_MIN = 0.3;
const GLOW_MAX = 1.0;
const GLOW_SPEED = 0.005;
const MOUSE_REACT_DIST = 120;
const MOUSE_PUSH = 140; // Pushing force in pixels per second

// ===== MOUSE TRACKING =====
let mouse = { x: -1000, y: -1000 };

// ===== OFF-SCREEN CANVAS FOR PRE-RENDERING =====
const fireflyCanvas = document.createElement('canvas');
const fireflyCtx = fireflyCanvas.getContext('2d');
const fireflyBaseRadius = 20; // High-res radius for pre-rendering
fireflyCanvas.width = fireflyBaseRadius * 4;
fireflyCanvas.height = fireflyBaseRadius * 4;

// Pre-render the firefly glow
const gradient = fireflyCtx.createRadialGradient(
  fireflyBaseRadius * 2, fireflyBaseRadius * 2, 0,
  fireflyBaseRadius * 2, fireflyBaseRadius * 2, fireflyBaseRadius
);
gradient.addColorStop(0, 'rgba(110, 193, 228, 1)');
gradient.addColorStop(0.6, 'rgba(110, 193, 228, 0.5)');
gradient.addColorStop(1, 'rgba(110, 193, 228, 0)');

fireflyCtx.fillStyle = gradient;
fireflyCtx.shadowColor = 'rgba(110, 193, 228, 0.8)';
fireflyCtx.shadowBlur = 30;
fireflyCtx.beginPath();
fireflyCtx.arc(fireflyBaseRadius * 2, fireflyBaseRadius * 2, fireflyBaseRadius, 0, Math.PI * 2);
fireflyCtx.fill();


// ===== WINDOW RESIZE HANDLING =====
window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
});

// ===== MOUSE EVENT LISTENERS =====
let mouseUpdateTimeout;
document.addEventListener('mousemove', e => {
  if (!mouseUpdateTimeout) {
    mouseUpdateTimeout = setTimeout(() => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouseUpdateTimeout = null;
    }, 16);
  }
});

document.addEventListener('mouseleave', () => {
  mouse.x = -1000;
  mouse.y = -1000;
});

// ===== UTILITY FUNCTIONS =====
function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

// ===== FIREFLY CLASS (V2) =====
class Firefly {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = randomBetween(0, width);
    this.y = randomBetween(0, height);
    this.radius = randomBetween(FIREFLY_MIN_RADIUS, FIREFLY_MAX_RADIUS);
    this.angle = randomBetween(0, Math.PI * 2);
    this.speed = randomBetween(FIREFLY_MIN_SPEED, FIREFLY_MAX_SPEED);
    this.glow = randomBetween(GLOW_MIN, GLOW_MAX);
    this.glowDir = Math.random() > 0.5 ? 1 : -1;
    this.glowSpeed = randomBetween(0.5, 1.2);
    this.changeDirectionTimer = 0;
    this.maxChangeDirectionTime = randomBetween(300, 800);
  }

  update(deltaTime) {
    // Mouse interaction
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const distSquared = dx * dx + dy * dy;

    if (distSquared < MOUSE_REACT_DIST * MOUSE_REACT_DIST && mouse.x > 0) {
      const dist = Math.sqrt(distSquared);
      const force = (MOUSE_REACT_DIST - dist) / MOUSE_REACT_DIST;
      const angleFromMouse = Math.atan2(dy, dx);
      const pushForce = MOUSE_PUSH * force * deltaTime;
      this.x += Math.cos(angleFromMouse) * pushForce;
      this.y += Math.sin(angleFromMouse) * pushForce;
      this.angle = angleFromMouse;
      this.glow = Math.min(GLOW_MAX * 1.5, this.glow + 0.08);
    } else {
      // Natural movement
      this.x += Math.cos(this.angle) * this.speed * deltaTime;
      this.y += Math.sin(this.angle) * this.speed * deltaTime;

      // Glow
      this.glow += this.glowDir * GLOW_SPEED * this.glowSpeed;
      if (this.glow > GLOW_MAX || this.glow < GLOW_MIN) {
        this.glowDir *= -1;
      }
    }

    // Boundary check and reset
    if (this.x < -this.radius || this.x > width + this.radius || this.y < -this.radius || this.y > height + this.radius) {
      this.reset();
      // Place it on the opposite side for continuous flow
      if (this.x < -this.radius) this.x = width + this.radius;
      else if (this.x > width + this.radius) this.x = -this.radius;
      else if (this.y < -this.radius) this.y = height + this.radius;
      else if (this.y > height + this.radius) this.y = -this.radius;
    }
  }

  draw(ctx) {
    ctx.globalAlpha = this.glow;
    // Draw the pre-rendered firefly, scaling it to the firefly's radius
    // The source image is fireflyBaseRadius*4 wide, we draw it centered on the firefly's x/y
    const drawSize = this.radius * 2.5;
    ctx.drawImage(fireflyCanvas, this.x - drawSize / 2, this.y - drawSize / 2, drawSize, drawSize);
  }
}

// ===== ANIMATION LOOP (V2) =====
const fireflies = Array.from({ length: FIREFLY_COUNT }, () => new Firefly());
let lastTime = 0;

function animate(currentTime) {
  const deltaTime = (currentTime - lastTime) / 1000; // Time in seconds
  lastTime = currentTime;

  ctx.clearRect(0, 0, width, height);

  ctx.globalCompositeOperation = 'lighter'; // Brighter glow where fireflies overlap

  for (const f of fireflies) {
    f.update(deltaTime || 0); // deltaTime will be NaN on first frame
    f.draw(ctx);
  }
  
  ctx.globalCompositeOperation = 'source-over'; // Reset composite mode
  ctx.globalAlpha = 1; // Reset global alpha

  requestAnimationFrame(animate);
}

// Start the animation
requestAnimationFrame(animate);




// ===== PROJECT EXPANSION SYSTEM =====
// Simple fade in/out animation for project overlays

// Function to open project in full-screen overlay
function openProject(projectId) {
  // Get the clicked project card
  const projectCard = document.querySelector(`[data-project="${projectId}"]`);
  if (!projectCard) return;
  
  // Get the overlay and content elements
  const overlay = document.getElementById('project-overlay');
  
  // Load project data
  const projectData = getProjectData(projectId);
  if (!projectData) return;
  
  // Populate the Microsoft Store-style layout
  populateProjectContent(projectData);
  
  // Show the overlay with simple fade animation
  overlay.classList.add('active');
  
  // Prevent body scrolling when overlay is open
  document.body.style.overflow = 'hidden';
}

// Function to populate the Microsoft Store-style project content
function populateProjectContent(projectData) {
  // Update header title
  document.getElementById('project-title').textContent = projectData.title;
  
  // Update hero section
  document.getElementById('hero-image').src = projectData.heroImage;
  document.getElementById('hero-image').alt = projectData.title;
  document.getElementById('hero-title').textContent = projectData.title;
  
  // Update action buttons
  const demoBtn = document.getElementById('demo-btn');
  const sourceBtn = document.getElementById('source-btn');
  
  if (projectData.demoUrl && projectData.demoUrl !== "") {
    demoBtn.style.display = '';
    demoBtn.href = projectData.demoUrl;
    demoBtn.target = "_blank";
  } else {
    demoBtn.style.display = 'none';
  }
  
  sourceBtn.href = projectData.sourceUrl;
  sourceBtn.target = "_blank";
  
  // Update description
  document.getElementById('project-description').textContent = projectData.description;
  
  // Update features list
  const featuresList = document.getElementById('project-features');
  featuresList.innerHTML = '';
  projectData.features.forEach(feature => {
    const li = document.createElement('li');
    li.textContent = feature;
    featuresList.appendChild(li);
  });
  
  // Update screenshots
  const screenshotsGrid = document.getElementById('screenshots-grid');
  screenshotsGrid.innerHTML = '';
  projectData.screenshots.forEach(screenshot => {
    const img = document.createElement('img');
    img.src = screenshot;
    img.alt = 'Project Screenshot';
    screenshotsGrid.appendChild(img);
  });
  
  // Update technologies
  const techGrid = document.getElementById('tech-grid');
  techGrid.innerHTML = '';
  Object.entries(projectData.technologies).forEach(([category, techs]) => {
    const techItem = document.createElement('div');
    techItem.className = 'tech-item';
    
    const h4 = document.createElement('h4');
    h4.textContent = category;
    
    const ul = document.createElement('ul');
    techs.forEach(tech => {
      const li = document.createElement('li');
      li.textContent = tech;
      ul.appendChild(li);
    });
    
    techItem.appendChild(h4);
    techItem.appendChild(ul);
    techGrid.appendChild(techItem);
  });
}

// Function to close the project overlay
function closeProject() {
  const overlay = document.getElementById('project-overlay');
  
  // Hide overlay with simple fade animation
  overlay.classList.remove('active');
  
  // Re-enable body scrolling
  document.body.style.overflow = '';
}

// Function to get project data based on project ID
function getProjectData(projectId) {
  const projects = {
    ecommerce: {
      title: "Data Structures Visualizer",
      heroImage: "content/images/project 1/logo.png",
      description: "A full Python build project that visualizes data structures like linked lists, stacks, queues, trees and more. This interactive application helps students and developers understand complex data structures through visual representation.",
      features: [
        "Interactive visualization of data structures",
        "Linked lists, stacks, queues, and trees",
        "Step-by-step animation of operations",
        "Educational tool for learning algorithms",
        "Python-based implementation with GUI",
        "Real-time data structure manipulation",
        "User-friendly interface for beginners"
      ],
      screenshots: [
        "content/images/project 1/1.png",
        "content/images/project 1/2.png",
        "content/images/project 1/3.png",
        "content/images/project 1/4.png"
      ],
      technologies: {
        "Frontend": ["Python", "PyQt5, GUI Framework, Canvas Drawing"],
        "Backend": ["Python", "Data Structures, Algorithms", "Object-Oriented Programming"],
        "Features": ["Interactive Animations", "Educational Content", "Real-time Updates", "Cross-platform Support"]
      },
      demoUrl: "",
      sourceUrl: "https://github.com/ScarletWagon/data-structures-visualizer"
    },
    
    taskmanager: {
      title: "Flappy Bird Game",
      heroImage: "content/images/project 2/logo.png",
      description: "The classic flappy bird game built with Java and Java Swing. A complete implementation featuring smooth gameplay, collision detection, and score tracking with a nostalgic retro feel.",
      features: [
        "Classic Flappy Bird gameplay mechanics",
        "Smooth bird animation and physics",
        "Collision detection with pipes",
        "Score tracking and high score system",
        "Java Swing GUI implementation",
        "Object-oriented programming design",
        "Cross-platform Java compatibility"
      ],
      screenshots: [
        "content/images/project 2/1.png",
        "content/images/project 2/2.png",
        "content/images/project 2/3.png",
        "content/images/project 2/4.png"
      ],
      technologies: {
        "Frontend": ["Java", "Java Swing", "GUI Components", "Physics2D"],
        "Backend": ["Java", "Game Logic", "Physics Engine", "Object-Oriented Design"],
        "Features": ["Game Loop", "Collision Detection", "Score System", "Cross-platform"]
      },
      demoUrl: "",
      sourceUrl: "https://github.com/ScarletWagon/Flappy-Bird--Java"
    },
    
    portfolio: {
      title: "Portfolio Website",
      heroImage: "content/images/project 3/logo.png",
      description: "This interactive portfolio website with animated fireflies background. Features a modern, responsive design with smooth animations and professional presentation of skills and projects.",
      features: [
        "Dynamic fireflies animation with mouse interaction",
        "Responsive design for all device sizes",
        "Smooth animations and transitions",
        "Glass-morphism effects and modern UI",
        "Interactive project showcase",
        "Professional typography and spacing",
        "Cross-browser compatibility"
      ],
      screenshots: [
        "content/images/project 3/1.png",
        "content/images/project 3/2.png",
        "content/images/project 3/3.png",
        "content/images/project 3/4.png"
      ],
      technologies: {
        "Frontend": ["HTML5", "CSS3", "JavaScript (ES6+)", "Canvas API"],
        "Styling": ["CSS Grid", "Flexbox", "CSS Animations", "Backdrop Filter"],
        "Features": ["Responsive Design", "Interactive Animations", "Modern UI/UX", "Cross-browser Support"]
      },
      demoUrl: "#",
      sourceUrl: "https://github.com/ScarletWagon/portfolio-website"
    },
    
    todoapp: {
      title: "To-Do App",
      heroImage: "content/images/project 4/1.png",
      description: "A modern, category-based to-do application with Google Drive synchronization and personalization features. Built with React, Node.js, and MongoDB, this app provides a seamless task management experience with cloud backup capabilities.",
      features: [
        "Category-based task organization",
        "Google Drive synchronization",
        "Personalization and customization options",
        "Real-time updates and notifications",
        "Responsive design for all devices",
        "User authentication and data persistence",
        "Modern UI with intuitive navigation"
      ],
      screenshots: [
        "content/images/project 4/2.png",
        "content/images/project 4/3.png",
        "content/images/project 4/4.png",
        "content/images/project 4/5.png"
      ],
      technologies: {
        "Frontend": ["React.js", "Material-UI", "React Router"],
        "Backend": ["Node.js", "Express.js", "JWT Authentication", "RESTful API"],
        "Database": ["MongoDB", "Mongoose ODM", "Cloud Storage"],
        "Services": ["Google Drive API", "Cloud Sync", "Real-time Updates"]
      },
      demoUrl: "https://scarletwagon.github.io/To-Do-App/",
      sourceUrl: "https://github.com/ScarletWagon/To-Do-App"
    },
    webcalendar: {
      title: "Web Calendar",
      heroImage: "content/images/project 5/1.jpg",
      description: "A web-based customizable calendar for managing events and schedules. Features month, week, and day views, event creation, and responsive design.",
      features: [
        "Customizable event creation and editing",
        "Month, week, and day calendar views",
        "Responsive design for all devices",
        "Event color coding",
        "Navigation between dates",
        "Modern and clean UI"
      ],
      screenshots: [
        "content/images/project 5/1.jpg",
        "content/images/project 5/2.png",
        "content/images/project 5/3.png",
        "content/images/project 5/2.png"
      ],
      technologies: {
        "Frontend": ["HTML5", "CSS3", "JavaScript"],
        "Features": ["Responsive Design", "Event Management", "Modern UI"]
      },
      demoUrl: "https://scarletwagon.github.io/Web-Calendar/",
      sourceUrl: "https://github.com/ScarletWagon/Web-Calendar"
    },
    urlshortner: {
      title: "Url-Shortner",
      heroImage: "content/images/project 6/logo.png",
      description: "A web-based URL link shortener with a full-stack implementation. Easily shorten long URLs, track usage, and manage your links with a modern interface.",
      features: [
        "Shorten long URLs to simple links",
        "Automatic redirection from short to long URLs",
        "View usage statistics for each link",
        "User-friendly and responsive interface",
        "MongoDB backend for persistent storage",
        "RESTful API for link management"
      ],
      screenshots: [
        "content/images/project 6/1.png",
        "content/images/project 6/2.png",
        "content/images/project 6/3.png",
        "content/images/project 6/logo.png"
      ],
      technologies: {
        "Frontend": ["HTML5", "CSS3", "JavaScript"],
        "Backend": ["Node.js", "Express.js", "MongoDB"],
        "Features": ["RESTful API", "URL Redirection", "Usage Stats"]
      },
      demoUrl: "",
      sourceUrl: "https://github.com/ScarletWagon/Url-Shortner"
    },
    classcast: {
      title: "Class-Cast",
      heroImage: "content/images/project 7/logo.png",
      description: "Class-Cast is a secure, cross-platform file sharing application designed for classrooms and educational environments where traditional internet-based solutions are unavailable or impractical. It enables teachers and students to share files quickly and safely over LAN or WLAN, making it ideal for schools, workshops, and training sessions. With a focus on privacy, ease of use, and reliability, Class-Cast bridges the gap in digital resource sharing in offline or restricted network settings.",
      features: [
        "Peer-to-peer file sharing over LAN/WLAN with no internet required",
        "End-to-end encryption for secure transfers",
        "User-friendly interface for teachers and students",
        "Drag-and-drop file upload and download",
        "Automatic device discovery on the local network",
        "Supports all file types and large file transfers",
        "Cross-platform: works on Windows, Linux, and macOS",
        "No installation required for clients (runs from browser)",
        "Real-time transfer progress and notifications",
        "Open source and customizable for institutional needs"
      ],
      screenshots: [
        "content/images/project 7/1.png",
        "content/images/project 7/2.png",
        "content/images/project 7/3.png",
        "content/images/project 7/4.png"
      ],
      technologies: {
        "Frontend": ["HTML5", "CSS3", "JavaScript (ES6+)", "WebSockets"],
        "Backend": ["Node.js", "Express.js", "Socket.IO"],
        "Security": ["End-to-End Encryption", "LAN/WLAN Only"],
        "Platform": ["Windows", "Linux", "macOS"]
      },
      demoUrl: "https://github.com/ScarletWagon/Class-Cast#readme",
      sourceUrl: "https://github.com/ScarletWagon/Class-Cast"
    },
    calorictracker: {
      title: "Caloric & Steps Tracker",
      heroImage: "content/images/project 10/logo.png",
      description: "A comprehensive full-stack iOS health application designed to track daily calories and steps with seamless HealthKit integration. Built with SwiftUI for the frontend and a robust Node.js/Express backend with MongoDB, this app offers real-time health data visualization, milestone tracking, and custom goal setting for a complete wellness experience.",
      features: [
        "Secure user authentication with JWT and Keychain storage",
        "Real-time dashboard showing calories, steps, and daily progress",
        "HealthKit integration for automatic step counting and background delivery",
        "Interactive charts visualizing the last 7 days of health data",
        "Milestone tracking with both default and custom user-defined goals",
        "Manual step logging for activities not tracked by HealthKit",
        "Dark mode support with modern iOS design language",
        "RESTful API with comprehensive endpoints for all data operations",
        "MongoDB database with optimized schemas for health data",
        "Background health data synchronization",
        "Progress analytics and achievement system",
        "Cross-platform backend supporting multiple iOS devices"
      ],
      screenshots: [
        "content/images/project 10/1.png",
        "content/images/project 10/2.png",
        "content/images/project 10/3.png",
        "content/images/project 10/4.png"
      ],
      technologies: {
        "iOS Frontend": ["SwiftUI", "HealthKit", "Charts Framework", "Keychain Services"],
        "Backend": ["Node.js", "Express.js", "MongoDB", "JWT Authentication"],
        "APIs": ["RESTful API", "HealthKit Background Delivery", "Secure Token Management"],
        "Features": ["Real-time Data Sync", "Milestone Tracking", "Custom Goals", "Dark Mode"]
      },
      demoUrl: "",
      sourceUrl: "https://github.com/ScarletWagon/Caloric-Steps-Tracker-Ios-"
    },
    tvguardian: {
      title: "TV Guardian",
      heroImage: "content/images/project 9/logo.png",
      description: "TV Guardian is a web-based application designed to control and monitor TV usage, particularly for Samsung TVs running Tizen OS. It features a backend server to manage rules and logging, a TV-side app that displays a lock screen, and a remote control app for unlocking and viewing activity.",
      features: [
        "Parental control for Tizen OS (Samsung TVs)",
        "Real-time TV usage logging",
        "Remote control app to unlock TV and view logs",
        "Node.js backend for rules and violations management",
        "Web-based TV client and remote control",
        "Designed for Tizen API integration",
        "Real-time communication between remote and TV"
      ],
      screenshots: [
        "content/images/project 9/1.png",
        "content/images/project 9/2.png",
        "content/images/project 9/3.png",
        "content/images/project 9/logo.png"
      ],
      technologies: {
        "Frontend": ["React.js", "HTML5", "CSS3", "JavaScript"],
        "Backend": ["Node.js", "Express.js", "Socket.IO"],
        "Platform": ["Tizen OS", "Web Browser"],
        "Features": ["Parental Controls", "Activity Logging", "Real-time Updates"]
      },
      demoUrl: "",
      sourceUrl: "https://github.com/ScarletWagon/Tv-Parental-Control"
    },
    aistudybuddy: {
      title: "AI Study Buddy",
      heroImage: "content/images/project 8/logo.png",
      description: "AI Study Buddy is an AI-powered study assistant designed to help students learn smarter, not harder. It offers intelligent flashcards, adaptive quizzes, and personalized study plans, leveraging artificial intelligence to identify knowledge gaps and optimize revision. With a clean, modern interface and seamless integration of AI tools, it transforms the way students prepare for exams and master new material.",
      features: [
        "Create and manage smart flashcards with AI-generated hints",
        "Adaptive quizzes that focus on weak areas",
        "Personalized study plans based on progress and goals",
        "Natural language Q&A with AI explanations",
        "Import notes and generate study questions automatically",
        "Track learning streaks and performance analytics",
        "Collaborative study groups and shared decks",
        "Responsive, mobile-friendly design",
        "Dark mode and accessibility options",
        "Open source and privacy-focused"
      ],
      screenshots: [
        "content/images/project 8/1.png",
        "content/images/project 8/2.png",
        "content/images/project 8/3.png",
        "content/images/project 8/4.png"
      ],
      technologies: {
        "Frontend": ["React", "JavaScript (ES6+)", "HTML5", "CSS3"],
        "AI": ["Google Gemini API", "Natural Language Processing"],
        "Features": ["Flashcards", "Quizzes", "Personalized Plans", "Analytics"]
      },
      demoUrl: "",
      sourceUrl: "https://github.com/ScarletWagon/AI-study-buddy"
    }
  };
  
  return projects[projectId] || null;
}

// ===== SCREENSHOT EXPAND FUNCTIONALITY =====
function createScreenshotOverlay() {
  let overlay = document.getElementById('screenshot-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'screenshot-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.95)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '2000';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.2s';
    overlay.style.visibility = 'hidden';
    overlay.innerHTML = '<img id="screenshot-expanded" style="max-width: 90vw; max-height: 90vh; width: auto; height: auto; border-radius: 12px; box-shadow: 0 0 40px rgba(0,0,0,0.5); cursor: pointer;" />';
    document.body.appendChild(overlay);
    // Close on click outside image
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeScreenshotOverlay();
    });
    // Close on Escape
    document.addEventListener('keydown', function escListener(e) {
      if (e.key === 'Escape' && overlay.style.visibility === 'visible') closeScreenshotOverlay();
    });
    // Close on click of the image itself
    overlay.querySelector('#screenshot-expanded').addEventListener('click', function(e) {
      e.stopPropagation();
      closeScreenshotOverlay();
    });
  }
  return overlay;
}

function openScreenshotOverlay(src) {
  const overlay = createScreenshotOverlay();
  const img = overlay.querySelector('#screenshot-expanded');
  img.src = src;
  overlay.style.visibility = 'visible';
  overlay.style.opacity = '1';
  document.body.style.overflow = 'hidden';
}

function closeScreenshotOverlay() {
  const overlay = document.getElementById('screenshot-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.style.visibility = 'hidden';
      document.body.style.overflow = '';
    }, 200);
  }
}

// Add click listeners to screenshots after project content is populated
function addScreenshotExpandListeners() {
  const screenshotsGrid = document.getElementById('screenshots-grid');
  if (!screenshotsGrid) return;
  screenshotsGrid.querySelectorAll('img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', function(e) {
      e.stopPropagation();
      openScreenshotOverlay(img.src);
    });
  });
}

// Patch populateProjectContent to call addScreenshotExpandListeners
const origPopulateProjectContent = populateProjectContent;
populateProjectContent = function(projectData) {
  origPopulateProjectContent(projectData);
  addScreenshotExpandListeners();
};

// ===== DOM CONTENT LOADED EVENT LISTENER =====
// Initialize all interactive functionality when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // ===== TAB NAVIGATION FUNCTIONALITY =====
  // Get all tab buttons and tab content panes
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  // Add click event listener to each tab button
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab'); // Get the target tab ID
      
      // Remove active class from all buttons and panes
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      
      // Add active class to clicked button and corresponding pane
      btn.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
    });
  });
  
  // ===== PROJECT CARD INTERACTIONS =====
  // Add click event listeners to all project cards
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const projectId = card.getAttribute('data-project'); // Get project ID from data attribute
      if (projectId) {
        openProject(projectId); // Open the project overlay
      }
    });
  });
  
  // ===== PROJECT OVERLAY INTERACTIONS =====
  // Get the project overlay element
  const overlay = document.getElementById('project-overlay');
  
  // Close overlay when clicking outside the content area
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeProject(); // Close the overlay
    }
  });
  
  // Close overlay when pressing the Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeProject(); // Close the overlay
    }
  });
  
  // ===== SKILL CARDS INTERACTIONS =====
  // Add hover effects and animations to skill cards
  initializeSkillCards();
});

// ===== SKILL CARDS FUNCTIONALITY =====
// Initialize interactive features for skill cards (optimized)
function initializeSkillCards() {
  // Get all skill cards once and cache the selection
  const skillCards = document.querySelectorAll('.skill-card');
  
  // Add click event for additional interaction (optional)
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.skill-card');
    if (card) {
      // Get the lines of code data
      const linesData = card.getAttribute('data-lines');
      if (linesData) {
        // You could add additional functionality here, like showing a tooltip
        // or triggering a more detailed animation
        console.log(`Lines of code: ${linesData}`);
      }
    }
  });
} 