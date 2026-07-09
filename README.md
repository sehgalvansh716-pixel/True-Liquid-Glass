# Real Liquid Glass

![Real Liquid Glass Preview](./Git%20preview.png)

A lightweight vanilla JavaScript library for creating real-time, zero-latency glass distortion effects over arbitrary DOM content using CSS `backdrop-filter` and SVG displacement maps.

## Important Note on Architecture

**This is a 2D pixel displacement technique, NOT a physically accurate 3D refraction.**

Unlike WebGL/Canvas-based solutions (which require slow, CPU-bound DOM-to-texture capturing like `html2canvas`), this library leverages the browser's native compositor via CSS `backdrop-filter`. This means the effect is **genuinely live**. As the background scrolls, animates, or changes, the glass effect updates in the same frame with zero JavaScript overhead or latency. 

## Features
- **Zero Latency:** True live sampling of background elements (videos, CSS animations, scrolling text) with no capture delay.
- **SDF Normal Maps:** Automatically traces your CSS `border-radius` to prevent inner-ring artifacts on circles and rounded rectangles.
- **Mouse Tracking:** Liquid lenses physically track your cursor dynamically at 60fps.
- **Chromatic Aberration:** Offsets the Red, Green, and Blue channels for realistic edge fringing.
- **Vanilla JS:** No heavy dependencies (no Three.js, no WebGL). 

## Installation

```bash
npm install real-liquid-glass
```

## Quick Start Guide

Simply import the `GlassSurface` class and bind it to any HTML element. 

**Pro-tip:** Use the [Interactive Demo Playground](https://example.com/demo) to tweak the sliders visually, and then click **Copy Config to Clipboard** to export the exact code!

```javascript
import { GlassSurface } from 'real-liquid-glass';

// The library automatically reads border-radius and dimensions from your element!
const myElement = document.getElementById('my-glass');

const options = {
  displacementScale: 80,         // Intensity of the pixel warping
  chromaticAberration: 6,        // Intensity of RGB channel splitting
  blurAmount: 0,                 // Amount of background blur for frosted looks
  edgeHighlightIntensity: 2.5,   // Intensity of the CSS box-shadow Fresnel simulation
  bulge: 1,                      // Enable the radial liquid lens bulge map (0 or 1)
  lensStrength: 2.5,             // Strength of the outward push from cursor
  edgeCurvature: 15,             // Sharp edge rim size in px (0 = disabled)
  enableMouseTracking: true      // Whether the lens follows the cursor
};

const glass = new GlassSurface(myElement, options);

// You can update options on the fly:
glass.options.displacementScale = 100;
glass.updateStyles();
```
