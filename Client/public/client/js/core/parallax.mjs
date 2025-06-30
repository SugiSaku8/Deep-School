/**
 * Deep-School Parallax Effects System
 * Apple-inspired parallax and hover effects for all applications
 * 
 * Features:
 * - Hover lift effects with shadows
 * - Mouse movement parallax
 * - Touch device support
 * - Smooth animations
 * - Performance optimized
 * 
 * @version 1.0.0
 * @author Deep-School Team
 */

// Parallax effect configuration
const PARALLAX_CONFIG = {
  // Hover effects
  hover: {
    liftDistance: '8px',
    shadowBlur: '20px',
    shadowSpread: '0px',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    transitionDuration: '0.3s',
    transitionTiming: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  },
  
  // Mouse parallax effects
  mouse: {
    intensity: 0.02,
    maxOffset: 10,
    smoothness: 0.1
  },
  
  // Touch effects
  touch: {
    activeScale: 0.98,
    rippleDuration: 600,
    rippleColor: 'rgba(0, 122, 255, 0.3)'
  },
  
  // Performance settings
  performance: {
    throttleMs: 16, // ~60fps
    useTransform3d: true,
    enableReducedMotion: true
  }
};

// CSS classes for effects
const PARALLAX_CLASSES = {
  hover: 'ds-parallax-hover',
  mouse: 'ds-parallax-mouse',
  touch: 'ds-parallax-touch',
  disabled: 'ds-parallax-disabled'
};

/**
 * Main Parallax Effects Manager
 */
class ParallaxEffectsManager {
  constructor() {
    this.isInitialized = false;
    this.isEnabled = true;
    this.mouseX = 0;
    this.mouseY = 0;
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    this.elements = new Map();
    this.animationFrame = null;
    this.lastUpdate = 0;
    
    // Bind methods
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    
    // Check for reduced motion preference
    this.checkReducedMotion();
  }

  /**
   * Initialize the parallax effects system
   */
  init() {
    if (this.isInitialized) return;
    
    this.log({from: 'dp.sys.parallax.out', message: 'ParallaxEffectsManager: Initializing', level: 'info'});
    
    // Add event listeners
    this.addEventListeners();
    
    // Add global styles
    this.addGlobalStyles();
    
    // Initialize existing elements
    this.initializeElements();
    
    this.isInitialized = true;
    this.log({from: 'dp.sys.parallax.out', message: 'ParallaxEffectsManager: Initialized successfully', level: 'info'});
  }

  /**
   * Add event listeners for mouse and touch events
   */
  addEventListeners() {
    // Mouse movement
    document.addEventListener('mousemove', this.handleMouseMove, { passive: true });
    
    // Window resize
    window.addEventListener('resize', this.handleResize, { passive: true });
    
    // Touch events
    document.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    document.addEventListener('touchend', this.handleTouchEnd, { passive: true });
    
    // Visibility change (for performance)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
  }

