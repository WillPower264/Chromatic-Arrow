import { Scene, BoxGeometry, Color, Euler, MeshStandardMaterial, Mesh, Vector3 } from 'three';
import { Arrow, Target, Barrier, Splatter, Wind } from 'objects';
import { BasicLights } from 'lights';
import _ from 'lodash';
import CONSTS from '../../constants';

class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Get constants
        const {
          backgroundColor, msBetweenTargets, msBetweenWind
        } = CONSTS.scene;

        // Init state
        this.state = {
            updateList: [],
            targets: [],
            numTargetsInUse: 0,
            barriers: [],
        };

        // Firing arrow
        this.isFiring = false;
        this.direction = new Vector3();
        this.beginFireStep = 0;
        this.currentStep = 0;

        // Set background to a nice color
        this.background = new Color(backgroundColor);

        // Set arrow and add, add to update list
        this.currentArrow = new Arrow(this);
        this.add(this.currentArrow);
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

        this.throttledCreateWind = _.throttle(
            this.createWind,
            msBetweenWind
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

    // TODO: Change wind direction/speed
    // TODO: Dispose when done
    createWind() {
        const wind = new Wind(2, new Vector3(0.1, 0, 1));
        this.add(wind);
        this.state.updateList.push(wind);
    }

    initializeTargets() {
        _.times(CONSTS.scene.maxTargets, () => {
            this.state.targets.push(new Target(this));
        });
    }

    removeObj(obj) {
        // Swap the places so there is no hole
        const len = this.state.updateList.length;
        const ind = this.state.updateList.indexOf(obj);
        this.state.updateList[ind] = this.state.updateList[len-1];
        this.state.updateList.pop();
        this.remove(obj);
    }

    // TODO: scale by impact velocity
    addSplatterGround(position, color) {
        const splat = new Splatter(
          this.ground.mesh, position, new Euler(-Math.PI/2, 0, 0), 1, color
        );
        this.add(splat.mesh);
    }

    // TODO: scale by impact velocity
    addSplatterBarrier(position, barrier, plane, color) {
        const projPos = new Vector3(0, 0, 0);
        plane.projectPoint(position, projPos);
        const rot = new Euler(0, Math.atan2(plane.normal.x, plane.normal.z), 0);
        const splat = new Splatter(
          barrier.children[0], projPos, rot, 1, color
        );
        barrier.attach(splat.mesh);
        barrier.children[0].visible = false;
    }

    initializeBarriers() {
        _.times(CONSTS.scene.numBarriers, (n) => {
            const barrier = new Barrier(n);
            this.add(barrier);
            this.addToUpdateList(barrier);
            this.state.barriers.push(barrier);
        });
    }

    update(timeStamp) {
        const { updateList } = this.state;

        // Firing arrow
        this.currentStep++;
        this.beginFireStep = !this.isFiring ?
            this.currentStep : this.beginFireStep;

        // Create targets if needed
        this.throttledCreateTarget();

        this.throttledCreateWind();

        // Call update for each object in the updateList
        const len = updateList.length;
        console.log(updateList)
        for (let i = len-1; i >= 0; i--) {
            const obj = updateList[i];
            if (obj.isDone()) {
                this.removeObj(obj);
            } else {
                obj.update(timeStamp);
            }
        }
        console.log(updateList.length)
    }

    addEventListeners() {
        window.addEventListener("mousedown", () => {
            this.isFiring = true;
        }, false);

        window.addEventListener("mouseup", () => {
            // Shoot this arrow
            const totalTime = this.currentStep - this.beginFireStep;
            const factor = Math.min(totalTime*CONSTS.arrow.movement.chargeRate, 1);
            this.currentArrow.addForce(
              this.direction.normalize().clone().multiplyScalar(
                factor*CONSTS.arrow.movement.maxForce
              )
            );
            // Create new arrow
            this.currentArrow = new Arrow(this);
            this.add(this.currentArrow);
            this.addToUpdateList(this.currentArrow);
            this.isFiring = false;
        }, false);

        window.addEventListener('keydown', () => {
            this.state.barriers[_.random(CONSTS.scene.numBarriers - 1)].reveal(Math.random() * 0xffffff);
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
