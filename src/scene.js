import THREE from "lib/three.js";

import {OrbitMesh} from "retrograde";

/**
 * Renders a mini-map view of the scene
 *
 * @param {THREE.WebGLRenderer} renderer Rendering context to use
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 */
export class MapView {
    constructor(renderer, scene_width, scene_height, x, y, width, height) {
        this.renderer = renderer;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.scene = new THREE.Scene();

        this.camera = new THREE.OrthographicCamera(
                -scene_width/2, scene_width/2,
            scene_height/2, -scene_height/2
        );

        this.camera.up.set(0, 0, -1);
    }

    get position() {
        return this.camera.position;
    }

    set position(posVec) {
        if (posVec.x)
            this.camera.position.copy(posVec);
        else
            this.camera.position.set(posVec[0], posVec[1], posVec[2]);
    }

    set observer(observer) {

        if (this._observer)
            this._observer.remove();

        let sphereGeometry = new THREE.SphereGeometry(
            observer._radius, // radius
            11, 11
        ),

            sphereMaterial = new THREE.MeshBasicMaterial({wireframe: true, color: 0x000000}),

            mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

        this._observer = mesh;

        this.scene.add(mesh);
    }

    set orbit(orbit) {
        if (this._orbitMesh) {
            this._orbitMesh.updateOrbit(orbit);
        } else {
            this._orbitMesh = new OrbitMesh(orbit, new THREE.LineBasicMaterial());

            this.scene.add(this._orbitMesh);
        }
    }

    lookAt(vec) {
        if (vec.x)
            this.camera.lookAt(vec);
        else
            this.camera.lookAt({x: vec[0], y: vec[1], z: vec[2]});
    }

    render(angle) {
        this.renderer.setViewport(this.x, this.y, this.width, this.height);

        this._observer.setRotationFromEuler(new THREE.Euler(Math.PI / 2, 0, angle, 'ZYX'));

        this.setupCamera();

        this.renderer.render(this.scene, this.camera);
    }

    setupCamera() {
        let bsphere = new THREE.Box3().setFromObject(this.scene).getBoundingSphere(),
            radius = Math.ceil(bsphere.radius / 10) * 10,
            aspect = this.width / this.height,
            left,
            right,
            top,
            bottom;

        if (aspect < 1) {
            left = -radius,
            right = radius,
            top = radius/aspect,
            bottom = -radius/aspect;
        } else {
            left = -radius * aspect,
            right = radius * aspect,
            top = radius,
            bottom = -radius;
        }

        this.camera.left = left;
        this.camera.right = right;
        this.camera.top = top;
        this.camera.bottom = bottom;

        this.camera.updateProjectionMatrix();
    }
};
