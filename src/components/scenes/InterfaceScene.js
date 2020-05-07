import { Scene } from 'three';
import { Crosshairs, Powerbar, Timer } from 'objects';

class InterfaceScene extends Scene {
    constructor(width, height, creationTime) {
        // Call parent Scene() constructor
        super();

        this.state = {
            updateList: [],
            score: 0,
        };

        // Interface objects
        const pbar = new Powerbar(250, 50);
        pbar.update(width, height, 0);
        this.add(pbar);
        this.addToUpdateList(pbar);
        this.pbar = pbar;

        const cross = new Crosshairs();
        this.add(cross);

        const timer = new Timer(creationTime);
        timer.update(width, height, 0);
        this.add(timer);
        this.addToUpdateList(timer);

        // Listeners
        this.addEventListeners();
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(width, height, timeStamp) {
        for (const obj of this.state.updateList) {
            obj.update(width, height, timeStamp);
        }
    }

    addEventListeners() {
        window.addEventListener("mousedown", () => {
          this.pbar.beginFill();
        }, false);
        window.addEventListener("mouseup", () => {
          this.pbar.stopFill();
        }, false);
        window.addEventListener('addScore', (e) => {
            this.state.score += e.detail.score;
            console.log(`score: ${this.state.score}`);
        }, false);
    }
}

export default InterfaceScene;
