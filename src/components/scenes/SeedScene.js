import { Scene, Color, MeshStandardMaterial, Mesh, PlaneBufferGeometry, Vector3 } from 'three';
import { Arrow, Target } from 'objects';
import { BasicLights } from 'lights';
import _ from 'lodash';

class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            rotationSpeed: 1,
            updateList: [],
            targets: [],
            maxTargets: 5,
            numTargetsInUse: 0,
            secondsBetweenTargets: 5,
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        // Set arrow and add, add to update list
        this.arrow = new Arrow();
        this.add(this.arrow);
        this.addToUpdateList(this.arrow);

        // Set up targets
        this.initializeTargets();

        // Add meshes to scene
        this.initializeGround();
        const lights = new BasicLights();
        this.add(lights);

        // Throttled function
        this.throttledCreateTarget = _.throttle(
            this.createTarget,
            this.state.secondsBetweenTargets * 1000
        );

        // Add event listeners
        this.addEventListeners();
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    createTarget() {
        // Check how many targets are in use
        if (this.state.numTargetsInUse >= this.state.maxTargets) { return; }

        const target = this.state.targets[this.state.numTargetsInUse];
        target.setRandomPosition(this.state.targets, this.state.numTargetsInUse);
        target.faceCenter(new Vector3(0, 2, 0));
        this.state.numTargetsInUse++;
        this.add(target);
    }

    initializeTargets() {
        _.times(this.state.maxTargets, () => {
            this.state.targets.push(new Target());
        });
    }

    removeTarget(target) {
        // This should be impossible
        if (this.state.numTargetsInUse === 0) { return; }

        // Swap the places so there is no hole
        const ind = this.state.targets.indexOf(target);
        this.state.numTargetsInUse--;
        this.state.targets[ind] = this.state.targets[this.state.numTargetsInUse];
        this.state.targets[this.state.numTargetsInUse] = new Target();
        this.remove(target);
    }

    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;
        this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        // Create targets if needed
        this.throttledCreateTarget();

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }

    addEventListeners() {
        window.addEventListener("click", () => {
            this.arrow.setVelocity(new Vector3(0, 200, 500));
            // this.arrow.addForce(new Vector3(0, 2, 5));
            console.log(this.arrow.getWorldPosition(new Vector3()));
        }, false);
    }

    initializeGround() {
        const ground = {};
        ground.textures = {};

        // ground material
        ground.material = new MeshStandardMaterial({
          color: 0x091200, //0x3c3c3c,
        //   specular: 0x404761, //0x3c3c3c//,
        //   metalness: 0.3,
        });

        // ground mesh
        ground.geometry = new PlaneBufferGeometry(500, 500);
        ground.mesh = new Mesh(ground.geometry, ground.material);
        ground.mesh.position.y = 0;
        ground.mesh.rotation.x = -Math.PI / 2;
        ground.mesh.receiveShadow = true;

        // handled in Scene.updateGroundTexture()
        // needed for ground texture
        // ground.texture = Scene.loader.load( "textures/terrain/grasslight-big.jpg" );
        // ground.texture.wrapS = ground.texture.wrapT = THREE.RepeatWrapping;
        // ground.texture.repeat.set( 25, 25 );
        // ground.texture.anisotropy = 16;
        // ground.material.map = ground.texture;

        this.add(ground.mesh); // add ground to scene

        // return ground;
    }
}

export default SeedScene;
