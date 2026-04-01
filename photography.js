/**
 * ============================================
 * PHOTOGRAPHY PAGE — 3D Camera Scroll Experience
 * ES Module — Three.js r160 + GLTFLoader + GSAP
 * ============================================
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ————————————————————————————————————————————
// 1. SCENE DATA
// ————————————————————————————————————————————
// Position X represents left/right side of the screen. Radius determines angle.
const CAMERA_POSITIONS = [
  { px:  0.0, ry: 0,                rx: 0.1, rz: 0 },    // 0: Hero (Center, Front)
  { px: -2.3, ry: 0,                rx: 0.1, rz: 0 },    // 1: Commercial (Left, Front)
  { px:  2.3, ry: -Math.PI / 2,     rx: 0.1, rz: 0.05 }, // 2: Street (Right, Right-side view)
  { px: -2.3, ry: -Math.PI,         rx: 0.1, rz: 0 },    // 3: Portrait (Left, Back view)
  { px:  2.3, ry: -Math.PI * 1.5,   rx: 0.1, rz:-0.05 }, // 4: Editorial (Right, Left-side view)
  { px: -2.3, ry: -Math.PI * 2,     rx: 0.1, rz: 0 },    // 5: E-Commerce (Left, Front view)
  { px:  2.3, ry: -Math.PI * 2.5,   rx: 0.1, rz: 0.05 }, // 6: Wildlife (Right, Right-side view)
];

// ————————————————————————————————————————————
// 2. THREE.JS SETUP
// ————————————————————————————————————————————
let scene, camera, renderer, cameraModel, cameraRig, cameraFloat;
const loadingEl = document.getElementById('loading-indicator');
const loadingText = document.getElementById('loading-text');

function initThree() {
  const canvas = document.getElementById('camera-canvas');

  scene = new THREE.Scene();

  // Nested rigging prevents GSAP and requestAnimationFrame from fighting
  cameraRig = new THREE.Group();   // Controlled by GSAP ScrollTrigger
  scene.add(cameraRig);

  cameraFloat = new THREE.Group(); // Controlled by sine wave idle animation
  cameraRig.add(cameraFloat);

  // Since canvas is 100vw, camera needs to adjust its view
  camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.5, 9);
  camera.lookAt(0, 1.0, 0);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Optimizing for 60fps on retina
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.6;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  setupEnvironment();
  setupLighting();
  loadGLTFModel();

  window.addEventListener('resize', onResize);
  animate();
}

// ————————————————————————————————————————————
// 2a. ENVIRONMENT MAP (studio reflections)
// ————————————————————————————————————————————
function setupEnvironment() {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);

  const envScene = new THREE.Scene();

  // Soft top
  const top = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshBasicMaterial({ color: 0x8899cc, side: THREE.DoubleSide })
  );
  top.position.set(0, 10, 0);
  top.rotation.x = Math.PI / 2;
  envScene.add(top);

  // Dark bottom
  const bottom = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshBasicMaterial({ color: 0x0a0a12, side: THREE.DoubleSide })
  );
  bottom.position.set(0, -10, 0);
  bottom.rotation.x = -Math.PI / 2;
  envScene.add(bottom);

  // Key panel (warm, right)
  const keyPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 10),
    new THREE.MeshBasicMaterial({ color: 0xfff0dd, side: THREE.DoubleSide })
  );
  keyPanel.position.set(8, 3, 3);
  keyPanel.rotation.y = -Math.PI / 3;
  envScene.add(keyPanel);

  // Fill panel (cool, left)
  const fillPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 8),
    new THREE.MeshBasicMaterial({ color: 0x99aabb, side: THREE.DoubleSide })
  );
  fillPanel.position.set(-7, 2, 2);
  fillPanel.rotation.y = Math.PI / 4;
  envScene.add(fillPanel);

  const envRT = pmremGenerator.fromScene(envScene, 0.04);
  scene.environment = envRT.texture;
  pmremGenerator.dispose();
}

// ————————————————————————————————————————————
// 2b. STUDIO LIGHTING
// ————————————————————————————————————————————
function setupLighting() {
  scene.add(new THREE.AmbientLight(0x404050, 0.4));

  const keyLight = new THREE.DirectionalLight(0xfff0e0, 2.0);
  keyLight.position.set(5, 8, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024; // Optimized shadow res
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.bias = -0.001;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xc0d0ff, 0.8);
  fillLight.position.set(-4, 3, 3);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 1.0);
  rimLight.position.set(-2, 4, -5);
  scene.add(rimLight);

  const accentLight = new THREE.PointLight(0xFFEF00, 0.2, 12);
  accentLight.position.set(0, -2, 4);
  scene.add(accentLight);
}

// ————————————————————————————————————————————
// 2c. LOAD GLTF MODEL
// ————————————————————————————————————————————
function loadGLTFModel() {
  const loader = new GLTFLoader();
  const modelPath = 'assets/uploads_files_6085952_gltf/gltf/ASSET.gltf';

  loader.load(
    modelPath,
    (gltf) => {
      cameraModel = gltf.scene;

      // Auto-scale: the model is ~0.13 units, we want ~4 units
      const box = new THREE.Box3().setFromObject(cameraModel);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scaleFactor = 4.0 / maxDim;
      cameraModel.scale.setScalar(scaleFactor);

      // Center the model cleanly inside the cameraFloat group
      const center = new THREE.Vector3();
      box.getCenter(center);
      cameraModel.position.set(
        -center.x * scaleFactor,
        -center.y * scaleFactor,
        -center.z * scaleFactor
      );

      // Enable shadows + boost env map on all meshes
      cameraModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.envMapIntensity = 1.5;
            child.material.needsUpdate = true;
          }
        }
      });

      cameraFloat.add(cameraModel);

      // Hide loading indicator with fade
      if (loadingEl) {
        loadingEl.style.opacity = '0';
        setTimeout(() => { loadingEl.style.display = 'none'; }, 600);
      }
    },
    (progress) => {
      if (loadingText && progress.total > 0) {
        const pct = Math.round((progress.loaded / progress.total) * 100);
        loadingText.textContent = `Loading 3D Model... ${pct}%`;
      }
    },
    (error) => {
      console.error('❌ GLTF Load Error:', error);
      if (loadingText) {
        loadingText.textContent = 'Error loading model';
        loadingText.style.color = '#ff4444';
      }
    }
  );
}

// ————————————————————————————————————————————
// 2d. RESIZE & ANIMATE
// ————————————————————————————————————————————
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Recalculate camera layout dynamically based on screen width
  const isMobile = window.innerWidth <= 768;
  const currentTarget = CAMERA_POSITIONS[currentSectionIndex];
  if (isMobile) {
    gsap.to(cameraRig.position, { x: 0, duration: 0.5, overwrite: 'auto' });
  } else {
    gsap.to(cameraRig.position, { x: currentTarget.px, duration: 0.5, overwrite: 'auto' });
  }
}

function animate() {
  requestAnimationFrame(animate);
  if (cameraFloat) {
    // Gentle idle float on the inner group ONLY (never touches X/Z, leaving GSAP untouched)
    cameraFloat.position.y = Math.sin(Date.now() * 0.001) * 0.08;
    cameraFloat.rotation.y = Math.sin(Date.now() * 0.0005) * 0.02; // ultra subtle breathing rotation
  }
  renderer.render(scene, camera);
}

// ————————————————————————————————————————————
// 3. GSAP SCROLL TRIGGER (SCRUBBED & SYNCED)
// ————————————————————————————————————————————
let currentSectionIndex = 0;

function initScrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  const sections = document.querySelectorAll('.photo-section');
  const contents = document.querySelectorAll('.section-content');

  // We build a master timeline to track the camera's journey smoothly across the whole page
  const cameraTl = gsap.timeline({
    scrollTrigger: {
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.5, // 1.5 seconds of smoothing to make the scroll buttery fluid without lag
    }
  });

  const isMobile = window.innerWidth <= 768;

  // Map out the camera journey section by section
  sections.forEach((section, index) => {
    if (index === 0) return; // Skip hero since it's the starting position

    const targetPos = CAMERA_POSITIONS[index];
    const xPos = isMobile ? 0 : targetPos.px;

    // The camera smoothly transitions between the previous section and this one
    cameraTl.to(cameraRig.position, {
      x: xPos,
      ease: 'power1.inOut'
    }, (index - 1)); // The section index acts as "time" in the scrub timeline

    cameraTl.to(cameraRig.rotation, {
      x: targetPos.rx,
      y: targetPos.ry,
      z: targetPos.rz,
      ease: 'power1.inOut'
    }, (index - 1));
  });

  // Independent triggers for the text/photos to appear ONLY after the camera has arrived
  sections.forEach((section, index) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%', // Section becomes active when halfway up screen
      end: 'bottom 50%',
      onEnter: () => setActiveSection(index),
      onEnterBack: () => setActiveSection(index),
    });
  });

  // Content fade-ins are delayed so they don't cover the screen while the camera is swinging across
  contents.forEach((content) => {
    ScrollTrigger.create({
      trigger: content.parentElement,
      start: 'top 40%',  // Reveal content very late (only when camera is almost done moving)
      end: 'bottom 20%', // Hide early on way up
      onEnter: () => content.classList.add('visible'),
      onLeave: () => content.classList.remove('visible'),
      onEnterBack: () => content.classList.add('visible'),
      onLeaveBack: () => content.classList.remove('visible'),
    });
  });

  setActiveSection(0);
  contents[0].classList.add('visible'); // Hero content visible immediately
}

function setActiveSection(index) {
  document.querySelectorAll('.section-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

// ————————————————————————————————————————————
// 4. DOT NAVIGATION
// ————————————————————————————————————————————
function initDotNav() {
  const dots = document.querySelectorAll('.section-dot');
  const sections = document.querySelectorAll('.photo-section');
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => sections[index].scrollIntoView({ behavior: 'smooth' }));
  });
}

// ————————————————————————————————————————————
// 5. INIT
// ————————————————————————————————————————————
initThree();
requestAnimationFrame(() => {
  initScrollAnimations();
  initDotNav();
});
