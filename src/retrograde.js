
import {vec3, mat4} from "lib/gl-matrix.js";

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

    /* Returns vector that points from source point to nearest point on orbit */
    nearest(source) {
        let t = this._orientation,

            t_inverse = mat4.invert(mat4.create(), t),

            // Transform source vector into orbit's local space
            source_prime;

        if (vec3.squaredLength(source) != 0) {
            source_prime = vec3.transformMat4(vec3.create(), source, t_inverse);
        } else {
            source_prime = [1, 0, 0];
        }

        // Project source_prime onto x-y place
        let projection = vec3.fromValues(source_prime[0], source_prime[1], 0),

            // Nearest point is simply at distance r from origin in direction of projection
            p_prime = vec3.scale(projection, vec3.normalize(projection, projection), this._radius);

        // Return vector projected back into orbit's transformed space
        return vec3.transformMat4(p_prime, p_prime, t);
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
