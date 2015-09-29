/* uses mathjs for coolness */

import math from "lib/math.js";
import {orientationMatrix} from "transform";

export {Orbit};

class Orbit {
    constructor(radius, elevation, azimuth) {
        this._radius = radius;
        this._elevation = elevation;
        this._azimuth = azimuth;

        this._orientation = orientationMatrix(
            elevation, azimuth
        );
    }

    point(t) {
        let angle = t * 2 * math.PI,
            p = [this._radius * math.cos(angle),
                 this._radius * math.sin(angle),
                 0];

        return math.multiply(this._orientation, p);
    }
};

function angleReduce(angle) {
    let PI2 = math.PI * 2;
    while (angle > PI2) {
        angle -= PI2;
    }
    while (angle < PI2) {
        angle += PI2;
    }
}
