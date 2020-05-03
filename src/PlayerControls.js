// Adapted from https://github.com/jpan17/constellations/blob/d253faeded2bf84009a3d47eb1fd33e0050cdcd0/js/PlayerControls.js

import { Euler, MOUSE, Vector3, Object3D } from 'three';
// initializes the player
const PlayerControls = function(camera, domElement) {
    const scope = this;

    this.domElement = (domElement !== undefined) ? domElement : document;

    this.velocity = new Vector3();

    this.block = new Object3D();
    this.block.add(camera);
    this.block.position.copy(camera.position);

    // Mouse buttons
    this.mouseButtons = { ORBIT: MOUSE.LEFT, ZOOM: MOUSE.MIDDLE, PAN: MOUSE.RIGHT };

    this.isLocked = false;

    const euler = new Euler(0, 0, 0, 'YXZ');
    const PI_2 = Math.PI / 2;

    function onMouseMove(event) {
        if (scope.isLocked === false) { return; }

        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        euler.setFromQuaternion(camera.quaternion);
        euler.y -= movementX * 0.002;
        euler.x -= movementY * 0.002;
        euler.x = Math.max(- PI_2, Math.min(PI_2, euler.x));
        camera.quaternion.setFromEuler(euler);
    }

    function onPointerlockChange() {
        scope.isLocked = document.pointerLockElement === scope.domElement;
    }

    function onPointerlockError() {
        console.error('THREE.PointerLockControls: Unable to use Pointer Lock API');
    }

    this.connect = function() {
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('pointerlockchange', onPointerlockChange, false);
        document.addEventListener('pointerlockerror', onPointerlockError, false);
    };

    this.disconnect = function() {
        document.removeEventListener('mousemove', onMouseMove, false);
        document.removeEventListener('pointerlockchange', onPointerlockChange, false);
        document.removeEventListener('pointerlockerror', onPointerlockError, false);
    };

    this.dispose = function() { this.disconnect(); };

    this.getObject = function() { return this.block; };
    this.getDirection = function() {
        const direction = new Vector3(0, 0, 0);
        camera.getWorldDirection(direction);
        return direction;
    };

    this.connect();

    this.enabled = false;

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;

    this.update = function(delta) {
        // Gradual slowdown
        const speed = 200;
        const velocity = this.velocity;

        // slow down based on friction
        velocity.x -= velocity.x * 10 * delta;
        velocity.z -= velocity.z * 10 * delta;

        // get change in velocity based on
        const dir = this.getDirection();
        dir.y = 0;
        dir.normalize();
        dir.multiplyScalar(speed * delta);
        const deltaV = new Vector3();
        if (this.moveForward) {
            deltaV.add(dir);
        }
        if (this.moveBackward) {
            deltaV.sub(dir);
        }
        if (this.moveLeft) {
            deltaV.x += dir.z;
            deltaV.z -= dir.x;
        }
        if (this.moveRight) {
            deltaV.x -= dir.z;
            deltaV.z += dir.x;
        }

        velocity.add(deltaV);
        this.block.translateX(velocity.x * delta);
        this.block.translateZ(velocity.z * delta);
    };

    const havePointerLock = 'pointerLockElement' in document ||
                                                 'mozPointerLockElement' in document ||
                                              'webkitPointerLockElement' in document;

    if (havePointerLock) {
        const element = document.body;
        const pointerlockchange = function() {
            if (document.pointerLockElement === element ||
                        document.mozPointerLockElement === element ||
                        document.webkitPointerLockElement === element) {
                scope.controlsEnabled = true;
                document.addEventListener('mousemove', onMouseMove, false);
            } else {
                scope.controlsEnabled = false;
            }
        };
        const pointerlockerror = function() {
            //There was an error
        };
        // Hook pointer lock state change events
        document.addEventListener('pointerlockchange', pointerlockchange, false);
        document.addEventListener('mozpointerlockchange', pointerlockchange, false);
        document.addEventListener('webkitpointerlockchange', pointerlockchange, false);
        document.addEventListener('pointerlockerror', pointerlockerror, false);
        document.addEventListener('mozpointerlockerror', pointerlockerror, false);
        document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

    } else {
        document.body.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
    }

    document.body.addEventListener("click", function() {
        const element = document.body;
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        element.requestPointerLock();
    });
};
export default PlayerControls;
