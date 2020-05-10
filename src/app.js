/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import { WebGLRenderer, PerspectiveCamera, OrthographicCamera, Clock, Vector2 } from 'three';
import { InterfaceScene, StartScene, GameScene, EndScene } from 'scenes';
import PlayerControls from './PlayerControls';
import runTutorial from './Tutorial';
import CONSTS from './constants';
import _ from 'lodash';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// Initialize core ThreeJS components
let camera;
let controls;
const renderer = new WebGLRenderer({ antialias: true });
const clock = new Clock();

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
window.addEventListener('resize', windowResizeHandler, false);

// Scene set up
let startScene;
let gameScene;
let interfaceScene;
let endScene;

// Bloom post-processing set up
const {exposure, strength, threshold, radius} = CONSTS.bloom;
renderer.toneMappingExposure = Math.pow(exposure, 4.0);
const vec = new Vector2(window.innerWidth, window.innerHeight);
const bloomPass = new UnrealBloomPass(vec, strength, radius, threshold);
bloomPass.renderToScreen = true;

// Create bloom postprocessing composer for a specific scene
let composerStart;
let composerGame;

function initStartScene() {
  startScene = new StartScene(startToGameHandler, startToTutorialHander);
  camera = new PerspectiveCamera();
  controls = new PlayerControls(camera, document.body);
  startScene.add(controls.getObject());
  isStarted = false;
  // Camera and controls
  startScene.add(controls.getObject());
  camera.position.copy(CONSTS.camera.position);
  camera.lookAt(CONSTS.camera.initialDirection); // camera starts looking down the +z axis
  composerStart = composeBloom(startScene, camera);
  windowResizeHandler();
}

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

// Control scene transitions
let isStarted = false;
let isEnded = false;
let isTutorial = false;

// Scene change functions
function changeToGame(lastScene, isTut) {
  lastScene.clearText();
  lastScene.dispose();
  if (gameScene !== undefined) {
    gameScene.dispose();
  }
  gameScene = new GameScene(isTut);
  // Set up controls
  controls.enable();
  gameScene.add(controls.getObject());
  interfaceScene = new InterfaceScene(isTut);
  composerGame = composeBloom(gameScene, camera, interfaceScene, cameraOrtho);
  isStarted = true;
  isTutorial = isTut;
  isEnded = false;
}

// Start game handler
const startToGameHandler = () => {
  changeToGame(startScene, false);
};

// Start tutorial handler
const startToTutorialHander = () => {
  changeToGame(startScene, true);
};

// Restart tutorial handler
const endToGameHandler = () => {
  changeToGame(endScene);
  window.removeEventListener('click', endToGameHandler, false);
};

function endGame() {
  // Handle transition between scenes
  const finalScore = interfaceScene.state.score;
  interfaceScene.clearText();
  interfaceScene.dispose();
  gameScene.end();
  endScene = new EndScene(finalScore);
  composerGame = composeBloom(gameScene, camera, endScene, cameraOrtho);
  isEnded = true;
  // Re-enable listener after short delay
  _.delay(() => {
    window.addEventListener('click', endToGameHandler, false);
  }, CONSTS.scene.msEndDelay);
}

function endTutorial() {
  interfaceScene.clearText();
  interfaceScene.dispose();
  interfaceScene = undefined;
  gameScene.dispose();
  gameScene = undefined;
  controls.disable();
  initStartScene();
}

// Set up renderer, canvas, and minor CSS adjustments
renderer.autoClear = false;
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = 'block'; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = 'hidden'; // Fix scrolling
document.body.appendChild(canvas);

function renderOne(projScene, timeStamp) {
  const deltaT = clock.getDelta();
  composerStart.render(deltaT);
  projScene.update && projScene.update(timeStamp);
}

function renderTwo(projScene, orthoScene, timeStamp) {
  const deltaT = clock.getDelta();
  controls.update(deltaT);
  renderer.clear();
  composerGame.render(deltaT);
  projScene.update && projScene.update(timeStamp);
  camera.getWorldDirection(projScene.direction);
  orthoScene.update && orthoScene.update(timeStamp);
}

// Apply post-processing
function composeBloom(projScene, projCamera, orthoScene, orthoCamera) {
    const composer = new EffectComposer(renderer);
    composer.setSize(window.innerWidth, window.innerHeight);
    const gamePass = new RenderPass(projScene, projCamera);
    gamePass.clearDepth = true;
    gamePass.clear = false;
    composer.addPass(gamePass);
    if (orthoScene) {
      const overlayPass = new RenderPass(orthoScene, orthoCamera);
      overlayPass.clearDepth = true;
      overlayPass.clear = false;
      composer.addPass(overlayPass);
    }
    composer.addPass(bloomPass);
    return composer;
}

// Initialize start scene for first time
initStartScene();

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
  // Show start scene
  if (!isStarted) {
    renderOne(startScene, timeStamp);
  // Show tutorial
  } else if (isTutorial) {
    isTutorial = runTutorial(gameScene, timeStamp);
    renderTwo(gameScene, interfaceScene, timeStamp);
    // Just ended
    if (!isTutorial) {
      endTutorial();
      isTutorial = true;
    }
  // Show end scene
  } else if (isEnded) {
    renderTwo(gameScene, endScene, timeStamp);
  // End the game
  } else if (interfaceScene.isEnded()) {
    endGame();
    renderTwo(gameScene, endScene, timeStamp);
  // Show game scene
  } else {
    renderTwo(gameScene, interfaceScene, timeStamp);
  }
  window.requestAnimationFrame(onAnimationFrameHandler);
};
window.requestAnimationFrame(onAnimationFrameHandler);
