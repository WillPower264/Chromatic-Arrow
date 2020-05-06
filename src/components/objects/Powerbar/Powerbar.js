import { Group, PlaneGeometry, Mesh, MeshBasicMaterial, Sprite } from 'three';

class Powerbar extends Group {
    constructor(width, height) {
        // Call parent Group() constructor
        super();

        this.name = 'powerbar';
        this.initWidth = width;
        this.initHeight = height;
        this.buffer = 25;
        this.isFilling = false;
        this.bar = undefined;
        this.step = width / 100;
        const edgeThickness = 5;

        // Bar
        const geometry = new PlaneGeometry(0, this.initHeight);
        const material = new MeshBasicMaterial({color: 0x00ff00});
        const mesh = new Mesh(geometry, material);
        mesh.position.x += this.initWidth/2;
        mesh.position.z -= 0.01;
        this.bar = mesh;
        this.add(this.bar);

        // Outline -- setting line thickness doesn't work, so we use 4 planes
        const e1 = new PlaneGeometry(width+edgeThickness, edgeThickness);
        const mat1 = new MeshBasicMaterial({color: 0x000000});
        const mesh1 = new Mesh(e1, mat1);
        mesh1.position.y += height/2;
        this.add(mesh1);

        const e2 = new PlaneGeometry(width+edgeThickness, edgeThickness);
        const mat2 = new MeshBasicMaterial({color: 0x000000});
        const mesh2 = new Mesh(e2, mat2);
        mesh2.position.y -= height/2;
        this.add(mesh2);

        const e3 = new PlaneGeometry(edgeThickness, height+edgeThickness);
        const mat3 = new MeshBasicMaterial({color: 0x000000});
        const mesh3 = new Mesh(e3, mat3);
        mesh3.position.x += width/2;
        this.add(mesh3);

        const e4 = new PlaneGeometry(edgeThickness, height+edgeThickness);
        const mat4 = new MeshBasicMaterial({color: 0x000000});
        const mesh4 = new Mesh(e4, mat4);
        mesh4.position.x -= width/2;
        this.add(mesh4);
    }

    beginFill() {
      this.isFilling = true;
    }

    stopFill() {
      this.isFilling = false;
      this.bar.scale.setX(0);
      this.bar.position.setX(this.initWidth/2);
    }

    update(width, height, timestamp) {
      this.position.x = width - this.initWidth/2 - this.buffer;
      this.position.y = -height + this.initHeight/2 + this.buffer;
      if (this.isFilling && this.bar.scale.x < this.initWidth) {
        this.bar.scale.x += this.step;
        this.bar.position.x -= this.step/2;
      }
    }
}

export default Powerbar;
