import CONSTS from './constants';
import _ from 'lodash';

// Constants
const { style, initialTargetPosition, texts } = CONSTS.tutorial;

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
        removeText();
        resetSteps();
        return false;
    } else if (hasSpawnedForthTarget) {
        hasShotFourthTarget = checkTargetHit(scene);
    } else if (hasShotBarrier) {
        scene.spawnTarget();
        hasSpawnedForthTarget = true;
        setText(texts.finish);
    } else if (hasSpawnedBarrier) {
        hasShotBarrier = checkBarrierHit(scene);
    } else if (hasShotThirdTarget) {
        scene.createBarriers();
        hasSpawnedBarrier = true;
        setText(texts.barriers);
        // Target with wind
    } else if (hasActivatedWind) {
        hasShotThirdTarget = checkTargetHit(scene);
    } else if (hasShotSecondTarget) {
        scene.changeWind();
        scene.createWind();
        scene.spawnTarget();
        hasActivatedWind = true;
        setText(texts.wind);
        // Target at random position
    } else if (hasSpawnedSecondTarget) {
        hasShotSecondTarget = checkTargetHit(scene);
    } else if (hasShotFirstTarget) {
        scene.spawnTarget();
        hasSpawnedSecondTarget = true;
        setText(texts.lookAround);
        // Target straight ahead
    } else if (hasSpawnedFirstTarget) {
        hasShotFirstTarget = checkTargetHit(scene);
    } else {
        scene.spawnTarget(initialTargetPosition);
        hasSpawnedFirstTarget = true;
        createText();
        setText(texts.initial);
    }
    return true;
}

function checkTargetHit(scene) {
    return scene.state.numTargetsInUse === 0;
}

function checkBarrierHit(scene) {
    return scene.barriersHit > 0;
}

function createText() {
    const text = document.createElement('div');
    _.extend(text.style, style);
    document.body.appendChild(text);
    currentTextBox = text;
}

function setText(str) {
    currentTextBox.innerHTML = str;
    // center text box
    currentTextBox.style.left = (window.innerWidth - currentTextBox.clientWidth) / 2 + 'px';
}

function removeText() {
    currentTextBox.remove();
    currentTextBox = undefined;
}

function resetSteps() {
    hasSpawnedFirstTarget = false;
    hasShotFirstTarget = false;
    hasSpawnedSecondTarget = false;
    hasShotSecondTarget = false;
    hasActivatedWind = false;
    hasShotThirdTarget = false;
    hasSpawnedBarrier = false;
    hasShotBarrier = false;
    hasSpawnedForthTarget = false;
    hasShotFourthTarget = false;
}

export default runTutorial;
