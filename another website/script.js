// ===== FIREFLIES ANIMATION SETUP =====
// Get the canvas element and its 2D rendering context for drawing fireflies
const canvas = document.getElementById('fireflies-bg');
const ctx = canvas.getContext('2d');

// Set initial canvas dimensions to match the window size
let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

// ===== ANIMATION CONSTANTS =====
// Number of fireflies to create for the background animation (reduced for performance)
const FIREFLY_COUNT = 150;
// Size range for fireflies (in pixels) - controls how big each firefly appears
const FIREFLY_MIN_RADIUS = 3;
const FIREFLY_MAX_RADIUS = 5;
// Movement speed range for fireflies (pixels per frame) - controls how fast they move
const FIREFLY_MIN_SPEED = 0.5;
const FIREFLY_MAX_SPEED = 0.7;
// Glow intensity range (0-1) - controls how bright each firefly appears
const GLOW_MIN = 0.7;
const GLOW_MAX = 1.0;
// Speed of glow transitions (natural breathing effect)
const GLOW_SPEED = 0.006;
// Distance from mouse where fireflies start reacting (in pixels)
const MOUSE_REACT_DIST = 80;
// Force multiplier for mouse repulsion - how strongly fireflies escape from mouse
const MOUSE_PUSH = 5;
// Performance optimization: skip frames for smoother animation
const FRAME_SKIP = 2;

// ===== MOUSE TRACKING =====
// Store mouse position (start off-screen to avoid initial interactions)
let mouse = { x: -1000, y: -1000 };

// ===== WINDOW RESIZE HANDLING =====
// Update canvas size when window is resized to maintain full coverage
window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
});

// ===== MOUSE EVENT LISTENERS =====
// Optimized mouse tracking with throttling for better performance
let mouseUpdateTimeout;

// Track mouse movement with throttling to reduce performance impact
document.addEventListener('mousemove', e => {
  // Throttle mouse updates to every 16ms (60fps) for better performance
  if (!mouseUpdateTimeout) {
    mouseUpdateTimeout = setTimeout(() => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouseUpdateTimeout = null;
    }, 16);
  }
});

// Reset mouse position when leaving document (fireflies stop reacting)
document.addEventListener('mouseleave', () => {
  mouse.x = -1000;
  mouse.y = -1000;
});

// ===== UTILITY FUNCTIONS =====
// Generate a random number between two values (inclusive of min, exclusive of max)
function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

// ===== FIREFLY CLASS =====
// Class to manage individual firefly behavior and rendering
class Firefly {
  constructor() {
    this.reset(); // Initialize firefly with random properties
  }
  
  // Reset firefly to random initial state with all properties
  reset() {
    // Random starting position within canvas bounds
    this.x = randomBetween(0, width);
    this.y = randomBetween(0, height);
    
    // Random size within defined range for visual variety
    this.radius = randomBetween(FIREFLY_MIN_RADIUS, FIREFLY_MAX_RADIUS);
    this.baseRadius = this.radius; // Store original radius for reference
    
    // Random movement direction (0 to 2π radians for full circle)
    this.angle = randomBetween(0, Math.PI * 2);
    
    // Random movement speed for natural variation
    this.speed = randomBetween(FIREFLY_MIN_SPEED, FIREFLY_MAX_SPEED);
    
    // Random initial glow state and direction
    this.glow = randomBetween(GLOW_MIN, GLOW_MAX);
    this.glowDir = Math.random() > 0.5 ? 1 : -1; // Random glow direction (brighten/dim)
    this.glowSpeed = randomBetween(0.5, 1.2); // Individual glow speed variation
    
    // Firefly color (red theme to match portfolio design)
    this.color = 'rgba(229,57,53,1)'; // Red color
    
    // Direction change timing for natural movement patterns
    this.changeDirectionTimer = 0;
    this.maxChangeDirectionTime = randomBetween(300, 800); // Longer intervals for slower movement
    
    // Natural breathing effect variables for realistic glow
    this.breathingTimer = 0;
    this.breathingInterval = randomBetween(100, 300); // Random breathing intervals
  }
  
