const gulp = require('gulp');
const concat = require('gulp-concat');
const uglifyes = require('uglify-es');
const composer = require('gulp-uglify/composer');
const minify = composer(uglifyes, console);
const babel = require('gulp-babel');
const pump = require('pump');
const clean = require('gulp-clean');
const sequence = require('run-sequence');

let userJS = [
  //按加载顺序把src下的js文件写在这里
  './src/game.js'
]
let code = ['./cache/libs.js'].concat(userJS)
let libs = [
  './bin/libs/laya.core.js',
  './bin/libs/laya.webgl.js',
  './bin/libs/laya.ani.js',
  './bin/libs/box2d.js',
  './bin/libs/laya.ui.js',
  './bin/libs/laya.wxmini.js'
]
let assets = [
  './bin/res/atlas/local.atlas',
  './bin/res/atlas/local.png',
  './bin/local/*',
  './bin/userlibs/*',
  './bin/game.js',
  './bin/game.json',
  './bin/weapp-adapter.js'
]
//移动素材
gulp.task('moveAssets', function() {
  let stream = gulp.src(assets, {
      base: "./bin"
    })
    .pipe(gulp.dest('./release/wxgame/'));
  return stream;
});
//实时合并
gulp.task('asyncCompile', function() {
  let stream = gulp.src(code)
    .pipe(concat('code.js'))
    .pipe(gulp.dest('./release/wxgame/'));
  return stream;
});
//合并用户JS
gulp.task('compile', function() {
  let stream = gulp.src(userJS)
    .pipe(babel())
    .pipe(concat('compiled.js'))
    .pipe(minify())
    .pipe(gulp.dest('./cache/'));
  return stream;
});
//合并库
gulp.task('combinelibs', function() {
  let stream = gulp.src(libs)
    .pipe(concat('libs.js'))
    .pipe(minify())
    .pipe(gulp.dest('./cache/'))
  return stream;
});
//build时合并压缩过的库和用户JS
gulp.task('combine', function() {
  let stream = gulp.src(['./cache/libs.js','./cache/compiled.js'])
    .pipe(concat('code.js'))
    .pipe(gulp.dest('./release/wxgame/'))
  return stream;
});
//清空发布目录
gulp.task('clean', function() {
  let stream = gulp.src('./release/wxgame/*')
    .pipe(clean({
      force: true
    }))
  return stream;
});
//打包
gulp.task('build', function(cb){
  sequence('clean', 'combinelibs', 'compile', 'combine', 'moveAssets',cb)
});
//开始实时合并
gulp.task('watch', function(cb){
  gulp.watch("./src/*", ['asyncCompile'])
});
