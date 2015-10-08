System.register("demo", ["input"], function (_export) {
  "use strict";

  var SliderTracker, Demo;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  return {
    setters: [function (_input) {
      SliderTracker = _input.SliderTracker;
    }],
    execute: function () {
      Demo = function Demo() {
        _classCallCheck(this, Demo);
      };
    }
  };
});
System.register("input", [], function (_export) {
    "use strict";

    var SliderTracker;

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    return {
        setters: [],
        execute: function () {
            SliderTracker = (function () {
                function SliderTracker(selector, callback) {
                    var _this = this;

                    _classCallCheck(this, SliderTracker);

                    this.inputElement = document.querySelector(selector);
                    this.callback = callback;

                    this._handler = function () {
                        if (_this.callback) {
                            var value = $(_this.inputElement).attr("data-slider");

                            if (!isNaN(value)) _this.callback(value);
                        }
                    };

                    $(this.inputElement).on("change.fndtn.slider", this._handler);
                }

                _createClass(SliderTracker, [{
                    key: "remove",
                    value: function remove() {
                        $(this.inputElement).off("change.fndtn.slider", this._handler);
                        this.inputElement = null;
                    }
                }]);

                return SliderTracker;
            })();

            _export("SliderTracker", SliderTracker);
        }
    };
});
System.register("render", ["lib/three.js", "lib/gl-matrix.js", "transform", "retrograde", "input"], function (_export) {
    "use strict";

    var T, mat4, vec3, transform, Orbit, OrbitMesh, Observer, SliderTracker, GridBox, scene, camera, renderer, canvas, resize, orbit, material, orbitMesh, gridMesh, theta, phi, speed, start, eye, up, planet, cameraElevation, cameraElevationTarget, tracker;

    var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    function render() {
        var time_stamp = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

        requestAnimationFrame(render);

        resize();

        if (!start) {
            start = time_stamp;
        }

        var delta_t = time_stamp - start;
        start = time_stamp;

        cameraElevation = smooth(cameraElevationTarget, cameraElevation, Math.PI / 4 * delta_t / 1000);

        orbit = new Orbit(225, theta, phi);
        orbitMesh.updateOrbit(orbit);

        var observationPoint = planet.step(delta_t / 1000),
            normal = planet.normal,
            inPlane = [normal[0], normal[1], 0],
            lookDir = rotateTowards(inPlane, [0, 0, 1], cameraElevation);

        console.log(lookDir);

        camera.position.copy(V3(observationPoint));

        camera.up.copy(up);

        camera.lookAt(V3(vec3.add(observationPoint, observationPoint, lookDir)));

        phi -= speed * delta_t;

        renderer.render(scene, camera);
    }

    function V3(a, b, c) {
        if (arguments.length == 3) return new T.Vector3(a, b, c);
        return new T.Vector3(a[0], a[1], a[2]);
    }

    function rotateTowards(start, onto, angle) {
        var axis = vec3.cross(vec3.create(), start, onto),
            rotation = mat4.fromRotation(mat4.create(), angle, axis);

        if (axis[0] == axis[1] && axis[1] == axis[2] && axis[0] == 0) return start;

        return vec3.transformMat4(axis, start, rotation);
    }

    function smooth(target, current, rate) {
        var diff = target - current,
            smoothed = current + rate * Math.sign(diff);

        if (diff > 0 && smoothed > target || diff < 0 && smoothed < target) {
            smoothed = target;
        }

        return smoothed;
    }
    return {
        setters: [function (_libThreeJs) {
            T = _libThreeJs["default"];
        }, function (_libGlMatrixJs) {
            mat4 = _libGlMatrixJs.mat4;
            vec3 = _libGlMatrixJs.vec3;
        }, function (_transform) {
            transform = _transform["default"];
        }, function (_retrograde) {
            Orbit = _retrograde.Orbit;
            OrbitMesh = _retrograde.OrbitMesh;
            Observer = _retrograde.Observer;
        }, function (_input) {
            SliderTracker = _input.SliderTracker;
        }],
        execute: function () {
            GridBox = (function (_T$LineSegments) {
                _inherits(GridBox, _T$LineSegments);

                function GridBox(width, height, depth, divisions) {
                    _classCallCheck(this, GridBox);

                    _get(Object.getPrototypeOf(GridBox.prototype), "constructor", this).call(this, undefined, new T.LineBasicMaterial({ color: 0xFFFFFF }));

                    var vert = this.geometry.vertices;

                    var stepX = width / divisions,
                        stepY = height / divisions,
                        stepZ = depth / divisions,
                        w2 = width / 2,
                        h2 = height / 2,
                        d2 = depth / 2;

                    for (var x = 0; x <= divisions; ++x) {
                        vert.push(V3(stepX * x - w2, h2, -d2));
                        vert.push(V3(stepX * x - w2, -h2, -d2));

                        vert.push(V3(stepX * x - w2, h2, d2));
                        vert.push(V3(stepX * x - w2, -h2, d2));

                        vert.push(V3(stepX * x - w2, h2, -d2));
                        vert.push(V3(stepX * x - w2, h2, d2));

                        vert.push(V3(stepX * x - w2, -h2, -d2));
                        vert.push(V3(stepX * x - w2, -h2, d2));
                    }

                    for (var y = 0; y <= divisions; ++y) {
                        vert.push(V3(w2, stepY * y - h2, -d2));
                        vert.push(V3(-w2, stepY * y - h2, -d2));

                        vert.push(V3(w2, stepY * y - h2, d2));
                        vert.push(V3(-w2, stepY * y - h2, d2));

                        vert.push(V3(w2, stepY * y - h2, -d2));
                        vert.push(V3(w2, stepY * y - h2, d2));

                        vert.push(V3(-w2, stepY * y - h2, -d2));
                        vert.push(V3(-w2, stepY * y - h2, d2));
                    }

                    for (var z = 0; z <= divisions; ++z) {
                        vert.push(V3(w2, h2, stepZ * z - d2));
                        vert.push(V3(-w2, h2, stepZ * z - d2));

                        vert.push(V3(w2, -h2, stepZ * z - d2));
                        vert.push(V3(-w2, -h2, stepZ * z - d2));

                        vert.push(V3(w2, -h2, stepZ * z - d2));
                        vert.push(V3(w2, h2, stepZ * z - d2));

                        vert.push(V3(-w2, -h2, stepZ * z - d2));
                        vert.push(V3(-w2, h2, stepZ * z - d2));
                    }

                    this.geometry.verticesNeedUpdate = true;
                }

                return GridBox;
            })(T.LineSegments);

            ;

            scene = new T.Scene();
            camera = new T.PerspectiveCamera(Math.PI / 4 * 360, 1, 0.1, 100000);
            renderer = new T.WebGLRenderer({ antialias: true });
            canvas = renderer.domElement;

            document.body.appendChild(canvas);

            resize = function resize() {

                var WIDTH = canvas.clientWidth,
                    HEIGHT = canvas.clientHeight;

                if (resize.old_w === undefined) {
                    resize.old_w = 0;
                    resize.old_h = 0;
                }

                if (WIDTH != resize.old_w || HEIGHT != resize.old_h) {

                    renderer.setPixelRatio(window.devicePixelRatio);

                    renderer.setSize(WIDTH, HEIGHT, false);

                    camera.aspect = canvas.width / canvas.height;

                    camera.updateProjectionMatrix();
                }

                resize.old_w = WIDTH;
                resize.old_h = HEIGHT;
            };

            renderer.setClearColor(0xFF0000);

            resize();

            orbit = new Orbit(225, 0, 0);
            material = new T.LineBasicMaterial({ color: 0xFFFFFF });
            orbitMesh = new OrbitMesh(orbit, material, 100);
            gridMesh = new GridBox(500, 500, 500, 10);

            scene.add(orbitMesh);
            scene.add(gridMesh);

            theta = Math.PI / 16;
            phi = 0;
            speed = 0.5 * Math.PI / 1000;
            start = undefined;
            eye = [500, 0, 0];
            up = new T.Vector3(0, 0, -1);
            planet = new Observer(25, Math.PI / 4, 0, -Math.PI / 5);
            cameraElevation = 0;
            cameraElevationTarget = 0;
            tracker = new SliderTracker("#elevation", function (elev) {
                cameraElevationTarget = elev * Math.PI / 180;
            });
            requestAnimationFrame(render);
        }
    };
});
System.register("retrograde", ["lib/gl-matrix.js", "transform", "input", "lib/three.js"], function (_export) {
    "use strict";

    var vec3, mat4, orientationMatrix, SliderTracker, THREE, Orbit, OrbitMesh, Observer;

    var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
        }, function (_input) {
            SliderTracker = _input.SliderTracker;
        }, function (_libThreeJs) {
            THREE = _libThreeJs["default"];
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

            OrbitMesh = (function (_THREE$Line) {
                _inherits(OrbitMesh, _THREE$Line);

                function OrbitMesh(orbit, material) {
                    var resolution = arguments.length <= 2 || arguments[2] === undefined ? 20 : arguments[2];

                    _classCallCheck(this, OrbitMesh);

                    _get(Object.getPrototypeOf(OrbitMesh.prototype), "constructor", this).call(this, undefined, material);

                    this._resolution = resolution;

                    this.updateOrbit(orbit);
                }

                _createClass(OrbitMesh, [{
                    key: "updateOrbit",
                    value: function updateOrbit(orbit) {
                        var points = orbit.plot(this._resolution),
                            p0 = points[0];

                        this.geometry.vertices = points.map(function (p) {
                            return new THREE.Vector3(p[0], p[1], p[2]);
                        });

                        this.geometry.vertices.push(new THREE.Vector3(p0[0], p0[1], p0[2]));

                        this.geometry.verticesNeedUpdate = true;
                    }
                }]);

                return OrbitMesh;
            })(THREE.Line);

            _export("OrbitMesh", OrbitMesh);

            ;

            /**
             * @class Observer
             * Represents the position of an observer on a spherical rotating body centered at 0,0,0
             *
             * @param {number} radius Radius of spherical body
             * @param {number} elevation Angle between line through observation point to center of body and plane through equator
             * @param {number} azimuth Angle between line through observation point and center and x-z plane
             * @param {number} speed Angular speed in radians/second
            */

            Observer = (function () {
                function Observer(radius, elevation, azimuth, speed) {
                    var _this = this;

                    _classCallCheck(this, Observer);

                    this._radius = radius;
                    this._elevation = elevation;
                    this._azimuth = azimuth;
                    this._speed = speed;

                    this._speed_tracker = new SliderTracker("#speed", function (s) {
                        return _this._speed = s * Math.PI / 180;
                    });
                    this._angle = 0;
                    this._last_time = 0;
                }

                /**
                 * Returns location of observation point at time t
                 *
                 * @param {number} t Time in seconds
                 */

                _createClass(Observer, [{
                    key: "point",
                    value: function point(t) {
                        var r_xy = this._radius * Math.cos(this._elevation),
                            p = vec3.fromValues(r_xy * Math.cos(this._azimuth), r_xy * Math.sin(this._azimuth), this._radius * Math.sin(this._elevation));

                        return vec3.rotateZ(p, p, [0, 0, 0], this._speed * t);
                    }

                    /**
                     * Returns location of observation point after t time has passed
                     *
                     * @param {number} delta_t Change in time in seconds
                     */
                }, {
                    key: "step",
                    value: function step(delta_t) {
                        var r_xy = this._radius * Math.cos(this._elevation),
                            p = vec3.fromValues(r_xy * Math.cos(this._azimuth), r_xy * Math.sin(this._azimuth), this._radius * Math.sin(this._elevation));

                        this._angle += delta_t * this._speed;

                        this._lastStep = vec3.rotateZ(p, p, [0, 0, 0], this._angle);

                        return this._lastStep;
                    }

                    /**
                     * Returns unit vector in the direction from the origin of the observer
                     * to the observation point
                     *
                     * @return {vec3} Normal vector
                     */
                }, {
                    key: "normal",
                    get: function get() {
                        if (!this._lastStep) this.step(0);

                        return vec3.normalize(vec3.create(), this._lastStep);
                    }
                }]);

                return Observer;
            })();

            _export("Observer", Observer);

            ;
        }
    };
});
System.register("test", ["transform", "retrograde", "lib/gl-matrix.js", "lib/three.js"], function (_export) {
    "use strict";

    var transform, Orbit, Observer, mat4, vec3, THREE, ortho, perspective, screen, view, canvas, ctx, theta, phi, speed, index, start, camera, observationPoint, eye, up, planet, render;

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
            Observer = _retrograde.Observer;
        }, function (_libGlMatrixJs) {
            mat4 = _libGlMatrixJs.mat4;
            vec3 = _libGlMatrixJs.vec3;
        }, function (_libThreeJs) {
            THREE = _libThreeJs["default"];
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
            planet = new Observer(50, Math.PI / 4, 0, -Math.PI / 4);

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

                eye = planet.point(time_stamp);
                //    let nearest =
                camera = mat4.lookAt(camera, eye, o.nearest(eye), up);

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
