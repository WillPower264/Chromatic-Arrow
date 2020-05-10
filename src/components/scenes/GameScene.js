import { Scene, BoxGeometry, Color, Euler, MeshStandardMaterial, Mesh, Vector3, SphereGeometry, DoubleSide } from 'three';
import { Arrow, Target, Barrier, Splatter, Wind } from 'objects';
import { BasicLights } from 'lights';
import _ from 'lodash';
import CONSTS from '../../constants';

class GameScene extends Scene {
    constructor(isTutorial) {
        // Call parent Scene() constructor
        super();

        // Get constants
        const { backgroundColor } = CONSTS.scene;

        // Init state
        this.state = {
            updateList: [],
            targets: [],
            numTargetsInUse: 0,
            barriers: [],
        };

        // Collision helper
        this.helper = new Mesh(
            new BoxGeometry(1, 1, 10), new MeshStandardMaterial({color: 0xffffff})
        );
        this.helper.visible = false;

        // Firing arrow
        this.disableControls = false;
        this.isFiring = false;
        this.direction = new Vector3();
        this.beginFireStep = 0;
        this.currentStep = 0;
        this.barriersHit = 0;

        // Set background, ground, and lights
        this.background = new Color(backgroundColor);
        this.ground = this.initializeGround();
        this.dome = this.initializeDome();
        const lights = new BasicLights();
        this.add(lights);

        // Set arrow and add, add to update list
        this.currentArrow = new Arrow(this);
        this.add(this.currentArrow);
        this.addToUpdateList(this.currentArrow);

        // Set up for targets and wind
        this.initializeTargets();
        this.windVec = new Vector3(0, 0, 0);
        this.windSpeed = 0;

        // Create barriers, targets, and wind
        if (!isTutorial) {
            this.createBarriers();
            this.createTargetLoop();
            this.changeWind();
            this.createWind();
        }

        // Add event listeners
        this.addEventListeners();
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    end() {
        // Reveal barriers
        const { barriers } = this.state;
        for (let i = 0; i < barriers.length; i++) {
            barriers[i].reveal();
        }
        // Disable user input
        this.disableControls = true;
    }

    spawnTarget(position) {
        // Check how many targets are in use
        if (this.state.numTargetsInUse < CONSTS.scene.maxTargets) {
            // Create new target
            const { disappearing, msDuration } = CONSTS.target;
            const target = this.state.targets[this.state.numTargetsInUse];
            if (position === undefined) {
                target.setRandomPosition();
            } else {
                target.position.copy(position);
            }
            target.faceCenter();
            this.state.numTargetsInUse++;
            this.add(target);

            // Set timer to disappear
            if (disappearing) {
                _.delay(() => {
                    if (target.parent !== null) {
                        target.remove();
                    }
                }, msDuration);
            }
        }
    }

    createTargetLoop() {
        this.spawnTarget();
        // Call function again, but later
        _.delay(() => this.createTargetLoop(), CONSTS.scene.msBetweenTargets);
    }

    changeWind() {
        const direction = 2*Math.PI*Math.random();
        const { minSpeed, maxSpeed } = CONSTS.scene.wind;
        const speed = _.random(minSpeed, maxSpeed, true);
        this.windVec = new Vector3(
          speed*Math.cos(direction), 0, speed*Math.sin(direction)
        ).normalize();
        this.windSpeed = Math.round(speed);
        _.delay(() => this.changeWind(), CONSTS.scene.wind.msBetweenChange);
    }

    // TODO: Dispose when done
    createWind() {
        const wind = new Wind(this.windSpeed, this.windVec);
        this.add(wind);
        this.state.updateList.push(wind);
        _.delay(() => this.createWind(), CONSTS.scene.wind.msBetweenSpawn);
    }

    initializeTargets() {
        _.times(CONSTS.scene.maxTargets, () => {
            this.state.targets.push(new Target(this));
        });
    }

    removeObj(obj) {
        // Remove from updateList
        const ind = this.state.updateList.indexOf(obj);
        this.state.updateList[ind] = this.state.updateList.pop();

        // Remove from scene
        this.remove(obj);
    }

    addSplatterGround(position, color) {
        const splat = new Splatter(
          this.ground,
          position,
          new Euler(-Math.PI/2, 0, 0),
          CONSTS.splatter.splatSize,
          color
        );
        this.add(splat.mesh);
    }

    addSplatterBarrier(position, barrier, plane, color) {
        const projPos = new Vector3(0, 0, 0);
        plane.projectPoint(position, projPos);
        const rot = barrier.rotation.clone();
        const splat = new Splatter(
          barrier.children[0], projPos, rot, CONSTS.splatter.splatSize, color
        );
        splat.mesh.renderOrder = barrier.children.length;
        barrier.attach(splat.mesh);
    }

    addSplatterDome(position, color) {
        const domeHit = position.clone().normalize().multiplyScalar(CONSTS.dome.radius);
        const norm = position.clone().negate().normalize();
        this.helper.lookAt(norm);
        const splat = new Splatter(
            this.dome, domeHit, this.helper.rotation, CONSTS.splatter.splatSize, color, true
        );
        this.add(splat.mesh);
    }

    createBarriers() {
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
        if (!this.isFiring) {
            this.beginFireStep = this.currentStep;
        }

        // Call update for each object in the updateList
        const len = updateList.length;
        for (let i = len-1; i >= 0; i--) {
            const obj = updateList[i];
            if (obj.isDone()) {
                this.removeObj(obj);
            } else {
                const windForce = this.windVec.clone().multiplyScalar(
                  this.windSpeed
                );
                obj.update(timeStamp, windForce);
            }
        }
    }

    addEventListeners() {
        window.addEventListener("mousedown", () => {
            this.isFiring = true;
            window.dispatchEvent(new CustomEvent('newArrowColor', {detail: { color: this.currentArrow.color}}));
        }, false);

        window.addEventListener("mouseup", () => {
            // Shoot this arrow
            if (this.disableControls) { return; }
            const { chargeRate, baseForce, maxForce} = CONSTS.arrow.movement;
            const totalTime = this.currentStep - this.beginFireStep;
            const factor = Math.min(totalTime * chargeRate, 1);
            this.currentArrow.addForce(
              this.direction.normalize().clone().multiplyScalar(
                baseForce + factor * maxForce
              )
            );
            // Create new arrow
            this.currentArrow = new Arrow(this);
            this.add(this.currentArrow);
            this.addToUpdateList(this.currentArrow);
            this.isFiring = false;
        }, false);
    }

    initializeGround() {
        const { size, thickness, color, yPos } = CONSTS.ground;
        const geometry = new BoxGeometry(size, thickness, size);
        const material = new MeshStandardMaterial({ color });
        const mesh = new Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.position.setY(yPos);
        this.add(mesh);
        return mesh;
    }

    initializeDome() {
        const { radius, numSegments, color } = CONSTS.dome;
        const geometry = new SphereGeometry(radius, numSegments, numSegments);
        const material = new MeshStandardMaterial({ side: DoubleSide, color });
        const mesh = new Mesh(geometry, material);
        this.add(mesh);
        return mesh;
    }
}

export default GameScene;
