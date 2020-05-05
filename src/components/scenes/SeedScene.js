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
            secondsBetweenTargets: 5,
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        // Set arrow and add, add to update list
        this.arrow = new Arrow();
        this.add(this.arrow);
        this.addToUpdateList(this.arrow);

        // Add meshes to scene
        this.buildGround();
        const lights = new BasicLights();
        this.add(lights);

        // Throttled function
        this.throttledCreateTarget = _.throttle(this.createTarget, this.state.secondsBetweenTargets * 1000);

        // Add event listeners
        this.addEventListeners();
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    createTarget() {
        if (this.state.targets.length >= this.state.maxTargets) { return; }

        console.log('creating target');
        const target = new Target();
        target.position.setX(_.random(-2, 2, true));
        target.position.setY(_.random(1, 2, true));
        target.position.setZ(_.random(-2, 2, true));
        target.faceCenter();
        this.state.targets.push(target);
        this.add(target);
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
            this.arrow.setVelocity(new Vector3(0, 2, 5));
            console.log(this.arrow.velocity);
            
        }, false);
    }

    buildGround() {
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
