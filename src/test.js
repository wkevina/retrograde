
import transform from "transform";
import {Orbit} from "retrograde";
import {mat4,vec3} from "lib/gl-matrix.js";

let o = new Orbit(225, 0, 0),

    p = o.plot(100),

    projection = transform.ortho(-350, 350, 350, -350, 350, -350),

    screen = transform.screenMatrix(500, 500),

    view = mat4.multiply(mat4.create(), screen, projection);

console.log(p);

let canvas = document.createElement("canvas"),

    ctx = canvas.getContext("2d");

document.body.appendChild(canvas);
canvas.width = 500;
canvas.height = 500;

let theta = Math.PI / 16,
    phi = 0,
    speed = 1 * Math.PI / 1000,
    index = 0,
    start = null,
    lastPath = null,
    camera = mat4.fromXRotation(mat4.create(), Math.PI / 2);

let render = function(time_stamp=0) {

    if (!start) {
        start = time_stamp;
    }

    let delta_t = time_stamp - start;
    start = time_stamp;

    let model = transform.orientationMatrix(theta, phi);

    let mvp = mat4.multiply(mat4.create(), camera, model);
    mvp = mat4.multiply(mvp, view, mvp);

    let points = transform.arrayMultiply(mvp,
                                         subset(p, index, 99)),

        path = pointsToPath(points);

    if (lastPath) {
        ctx.strokeStyle = "rgb(255,255,255)";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.stroke(lastPath);
    }

    ctx.strokeStyle = "rgb(0,0,0)";
    ctx.lineWidth = 1;
    ctx.lineCap = "butt";
    ctx.stroke(path);

    lastPath = path;

    phi += speed * delta_t;

    index = (index + 1) % p.length;

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