  // Update firefly position, glow, and behavior each frame (optimized)
  update() {
    // ===== OPTIMIZED NATURAL BREATHING EFFECT =====
    // Handle natural breathing/glow cycle with reduced frequency
    this.breathingTimer++;
    if (this.breathingTimer > this.breathingInterval) {
      this.glowDir = Math.random() > 0.5 ? 1 : -1;
      this.breathingTimer = 0;
      this.breathingInterval = randomBetween(150, 400); // Longer intervals for better performance
    }
    
    // ===== OPTIMIZED NATURAL MOVEMENT =====
    // Increment direction change timer
    this.changeDirectionTimer++;
    
    // Randomly change direction at intervals for natural movement
    if (this.changeDirectionTimer > this.maxChangeDirectionTime) {
      this.angle += randomBetween(-0.15, 0.15); // Smaller direction changes
      this.changeDirectionTimer = 0;
      this.maxChangeDirectionTime = randomBetween(400, 1000); // Longer intervals
    }
    
    // ===== OPTIMIZED MOUSE INTERACTION =====
    // Use squared distance to avoid expensive square root calculation
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const distSquared = dx * dx + dy * dy;
    const reactDistSquared = MOUSE_REACT_DIST * MOUSE_REACT_DIST;
    
    // Check if mouse is within reaction distance and on screen
    if (distSquared < reactDistSquared && mouse.x > 0 && mouse.y > 0) {
      // Calculate force based on proximity (closer = stronger effect)
      const dist = Math.sqrt(distSquared); // Only calculate sqrt when needed
      const force = (MOUSE_REACT_DIST - dist) / MOUSE_REACT_DIST;
      const angleFromMouse = Math.atan2(dy, dx);
      
      // Fireflies bounce away from mouse
      const escapeSpeed = MOUSE_PUSH * force;
      this.x += Math.cos(angleFromMouse) * escapeSpeed;
      this.y += Math.sin(angleFromMouse) * escapeSpeed;
      
      // Override natural movement when escaping
      this.angle = angleFromMouse;
      
      // Glow brighter when escaping from mouse
      this.glow = Math.min(GLOW_MAX * 1.8, this.glow + 0.08);
    } else {
      // ===== OPTIMIZED NATURAL GLOW CYCLE =====
      // Update glow intensity based on direction and speed
      this.glow += this.glowDir * GLOW_SPEED * this.glowSpeed;
      
      // Reverse direction when reaching glow limits
      if (this.glow > GLOW_MAX) {
        this.glow = GLOW_MAX;
        this.glowDir = -1;
        this.glowSpeed = randomBetween(0.6, 1.0); // Reduced variation
      }
      if (this.glow < GLOW_MIN) {
        this.glow = GLOW_MIN;
        this.glowDir = 1;
        this.glowSpeed = randomBetween(0.6, 1.0); // Reduced variation
      }
    }
    
    // ===== OPTIMIZED NATURAL MOVEMENT =====
    // Only apply natural movement if not escaping from mouse
    if (distSquared >= reactDistSquared || mouse.x <= 0) {
      // Move firefly in current direction
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
    }
    
    // ===== OPTIMIZED BOUNDARY HANDLING =====
    // Simplified boundary handling for better performance
    if (this.x < 0) {
      this.x = 0;
      this.angle = randomBetween(-Math.PI/2, Math.PI/2);
    } else if (this.x > width) {
      this.x = width;
      this.angle = randomBetween(Math.PI/2, 3*Math.PI/2);
    }
    
    if (this.y < 0) {
      this.y = 0;
      this.angle = randomBetween(0, Math.PI);
    } else if (this.y > height) {
      this.y = height;
      this.angle = randomBetween(Math.PI, 2*Math.PI);
    }
  }
  
  // Render the firefly on the canvas (optimized)
  draw(ctx) {
    // ===== OPTIMIZED RENDERING =====
    // Skip rendering if firefly is too dim to be visible
    if (this.glow < 0.1) return;
    
    // ===== CREATE OPTIMIZED GLOWING DOT =====
    // Simplified gradient for better performance
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.radius * 2.5 // Reduced glow size for performance
    );
    
    // Simplified gradient stops for better performance
    gradient.addColorStop(0, `rgba(229, 57, 53, ${this.glow})`);
    gradient.addColorStop(0.6, `rgba(229, 57, 53, ${this.glow * 0.4})`);
    gradient.addColorStop(1, 'rgba(229, 57, 53, 0)');
    
    // ===== OPTIMIZED RENDERING CONTEXT =====
    ctx.globalAlpha = this.glow;
    ctx.shadowColor = 'rgba(229, 57, 53, 0.7)';
    ctx.shadowBlur = 20 * this.glow; // Reduced shadow blur for performance
    
    // ===== DRAW OPTIMIZED GLOWING DOT =====
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Reset global alpha to avoid affecting other elements
    ctx.globalAlpha = 1;
  }
}

// ===== CREATE FIREFLIES =====
// Create array of firefly objects
const fireflies = Array.from({ length: FIREFLY_COUNT }, () => new Firefly());

// ===== OPTIMIZED ANIMATION LOOP =====
// Performance tracking variables
let frameCount = 0;
let lastTime = 0;

