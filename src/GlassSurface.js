// Helper to convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
}

export class GlassSurface {
  constructor(element, options = {}) {
    this.element = element;
    
    // Default options mapped to the new SVG 2D displacement approach
    this.options = Object.assign({
      displacementScale: 20,
      blurAmount: 5,
      chromaticAberration: 3,   
      edgeHighlightIntensity: 1.0, 
      bulge: 0.0,
      noiseFrequency: 0.04,
      lensStrength: 1.0,        // Strength of the outward push from cursor
      edgeCurvature: 0,         // Width in pixels of the sharp edge rim (0 = disabled)
      enableMouseTracking: true,// Whether the lens follows the cursor
      borderRadius: 24,         // Border radius of the panel (in px)
      tintColor: '#ffffff',     // Base color of the glass
      tintIntensity: 0.05,      // Opacity of the base color
      edgeGlowColor: '#ffffff'  // Color of the edge highlight
    }, options);
    
    // Mouse state
    this.mouse = { x: 0.5, y: 0.5 };
    this.targetMouse = { x: 0.5, y: 0.5 };
    this.isHovered = false;
    this.animationId = null;
    
    this.filterId = `glass-filter-${Math.random().toString(36).substr(2, 9)}`;
    this.initSVG();
    this.updateStyles();
    
    this.bindEvents();
    
    this.resizeObserver = new ResizeObserver(() => {
      this.updateFilter();
    });
    this.resizeObserver.observe(this.element);
  }

  bindEvents() {
    this.element.addEventListener('pointermove', (e) => {
      if (!this.options.enableMouseTracking) return;
      const rect = this.element.getBoundingClientRect();
      // Normalize mouse coordinates 0-1
      this.targetMouse.x = (e.clientX - rect.left) / rect.width;
      this.targetMouse.y = (e.clientY - rect.top) / rect.height;
      this.isHovered = true;
      
      this.startAnimationLoop();
    });
    
    this.element.addEventListener('pointerleave', () => {
      if (!this.options.enableMouseTracking) return;
      // Ease back to center
      this.targetMouse.x = 0.5;
      this.targetMouse.y = 0.5;
      this.isHovered = false;
      this.startAnimationLoop();
    });
  }

  startAnimationLoop() {
    if (!this.animationId) {
      this.tick();
    }
  }

  tick = () => {
    // Lerp mouse
    const dx = this.targetMouse.x - this.mouse.x;
    const dy = this.targetMouse.y - this.mouse.y;
    
    this.mouse.x += dx * 0.1;
    this.mouse.y += dy * 0.1;
    
    // If we've reached the target closely enough, and we aren't hovered, we can stop the loop
    if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
      this.mouse.x = this.targetMouse.x;
      this.mouse.y = this.targetMouse.y;
      if (!this.isHovered && this.mouse.x === 0.5 && this.mouse.y === 0.5) {
        this.animationId = null;
        return; // stop loop
      }
    }
    
    // Update the base64 SVG normal map if we are using the bulge
    if (this.options.bulge > 0) {
      this.updateFilter();
    }
    