  /**
   * Add global CSS styles for parallax effects
   */
  addGlobalStyles() {
    const styleId = 'ds-parallax-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Deep-School Parallax Effects */
      
      /* Base hover effects */
      .ds-parallax-hover {
        transition: transform ${PARALLAX_CONFIG.hover.transitionDuration} ${PARALLAX_CONFIG.hover.transitionTiming},
                    box-shadow ${PARALLAX_CONFIG.hover.transitionDuration} ${PARALLAX_CONFIG.hover.transitionTiming},
                    filter ${PARALLAX_CONFIG.hover.transitionDuration} ${PARALLAX_CONFIG.hover.transitionTiming};
        will-change: transform, box-shadow;
        transform: translateZ(0);
      }
      
      .ds-parallax-hover:hover {
        transform: translateY(-${PARALLAX_CONFIG.hover.liftDistance}) translateZ(0);
        box-shadow: 0 ${PARALLAX_CONFIG.hover.liftDistance} ${PARALLAX_CONFIG.hover.shadowBlur} ${PARALLAX_CONFIG.hover.shadowSpread} ${PARALLAX_CONFIG.hover.shadowColor};
        filter: brightness(1.02);
      }
      
      /* Mouse parallax effects */
      .ds-parallax-mouse {
        transition: transform 0.1s ease-out;
        will-change: transform;
        transform: translateZ(0);
      }
      
      /* Touch effects */
      .ds-parallax-touch {
        transition: transform 0.15s ease-out;
        will-change: transform;
        transform: translateZ(0);
      }
      
      .ds-parallax-touch:active {
        transform: scale(${PARALLAX_CONFIG.touch.activeScale}) translateZ(0);
      }
      
      /* Ripple effect */
      .ds-parallax-ripple {
        position: relative;
        overflow: hidden;
      }
      
      .ds-parallax-ripple::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: ${PARALLAX_CONFIG.touch.rippleColor};
        transform: translate(-50%, -50%);
        transition: width ${PARALLAX_CONFIG.touch.rippleDuration}ms ease-out,
                    height ${PARALLAX_CONFIG.touch.rippleDuration}ms ease-out,
                    opacity ${PARALLAX_CONFIG.touch.rippleDuration}ms ease-out;
        opacity: 0;
        pointer-events: none;
      }
      
      .ds-parallax-ripple.rippling::before {
        width: 200px;
        height: 200px;
        opacity: 1;
      }
      
      /* Disabled state */
      .ds-parallax-disabled {
        transition: none !important;
        transform: none !important;
        box-shadow: none !important;
        filter: none !important;
      }
      
      /* Dark mode adjustments */
      @media (prefers-color-scheme: dark) {
        .ds-parallax-hover:hover {
          box-shadow: 0 ${PARALLAX_CONFIG.hover.liftDistance} ${PARALLAX_CONFIG.hover.shadowBlur} ${PARALLAX_CONFIG.hover.shadowSpread} rgba(255, 255, 255, 0.1);
        }
      }
      
      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        .ds-parallax-hover,
        .ds-parallax-mouse,
        .ds-parallax-touch {
          transition: none !important;
          animation: none !important;
        }
        
