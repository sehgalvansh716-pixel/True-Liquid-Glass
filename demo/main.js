import { GlassSurface } from '../src/index.js';

document.addEventListener('DOMContentLoaded', () => {
  const activePanelEl = document.getElementById('active-panel');
  const panelTitle = document.getElementById('panel-title');
  const panelDesc = document.getElementById('panel-desc');
  const specularLight = document.getElementById('specular-light');
  const bgContainer = document.getElementById('bg-container');
  
  const presetSelect = document.getElementById('preset-select');
  const shapeButtons = document.querySelectorAll('.shape-buttons button');
  const bgButtons = document.querySelectorAll('.bg-thumbnails button');

  // Input Elements
  const inputs = {
    enableMouseTracking: document.getElementById('inp-trackMouse'),
    tintColor: document.getElementById('inp-tintColor'),
    tintIntensity: document.getElementById('inp-tintIntensity'),
    edgeGlowColor: document.getElementById('inp-edgeGlowColor'),
    displacementScale: document.getElementById('inp-displacement'),
    chromaticAberration: document.getElementById('inp-chromatic'),
    blurAmount: document.getElementById('inp-blur'),
    edgeHighlightIntensity: document.getElementById('inp-edgeGlow'),
    bulge: document.getElementById('inp-bulge'),
    lensStrength: document.getElementById('inp-lens'),
    edgeCurvature: document.getElementById('inp-curvature')
  };

  // Value Display Elements
  const displays = {
    tintIntensity: document.getElementById('val-tintIntensity'),
    displacementScale: document.getElementById('val-displacement'),
    chromaticAberration: document.getElementById('val-chromatic'),
    blurAmount: document.getElementById('val-blur'),
    edgeHighlightIntensity: document.getElementById('val-edgeGlow'),
    lensStrength: document.getElementById('val-lens'),
    edgeCurvature: document.getElementById('val-curvature')
  };

  const presets = {
    thick: {
      title: 'Thick Chromatic',
      desc: 'High chromatic aberration and scale for a thick glass look.',
      options: {
        displacementScale: 40,
        blurAmount: 2,
        chromaticAberration: 15,
        edgeHighlightIntensity: 1.5,
        bulge: 1.0, 
        noiseFrequency: 0.02,
        lensStrength: 1.0,
        edgeCurvature: 0,
        enableMouseTracking: true,
        tintColor: '#ffffff',
        tintIntensity: 0.05,
        edgeGlowColor: '#ffffff'
      },
      specular: false
    },
    frosted: {
      title: 'Frosted Thin',
      desc: 'High blur, noise-based displacement, minimal chromatic aberration.',
      options: {
        displacementScale: 15,
        blurAmount: 6,
        chromaticAberration: 2,
        edgeHighlightIntensity: 0.8,
        bulge: 0.0,
        noiseFrequency: 0.02,
        lensStrength: 1.0,
        edgeCurvature: 0,
        enableMouseTracking: false,
        tintColor: '#ffffff',
        tintIntensity: 0.05,
        edgeGlowColor: '#ffffff'
      },
      specular: false
    },
    bubble: {
      title: 'Liquid Bubble',
      desc: 'Very high bulge factor, acts like a drop of water. Tracks your mouse!',
      options: {
        displacementScale: 60,
        blurAmount: 0,
        chromaticAberration: 4,
        edgeHighlightIntensity: 2.0,
        bulge: 1.0, 
        noiseFrequency: 0.01,
        lensStrength: 1.0,
        edgeCurvature: 0,
        enableMouseTracking: true,
        tintColor: '#ffffff',
        tintIntensity: 0.0,
        edgeGlowColor: '#ffffff'
      },
      specular: false
    },
    trueLiquid: {
      title: 'True Liquid Glass',
      desc: 'A physically-inspired liquid lens with steep edge curvature and static highlight.',
      options: {
        displacementScale: 80,
        blurAmount: 0,
        chromaticAberration: 6,
        edgeHighlightIntensity: 2.5,
        bulge: 1.0, 
        noiseFrequency: 0.01,
        lensStrength: 2.5,
        edgeCurvature: 15,
        enableMouseTracking: true,
        tintColor: '#ffffff',
        tintIntensity: 0.0,
        edgeGlowColor: '#ffffff'
      },
      specular: true
    },
    crystal: {
      title: 'Crystal Clear',
      desc: 'Pure, flawless water drop. High displacement, zero blur or chromatic aberration.',
      options: {
        displacementScale: 90,
        blurAmount: 0,
        chromaticAberration: 0,
        edgeHighlightIntensity: 1.2,
        bulge: 1.0, 
        noiseFrequency: 0.01,
        lensStrength: 1.8,
        edgeCurvature: 5,
        enableMouseTracking: true,
        tintColor: '#ffffff',
        tintIntensity: 0.0,
        edgeGlowColor: '#ffffff'
      },
      specular: false
    },
    opal: {
      title: 'Opal Glass',
      desc: 'Heavy, milky blur with a strong, solid glowing rim.',
      options: {
        displacementScale: 10,
        blurAmount: 15,
        chromaticAberration: 2,
        edgeHighlightIntensity: 3.5,
        bulge: 0.0, 
        noiseFrequency: 0.03,
        lensStrength: 1.0,
        edgeCurvature: 0,
        enableMouseTracking: false,
        tintColor: '#f1f5f9',
        tintIntensity: 0.2,
        edgeGlowColor: '#ffffff'
      },
      specular: false
    },
    glitch: {
      title: 'Glitch Distortion',
      desc: 'High chromatic aberration combined with intense fractal noise.',
      options: {
        displacementScale: 120,
        blurAmount: 0,
        chromaticAberration: 30,
        edgeHighlightIntensity: 0.5,
        bulge: 0.0, 
        noiseFrequency: 0.1,
        lensStrength: 1.0,
        edgeCurvature: 0,
        enableMouseTracking: false,
        tintColor: '#000000',
        tintIntensity: 0.1,
        edgeGlowColor: '#ff0055'
      },
      specular: false
    },
    magnify: {
      title: 'Magnifying Glass',
      desc: 'Aggressive central lens pushing outwards, following the cursor.',
      options: {
        displacementScale: 150,
        blurAmount: 0,
        chromaticAberration: 3,
        edgeHighlightIntensity: 2.0,
        bulge: 1.0, 
        noiseFrequency: 0.01,
        lensStrength: 4.5,
        edgeCurvature: 2,
        enableMouseTracking: true,
        tintColor: '#ffffff',
        tintIntensity: 0.0,
        edgeGlowColor: '#ffffff'
      },
      specular: true
    },
    bevel: {
      title: 'Steep Bevel',
      desc: 'Flat center with an intense, sharp bevel dropping off directly at the border radius.',
      options: {
        displacementScale: 60,
        blurAmount: 1,
        chromaticAberration: 4,
        edgeHighlightIntensity: 4.0,
        bulge: 1.0, 
        noiseFrequency: 0.01,
        lensStrength: 0.2,
        edgeCurvature: 30,
        enableMouseTracking: false,
        tintColor: '#ffffff',
        tintIntensity: 0.05,
        edgeGlowColor: '#ffffff'
      },
      specular: false
    }
  };

  let currentPreset = 'trueLiquid';
  let currentShapeClass = 'shape-rounded';
  
  bgContainer.style.backgroundImage = `url('./bg1.jpg')`;
  
  function getBorderRadius(el) {
    const computed = window.getComputedStyle(el).borderRadius;
    if (computed.includes('%')) return 9999;
    return parseInt(computed) || 0;
  }

  const activeOptions = { ...presets[currentPreset].options };
  activeOptions.borderRadius = getBorderRadius(activePanelEl);
  
  const glass = new GlassSurface(activePanelEl, activeOptions);
  specularLight.style.opacity = presets[currentPreset].specular ? "1" : "0";

  // Sync initial UI state to preset
  function syncUIToOptions(options) {
    inputs.enableMouseTracking.checked = options.enableMouseTracking;
    inputs.tintColor.value = options.tintColor;
    inputs.tintIntensity.value = options.tintIntensity;
    inputs.edgeGlowColor.value = options.edgeGlowColor;
    inputs.displacementScale.value = options.displacementScale;
    inputs.chromaticAberration.value = options.chromaticAberration;
    inputs.blurAmount.value = options.blurAmount;
    inputs.edgeHighlightIntensity.value = options.edgeHighlightIntensity;
    inputs.bulge.checked = options.bulge > 0;
    inputs.lensStrength.value = options.lensStrength;
    inputs.edgeCurvature.value = options.edgeCurvature;

    displays.tintIntensity.textContent = options.tintIntensity;
    displays.displacementScale.textContent = options.displacementScale;
    displays.chromaticAberration.textContent = options.chromaticAberration;
    displays.blurAmount.textContent = options.blurAmount;
    displays.edgeHighlightIntensity.textContent = options.edgeHighlightIntensity;
    displays.lensStrength.textContent = options.lensStrength;
    displays.edgeCurvature.textContent = options.edgeCurvature;
  }

  syncUIToOptions(activeOptions);

  // Bind Custom Controls
  inputs.enableMouseTracking.addEventListener('change', (e) => {
    const v = e.target.checked;
    glass.options.enableMouseTracking = v;
    if (!v) {
      glass.targetMouse.x = 0.5;
      glass.targetMouse.y = 0.5;
      glass.isHovered = false;
      glass.startAnimationLoop();
    }
  });

  inputs.tintColor.addEventListener('input', (e) => {
    glass.options.tintColor = e.target.value;
    glass.updateStyles();
  });
  inputs.edgeGlowColor.addEventListener('input', (e) => {
    glass.options.edgeGlowColor = e.target.value;
    glass.updateStyles();
  });

  ['tintIntensity', 'displacementScale', 'chromaticAberration', 'blurAmount', 'edgeHighlightIntensity', 'lensStrength', 'edgeCurvature'].forEach(key => {
    inputs[key].addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      glass.options[key] = v;
      displays[key].textContent = v;
      glass.updateStyles();
    });
  });

  inputs.bulge.addEventListener('change', (e) => {
    glass.options.bulge = e.target.checked ? 1.0 : 0.0;
    glass.updateStyles();
  });

  function loadPreset(presetKey) {
    currentPreset = presetKey;
    const preset = presets[presetKey];
    
    panelTitle.textContent = preset.title;
    panelDesc.textContent = preset.desc;
    specularLight.style.opacity = preset.specular ? "1" : "0";
    
    Object.assign(glass.options, preset.options);
    glass.updateStyles();
    syncUIToOptions(preset.options);
  }

  presetSelect.addEventListener('change', (e) => loadPreset(e.target.value));

  shapeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      shapeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      activePanelEl.classList.remove(currentShapeClass);
      currentShapeClass = btn.dataset.shape;
      activePanelEl.classList.add(currentShapeClass);
      
      requestAnimationFrame(() => {
        glass.options.borderRadius = getBorderRadius(activePanelEl);
        glass.updateStyles();
      });
    });
  });

  const themeButtons = document.querySelectorAll('.theme-buttons button');
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      themeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // The default white theme has opacity 0, others 0.4 for strong tint
      const isDefault = btn.dataset.tint === '#ffffff' && btn.dataset.glow === '#ffffff';
      
      glass.options.tintColor = btn.dataset.tint;
      glass.options.edgeGlowColor = btn.dataset.glow;
      glass.options.tintIntensity = isDefault ? 0.05 : 0.4;
      glass.updateStyles();
      
      // Update UI inputs to reflect theme selection
      inputs.tintColor.value = btn.dataset.tint;
      inputs.edgeGlowColor.value = btn.dataset.glow;
      inputs.tintIntensity.value = glass.options.tintIntensity;
      displays.tintIntensity.textContent = glass.options.tintIntensity;
    });
  });

  bgButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      bgButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      bgContainer.style.backgroundImage = `url('./${btn.dataset.bg}')`;
    });
  });

  // Export Config
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      // Build JS snippet
      const opt = glass.options;
      const snippet = `import { GlassSurface } from 'real-liquid-glass';

const options = {
  displacementScale: ${opt.displacementScale},
  chromaticAberration: ${opt.chromaticAberration},
  blurAmount: ${opt.blurAmount},
  edgeHighlightIntensity: ${opt.edgeHighlightIntensity},
  bulge: ${opt.bulge},
  lensStrength: ${opt.lensStrength},
  edgeCurvature: ${opt.edgeCurvature},
  enableMouseTracking: ${opt.enableMouseTracking},
  tintColor: '${opt.tintColor}',
  tintIntensity: ${opt.tintIntensity},
  edgeGlowColor: '${opt.edgeGlowColor}'
};

const myPanel = document.getElementById('my-panel');
const glass = new GlassSurface(myPanel, options);`;

      navigator.clipboard.writeText(snippet).then(() => {
        const originalText = exportBtn.textContent;
        exportBtn.textContent = 'Copied to Clipboard!';
        exportBtn.classList.add('success');
        setTimeout(() => {
          exportBtn.textContent = originalText;
          exportBtn.classList.remove('success');
        }, 2000);
      });
    });
  }

});
