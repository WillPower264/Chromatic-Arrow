import { Scene, Color, MeshStandardMaterial, Mesh, PlaneBufferGeometry, Vector3 } from 'three';
import { Arrow, Target, Barrier } from 'objects';
import { BasicLights } from 'lights';
import _ from 'lodash';
import CONSTS from '../../constants';

class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Get constants
        const { backgroundColor, msBetweenTargets } = CONSTS.scene;

        // Init state
        this.state = {
            updateList: [],
            targets: [],
            numTargetsInUse: 0,
            barriers: [],
        };

        // Set background to a nice color
        this.background = new Color(backgroundColor);

        // Set arrow and add, add to update list
        this.arrow = new Arrow();
        this.add(this.arrow);
        this.addToUpdateList(this.arrow);

        // Set up targets
        this.initializeTargets();

        // Set up barriers
        this.initializeBarriers();

        // Add meshes to scene
        this.initializeGround();
        const lights = new BasicLights();
        this.add(lights);

        // Throttled function
        this.throttledCreateTarget = _.throttle(
            this.createTarget,
            msBetweenTargets
        );

        // Add event listeners
        this.addEventListeners();
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    createTarget() {
        // Check how many targets are in use
        if (this.state.numTargetsInUse >= CONSTS.scene.maxTargets) { return; }

        const target = this.state.targets[this.state.numTargetsInUse];
        target.setRandomPosition(this.state.targets, this.state.numTargetsInUse);
        target.faceCenter();
        this.state.numTargetsInUse++;
        this.add(target);
    }

    initializeTargets() {
        _.times(CONSTS.scene.maxTargets, () => {
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

    initializeBarriers() {
        _.times(CONSTS.scene.numBarriers, () => {
            const barrier = new Barrier();
            this.add(barrier);
            this.addToUpdateList(barrier);
            this.state.barriers.push(barrier);
        });
    }

    update(timeStamp) {
        const { updateList } = this.state;

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
            color: CONSTS.scene.groundColor, //0x3c3c3c,
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
