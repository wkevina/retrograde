
import transform from "transform";
import {Orbit} from "retrograde";
import {mat4,vec3} from "lib/gl-matrix.js";

let ortho = transform.ortho(-350, 350, 350, -350, 350, -350),

    perspective = mat4.perspective(
        mat4.create(),
        Math.PI / 4, // vertical field of view (radians)
        1, // aspect ratio
        -100, // near bound
        100 // far bound
    ),

    screen = transform.screenMatrix(500, 500), // transforms NDC to screen coordinates

    view = mat4.multiply(mat4.create(), screen, perspective),

    canvas = document.createElement("canvas"),

    ctx = canvas.getContext("2d");

document.body.appendChild(canvas);
canvas.width = 500;
canvas.height = 500;

let theta = Math.PI / 16,
    phi = 0,
    speed = 0.5 * Math.PI / 1000,
    index = 0,
    start = null,
    camera = mat4.create(),
    observationPoint = [50, 0, -100],
    eye = [500, 0, 0],
    up = [0, 0, 1];

let render = function(time_stamp=0) {

    if (!start) {
        start = time_stamp;
    }

    let o = new Orbit(225, theta, phi), // make orbit

        p = o.plot(200), // plot points (really just a circle)

        delta_t = time_stamp - start;

    start = time_stamp;

    //    let model = transform.orientationMatrix(theta, phi);
    let model = mat4.create();

    camera = mat4.lookAt(camera, eye, [0,0,0], up);

    let mvp = mat4.multiply(mat4.create(), camera, model);
    mvp = mat4.multiply(mvp, view, mvp);

    ctx.fillStyle = "#000";
    ctx.fillRect(0,0,500,500);

    ctx.strokeStyle = "#DDD";
    ctx.lineWidth = 1;

    renderLines(ctx, mvp, subset(p, 0, 199));

    renderLines(ctx, mvp, lineBetween(observationPoint, o.nearest(observationPoint)));

    phi -= speed * delta_t;

    index = (index + 2) % p.length;

    window.requestAnimationFrame(render);
};

render();

function subset(arr, index, samples) {
    if (samples >= arr.length)
        return arr;

    let sub = arr.slice(index);

    if (sub.length < samples)
        return sub.concat(arr.slice(0, samples - sub.length));
    else
        return sub.slice(0, samples);
}

function pointsToPath(points) {
    let path = new Path2D();
    path.moveTo(points[0][0], points[0][1]);

    for (let i = 1; i < points.length; ++i) {
        path.lineTo(points[i][0], points[i][1]);
    }

    return path;
}

function renderLines(ctx, mvp, points) {
    let transformedPoints = transform.arrayMultiply(
        mvp,
        points
    ),
        path = pointsToPath(transformedPoints);

    ctx.stroke(path);
}

function lineBetween(start, end) {
    return [start, end];
}
