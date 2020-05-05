import { Scene } from 'three';
import { Crosshairs, Powerbar, Timer } from 'objects';

class InterfaceScene extends Scene {
    constructor(width, height) {
        // Call parent Scene() constructor
        super();

        this.state = {
            updateList: [],
        };

        // Interface objects
        const pbar = new Powerbar(250, 50);
        pbar.update(width, height, 0);
        this.add(pbar);
        this.addToUpdateList(pbar);
        this.pbar = pbar;

        const cross = new Crosshairs();
        this.add(cross);

        const timer = new Timer(60);
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
    }
}

export default InterfaceScene;
