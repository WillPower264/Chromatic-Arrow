import { Vector3 } from 'three';
import CONSTS from './constants';
// Steps in tutorial
let hasSpawnedFirstTarget = false;
let hasShotFirstTarget = false;
let hasSpawnedSecondTarget = false;
let hasShotSecondTarget = false;
let hasActivatedWind = false;
let hasShotThirdTarget = false;
let hasSpawnedBarrier = false;
let hasShotBarrier = false;
let hasSpawnedForthTarget = false;
let hasShotFourthTarget = false;

// Text
let currentTextBox;

// Returns true if still in tutorial
function runTutorial(scene) {
    // Target behind barrier
    if (hasShotFourthTarget) {
      clearText();
      return false;
    } else if (hasSpawnedForthTarget) {
      hasShotFourthTarget = (scene.state.numTargetsInUse === 0);
    } else if (hasShotBarrier) {
      scene.spawnTarget();
      hasSpawnedForthTarget = true;
      createText("You're ready to go! Hit the last target to complete the tutorial.");
    } else if (hasSpawnedBarrier) {
      hasShotBarrier = scene.barriersHit > 0;
    } else if (hasShotThirdTarget) {
      scene.createBarriers();
      hasSpawnedBarrier = true;
      createText("Invisible barriers can block your shots. Shoot one to reveal it.");
    // Target with wind
    } else if (hasActivatedWind) {
      hasShotThirdTarget = (scene.state.numTargetsInUse === 0);
    } else if (hasShotSecondTarget) {
      scene.changeWind();
      scene.createWind();
      scene.spawnTarget();
      hasActivatedWind = true;
      createText("Arrows are also affected by wind. Aim carefully.");
    // Target at random position
    } else if (hasSpawnedSecondTarget) {
      hasShotSecondTarget = (scene.state.numTargetsInUse === 0);
    } else if (hasShotFirstTarget) {
      scene.spawnTarget();
      hasSpawnedSecondTarget = true;
      createText("Targets spawn all around you. Use the mouse to look around.");
    // Target straight ahead
    } else if (hasSpawnedFirstTarget) {
      hasShotFirstTarget = (scene.state.numTargetsInUse === 0);
    } else {
      scene.spawnTarget(new Vector3(0, 3, 31));
      hasSpawnedFirstTarget = true;
      createText("Hold click to charge up a shot and hit the target. \
                  Score points by hitting each target near the center within \
                  the time limit.");
    }
    return true;
}

function createText(str) {
    if (currentTextBox) { clearText(); }
    const text = document.createElement('div');
    text.innerHTML = str;
    text.style.position = 'absolute';
    text.style.fontSize = '20px';
    text.style.color = 'white';
    document.body.appendChild(text);
    // Center text
    const { innerWidth } = window;
    text.style.left = (innerWidth - text.clientWidth)/2 + 'px';
    text.style.top = '80%';
    currentTextBox = text;
}

function clearText() {
    currentTextBox.remove();
}

export default runTutorial;
