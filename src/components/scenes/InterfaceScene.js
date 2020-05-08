import { Scene } from 'three';
import { Crosshairs, Powerbar, Timer } from 'objects';
import CONSTS from '../../constants';
import _ from 'lodash';

class InterfaceScene extends Scene {
    constructor(creationTime) {
        // Call parent Scene() constructor
        super();

        this.state = {
            updateList: [],
            score: 0,
            timeLeft: CONSTS.msTimeLimit / 1000,
        };

        // Interface objects
        const pbar = new Powerbar(250, 50);
        this.add(pbar);
        this.addToUpdateList(pbar);
        this.powerbar = pbar;

        const cross = new Crosshairs();
        this.add(cross);

        const timer = new Timer(creationTime);
        timer.update(0);
        this.add(timer);
        this.addToUpdateList(timer);

        // Add text
        const { text: scoreText, style: scoreStyle } = CONSTS.scoreBox;
        this.scoreBox = this.createText(`${scoreText}${this.state.score}`, scoreStyle);
        const { text: timerText, style: timerStyle } = CONSTS.timer;
        this.timer = this.createText(`${timerText}${this.state.score}`, timerStyle);

        // Countdown on clock
        this.countDown();

        // Listeners
        this.addEventListeners();
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    countDown() {
        const { timeLeft } = this.state;
        if (timeLeft === 0) {
            this.scoreBox.remove();
            this.timer.remove();
            return;
        }
        this.timer.innerHTML = `${CONSTS.timer.text}${timeLeft}`;
        this.state.timeLeft--;
        _.delay(() => this.countDown(), 1000);
    }

    createText(text, style) {
        const textBox = document.createElement('div');
        textBox.innerHTML = text;
        _.extend(textBox.style, style);
        textBox.style.textAlign = 'right';
        document.body.appendChild(textBox);
        return textBox;
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
