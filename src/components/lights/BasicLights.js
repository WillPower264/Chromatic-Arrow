import { Group, AmbientLight } from 'three';

class BasicLights extends Group {
    constructor(...args) {
        // Invoke parent Group() constructor with our args
        super(...args);

        const ambi = new AmbientLight(0xffffff, 1);

        this.add(ambi);
    }
}

export default BasicLights;
