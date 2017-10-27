'use strict';
var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var nodemon = require('gulp-nodemon');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');

/**
 * Gulp Tasks
 */

gulp.task('browser-sync', ['nodemon'], function () {
    browserSync({
        proxy: "localhost:5000",  // local node app address
        port: 7000,  // use *different* port than above
        notify: true,
        browser: "opera"
    });
});

gulp.task('nodemon', function (cb) {
    var called = false;
    return nodemon({
        script: 'server.js',
        ignore: [
            'gulpfile.js',
            'node_modules/']
    })
        .on('start', function () {
            if (!called) {
                called = true;
                cb();
            }
        })
        .on('restart', function () {
            setTimeout(function () {
                reload({stream: false});
            }, 1000);
        });
});

var jsFiles = ['static/js/socket.io.js', 'static/js/jquery-1.11.1.min.js', 'static/js/bootstrap.min.js', 'static/js/plugins.js', 'static/js/bskit-scripts.js', 'bower_components/angular/angular.js', 'bower_components/chart.js/dist/Chart.min.js', 'bower_components/angular-chart.js/dist/angular-chart.min.js', 'static/js/main.js'],
    dest = 'static/dist/',
    cssFiles = ['static/bootstrap/css/bootstrap.min.css', 'static/css/font-awesome.min.css', 'static/css/style-library-1.css', 'static/css/plugins.css', 'static/css/blocks.css'];

gulp.task('scripts', function () {
    return gulp.src(jsFiles)
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest(dest))
        .pipe(rename('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(dest));
});
gulp.task('styles', function () {
    return gulp.src(cssFiles)
        .pipe(concat('styles.css'))
        .pipe(gulp.dest(dest))
        .pipe(rename('styles.min.css'))
        .pipe(uglifycss())
        .pipe(gulp.dest(dest));
});
gulp.task('default', ['scripts', 'styles', 'browser-sync'], function () {
    gulp.watch(['static/**/*.*', '!static/dist/**'], ['scripts', 'styles', reload]);
    gulp.watch(['views/**/*.*'], reload);
});
