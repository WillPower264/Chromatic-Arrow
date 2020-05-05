/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, PerspectiveCamera, OrthographicCamera, Clock } from 'three';
import { InterfaceScene, SeedScene } from 'scenes';
import PlayerControls from './PlayerControls';
import CONSTS from './constants';

// Initialize core ThreeJS components
const scene = new SeedScene();
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({ antialias: true });
const clock = new Clock();

// Set up camera
camera.position.copy(CONSTS.camera.position);
camera.lookAt(CONSTS.camera.initialDirection); // camera starts looking down the +z axis

// Set up interface overlay camera
// From example: https://threejs.org/examples/#webgl_sprites
const { innerHeight, innerWidth } = window;
const cameraOrtho = new OrthographicCamera(
  -innerWidth / 2,
  innerWidth / 2,
  innerHeight / 2,
  -innerHeight / 2,
  CONSTS.camera.near,
  CONSTS.camera.far
);
cameraOrtho.position.z = 1;
const sceneOrtho = new InterfaceScene(innerWidth / 2, innerHeight / 2);

// Set up renderer, canvas, and minor CSS adjustments
renderer.autoClear = false;
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
document.body.appendChild(canvas);

// Set up controls
const controls = new PlayerControls(camera, document.body);
scene.add(controls.getObject());

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
  controls.update(clock.getDelta());
  renderer.clear();
  renderer.render(scene, camera);
  renderer.clearDepth();
  renderer.render(sceneOrtho, cameraOrtho);
  scene.update && scene.update(timeStamp);
  sceneOrtho.update && sceneOrtho.update(
    cameraOrtho.right, cameraOrtho.top, timeStamp
  );
  window.requestAnimationFrame(onAnimationFrameHandler);
};
window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
  const { innerHeight, innerWidth } = window;
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  console.log(camera.getFilmHeight());

  // Update ortho camera
  cameraOrtho.left = -innerWidth / 2;
  cameraOrtho.right = innerWidth / 2;
  cameraOrtho.top = innerHeight / 2;
  cameraOrtho.bottom = -innerHeight / 2;
  cameraOrtho.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);
