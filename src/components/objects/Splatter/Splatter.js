import { Group, Euler, BoxGeometry, Mesh, MeshBasicMaterial, TextureLoader, Vector3 } from 'three';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js'
import SPLATTER from './splatter.png';

class Splatter extends Group {
    constructor(mesh, position, rotation, scale, color) {
        // Call parent Group() constructor
        super();

        this.name = 'splatter';
        // Inspired by https://threejs.org/examples/webgl_decals.html
        if (color === undefined) {
          color = Math.random() * 0xffffff;
        }
        const textureLoader = new TextureLoader();
        const splatter = textureLoader.load(SPLATTER);
        this.texture = splatter;

        if (mesh !== undefined) {
            const decalMat = new MeshBasicMaterial({
              map: splatter,
              color: color,
              transparent: true,
              depthTest: true,
      				depthWrite: false,
      				polygonOffset: true,
      				polygonOffsetFactor: -4
            });
            rotation.z = Math.random()*2*Math.PI;
            const decalGeom = new DecalGeometry(
              mesh, position, rotation, new Vector3(scale,scale,scale)
            );
            const decalMesh = new Mesh(decalGeom, decalMat);
            this.mesh = decalMesh;
        }
    }
}

export default Splatter;
