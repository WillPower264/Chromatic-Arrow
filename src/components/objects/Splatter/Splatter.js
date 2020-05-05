import { Group, Euler, BoxGeometry, Mesh, MeshBasicMaterial, TextureLoader, Vector3 } from 'three';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js'
import SPLATTER from './splatter.png';

class Splatter extends Group {
    constructor(mesh, position, rotation, scale) {
        // Call parent Group() constructor
        super();

        // testing
        const testG = new BoxGeometry(1, 1, 0.01);
        const testMat = new MeshBasicMaterial({color: 0xffffff});
        const testM = new Mesh(testG, testMat);
        testM.position.set(0, 1, 10)
        testM.updateMatrix();
        //parent.add(testM);

        this.name = 'splatter';
        const textureLoader = new TextureLoader();
        const splatter = textureLoader.load(SPLATTER);
        const decalMat = new MeshBasicMaterial({
          map: splatter,
          color: Math.random() * 0xffffff,
          transparent: true,
          depthTest: true,
  				depthWrite: false,
  				polygonOffset: true,
  				polygonOffsetFactor: -4
        });
        const decalGeom = new DecalGeometry(
          mesh, position, rotation, new Vector3(scale,scale,scale)
        );
        const decalMesh = new Mesh(decalGeom, decalMat);
        this.mesh = decalMesh;
    }
}

export default Splatter;
