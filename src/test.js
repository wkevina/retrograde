
import transform from "transform";
import {Orbit} from "retrograde";
import math from "lib/math.js";


let ei = [1, 0, 0, 1],
    ej = [0, 1, 0, 1],
    ek = [0, 0, 1, 1],

    rotTheta = transform.orientationMatrix(math.PI / 2, 0),

    rotPhi = transform.orientationMatrix(0, math.PI / 2),

    mult = math.multiply;

console.log("Theta: expect [0, 0, -1]: ", mult(rotTheta, ei)._data);

console.log("Theta: expect [0, 1, 0]: ", mult(rotTheta, ej)._data);

console.log("Theta: expect [1, 0, 0]: ", mult(rotTheta, ek)._data);

console.log("Phi: expect [0, 1, 0]: ", mult(rotPhi, ei)._data);

console.log("Phi: expect [-1, 0, 0]: ", mult(rotPhi, ej)._data);

console.log("Phi: expect [0, 0, 1]: ", mult(rotPhi, ek)._data);

let o = new Orbit(225, 0, 0),

    p = o.plot(100),

    projection = transform.ortho(-250, 250, 250, -250, 250, -250),

    screen = transform.screenMatrix(500, 500),

    view = math.multiply(screen, projection);

console.log(p);

let canvas = document.createElement("canvas"),

    ctx = canvas.getContext("2d");

document.body.appendChild(canvas);
canvas.width = 500;
canvas.height = 500;

let theta = -math.pi * 0.25,
    phi = 0,
    index = 0,
    lastPath = null,
    camera = transform.orientationMatrix(math.PI / 2, 0);
    //camera = math.eye(4,4);

let render = function() {

    //ctx.fillStyle = "#FFF";
    //ctx.fillRect(0, 0, 500, 500);

    let model = transform.orientationMatrix(theta, phi),

        points = transform.arrayMultiply(
            math.multiply(view, math.multiply(camera, model)),
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

    //theta += 0.005;
    phi += 0.005;

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
