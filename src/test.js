
import transform from "transform";
import {Orbit} from "retrograde";
import math from "lib/math.js";

let o = new Orbit(250, 0, 0),

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

var theta = math.PI / 4;

let render = function() {

    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, 500, 500);

    let model = transform.orientationMatrix(theta, 0);

    let points = transform.arrayMultiply(math.multiply(view, model), p);


    //ctx.fillRect(0, 0, canvas.width, canvas.height);

    let path = pointsToPath(points);

    ctx.fillStyle = "#000";
    ctx.stroke(path);

    //theta += 0.01;

    window.requestAnimationFrame(render);
};

render();



function pointsToPath(points) {
    let path = new Path2D();
    path.moveTo(points[0][0], points[0][1]);

    for (let i = 1; i < points.length; ++i) {
        path.lineTo(points[i][0], points[i][1]);
    }

    path.lineTo(points[0][0], points[0][1]);
    path.closePath();

    return path;
}
