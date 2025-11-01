/**
 * Sidebar Button Variants Utility
 * Easily switch between three beautiful design variants for the sidebar buttons
 */

export class SidebarButtonVariants {
  static VARIANTS = {
    DEFAULT: 'default',
    GLASSMORPHISM: 'variant-1',
    NEUMORPHIC: 'variant-2', 
    GRADIENT_CARDS: 'variant-3'
  };

  /**
   * Apply a specific variant to the sidebar buttons
   * @param {string} variant - The variant to apply (use SidebarButtonVariants.VARIANTS)
   */
  static applyVariant(variant) {
    const sidebarButtons = document.querySelector('.sidebar-buttons');
    if (!sidebarButtons) {
      console.warn('Sidebar buttons container not found');
      return;
    }

    // Remove all variant classes
    Object.values(this.VARIANTS).forEach(v => {
      sidebarButtons.classList.remove(v);
    });

    // Add the selected variant class
    if (variant !== this.VARIANTS.DEFAULT) {
      sidebarButtons.classList.add(variant);
    }

    // Save preference to localStorage
    localStorage.setItem('sidebarButtonVariant', variant);
    
    console.log(`Applied sidebar button variant: ${variant}`);
  }

  /**
   * Get the currently applied variant
   * @returns {string} The current variant class
   */
  static getCurrentVariant() {
    const sidebarButtons = document.querySelector('.sidebar-buttons');
    if (!sidebarButtons) return this.VARIANTS.DEFAULT;

    for (const variant of Object.values(this.VARIANTS)) {
      if (sidebarButtons.classList.contains(variant)) {
        return variant;
      }
    }
    return this.VARIANTS.DEFAULT;
  }

  /**
   * Initialize with saved preference or default
   */
  static initialize() {
    const savedVariant = localStorage.getItem('sidebarButtonVariant') || this.VARIANTS.GRADIENT_CARDS;
    this.applyVariant(savedVariant);
  }

  /**
   * Cycle through variants (useful for testing)
   */
  static cycleVariant() {
    const current = this.getCurrentVariant();
    const variants = Object.values(this.VARIANTS);
    const currentIndex = variants.indexOf(current);
    const nextIndex = (currentIndex + 1) % variants.length;
    this.applyVariant(variants[nextIndex]);
  }

  /**
   * Create a variant selector UI (for development/testing)
   */
  static createVariantSelector() {
    const selector = document.createElement('div');
    selector.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 1000;
      font-size: 12px;
    `;

    selector.innerHTML = `
      <div style="margin-bottom: 8px; font-weight: bold;">Sidebar Button Variants:</div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        ${Object.entries(this.VARIANTS).map(([key, value]) => `
          <button onclick="SidebarButtonVariants.applyVariant('${value}')" 
                  style="padding: 4px 8px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; font-size: 11px;">
            ${key.replace(/_/g, ' ')}
          </button>
        `).join('')}
      </div>
    `;

    document.body.appendChild(selector);
    return selector;
  }
}

// Make available globally for easy access
window.SidebarButtonVariants = SidebarButtonVariants; 