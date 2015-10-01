
import {vec3} from "lib/gl-matrix.js";

import {orientationMatrix} from "transform";

export class Orbit {
    constructor(radius, elevation, azimuth) {
        this._radius = radius;
        this._elevation = elevation;
        this._azimuth = azimuth;

        this._orientation = orientationMatrix(
            elevation, azimuth
        );
    }

    point(t) {
        let angle = angleReduce(t * 2 * Math.PI),

            p = vec3.fromValues(
                this._radius * Math.cos(angle),
                this._radius * Math.sin(angle),
                0
            );

        return vec3.transformMat4(p, p, this._orientation);
    }

    plot(resolution=100) {
        let a = [];

        for (let i = 0; i < resolution; ++i) {
            a.push(this.point(i / resolution));
        }

        return a;
    }
};

function angleReduce(angle) {
    let PI2 = Math.PI * 2;
    while (angle > PI2) {
        angle -= PI2;
    }
    while (angle < 0) {
        angle += PI2;
    }
    return angle;
}
