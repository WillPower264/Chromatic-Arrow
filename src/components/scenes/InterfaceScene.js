import { Scene } from 'three';
import { Crosshairs, Powerbar } from 'objects';
import CONSTS from '../../constants';
import _ from 'lodash';

class InterfaceScene extends Scene {
    constructor(isTutorial) {
        // Call parent Scene() constructor
        super();

        this.state = {
            updateList: [],
            score: 0,
            timeLeft: CONSTS.scene.timeLimit,
            gaemOver: false,
        };
        // Tutorial mode
        this.isTutorial = isTutorial;
        this.disableControls = false;

        // Add powerbar
        const pbar = new Powerbar(250, 50);
        this.add(pbar);
        this.addToUpdateList(pbar);
        this.powerbar = pbar;

        // Add crosshairs
        this.crosshairs = new Crosshairs();
        this.add(this.crosshairs);

        // Add text
        const { text: scoreText, style: scoreStyle } = CONSTS.scoreBox;
        this.scoreBox = this.createText(`${scoreText}${this.state.score}`, scoreStyle);
        const {text: powerText, style: powerStyle} = CONSTS.powerBar;
        this.powerbarText = this.createText(powerText, powerStyle);

        // Add timer and countdown
        if (!isTutorial) {
            const { text: timerText, style: timerStyle } = CONSTS.timer;
            this.timer = this.createText(`${timerText}${this.state.score}`, timerStyle);
            this.countDown();
        }
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    createText(text, style) {
        const textBox = document.createElement('div');
        textBox.innerHTML = text;
        _.extend(textBox.style, style);
        document.body.appendChild(textBox);
        return textBox;
    }

    countDown() {
        const { timeLeft } = this.state;
        if (timeLeft < 0) {
            this.state.gameOver = true;
            return;
        }
        const min = Math.floor(timeLeft / 60);
        const sec = timeLeft % 60;
        const time = `${min}:${sec < 10 ? `0${sec}` : sec}`;
        this.timer.innerHTML = `${CONSTS.timer.text}${time}`;
        this.state.timeLeft--;
        _.delay(() => this.countDown(), 1000);
    }

    updateScore(change) {
        this.state.score += change;
        this.scoreBox.innerHTML = `${CONSTS.scoreBox.text}${this.state.score}`;
    }

    /* Event handlers */
    resizeHandler() {
        this.powerbar.resizeHandler();
    }

    mousedownHandler() {
        this.powerbar.beginFill();
    }

    mouseupHandler() {
        this.powerbar.stopFill();
    }

    addScoreHandler(e) {
        this.updateScore(e.detail.score);
    }

    newArrowColorHandler(e) {
        this.powerbar.setFillColor(e.detail.color);
    }

    /* Update */
    update() {
        if (!this.disableControls) {
            for (const obj of this.state.updateList) {
                obj.update();
            }
        }
    }

    /* Clean up */
    destruct() {
        // Destruct powerbar and crosshairs
        this.powerbar.destruct();
        this.powerbar = null;
        this.crosshairs.destruct();
        this.crosshairs = null;

        // Clear the updateList
        this.state.updateList = null;

        // Remove textboxes
        this.scoreBox.remove();
        this.scoreBox = null;
        this.powerbarText.remove();
        this.powerbarText = null;
        this.timer && this.timer.remove();  // Does not exist in tutorial mode
        this.timer = null;

        // Dispose the scene
        this.dispose();
    }
}

export default InterfaceScene;
