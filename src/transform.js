
import {vec3, mat4} from "lib/gl-matrix.js";

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
        cos_phi = M.cos(phi);

    return mat4.clone(
        [cos_phi * cos_theta, sin_phi * cos_theta, -sin_theta, 0,
                    -sin_phi,             cos_phi,          0, 0,
         cos_phi * sin_theta, sin_phi * sin_theta,  cos_theta, 0,
                           0,                   0,          0, 1]
    );
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
    return mat4.ortho(mat4.create(), left, right, bottom, top, near, far);
}

export function screenMatrix(width, height) {
    let m = mat4.create();

    m[0] = width / 2;
    m[5] = height / 2;
    m[12] = width / 2;
    m[13] = height / 2;

    return m;
}

export function arrayMultiply(matrix, arr) {
    return arr.map((a) => vec3.transformMat4(vec3.create(), a, matrix));
}

export function translate(x, y, z) {
    return mat4.fromTranslation(mat4.create(), [x, y, z]);
}

export default {
    orientationMatrix: orientationMatrix,
    ortho: ortho,
    arrayMultiply: arrayMultiply,
    translate: translate,
    screenMatrix: screenMatrix
};
