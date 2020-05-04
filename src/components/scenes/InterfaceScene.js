import { Scene } from 'three';
import { Powerbar } from 'objects';

class InterfaceScene extends Scene {
    constructor(width, height) {
        // Call parent Scene() constructor
        super();

        this.state = {
            updateList: [],
        };

        const pbar = new Powerbar(250, 50);
        pbar.update(width, height, 0);
        this.add(pbar);
        this.addToUpdateList(pbar);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(width, height, timeStamp) {
        for (const obj of this.state.updateList) {
            obj.update(width, height, timeStamp);
        }
    }
}

export default InterfaceScene;
