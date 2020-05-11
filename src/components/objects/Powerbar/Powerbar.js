import { Group, PlaneGeometry, Mesh, MeshBasicMaterial, Color } from 'three';
import CONSTS from '../../../constants';

class Powerbar extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        this.name = 'powerbar';

        const { width, height, edgeThickness, edgeColor, fillColor } = CONSTS.powerBar;
        this.isFilling = false;
        this.step = width * CONSTS.arrow.movement.chargeRate;

        // Bar
        const geometry = new PlaneGeometry(0, height);
        const material = new MeshBasicMaterial({ color: fillColor });
        const mesh = new Mesh(geometry, material);
        mesh.position.x += width / 2;
        mesh.position.z -= 0.01;
        this.bar = mesh;
        this.add(this.bar);

        // Outline -- setting line thickness doesn't work, so we use 4 planes
        const outlineMat = new MeshBasicMaterial({ color: edgeColor });
        const e1 = new PlaneGeometry(width + edgeThickness, edgeThickness);
        const mesh1 = new Mesh(e1, outlineMat);
        mesh1.position.y += height / 2;
        this.add(mesh1);

        const e2 = new PlaneGeometry(width + edgeThickness, edgeThickness);
        const mesh2 = new Mesh(e2, outlineMat);
        mesh2.position.y -= height / 2;
        this.add(mesh2);

        const e3 = new PlaneGeometry(edgeThickness, height + edgeThickness);
        const mesh3 = new Mesh(e3, outlineMat);
        mesh3.position.x += width / 2;
        this.add(mesh3);

        const e4 = new PlaneGeometry(edgeThickness, height + edgeThickness);
        const mesh4 = new Mesh(e4, outlineMat);
        mesh4.position.x -= width / 2;
        this.add(mesh4);

        this.addEventListeners();
    }

    setFillColor(color) {
        this.bar.material.color = new Color(color);
    }

    beginFill() {
        this.isFilling = true;
    }

    stopFill() {
        this.isFilling = false;
        this.bar.scale.setX(0);
        this.bar.position.setX(CONSTS.powerBar.width / 2);
    }

    update() {
        if (this.isFilling && this.bar.scale.x < CONSTS.powerBar.width) {
            this.bar.scale.x += this.step;
            this.bar.position.x -= this.step / 2;
        }
    }

    destruct() {
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].geometry.dispose();
            this.children[i].material.dispose();
        }
    }

    windowResizeHandler() {
        const { width, height, buffer } = CONSTS.powerBar;
        this.position.x = window.innerWidth / 2 - width / 2 - buffer;
        this.position.y = -window.innerHeight / 2 + height / 2 + buffer;
    }

    addEventListeners() {
        this.windowResizeHandler();
        window.addEventListener('resize', () => this.windowResizeHandler(), false);
        window.addEventListener('newArrowColor', (e) => this.setFillColor(e.detail.color), false);
    }

}

export default Powerbar;
