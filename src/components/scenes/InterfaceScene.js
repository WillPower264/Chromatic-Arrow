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
        const { text, id, style } = CONSTS.scoreBox;
        this.scoreBox = this.createText(
          `${text}${this.state.score}`, id, style
        );

        // Listeners
        this.addEventListeners();
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    createText(text, id, style) {
        const scoreBox = document.createElement('div');
        scoreBox.id = id;
        scoreBox.innerHTML = text;
        _.extend(scoreBox.style, style);
        document.body.appendChild(scoreBox);
        return scoreBox;
    }

    clearText() {
        const { id } = CONSTS.scoreBox;
        document.getElementById(id).remove();
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
