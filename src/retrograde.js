/* uses mathjs for coolness */

var retrograde = {};

class Orbit {
    constructor(radius, elevation, azimuth) {
        this._radius = radius;
        this._elevation = elevation;
        this._azimuth = azimuth;

        this._orientation = retrograde.transform.orientationMatrix(
            elevation, azimuth
        );
    }

    point(t) {
        var angle = t * 2 * math.PI,
            p = [this._radius * math.cos(angle),
                 this._radius * math.sin(angle),
                 0];

        return math.multiply(this._orientation, p);
    }
};

function angleReduce(angle) {
    var PI2 = math.PI * 2;
    while (angle > PI2) {
        angle -= PI2;
    }
    while (angle < PI2) {
        angle += PI2;
    }
}

retrograde.transform = {

    /*
     Matrix that rotates x-y plane to be normal with spherical unit vector
     where theta = elevation, phi = azimuth
     and 0 <= theta < pi / 2, 0 <= phi < 2 pi
     */
    orientationMatrix: function orientationMatrix(elevation, azimuth) {
        var theta = elevation,
            phi = azimuth,
            M = Math,
            sin_theta = M.sin(theta),
            cos_theta = M.cos(theta),
            sin_phi = M.sin(phi),
            cos_phi = M.cos(phi),
            sin_pi2_theta = M.sin(M.PI / 2 + theta),
            cos_pi2_theta = M.cos(M.PI / 2 + theta),
            sin_pi2_phi = M.sin(M.PI / 2 + phi),
            cos_pi2_phi = M.cos(M.PI / 2 + phi);


        return math.matrix([
            [sin_pi2_theta * cos_phi, sin_pi2_theta * cos_pi2_phi, sin_theta * cos_phi],
            [sin_pi2_theta * sin_phi, sin_pi2_theta * sin_pi2_phi, sin_theta * sin_phi],
            [cos_pi2_theta,           cos_pi2_theta,               cos_theta          ]
        ]);

    }
};