    this.animationId = requestAnimationFrame(this.tick);
  }

  generateNormalMap(width, height) {
    const maxRes = 64; // Low res for 60fps performance! 64x64 is plenty since it scales smoothly via feImage
    const scale = Math.min(1, maxRes / Math.max(width, height));
    const cw = Math.max(1, Math.ceil(width * scale));
    const ch = Math.max(1, Math.ceil(height * scale));
    
    if (!this.normalCanvas) {
      this.normalCanvas = document.createElement('canvas');
      this.normalCtx = this.normalCanvas.getContext('2d');
    }
    if (this.normalCanvas.width !== cw || this.normalCanvas.height !== ch) {
      this.normalCanvas.width = cw;
      this.normalCanvas.height = ch;
    }
    
    // We recreate ImageData to ensure a clean buffer
    const imgData = this.normalCtx.createImageData(cw, ch);
    const data = imgData.data;
    
    // Check if it's a circle (borderRadius >= half of width/height)
    let br = this.options.borderRadius;
    if (br >= Math.min(width, height) / 2) {
       br = Math.min(width, height) / 2;
    }
    
    // Mouse center in physical pixels
    const cx = width * this.mouse.x;
    const cy = height * this.mouse.y;
    const halfW = width / 2;
    const halfH = height / 2;
    
    const { lensStrength, edgeCurvature } = this.options;
    const maxDist = Math.max(width, height);
    
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        // Pixel coords relative to element scale
        const px = x / scale;
        const py = y / scale;
        
        // Direction from mouse
        const dx = px - cx;
        const dy = py - cy;
        const distToMouse = Math.sqrt(dx*dx + dy*dy);
        
        const nx = distToMouse > 0 ? dx / distToMouse : 0;
        const ny = distToMouse > 0 ? dy / distToMouse : 0;
        
        // SDF for rounded box
        const sdfX = px - halfW;
        const sdfY = py - halfH;
        const qx = Math.abs(sdfX) - halfW + br;
        const qy = Math.abs(sdfY) - halfH + br;
        const mx = Math.max(qx, 0);
        const my = Math.max(qy, 0);
        const distToEdge = -(Math.sqrt(mx*mx + my*my) + Math.min(Math.max(qx, qy), 0) - br);
        
        // Magnitude based on distance from mouse
        let magnitude = (distToMouse / (maxDist * 0.8)) * lensStrength;
        
        // Add steep edge curvature if specified
        if (edgeCurvature > 0 && distToEdge > 0 && distToEdge < edgeCurvature) {
          const edgeFactor = 1 - (distToEdge / edgeCurvature); // 0 at inner, 1 at very edge
          magnitude += Math.pow(edgeFactor, 3) * 1.5; // Steep spike at the rim
        }
        
        // Smooth falloff to 0 outside the rounded rect (to prevent artifacts leaking in)
        if (distToEdge < 0) {
           magnitude = 0;
        }

        magnitude = Math.min(1.0, magnitude);
        
        const i = (y * cw + x) * 4;
        data[i] = (nx * magnitude * 127) + 128;     // R (X)
        data[i + 1] = (ny * magnitude * 127) + 128; // G (Y)
        data[i + 2] = 255;
        data[i + 3] = 255;
      }
    }
    
    this.normalCtx.putImageData(imgData, 0, 0);
    return this.normalCanvas.toDataURL('image/png');
  }

  initSVG() {
    this.svgContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svgContainer.style.position = 'absolute';
    this.svgContainer.style.width = '0';
    this.svgContainer.style.height = '0';
    this.svgContainer.setAttribute('aria-hidden', 'true');
    
    this.filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    this.filter.setAttribute("id", this.filterId);
    
    this.filter.setAttribute("x", "-20%");
    this.filter.setAttribute("y", "-20%");
    this.filter.setAttribute("width", "140%");
    this.filter.setAttribute("height", "140%");
    this.filter.setAttribute("filterUnits", "objectBoundingBox");
    this.filter.setAttribute("primitiveUnits", "userSpaceOnUse");
    
    this.svgContainer.appendChild(this.filter);
    document.body.appendChild(this.svgContainer);
  }

  updateFilter() {
    this.filter.innerHTML = '';
    
    const { displacementScale, chromaticAberration, bulge, noiseFrequency } = this.options;
    const rect = this.element.getBoundingClientRect();
    const width = rect.width || 100;
    const height = rect.height || 100;
    
    if (bulge > 0) {
      const encodedImg = this.generateNormalMap(width, height);
      this.filter.innerHTML += `
        <feImage href="${encodedImg}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="none" result="dispMap" />
      `;
    } else {
      this.filter.innerHTML += `
        <feTurbulence type="fractalNoise" baseFrequency="${noiseFrequency}" numOctaves="2" result="dispMap" />
      `;
    }
    
    this.filter.innerHTML += `
      <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
      <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
      <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
      
      <feDisplacementMap in="red" in2="dispMap" scale="${displacementScale + chromaticAberration}" xChannelSelector="R" yChannelSelector="G" result="dispRed" />
      <feDisplacementMap in="green" in2="dispMap" scale="${displacementScale}" xChannelSelector="R" yChannelSelector="G" result="dispGreen" />
      <feDisplacementMap in="blue" in2="dispMap" scale="${Math.max(0, displacementScale - chromaticAberration)}" xChannelSelector="R" yChannelSelector="G" result="dispBlue" />
      
      <feComposite in="dispRed" in2="dispGreen" operator="arithmetic" k2="1" k3="1" result="rg" />
      <feComposite in="rg" in2="dispBlue" operator="arithmetic" k2="1" k3="1" result="final" />
    `;
  }

  updateStyles() {
    this.updateFilter();
    
    const { blurAmount, edgeHighlightIntensity } = this.options;
    
    this.element.style.backdropFilter = `url(#${this.filterId}) blur(${blurAmount}px)`;
    this.element.style.webkitBackdropFilter = `url(#${this.filterId}) blur(${blurAmount}px)`;
    
    const glow = this.options.edgeHighlightIntensity;
    const gColor = hexToRgb(this.options.edgeGlowColor);
    
    const highlight = `rgba(${gColor.r}, ${gColor.g}, ${gColor.b}, ${Math.min(1, 0.6 * glow)})`;
    const shadow = `rgba(0, 0, 0, ${Math.min(1, 0.4 * glow)})`;
    const edgeGlow = `rgba(${gColor.r}, ${gColor.g}, ${gColor.b}, ${Math.min(1, 0.2 * glow)})`;
    
    this.element.style.boxShadow = `
      inset 1px 1px 4px ${highlight},
      inset -1px -1px 4px ${shadow},
      0 0 0 1px ${edgeGlow},
      0 12px 40px rgba(0, 0, 0, 0.3)
    `;
    
    const tColor = hexToRgb(this.options.tintColor);
    this.element.style.backgroundColor = `rgba(${tColor.r}, ${tColor.g}, ${tColor.b}, ${this.options.tintIntensity})`;
    this.element.style.transform = 'translateZ(0)';
  }

  updateUniforms() {
    this.updateStyles();
  }

  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.svgContainer && this.svgContainer.parentNode) {
      this.svgContainer.parentNode.removeChild(this.svgContainer);
    }
  }
}
