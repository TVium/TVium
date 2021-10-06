"use strict";

//Main import
const gulp = require('gulp');

//Libs imports
const less = require('gulp-less');
const connect = require('gulp-connect');
const gutil = require('gulp-util');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

//Paths
var distributionDir = 'dist';
var originStylesheetDir = 'less';
var targetStylesheetDir = distributionDir + '/css';
var targetJSDir = distributionDir + '/js';


function lessApp() {
    return gulp.src(originStylesheetDir + '/**/*.less')
        .pipe(less({style: 'compressed'}).on('error', gutil.log))
        .pipe(gulp.dest(targetStylesheetDir));
}
function lessConsent() {
    return gulp.src('features/consent/less/**/*.less')
        .pipe(less({style: 'compressed'}).on('error', gutil.log))
        .pipe(gulp.dest('features/consent/dist'));
}
const lessCss = gulp.parallel(lessApp, lessConsent);

function scriptsApp() {
    return gulp.src('js/*.js').pipe(concat('scripts.js'))
      .pipe(gulp.dest(targetJSDir))
      .pipe(rename('scripts.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest(targetJSDir));
}

function scriptsBanner() {
    return gulp.src(['features/banner/**/*.js', '!features/banner/dist/**', '!features/banner/node_modules/**']).pipe(concat('scripts.js'))
        .pipe(gulp.dest('features/banner/dist'))
        .pipe(rename('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('features/banner/dist'));
}

function scriptsConsent() {
    return gulp.src(['features/consent/**/*.js', '!features/consent/dist/**', '!features/consent/node_modules/**']).pipe(concat('scripts.js'))
        .pipe(gulp.dest('features/consent/dist'))
        .pipe(rename('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('features/consent/dist'));
}

function scriptsAds() {
    return gulp.src(['features/ads/**/*.js', '!features/ads/dist/**', '!features/ads/node_modules/**']).pipe(concat('scripts.js'))
        .pipe(gulp.dest('features/ads/dist'))
        .pipe(rename('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('features/ads/dist'));
}

function scriptsTracing() {
    return gulp.src(['features/tracing/**/*.js', '!features/tracing/dist/**', '!features/tracing/node_modules/**']).pipe(concat('scripts.js'))
        .pipe(gulp.dest('features/tracing/dist'))
        .pipe(rename('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('features/tracing/dist'));
}

function scriptsCore() {
    return gulp.src(['features/core/**/*.js', '!features/core/dist/**', '!features/core/node_modules/**']).pipe(concat('scripts.js'))
        .pipe(gulp.dest('features/core/dist'))
        .pipe(rename('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('features/core/dist'));
}

const scripts = gulp.parallel(scriptsConsent, scriptsBanner, scriptsAds, scriptsTracing, scriptsCore, scriptsApp);

function watch(done) {
    gulp.watch([originStylesheetDir + '/**/*.less', 'features/consent/less/**/*.less'], lessCss);
    done();
}

function webserver(done) {
    connect.server({
        port: 8888
    });
    done();
}

//Default script
const build = gulp.series(lessCss, scripts, watch, webserver);

exports.less = lessCss;
exports.watch = watch;
exports.webserver = webserver;
exports.scripts = scripts;
exports.default = build;