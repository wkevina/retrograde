
import T from "lib/three.js";
import {mat4, vec3} from "lib/gl-matrix.js";

import transform from "transform";
import {Orbit, OrbitMesh, Observer} from "retrograde";

class GridBox extends T.LineSegments {
    constructor(width, height, depth, divisions) {
        super(undefined, new T.LineBasicMaterial({color: 0xFFFFFF}));

        let vert = this.geometry.vertices;

        let stepX = width/divisions,
            stepY = height/divisions,
            stepZ = depth/divisions,

            w2 = width / 2,
            h2 = height / 2,
            d2 = depth / 2;

        for (let x = 0; x <= divisions; ++x) {
            vert.push(V3(stepX * x - w2, h2, -d2));
            vert.push(V3(stepX * x - w2, -h2, -d2));

            vert.push(V3(stepX * x - w2, h2, d2));
            vert.push(V3(stepX * x - w2, -h2, d2));

            vert.push(V3(stepX * x - w2, h2, -d2));
            vert.push(V3(stepX * x - w2, h2, d2));

            vert.push(V3(stepX * x - w2, -h2, -d2));
            vert.push(V3(stepX * x - w2, -h2, d2));
        }

        for (let y = 0; y <= divisions; ++y) {
            vert.push(V3(w2, stepY * y - h2, -d2));
            vert.push(V3(-w2, stepY * y - h2, -d2));

            vert.push(V3(w2, stepY * y - h2, d2));
            vert.push(V3(-w2, stepY * y - h2, d2));

            vert.push(V3(w2, stepY * y - h2, -d2));
            vert.push(V3(w2, stepY * y - h2, d2));

            vert.push(V3(-w2, stepY * y - h2, -d2));
            vert.push(V3(-w2, stepY * y - h2, d2));
        }

        for (let z = 0; z <= divisions; ++z) {
            vert.push(V3(w2, h2, stepZ * z - d2));
            vert.push(V3(-w2, h2, stepZ * z - d2));

            vert.push(V3(w2, -h2, stepZ * z - d2));
            vert.push(V3(-w2, -h2, stepZ * z - d2));

            vert.push(V3(w2, -h2, stepZ * z - d2));
            vert.push(V3(w2, h2, stepZ * z - d2));

            vert.push(V3(-w2, -h2, stepZ * z - d2));
            vert.push(V3(-w2, h2, stepZ * z - d2));
        }

        this.geometry.verticesNeedUpdate = true;
    }
};

let scene = new T.Scene(),

    camera = new T.PerspectiveCamera(
        Math.PI / 4 * 360,
        1,
        0.1,
        100000
    ),

    renderer = new T.WebGLRenderer({antialias: true}),

    canvas = renderer.domElement;

document.body.appendChild(canvas);

let resize = function() {

    const WIDTH = canvas.clientWidth,
        HEIGHT = canvas.clientHeight;

    if (resize.old_w === undefined) {
        resize.old_w = 0;
        resize.old_h = 0;
    }

    if (WIDTH != resize.old_w || HEIGHT != resize.old_h) {

        renderer.setPixelRatio(window.devicePixelRatio);

        renderer.setSize(WIDTH, HEIGHT, false);

        camera.aspect = canvas.width/canvas.height;

        camera.updateProjectionMatrix();
    }

    resize.old_w = WIDTH;
    resize.old_h = HEIGHT;
};

renderer.setClearColor(0xFF0000);

resize();

let orbit = new Orbit(225, 0, 0),

    material = new T.LineBasicMaterial({color: 0xFFFFFF}),

    orbitMesh = new OrbitMesh(orbit, material, 100),

    gridMesh = new GridBox(500, 500, 500, 10);

scene.add(orbitMesh);
scene.add(gridMesh);

let theta = Math.PI / 16,
    phi = 0,
    speed = 0.5 * Math.PI / 1000,
    start,
    eye = [500, 0, 0],
    up = new T.Vector3(0, 0, -1),
    planet = new Observer(25, Math.PI / 4, 0, -Math.PI / 5);

function render(time_stamp=0) {
    requestAnimationFrame(render);

    resize();

    if (!start) {
        start = time_stamp;
    }

    let delta_t = time_stamp - start;
    start = time_stamp;

    orbit = new Orbit(225, theta, phi);
    orbitMesh.updateOrbit(orbit);

    let observationPoint = planet.point(time_stamp / 1000);

    camera.position.copy(V3(observationPoint));
    //camera.position.copy(V3(eye));
    camera.up.copy(up);
    camera.lookAt(V3(orbit.nearest(observationPoint)));
    // camera.lookAt(V3([0,0,0]));

    phi -= speed * delta_t;

    renderer.render(scene, camera);
}

requestAnimationFrame(render);

function V3(a, b, c) {
    if (arguments.length == 3)
        return new T.Vector3(a, b, c);
    return new T.Vector3(a[0], a[1], a[2]);
}