        .ds-parallax-hover:hover {
          transform: none !important;
          box-shadow: none !important;
          filter: none !important;
        }
      }
      
      /* High contrast mode support */
      @media (prefers-contrast: high) {
        .ds-parallax-hover:hover {
          box-shadow: 0 ${PARALLAX_CONFIG.hover.liftDistance} ${PARALLAX_CONFIG.hover.shadowBlur} ${PARALLAX_CONFIG.hover.shadowSpread} rgba(0, 0, 0, 0.3);
        }
      }
      
      /* Performance optimizations */
      .ds-parallax-container {
        contain: layout style paint;
      }
      
      /* Specific element enhancements */
      .menu-item.ds-parallax-hover:hover {
        transform: translateY(-${PARALLAX_CONFIG.hover.liftDistance}) scale(1.02) translateZ(0);
      }
      
      .button-chalk.ds-parallax-hover:hover {
        transform: translateY(-${PARALLAX_CONFIG.hover.liftDistance}) scale(1.05) translateZ(0);
        box-shadow: 0 ${PARALLAX_CONFIG.hover.liftDistance} ${PARALLAX_CONFIG.hover.shadowBlur} ${PARALLAX_CONFIG.hover.shadowSpread} ${PARALLAX_CONFIG.hover.shadowColor},
                    0 0 0 1px rgba(0, 122, 255, 0.2);
      }
      
      .card.ds-parallax-hover:hover {
        transform: translateY(-${PARALLAX_CONFIG.hover.liftDistance}) translateZ(0);
        box-shadow: 0 ${PARALLAX_CONFIG.hover.liftDistance} ${PARALLAX_CONFIG.hover.shadowBlur} ${PARALLAX_CONFIG.hover.shadowSpread} ${PARALLAX_CONFIG.hover.shadowColor},
                    0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .estore-item.ds-parallax-hover:hover {
        transform: translateY(-${PARALLAX_CONFIG.hover.liftDistance}) scale(1.03) translateZ(0);
        box-shadow: 0 ${PARALLAX_CONFIG.hover.liftDistance} ${PARALLAX_CONFIG.hover.shadowBlur} ${PARALLAX_CONFIG.hover.shadowSpread} ${PARALLAX_CONFIG.hover.shadowColor},
                    0 8px 25px rgba(0, 0, 0, 0.15);
      }
      
      .setting-item.ds-parallax-hover:hover {
        transform: translateY(-2px) translateZ(0);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        background: rgba(0, 122, 255, 0.05);
      }
      
      .input-container.ds-parallax-hover:hover {
        transform: translateY(-2px) translateZ(0);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        border-color: rgba(0, 122, 255, 0.3);
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Initialize parallax effects on existing elements
   */
  initializeElements() {
    // Apply to common interactive elements
    const selectors = [
      '.menu-item',
      '.button-chalk',
      '.auto-btn',
      '.card',
      '.estore-item',
      '.setting-item',
      '.input-container',
      '.pickramu-select-card',
      '.pickramu-load-button',
      '.go-back-button',
      '.close-btn',
      '.submit-button',
      '.modal-post-btn',
      '.scr-post-icon-btn',
      '.new-chat-btn',
      '.estore-buy-btn'
    ];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        this.addParallaxEffects(element);
      });
    });

    this.log({from: 'dp.sys.parallax.out', message: `ParallaxEffectsManager: Initialized ${this.elements.size} elements`, level: 'info'});
  }

  /**
   * Add parallax effects to a specific element
   */
  addParallaxEffects(element, options = {}) {
    if (!element || this.elements.has(element)) return;

    const config = {
      hover: true,
      mouse: false,
      touch: true,
      ripple: false,
      ...options
    };

    // Add CSS classes
    if (config.hover) {
      element.classList.add(PARALLAX_CLASSES.hover);
    }
    if (config.mouse) {
      element.classList.add(PARALLAX_CLASSES.mouse);
    }
    if (config.touch) {
      element.classList.add(PARALLAX_CLASSES.touch);
    }
    if (config.ripple) {
      element.classList.add('ds-parallax-ripple');
    }

    // Store element configuration
    this.elements.set(element, {
      config,
      originalTransform: element.style.transform,
      originalBoxShadow: element.style.boxShadow
    });

    // Add touch ripple effect if enabled
    if (config.ripple) {
      element.addEventListener('touchstart', this.createRippleEffect.bind(this), { passive: true });
    }
  }

  /**
   * Remove parallax effects from an element
   */
  removeParallaxEffects(element) {
    if (!element || !this.elements.has(element)) return;

    const elementData = this.elements.get(element);
    
    // Remove CSS classes
    element.classList.remove(
      PARALLAX_CLASSES.hover,
      PARALLAX_CLASSES.mouse,
      PARALLAX_CLASSES.touch,
      'ds-parallax-ripple'
    );

    // Restore original styles
    element.style.transform = elementData.originalTransform;
    element.style.boxShadow = elementData.originalBoxShadow;

    // Remove from tracking
    this.elements.delete(element);
  }

  /**
   * Handle mouse movement for parallax effects
   */
  handleMouseMove(event) {
    if (!this.isEnabled || !this.isInitialized) return;

    const now = performance.now();
    if (now - this.lastUpdate < PARALLAX_CONFIG.performance.throttleMs) return;
    this.lastUpdate = now;

    this.mouseX = event.clientX;
    this.mouseY = event.clientY;

    // Update mouse parallax elements
    this.elements.forEach((data, element) => {
      if (data.config.mouse && element.classList.contains(PARALLAX_CLASSES.mouse)) {
        this.updateMouseParallax(element);
      }
    });
  }

  /**
   * Update mouse parallax effect for an element
   */
  updateMouseParallax(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (this.mouseX - centerX) * PARALLAX_CONFIG.mouse.intensity;
    const deltaY = (this.mouseY - centerY) * PARALLAX_CONFIG.mouse.intensity;

    const offsetX = Math.max(-PARALLAX_CONFIG.mouse.maxOffset, Math.min(PARALLAX_CONFIG.mouse.maxOffset, deltaX));
    const offsetY = Math.max(-PARALLAX_CONFIG.mouse.maxOffset, Math.min(PARALLAX_CONFIG.mouse.maxOffset, deltaY));

    const transform = `translate(${offsetX}px, ${offsetY}px) translateZ(0)`;
    element.style.transform = transform;
  }

  /**
   * Handle window resize
   */
  handleResize() {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
  }

  /**
   * Handle touch start events
   */
  handleTouchStart(event) {
    if (!this.isEnabled) return;

    const element = event.target.closest(`.${PARALLAX_CLASSES.touch}`);
    if (element) {
      element.style.transform = `scale(${PARALLAX_CONFIG.touch.activeScale}) translateZ(0)`;
    }
  }

  /**
   * Handle touch end events
   */
  handleTouchEnd(event) {
    if (!this.isEnabled) return;

    const element = event.target.closest(`.${PARALLAX_CLASSES.touch}`);
    if (element) {
      element.style.transform = 'translateZ(0)';
    }
  }

  /**
   * Create ripple effect on touch
   */
  createRippleEffect(event) {
    const element = event.currentTarget;
    element.classList.add('rippling');

    setTimeout(() => {
      element.classList.remove('rippling');
    }, PARALLAX_CONFIG.touch.rippleDuration);
  }

  /**
   * Check for reduced motion preference
   */
  checkReducedMotion() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.disable();
      this.log({from: 'dp.sys.parallax.out', message: 'ParallaxEffectsManager: Disabled due to reduced motion preference', level: 'info'});
    }
  }

  /**
   * Enable parallax effects
   */
  enable() {
    this.isEnabled = true;
    document.body.classList.remove(PARALLAX_CLASSES.disabled);
    this.log({from: 'dp.sys.parallax.out', message: 'ParallaxEffectsManager: Enabled', level: 'info'});
  }

  /**
   * Disable parallax effects
   */
  disable() {
    this.isEnabled = false;
    document.body.classList.add(PARALLAX_CLASSES.disabled);
    this.log({from: 'dp.sys.parallax.out', message: 'ParallaxEffectsManager: Disabled', level: 'info'});
  }

  /**
   * Pause animations (when tab is not visible)
   */
  pause() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Resume animations
   */
  resume() {
    if (!this.animationFrame && this.isEnabled) {
      this.animationFrame = requestAnimationFrame(this.update.bind(this));
    }
  }

  /**
   * Update loop for continuous effects
   */
  update() {
    if (!this.isEnabled) return;

    // Update any continuous effects here
    this.animationFrame = requestAnimationFrame(this.update.bind(this));
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.pause();
    
    // Remove event listeners
    document.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('touchstart', this.handleTouchStart);
    document.removeEventListener('touchend', this.handleTouchEnd);
    
    // Remove all effects
    this.elements.forEach((data, element) => {
      this.removeParallaxEffects(element);
    });
    
    // Remove global styles
    const styleElement = document.getElementById('ds-parallax-styles');
    if (styleElement) {
      styleElement.remove();
    }
    
    this.isInitialized = false;
    this.log({from: 'dp.sys.parallax.out', message: 'ParallaxEffectsManager: Destroyed', level: 'info'});
  }

  /**
   * Log messages using Deep-School logging system
   */
  log({from, message, level = 'info'}) {
    if (window.ds && window.ds.log) {
      window.ds.log({from, message, level});
    } else {
      console.log(`[ParallaxEffectsManager] ${message}`);
    }
  }
}

// Create and export the global instance
const parallaxManager = new ParallaxEffectsManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    parallaxManager.init();
  });
} else {
  parallaxManager.init();
}

// Export for use in other modules
export { parallaxManager, ParallaxEffectsManager, PARALLAX_CONFIG, PARALLAX_CLASSES };

// Make available globally
window.parallaxManager = parallaxManager; 