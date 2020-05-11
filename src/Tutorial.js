import CONSTS from './constants';
import _ from 'lodash';

// Constants
const {
  style, initialTargetPosition, texts, msBarriersRevealed, maxTextBoxes,
  baseHeight, spacePerLine
} = CONSTS.tutorial;

// Steps in tutorial
let hasSpawnedFirstTarget = false;
let hasShotFirstTarget = false;
let hasSpawnedSecondTarget = false;
let hasShotSecondTarget = false;
let hasActivatedWind = false;
let hasShotThirdTarget = false;
let hasSpawnedBarriers = false;
let spawnBarrierTime;
let hasConcealedBarriers = false;
let hasShotBarrier = false;
let hasSpawnedForthTarget = false;
let hasShotFourthTarget = false;

// Text
let currentTextBoxes = [];

// Returns true if still in tutorial
function runTutorial(gameScene, interfaceScene, timeStamp) {
    // Target behind barrier
    if (hasShotFourthTarget) {
        removeText();
        resetSteps();
        return false;
    } else if (hasSpawnedForthTarget) {
        hasShotFourthTarget = checkTargetHit(gameScene);
    } else if (hasShotBarrier) {
        gameScene.spawnTarget();
        hasSpawnedForthTarget = true;
        setText([texts.finish, '']);
    } else if (hasConcealedBarriers) {
        hasShotBarrier = checkBarrierHit(gameScene);
        setText([texts.barrierFirst, texts.barrierSecond]);
    } else if (hasSpawnedBarriers) {
        if (timeStamp-spawnBarrierTime > msBarriersRevealed) {
            const { barriers } = gameScene.state;
            for (let i = 0; i < barriers.length; i++) {
                barriers[i].conceal();
            }
            hasConcealedBarriers = true;
            toggleScenesEnabled(gameScene, interfaceScene);
        }
    } else if (hasShotThirdTarget) {
        setText(['', '']);
        gameScene.initializeBarriers();
        const { barriers } = gameScene.state;
        for (let i = 0; i < barriers.length; i++) {
            barriers[i].reveal();
        }
        spawnBarrierTime = timeStamp;
        hasSpawnedBarriers = true;
        toggleScenesEnabled(gameScene, interfaceScene);
        // Target with wind
    } else if (hasActivatedWind) {
        hasShotThirdTarget = checkTargetHit(gameScene);
    } else if (hasShotSecondTarget) {
        gameScene.changeWind();
        gameScene.createWind();
        gameScene.spawnTarget();
        hasActivatedWind = true;
        setText([texts.wind, '']);
        // Target at random position
    } else if (hasSpawnedSecondTarget) {
        hasShotSecondTarget = checkTargetHit(gameScene);
    } else if (hasShotFirstTarget) {
        gameScene.spawnTarget();
        hasSpawnedSecondTarget = true;
        setText([texts.lookAround, '']);
        // Target straight ahead
    } else if (hasSpawnedFirstTarget) {
        hasShotFirstTarget = checkTargetHit(gameScene);
    } else {
        gameScene.spawnTarget(initialTargetPosition);
        hasSpawnedFirstTarget = true;
        createText();
        setText([texts.initialFirst, texts.initialSecond]);
    }
    return true;
}

function checkTargetHit(gameScene) {
    return gameScene.state.numTargetsInUse === 0;
}

function checkBarrierHit(gameScene) {
    return gameScene.barriersHit > 0;
}

function createText() {
    for (let i = 0; i < maxTextBoxes; i++) {
        const text = document.createElement('div');
        _.extend(text.style, style);
        document.body.appendChild(text);
        currentTextBoxes.push(text);
    }
}

function setText(strs) {
    for (let i = 0; i < strs.length; i++) {
        currentTextBoxes[i].innerHTML = strs[i];
        // center text box
        currentTextBoxes[i].style.left =
            (window.innerWidth - currentTextBoxes[i].clientWidth) / 2 + 'px';
        currentTextBoxes[i].style.top = (baseHeight + i*spacePerLine) + '%';
    }
}

function removeText() {
    for (let i = 0; i < maxTextBoxes; i++) {
        currentTextBoxes[i].remove();
    }
    currentTextBoxes = [];
}

function toggleScenesEnabled(gameScene, interfaceScene) {
    gameScene.disableControls = !gameScene.disableControls;
    interfaceScene.disableControls = !interfaceScene.disableControls;
}

function resetSteps() {
    hasSpawnedFirstTarget = false;
    hasShotFirstTarget = false;
    hasSpawnedSecondTarget = false;
    hasShotSecondTarget = false;
    hasActivatedWind = false;
    hasShotThirdTarget = false;
    hasSpawnedBarriers = false;
    hasShotBarrier = false;
    hasConcealedBarriers = false;
    hasSpawnedForthTarget = false;
    hasShotFourthTarget = false;
}

export default runTutorial;
