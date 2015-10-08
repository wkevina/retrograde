/*global require: true */

var gulp = require('gulp');
var plumber = require('gulp-plumber');
var babel = require('gulp-babel');
var sourceMaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var runSeq = require('run-sequence');
var del = require('del');
var connect = require('gulp-connect');
var bower = require('gulp-bower');
var wiredep = require('wiredep').stream;

var dir = {
    index: './index.html',
    sourceDir: './src',
    source: ['./src/**/*.js', '!./app/{lib,lib/**}'],
    lib: ['!*.json',
          'node_modules/systemjs/dist/system.*',
          'node_modules/babel-core/browser-polyfill.min.js*',
          'node_modules/gl-matrix/dist/gl-matrix-min.js',
          'node_modules/three/three.js',
          'bower_components/**/*'
	 ],
    css: 'css/**/*',
    cssOut: 'dist/css',
    libOut: './dist/lib',
    build: './dist',
    targetAppJs: 'app.js',
    img: './assets/img/**/*.png',
    imgOut: './dist/img',
    ignore: '!**/#*'
};

var staticCopyTasks = [];
var copyTask = require('./copyTask')(staticCopyTasks, dir, dir.build);

copyTask('index');
copyTask('img');
copyTask('lib');
copyTask('css');

gulp.task('clean-build', function(done) {
    del(dir.build).then(function(){
        done();
    });
});

gulp.task('copy-static', function(callback) {
    runSeq(staticCopyTasks, callback);
});

gulp.task('compileApp', function() {

    var babelOptions = {
	modules: 'system',
	moduleIds: true
    };


    return gulp.src(dir.source, {
	base: dir.sourceDir
    })
	.pipe(plumber())
	.pipe(sourceMaps.init())
	.pipe(babel(babelOptions))
	.pipe(concat('all.js'))
	.pipe(sourceMaps.write('.', {sourceMappingURLPrefix: ''}))
        .pipe(gulp.dest(dir.build));
});

gulp.task('watchJS', function() {
    // return gulp.watch([dir.source, dir.lib, dir.index], ['build-dev']);
    return gulp.watch([dir.ignore, dir.source], ['build-dev']);
});

gulp.task('watchStatic', function() {
    // return gulp.watch([dir.source, dir.lib, dir.index], ['build-dev']);
    return gulp.watch([dir.ignore, dir.lib, dir.index, dir.css], ['copy-static']);
});

gulp.task('connect', function() {
    return connect.server({
	root: dir.build,
	livereload: false,
	host: 'localhost',
        port: 8082
    });
});

gulp.task('build-dev', function(cb) {
    runSeq('clean-build', 'copy-static', ['compileApp', 'bower'], cb);
});

/* Build and copy files to outside directory */
gulp.task('export', ['build-dev'], function() {
    gulp.src(dir.build + '/**/*')
        .pipe(gulp.dest('../retrograde-build'));
});


gulp.task('default', function(cb) {
    runSeq(['build-dev', 'watchStatic', 'watchJS', 'connect'], cb);
});

gulp.task('bower', function() {
    return gulp.src(dir.build + '/index.html')
	.pipe(wiredep({
	    cwd: '.',
	    ignorePath: /\.\.\/bower_components\//,
	    fileTypes: {
		html: {
		    replace: {
			js: '<script type="text/javascript" src="lib/{{filePath}}"></script>',
                        css:'<link rel="stylesheet" href="lib/{{filePath}}" />'
		    }
		}
	    }
	}))
	.pipe(gulp.dest(dir.build));
});
