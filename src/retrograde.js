
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

/**
 * @class Observer
 * Represents the position of an observer on a spherical rotating body centered at 0,0,0
 *
 * @param {number} radius Radius of spherical body
 * @param {number} elevation Angle between line through observation point to center of body and plane through equator
 * @param {number} azimuth Angle between line through observation point and center and x-z plane
 * @param {number} speed Angular speed in radians/second
*/
export class Observer {
    constructor(radius, elevation, azimuth, speed) {
        this._radius = radius;
        this._elevation = elevation;
        this._azimuth = azimuth;
        this._speed = speed;
    }

    /**
     * Returns location of observation point at time t
     *
     * @param {number} t Time in seconds
     */
    point(t) {
        let r_xy = this._radius * Math.cos(this._elevation),

            p = vec3.fromValues(
                r_xy * Math.cos(this._azimuth),
                r_xy * Math.sin(this._azimuth),
                this._radius * Math.sin(this._elevation)
            );

        return vec3.rotateZ(p, p, [0,0,0], this._speed * t);
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
