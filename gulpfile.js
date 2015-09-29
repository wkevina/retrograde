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
//var wiredep = require('wiredep').stream;

var dir = {
    index: './index.html',
    sourceDir: './src',
    source: ['./src/**/*.js', '!./app/{lib,lib/**}'],
    lib: ['!*.json',
	  './lib/**/*.*',
	  //'./node_modules/systemjs/dist/system.*',
	  //'./node_modules/es6-module-loader/dist/es6-module-loader.*',
          'node_modules/es6-micro-loader/dist/system-polyfill.min.js'
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

gulp.task('clean-build', function(cb) {
    del(dir.build, cb);
});

gulp.task('copy-static', staticCopyTasks);

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
	.pipe(concat('all.js'))
	.pipe(babel(babelOptions))
	.pipe(sourceMaps.write('.', {sourceMappingURLPrefix: '/'}))
        .pipe(gulp.dest(dir.build));
});

gulp.task('watch', function() {
    gulp.watch([dir.source, dir.lib, dir.index, 'gulpfile.js'], ['build-dev']);
});

gulp.task('connect', function() {
    connect.server({
	root: 'build',
	livereload: false,
	host: 'localhost'
    });
});

gulp.task('build-dev', function() {
    runSeq('clean-build', ['copy-static', 'compileApp']);
});

gulp.task('default', function() {
    runSeq('build-dev', ['watch', 'connect']);
});

gulp.task('bower', function() {
    gulp.src(dir.build + '/index.html')
	.pipe(wiredep({
	    cwd: '.',
	    ignorePath: /\.\.\/app\//,
	    fileTypes: {
		html: {
		    replace: {
			js: '<script src="static/{{filePath}}"></script>'
		    }
		}
	    }
	}))
	.pipe(gulp.dest(dir.build));
});
