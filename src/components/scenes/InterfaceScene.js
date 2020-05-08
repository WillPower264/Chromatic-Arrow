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
            timeLeft: CONSTS.msTimeLimit / 1000,
        };
        // Tutorial mode
        this.isTutorial = isTutorial;

        // Add powerbar
        const pbar = new Powerbar(250, 50);
        this.add(pbar);
        this.addToUpdateList(pbar);
        this.powerbar = pbar;

        // Add crosshairs
        const cross = new Crosshairs();
        this.add(cross);

        // Add text
        const { text: scoreText, style: scoreStyle } = CONSTS.scoreBox;
        this.scoreBox = this.createText(`${scoreText}${this.state.score}`, scoreStyle);
        const {text: powerText, style: powerStyle} = CONSTS.powerBar;
        this.powerBarText = this.createText(powerText, powerStyle);

        // Add timer and countdown
        if (!isTutorial) {
            const { text: timerText, style: timerStyle } = CONSTS.timer;
            this.timer = this.createText(`${timerText}${this.state.score}`, timerStyle);
            this.countDown();
        }

        // Listeners
        this.addEventListeners();
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    countDown() {
        const { timeLeft } = this.state;
        if (timeLeft < 0) { return; }
        const min = Math.floor(timeLeft / 60);
        const sec = timeLeft % 60;
        const time = `${min}:${sec < 10 ? `0${sec}` : sec}`;
        this.timer.innerHTML = `${CONSTS.timer.text}${time}`;
        this.state.timeLeft--;
        _.delay(() => this.countDown(), 1000);
    }

    isEnded() {
        return this.isTutorial ? false : this.state.timeLeft < 0;
    }

    createText(text, style) {
        const textBox = document.createElement('div');
        textBox.innerHTML = text;
        _.extend(textBox.style, style);
        document.body.appendChild(textBox);
        return textBox;
    }

    clearText() {
        this.scoreBox.remove();
        this.powerBarText.remove();
        if (!this.isTutorial) { this.timer.remove(); }
    }

    updateScore(change) {
        this.state.score += change;
        this.scoreBox.innerHTML = `${CONSTS.scoreBox.text}${this.state.score}`;
    }

    update(timeStamp) {
        for (const obj of this.state.updateList) {
            obj.update(timeStamp);
        }
    }

    addEventListeners() {
        window.addEventListener("mousedown", () => {
          this.powerbar.beginFill();
        }, false);
        window.addEventListener("mouseup", () => {
          this.powerbar.stopFill();
        }, false);
        window.addEventListener('addScore', (e) => {
            this.updateScore(e.detail.score);
        }, false);
    }
}

export default InterfaceScene;
