
import transform from "transform";
import {Orbit, OrbitMesh, Observer} from "retrograde";
import {mat4, vec3} from "lib/gl-matrix.js";
import T from "lib/three.js";

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

const WIDTH = 500;
const HEIGHT = 500;

let scene = new T.Scene(),
    camera = new T.PerspectiveCamera(
        Math.PI / 4 * 360,
        WIDTH/HEIGHT,
        0.1,
        100000
    ),
    renderer = new T.WebGLRenderer();

renderer.setSize(WIDTH, HEIGHT);

document.body.appendChild(renderer.domElement);

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



// let ortho = transform.ortho(-350, 350, 350, -350, 350, -350),

//     perspective = mat4.perspective(
//         mat4.create(),
//         Math.PI / 4, // vertical field of view (radians)
//         1, // aspect ratio
//         -100, // near bound
//         100 // far bound
//     ),

//     screen = transform.screenMatrix(500, 500), // transforms NDC to screen coordinates

//     view = mat4.multiply(mat4.create(), screen, perspective),

//     canvas = document.createElement("canvas"),

//     ctx = canvas.getContext("2d");

// document.body.appendChild(canvas);
// canvas.width = 500;
// canvas.height = 500;

// let theta = Math.PI / 16,
//     phi = 0,
//     speed = 0.5 * Math.PI / 1000,
//     index = 0,
//     start = null,
//     camera = mat4.create(),
//     observationPoint = [50, 0, -100],
//     eye = [500, 0, 0],
//     up = [0, 0, 1],
//     planet = new Observer(50, Math.PI / 4, 0, -Math.PI / 4);

// let render = function(time_stamp=0) {

//     if (!start) {
//         start = time_stamp;
//     }

//     let o = new Orbit(225, theta, phi), // make orbit

//         p = o.plot(200), // plot points (really just a circle)

//         delta_t = time_stamp - start;

//     start = time_stamp;

//     //    let model = transform.orientationMatrix(theta, phi);
//     let model = mat4.create();

//     eye = planet.point(time_stamp);
// //    let nearest =
//     camera = mat4.lookAt(camera, eye, o.nearest(eye), up);

//     let mvp = mat4.multiply(mat4.create(), camera, model);
//     mvp = mat4.multiply(mvp, view, mvp);

//     ctx.fillStyle = "#000";
//     ctx.fillRect(0,0,500,500);

//     ctx.strokeStyle = "#DDD";
//     ctx.lineWidth = 1;

//     renderLines(ctx, mvp, subset(p, 0, 199));

//     renderLines(ctx, mvp, lineBetween(observationPoint, o.nearest(observationPoint)));

//     phi -= speed * delta_t;

//     index = (index + 2) % p.length;

//     window.requestAnimationFrame(render);
// };

// render();

// function subset(arr, index, samples) {
//     if (samples >= arr.length)
//         return arr;

//     let sub = arr.slice(index);

//     if (sub.length < samples)
//         return sub.concat(arr.slice(0, samples - sub.length));
//     else
//         return sub.slice(0, samples);
// }

// function pointsToPath(points) {
//     let path = new Path2D();
//     path.moveTo(points[0][0], points[0][1]);

//     for (let i = 1; i < points.length; ++i) {
//         path.lineTo(points[i][0], points[i][1]);
//     }

//     return path;
// }

// function renderLines(ctx, mvp, points) {
//     let transformedPoints = transform.arrayMultiply(
//         mvp,
//         points
//     ),
//         path = pointsToPath(transformedPoints);

//     ctx.stroke(path);
// }

// function lineBetween(start, end) {
//     return [start, end];
// }
