/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, PerspectiveCamera, Vector3, Clock } from 'three';
import { SeedScene } from 'scenes';
import PlayerControls from './PlayerControls';

// Initialize core ThreeJS components
const scene = new SeedScene();
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({ antialias: true });
const clock = new Clock();

// Set up camera
camera.position.set(0, 2, 0);
camera.lookAt(new Vector3(0, 2, 1)); // camera starts looking down the +z axis

// Set up renderer, canvas, and minor CSS adjustments
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
    renderer.render(scene, camera);
    scene.update && scene.update(timeStamp);
    window.requestAnimationFrame(onAnimationFrameHandler);
};
window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);
