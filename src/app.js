/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, PerspectiveCamera, OrthographicCamera, Clock } from 'three';
import { InterfaceScene, StartScene, SeedScene, EndScene } from 'scenes';
import PlayerControls from './PlayerControls';
import CONSTS from './constants';
import _ from 'lodash';

// Initialize core ThreeJS components
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({ antialias: true });
const clock = new Clock();

// Control scene transitions
let isStarted = false;
let isEnded = false;
let startTimeStamp;

// Scenes
let startScene = new StartScene();
let gameScene;
let interfaceScene;
let endScene;

// Controls
const controls = new PlayerControls(camera, document.body);
startScene.add(controls.getObject());

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

// Set up renderer, canvas, and minor CSS adjustments
renderer.autoClear = false;
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
document.body.appendChild(canvas);

function endGame() {
  // Handle transition between scenes
  const finalScore = interfaceScene.state.score;
  interfaceScene.clearText();
  interfaceScene.dispose();
  gameScene.end();
  endScene = new EndScene(finalScore);
  isEnded = true;
  // Re-enable listener after short delay
  _.delay(() => {
    window.addEventListener('click', endToGameHandler, false);
  }, CONSTS.msEndDelay);
}

function renderOne(projScene, timeStamp) {
  renderer.render(projScene, camera);
  projScene.update && projScene.update(timeStamp);
}

function renderTwo(projScene, orthoScene, timeStamp) {
  controls.update(clock.getDelta());
  renderer.clear();
  renderer.render(projScene, camera);
  renderer.clearDepth();
  renderer.render(orthoScene, cameraOrtho);
  projScene.update && projScene.update(timeStamp);
  camera.getWorldDirection(projScene.direction);
  orthoScene.update && orthoScene.update(timeStamp);
}

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
  // Show start scene
  if (!isStarted) {
    startTimeStamp = timeStamp;
    renderOne(startScene, timeStamp);
  // End the game
  } else if (isEnded) {
    renderTwo(gameScene, endScene, timeStamp);
  // End the game
  } else if (interfaceScene.isEnded()) {
    endGame();
    renderTwo(gameScene, endScene, timeStamp);
  } else {
    renderTwo(gameScene, interfaceScene, timeStamp);
  }
  window.requestAnimationFrame(onAnimationFrameHandler);
};
window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
  const { innerHeight, innerWidth } = window;
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();

  // Update ortho camera
  cameraOrtho.left = -innerWidth / 2;
  cameraOrtho.right = innerWidth / 2;
  cameraOrtho.top = innerHeight / 2;
  cameraOrtho.bottom = -innerHeight / 2;
  cameraOrtho.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler, false);

function changeScenes(lastScene) {
  lastScene.clearText();
  lastScene.dispose();
  if (gameScene !== undefined) {
    gameScene.dispose();
  }
  gameScene = new SeedScene();
  // Set up controls
  gameScene.add(controls.getObject());
  interfaceScene = new InterfaceScene();
  isStarted = true;
  isEnded = false;
};

// Start game handler
const startToGameHandler = () => {
  if (isStarted || isEnded) { return; }
  changeScenes(startScene);
};

// Start game handler
const endToGameHandler = () => {
  changeScenes(endScene);
  window.removeEventListener('click', endToGameHandler, false);
};

window.addEventListener('click', startToGameHandler, false);
