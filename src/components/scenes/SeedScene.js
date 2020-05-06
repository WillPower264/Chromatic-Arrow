import { Scene, BoxGeometry, Color, Euler, MeshStandardMaterial, Mesh, Vector3 } from 'three';
import { Arrow, Target, Barrier, Splatter } from 'objects';
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
            arrows: []
        };

        // Firing arrow
        this.isFiring = false;
        this.direction = new Vector3();
        this.beginFireStep = 0;
        this.currentStep = 0;

        // Set background to a nice color
        this.background = new Color(backgroundColor);

        // Set arrow and add, add to update list
        this.currentArrow = new Arrow();
        this.add(this.currentArrow);
        this.state.arrows.push(this.currentArrow);
        this.addToUpdateList(this.currentArrow);

        // Set up targets
        this.initializeTargets();

        // Set up barriers
        this.initializeBarriers();

        // Add meshes to scene
        this.ground = this.initializeGround();
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
        target.setRandomPosition();
        target.faceCenter();
        this.state.numTargetsInUse++;
        this.add(target);
    }

    initializeTargets() {
        _.times(CONSTS.scene.maxTargets, () => {
            this.state.targets.push(new Target(this));
        });
    }

    removeArrow(arrow) {
        const len = this.state.arrows.length
        if (len === 0) { return; }

        // Swap the places so there is no hole
        const ind = this.state.arrows.indexOf(arrow);
        this.state.arrows[ind] = this.state.arrows[len-1];
        this.state.arrows.pop();
        this.remove(arrow);
    }

    initializeBarriers() {
        _.times(CONSTS.scene.numBarriers, () => {
            const barrier = new Barrier();
            this.add(barrier);
            this.addToUpdateList(barrier);
            this.state.barriers.push(barrier);
        });
    }

    // TODO: scale by impact velocity
    // TODO: make color match arrow color
    addSplatterGround(position) {
        const splat = new Splatter(
          this.ground.mesh, position, new Euler(-Math.PI/2, 0, 0), 1
        );
        this.add(splat.mesh);
    }

    update(timeStamp) {
        const { updateList } = this.state;

        // Firing arrow
        this.currentStep++;
        this.beginFireStep = !this.isFiring ?
            this.currentStep : this.beginFireStep;

        // Arrow collisions
        for (let i = this.state.arrows.length-1; i >= 0; i--) {
            // Assumes ground
            // TODO: Add for other collisions
            if (this.state.arrows[i].hasCollided) {
                this.addSplatterGround(this.state.arrows[i].position);
                this.removeArrow(this.state.arrows[i]);
            }
        }

        // Create targets if needed
        this.throttledCreateTarget();

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }

    addEventListeners() {
        window.addEventListener("mousedown", () => {
            this.isFiring = true;
        }, false);

        window.addEventListener("mouseup", () => {
            // Shoot this arrow
            const totalTime = this.currentStep - this.beginFireStep;
            const factor = Math.min(totalTime*CONSTS.arrow.chargeRate, 1);
            this.currentArrow.addForce(
              this.direction.normalize().clone().multiplyScalar(
                factor*CONSTS.arrow.maxForce
              )
            );
            // Create new arrow
            this.currentArrow = new Arrow();
            this.add(this.currentArrow);
            this.state.arrows.push(this.currentArrow);
            this.addToUpdateList(this.currentArrow);
            this.isFiring = false;
        }, false);

        window.addEventListener('keydown', () => {
            this.state.targets[0].remove();
        });
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
        ground.geometry = new BoxGeometry(500, 1, 500);
        ground.mesh = new Mesh(ground.geometry, ground.material);
        ground.mesh.position.y = CONSTS.scene.groundPos;
        ground.mesh.receiveShadow = true;

        // handled in Scene.updateGroundTexture()
        // needed for ground texture
        // ground.texture = Scene.loader.load( "textures/terrain/grasslight-big.jpg" );
        // ground.texture.wrapS = ground.texture.wrapT = THREE.RepeatWrapping;
        // ground.texture.repeat.set( 25, 25 );
        // ground.texture.anisotropy = 16;
        // ground.material.map = ground.texture;
        this.add(ground.mesh); // add ground to scene
        return ground;
    }
}

export default SeedScene;