// Main animation function with performance optimizations
function animate(currentTime) {
  // Frame skipping for better performance on slower devices
  frameCount++;
  if (frameCount % FRAME_SKIP !== 0) {
    requestAnimationFrame(animate);
    return;
  }
  
  // Clear the entire canvas
  ctx.clearRect(0, 0, width, height);
  
  // Update and draw each firefly
  for (const f of fireflies) {
    f.update(); // Update position, glow, and behavior
    f.draw(ctx); // Render the firefly on canvas
  }
  
  // Request next frame for smooth animation
  requestAnimationFrame(animate);
}

// Start the optimized animation loop
animate();



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
  document.getElementById('demo-btn').href = projectData.demoUrl;
  document.getElementById('source-btn').href = projectData.sourceUrl;
  
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
      title: "Project Alpha",
      heroImage: "https://via.placeholder.com/800x400/e53935/ffffff?text=Project+Alpha",
      description: "A comprehensive full-stack e-commerce solution built with modern web technologies. This platform provides a complete online shopping experience with user authentication, product management, shopping cart functionality, and secure payment processing.",
      features: [
        "User authentication and authorization",
        "Product catalog with search and filtering",
        "Shopping cart and wishlist functionality",
        "Secure payment processing with Stripe",
        "Admin dashboard for product management",
        "Order tracking and history",
        "Responsive design for all devices"
      ],
      screenshots: [
        "https://via.placeholder.com/300x200/e53935/ffffff?text=Home+Page",
        "https://via.placeholder.com/300x200/e53935/ffffff?text=Product+Page",
        "https://via.placeholder.com/300x200/e53935/ffffff?text=Cart",
        "https://via.placeholder.com/300x200/e53935/ffffff?text=Admin+Panel"
      ],
      technologies: {
        "Frontend": ["React.js", "Redux for state management", "Styled Components", "React Router"],
        "Backend": ["Node.js", "Express.js", "JWT Authentication", "RESTful API"],
        "Database": ["MongoDB", "Mongoose ODM", "MongoDB Atlas"],
        "Services": ["Stripe Payment", "AWS S3 for images", "SendGrid for emails"]
      },
      demoUrl: "#",
      sourceUrl: "#"
    },
    
    taskmanager: {
      title: "Project Beta",
      heroImage: "https://via.placeholder.com/800x400/e53935/ffffff?text=Project+Beta",
      description: "A collaborative task management application designed for teams to organize, track, and complete projects efficiently with real-time updates and seamless communication features.",
      features: [
        "Create, assign, and track tasks with priority levels",
        "Kanban board view for visual project management",
        "Real-time collaboration with team members",
        "Instant notifications and comments system",
        "File sharing capabilities for seamless teamwork",
        "Comprehensive analytics dashboard",
        "Project progress tracking and reporting"
      ],
      screenshots: [
        "https://via.placeholder.com/300x200/e53935/ffffff?text=Dashboard",
        "https://via.placeholder.com/300x200/e53935/ffffff?text=Kanban+Board",
        "https://via.placeholder.com/300x200/e53935/ffffff?text=Task+Details",
        "https://via.placeholder.com/300x200/e53935/ffffff?text=Analytics"
      ],
      technologies: {
        "Frontend": ["Vue.js", "Vuex for state management", "Vue Router", "Chart.js"],
        "Backend": ["Node.js", "Express.js", "Socket.io", "JWT Authentication"],
        "Database": ["PostgreSQL", "Sequelize ORM", "Redis for caching"],
        "Services": ["AWS S3", "SendGrid", "WebSocket connections"]
      },
      demoUrl: "#",
      sourceUrl: "#"
    },
    
    portfolio: {
      title: "Project Gamma",
      heroImage: "https://via.placeholder.com/800x400/e53935/ffffff?text=Project+Gamma",
      description: "An interactive portfolio website featuring an animated fireflies background that creates an immersive and engaging user experience while showcasing professional work and skills.",
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
        "https://via.placeholder.com/300x200/e53935/ffffff?text=Home+Page",
        "https://via.placeholder.com/300x200/e53935/ffffff?text=Projects+View",
        "https://via.placeholder.com/300x200/e53935/ffffff?text=Skills+Section",
        "https://via.placeholder.com/300x200/e53935/ffffff?text=Mobile+View"
      ],
      technologies: {
        "Frontend": ["HTML5", "CSS3", "JavaScript (ES6+)", "Canvas API"],
        "Styling": ["CSS Grid", "Flexbox", "CSS Animations", "Backdrop Filter"],
        "Features": ["Responsive Design", "Interactive Animations", "Modern UI/UX", "Cross-browser Support"]
      },
      demoUrl: "#",
      sourceUrl: "#"
    }
  };
  
  return projects[projectId] || null;
}

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