
import math from "lib/math.js";

/*
 Matrix that rotates x-y plane to be normal with spherical unit vector
 where theta = elevation, phi = azimuth
 and 0 <= theta < pi / 2, 0 <= phi < 2 pi
 */
export function orientationMatrix(elevation, azimuth) {
    let theta = elevation,
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
        [sin_pi2_theta * cos_phi, sin_pi2_theta * cos_pi2_phi, sin_theta * cos_phi, 0],
        [sin_pi2_theta * sin_phi, sin_pi2_theta * sin_pi2_phi, sin_theta * sin_phi, 0],
        [cos_pi2_theta,           cos_pi2_theta,               cos_theta          , 0],
        [            0,                       0,            0,                      1]
    ]);
}

/*
 Orthographic projection matrix
 Returns 4x4 matrix
 __                                                                                        __
 |                                                                                          |
 | 2 / (right - left)          0                 0         -(right + left) / (right - left) |
 |                                                                                          |
 |       0            2 / (top - bottom)         0         -(top + bottom) / (top - bottom) |
 |                                                                                          |
 |       0                     0         -2 / (far - near)    (far + near) / (far - near)   |
 |                                                                                          |
 |       0                     0                 0                         1                |
 |                                                                                          |
 --                                                                                        --
 */
export function ortho(left, right, top, bottom, near, far) {
    let m = math.eye(4,4);

    m.subset(math.index(0,0), 2 / (right - left));
    m.subset(math.index(1,1), 2 / (top - bottom));
    m.subset(math.index(2,2), -2 / (far - near));

    m.subset(math.index(0,3), -(right + left) / (right - left));
    m.subset(math.index(1,3), -(top + bottom) / (top - bottom));
    m.subset(math.index(2,3), -(far + near) / (far - near));

    return m;
}

export function screenMatrix(width, height) {
    let m = math.eye(4,4);

    m.subset(math.index(0, 0), width / 2);
    m.subset(math.index(1, 1), height / 2);

    m.subset(math.index(0, 3), width / 2);
    m.subset(math.index(1, 3), height / 2);

    return m;
}

export function arrayMultiply(matrix, arr) {
    return arr.map((a) => math.multiply(matrix, a)._data);
}

export function translate(x, y, z) {
    let m = math.eye(4,4);

    m.subset(math.index(0, 3), x);
    m.subset(math.index(1, 3), y);
    m.subset(math.index(2, 3), z);

    return m;
}

export default {
    orientationMatrix: orientationMatrix,
    ortho: ortho,
    arrayMultiply: arrayMultiply,
    translate: translate,
    screenMatrix: screenMatrix
};
