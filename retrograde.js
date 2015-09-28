/* uses mathjs for coolness */

var retrograde = {};

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
