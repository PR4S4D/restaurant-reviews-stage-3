const gulp = require("gulp");
const concat = require("gulp-concat");
const cleanCss = require("gulp-clean-css");
const autoPrefixer = require("gulp-autoprefixer");
const sourceMaps = require("gulp-sourcemaps");
const del = require("del");
const browserSync = require("browser-sync").create();
const uglify = require("gulp-uglify-es").default;
const filter = require("gulp-filter");

const cssFiles = ["app/css/styles.css", "app/css/responsive.css"];
const scriptFiles = "app/js/*.js";

//Minifies and concats the css files
gulp.task("style", () => {
  gulp
    .src(cssFiles)
    .pipe(sourceMaps.init())
    .pipe(concat("main.css"))
    .pipe(
      autoPrefixer({
        browsers: ["last 2 versions"],
        cascade: false
      })
    )
    .pipe(cleanCss())
    .pipe(filter("**/*.css"))
    .pipe(sourceMaps.write("./"))
    .pipe(gulp.dest(".tmp/css"))
    .pipe(gulp.dest("dist/css"));
});

// Minifies the javascript files
gulp.task("scripts", () => {
  gulp
    .src(scriptFiles)
    .pipe(sourceMaps.init())
    .pipe(uglify().on("error", e => console.error(e)))
    .pipe(sourceMaps.write("./"))
    .pipe(gulp.dest(".tmp/js"))
    .pipe(gulp.dest("dist/js"));
});

// Copies sw.js to dev and production destination folders
gulp.task("service-worker", () => {
  gulp
    .src(["app/sw.js", "app/manifest.json"])
    .pipe(gulp.dest(".tmp"))
    .pipe(gulp.dest("dist"));
});

gulp.task("copy-dist", () => {
  gulp.src(["app/*.html"]).pipe(gulp.dest("dist"));
  gulp.src("app/img/**").pipe(gulp.dest("dist/img"));
});

gulp.task("clean", () => del([".tmp/**", "dist/**"], { dot: true }));

// Serves development versions of the statics with live-reload
gulp.task("serve", ["default"], () => {
  browserSync.init({
    server: ["./.tmp", "./app"]
  });
  gulp.watch("app/css/*.css", ["style-watch"]);
  gulp.watch("app/js/*.js", ["js-watch"]);
  gulp.watch("app/*.html").on("change", browserSync.reload);
});

// Minifies css and js and copies the statics to .tmp and dist folders
gulp.task("default", ["style", "service-worker", "scripts"]);

// Generates production version of the statics
gulp.task("dist", ["default", "copy-dist"]);

// Serves production verions with live-reload
gulp.task("serve-dist", ["dist"], () => {
  browserSync.init({
    server: ["./dist"]
  });
  gulp.watch("app/css/*.css", ["style-watch"]);
  gulp.watch("app/js/*.js", ["js-watch"]);
  gulp.watch("app/*.html").on("change", browserSync.reload);
});

// Browser sync on javascript changes
gulp.task("js-watch", ["scripts"], function(done) {
  browserSync.reload();
  done();
});

// Browser sync on css changes
gulp.task("style-watch", ["style"], function(done) {
  browserSync.reload();
  done();
});
