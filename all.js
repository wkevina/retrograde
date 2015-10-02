System.register("retrograde", ["lib/gl-matrix.js", "transform"], function (_export) {
    "use strict";

    var vec3, mat4, orientationMatrix, Orbit;

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function angleReduce(angle) {
        var PI2 = Math.PI * 2;
        while (angle > PI2) {
            angle -= PI2;
        }
        while (angle < 0) {
            angle += PI2;
        }
        return angle;
    }
    return {
        setters: [function (_libGlMatrixJs) {
            vec3 = _libGlMatrixJs.vec3;
            mat4 = _libGlMatrixJs.mat4;
        }, function (_transform) {
            orientationMatrix = _transform.orientationMatrix;
        }],
        execute: function () {
            Orbit = (function () {
                function Orbit(radius, elevation, azimuth) {
                    _classCallCheck(this, Orbit);

                    this._radius = radius;
                    this._elevation = elevation;
                    this._azimuth = azimuth;

                    this._orientation = orientationMatrix(elevation, azimuth);
                }

                _createClass(Orbit, [{
                    key: "point",
                    value: function point(t) {
                        var angle = angleReduce(t * 2 * Math.PI),
                            p = vec3.fromValues(this._radius * Math.cos(angle), this._radius * Math.sin(angle), 0);

                        return vec3.transformMat4(p, p, this._orientation);
                    }
                }, {
                    key: "plot",
                    value: function plot() {
                        var resolution = arguments.length <= 0 || arguments[0] === undefined ? 100 : arguments[0];

                        var a = [];

                        for (var i = 0; i < resolution; ++i) {
                            a.push(this.point(i / resolution));
                        }

                        return a;
                    }

                    /* Returns vector that points from source point to nearest point on orbit */
                }, {
                    key: "nearest",
                    value: function nearest(source) {
                        var t = this._orientation,
                            t_inverse = mat4.invert(mat4.create(), t),

                        // Transform source vector into orbit's local space
                        source_prime = undefined;

                        if (vec3.squaredLength(source) != 0) {
                            source_prime = vec3.transformMat4(vec3.create(), source, t_inverse);
                        } else {
                            source_prime = [1, 0, 0];
                        }

                        // Project source_prime onto x-y place
                        var projection = vec3.fromValues(source_prime[0], source_prime[1], 0),

                        // Nearest point is simply at distance r from origin in direction of projection
                        p_prime = vec3.scale(projection, vec3.normalize(projection, projection), this._radius);

                        // Return vector projected back into orbit's transformed space
                        return vec3.transformMat4(p_prime, p_prime, t);
                    }
                }]);

                return Orbit;
            })();

            _export("Orbit", Orbit);

            ;
        }
    };
});
System.register("test", ["transform", "retrograde", "lib/gl-matrix.js"], function (_export) {
    "use strict";

    var transform, Orbit, mat4, vec3, ortho, perspective, screen, view, canvas, ctx, theta, phi, speed, index, start, camera, observationPoint, eye, up, render;

    function subset(arr, index, samples) {
        if (samples >= arr.length) return arr;

        var sub = arr.slice(index);

        if (sub.length < samples) return sub.concat(arr.slice(0, samples - sub.length));else return sub.slice(0, samples);
    }

    function pointsToPath(points) {
        var path = new Path2D();
        path.moveTo(points[0][0], points[0][1]);

        for (var i = 1; i < points.length; ++i) {
            path.lineTo(points[i][0], points[i][1]);
        }

        return path;
    }

    function renderLines(ctx, mvp, points) {
        var transformedPoints = transform.arrayMultiply(mvp, points),
            path = pointsToPath(transformedPoints);

        ctx.stroke(path);
    }

    function lineBetween(start, end) {
        return [start, end];
    }
    return {
        setters: [function (_transform) {
            transform = _transform["default"];
        }, function (_retrograde) {
            Orbit = _retrograde.Orbit;
        }, function (_libGlMatrixJs) {
            mat4 = _libGlMatrixJs.mat4;
            vec3 = _libGlMatrixJs.vec3;
        }],
        execute: function () {
            ortho = transform.ortho(-350, 350, 350, -350, 350, -350);
            perspective = mat4.perspective(mat4.create(), Math.PI / 4, // vertical field of view (radians)
            1, // aspect ratio
            -100, // near bound
            100 // far bound
            );
            screen = transform.screenMatrix(500, 500);
            view = mat4.multiply(mat4.create(), screen, perspective);
            canvas = document.createElement("canvas");
            ctx = canvas.getContext("2d");

            document.body.appendChild(canvas);
            canvas.width = 500;
            canvas.height = 500;

            theta = Math.PI / 16;
            phi = 0;
            speed = 0.5 * Math.PI / 1000;
            index = 0;
            start = null;
            camera = mat4.create();
            observationPoint = [50, 0, -100];
            eye = [500, 0, 0];
            up = [0, 0, 1];

            render = function render() {
                var time_stamp = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

                if (!start) {
                    start = time_stamp;
                }

                var o = new Orbit(225, theta, phi),
                    // make orbit

                p = o.plot(200),
                    // plot points (really just a circle)

                delta_t = time_stamp - start;

                start = time_stamp;

                //    let model = transform.orientationMatrix(theta, phi);
                var model = mat4.create();

                camera = mat4.lookAt(camera, eye, [0, 0, 0], up);

                var mvp = mat4.multiply(mat4.create(), camera, model);
                mvp = mat4.multiply(mvp, view, mvp);

                ctx.fillStyle = "#000";
                ctx.fillRect(0, 0, 500, 500);

                ctx.strokeStyle = "#DDD";
                ctx.lineWidth = 1;

                renderLines(ctx, mvp, subset(p, 0, 199));

                renderLines(ctx, mvp, lineBetween(observationPoint, o.nearest(observationPoint)));

                phi -= speed * delta_t;

                index = (index + 2) % p.length;

                window.requestAnimationFrame(render);
            };

            render();
        }
    };
});
// transforms NDC to screen coordinates
System.register("transform", ["lib/gl-matrix.js"], function (_export) {

    /*
     Matrix that rotates x-y plane to be normal with spherical unit vector
     where theta = elevation, phi = azimuth
     and 0 <= theta < pi / 2, 0 <= phi < 2 pi
     */
    "use strict";

    var vec3, mat4;

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

    _export("orientationMatrix", orientationMatrix);

    _export("ortho", ortho);

    _export("screenMatrix", screenMatrix);

    _export("arrayMultiply", arrayMultiply);

    _export("translate", translate);

    function orientationMatrix(elevation, azimuth) {
        var theta = elevation,
            phi = azimuth,
            M = Math,
            sin_theta = M.sin(theta),
            cos_theta = M.cos(theta),
            sin_phi = M.sin(phi),
            cos_phi = M.cos(phi);

        return mat4.clone([cos_phi * cos_theta, sin_phi * cos_theta, -sin_theta, 0, -sin_phi, cos_phi, 0, 0, cos_phi * sin_theta, sin_phi * sin_theta, cos_theta, 0, 0, 0, 0, 1]);
    }

    function ortho(left, right, top, bottom, near, far) {
        return mat4.ortho(mat4.create(), left, right, bottom, top, near, far);
    }

    function screenMatrix(width, height) {
        var m = mat4.create();

        m[0] = width / 2;
        m[5] = height / 2;
        m[12] = width / 2;
        m[13] = height / 2;

        return m;
    }

    function arrayMultiply(matrix, arr) {
        return arr.map(function (a) {
            return vec3.transformMat4(vec3.create(), a, matrix);
        });
    }

    function translate(x, y, z) {
        return mat4.fromTranslation(mat4.create(), [x, y, z]);
    }

    return {
        setters: [function (_libGlMatrixJs) {
            vec3 = _libGlMatrixJs.vec3;
            mat4 = _libGlMatrixJs.mat4;
        }],
        execute: function () {
            _export("default", {
                orientationMatrix: orientationMatrix,
                ortho: ortho,
                arrayMultiply: arrayMultiply,
                translate: translate,
                screenMatrix: screenMatrix
            });
        }
    };
});
//# sourceMappingURL=all.js.map
