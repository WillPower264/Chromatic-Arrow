import * as Dat from 'dat.gui';
import { Scene, Color, MeshStandardMaterial, Mesh, PlaneBufferGeometry } from 'three';
import { Flower, Land } from 'objects';
import { BasicLights } from 'lights';

class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 1,
            updateList: [],
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        // Add meshes to scene
        const land = new Land();
        land.position.set(12, 0, 12);
        const flower = new Flower(this);
        flower.position.set(12, 0, 12);
        const lights = new BasicLights();
        this.add(land, flower, lights);

        // Populate GUI
        this.state.gui.add(this.state, 'rotationSpeed', -5, 5);
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;
        this.rotation.y = (rotationSpeed * timeStamp) / 10000;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }

    addEventListeners() {
        window.addEventListener("click", () => console.log(this), false);
    }

    buildGround() {
        const ground = {};
        ground.textures = {};

        // ground material
        ground.material = new MeshStandardMaterial({
          color: 0x0b6e24, //0x3c3c3c,
          specular: 0x404761, //0x3c3c3c//,
          metalness: 0.3,
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
