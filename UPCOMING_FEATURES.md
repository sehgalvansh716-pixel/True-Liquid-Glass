# Potential Upcoming Features for True Liquid Glass

As the library grows, here are some exciting features and architectural upgrades that could be added in future versions:

### 1. Dynamic Specular Lighting (`<feSpecularLighting>`)
Currently, the specular highlight is a static CSS `radial-gradient` that simply sits on top of the glass. By integrating SVG's native `<feSpecularLighting>` into the filter chain and passing in a 3D light vector, the highlight could physically track the mouse, react to the curvature of the liquid lens, and provide a truly photorealistic 3D lighting model.

### 2. Interactive Physics (Water Ripples)
Instead of just a single bulge following the mouse, the engine could implement a simple 2D wave equation on the hidden canvas. Clicking or dragging the glass would generate expanding, bouncing ripples that slowly decay over time, turning the panel into a highly interactive pool of liquid.

### 3. Framework Wrappers (React / Vue / Svelte)
While the vanilla JS approach is lightweight, providing native component wrappers would make adoption much easier for modern developers. 
Example: `<LiquidGlass displacementScale={80} bulge={1.0}> ... </LiquidGlass>`

### 4. Custom Normal Map Uploads
Currently, the library generates normal maps procedurally based on noise or the SDF of the element's border-radius. We could add a feature allowing users to pass an image URL (like a logo, text, a shattered glass texture, or water drops) to be used as the base displacement map.

### 5. Mobile Gyroscope Support
Hooking into the `DeviceOrientationEvent` API would allow the liquid lens and lighting to shift dynamically based on how the user tilts their mobile device, creating a stunning holographic effect on phones and tablets.

### 6. Multi-layer "Thick Glass" Refraction
By stacking two or more `<feDisplacementMap>` passes with slightly different scales and opacities, we could simulate internal reflections and glass thickness, pushing the 2D effect even closer to a true 3D raytraced look.
