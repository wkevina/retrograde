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
          'node_modules/systemjs/dist/system.src.js',
          'node_modules/mathjs/dist/math.js'
	 ],
    libOut: './dist/lib',
    build: './dist',
    targetAppJs: 'app.js',
    img: './assets/img/**/*.png',
    imgOut: './dist/img'
};

var staticCopyTasks = [];
var copyTask = require('./copyTask')(staticCopyTasks, dir, dir.build);

copyTask('index');
copyTask('img');
copyTask('lib');

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

gulp.task('watch', function() {
    return gulp.watch([dir.source, dir.lib, dir.index, 'gulpfile.js'], ['build-dev']);
});

gulp.task('connect', function() {
    return connect.server({
	root: dir.build,
	livereload: false,
	host: 'localhost',
        port: 8081
    });
});

gulp.task('build-dev', function(cb) {
    runSeq('clean-build', 'copy-static', ['compileApp', 'bower'], cb);
});

gulp.task('default', function(cb) {
    runSeq('build-dev', ['watch', 'connect'], cb);
});

gulp.task('bower', function() {
    return gulp.src(dir.build + '/index.html')
	.pipe(wiredep({
	    cwd: '.',
	    ignorePath: /\.\.\/bower_components\//,
	    fileTypes: {
		html: {
		    replace: {
			js: '<script src="lib/{{filePath}}"></script>'
		    }
		}
	    }
	}))
	.pipe(gulp.dest(dir.build));
});
