"use strict";

//Main import
const gulp = require('gulp');

//Libs imports
const jshint = require('gulp-jshint');
const less = require('gulp-less');
const connect = require('gulp-connect');
const gutil = require('gulp-util');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

//Paths
var distributionDir = 'dist';
var originStylesheetDir = 'less';
var originJSDir = 'js';
var targetStylesheetDir = distributionDir + '/css';
var targetJSDir = distributionDir + '/js';

//Build & Run scripts
function lint() {
    return gulp.src([originJSDir + '/**/*.js', 'features/consent/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
}

function lessCss() {
    return gulp.src([originStylesheetDir + '/**/*.less', 'features/consent/' + originStylesheetDir + '/**/*.less'])
        .pipe(less({style: 'compressed'}).on('error', gutil.log))
        .pipe(gulp.dest(targetStylesheetDir));
}

function scripts() {
    return gulp.src([originJSDir + '/**/*.js', 'features/consent/**/*.js'])
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest(targetJSDir))
        .pipe(rename('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(targetJSDir));
}

function watch(done) {
    gulp.watch([originStylesheetDir + '/**/*.less', "features/consent/" + originStylesheetDir + '/**/*.less'], lessCss);
    done();
}

function webserver(done) {
    connect.server({
        port: 8888
    });
    done();
}

//Default script
const build = gulp.series(lint, lessCss, scripts, watch, webserver);

exports.lint = lint;
exports.less = lessCss;
exports.watch = watch;
exports.webserver = webserver;
exports.scripts = scripts;
exports.default = build;