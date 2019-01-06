const path = require("path");
const gulp = require("gulp");
const minifyCSS = require("gulp-csso");
const sourcemaps = require("gulp-sourcemaps");
//
const browserSync = require("browser-sync").create();
const reload = browserSync.reload;
// postcss
const postcss = require("gulp-postcss");
const precss = require("precss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

// markdown
const marked = require("marked");

// template

// var
var src_dir = path.join(__dirname, "src");
var dest_dir = path.join(__dirname, "dist");
var dest_css_dir = path.join(dest_dir, "css");
var dest_js_dir = path.join(dest_dir, "js");
var dest_html_dir = path.join(dest_dir, "html");

// pug
gulp.task("pug", function() {
  let pug = require("gulp-pug");

  return gulp
    .src(path.join(src_dir, "templates/*.pug"))
    .pipe(pug())
    .pipe(gulp.dest(path.join(dest_dir, "html")));
});

// nunjucks
gulp.task("nunjucks", function() {
  let nunjucks = require("gulp-nunjucks");
  let html = marked(md);

  return gulp
    .src(path.join(src_dir, "templates/*.html"))
    .pipe(
      nunjucks.compile({
        username: "Sindre"
      })
    )
    .pipe(gulp.dest(path.join(dest_dir, "html")));
});

gulp.task("nunjucks:watch", function() {
  gulp.watch(src_postcss_dir, gulp.series("nunjucks"));
});

// postcss
var src_postcss_dir = path.join(src_dir, "postcss/**/*.css");
gulp.task("postcss", function() {
  let plugins = [precss()];
  return gulp
    .src(src_postcss_dir)
    .pipe(sourcemaps.init())
    .pipe(postcss())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(dest_css_dir));
});

gulp.task("postcss:watch", function() {
  gulp.watch(src_postcss_dir, ["postcss"]);
});

// sass
var src_sass_dir = path.join(src_dir, "weixin.css");
// var src_sass_dir = path.join(src_dir, "scss/**/*.scss");
var outputStyle = "expanded"; // compact compressed expanded nested

gulp.task("sass", function() {
  let sass = require("gulp-sass");

  let plugins = [
    autoprefixer({
      browsers: [
        "last 2 versions",
        "Android >= 4",
        "iOS >= 8",
        "Firefox >= 20",
        "ie 6-11"
      ]
    })
  ];
  return (
    gulp
      .src(src_sass_dir)
      // .pipe(sourcemaps.init())
      .pipe(
        sass({
          outputStyle: outputStyle
        }).on("error", sass.logError)
      )
      .pipe(postcss(plugins))
      // .pipe(sourcemaps.write("."))
      // .pipe(gulp.dest(dest_css_dir))
      .pipe(gulp.dest("assets/css"))
  );
});

gulp.task("sass:watch", function() {
  gulp.watch(src_sass_dir, ["sass"]);
});

// less
var src_less_dir = path.join(src_dir, "less/*.less");
gulp.task("less", function() {
  let less = require("gulp-less");
  return gulp
    .src(src_less_dir)
    .pipe(less())
    .pipe(minifyCSS())
    .pipe(gulp.dest(dest_css_dir));
});

gulp.task("less:watch", function() {
  gulp.watch(src_less_dir, gulp.series("less"));
});

// css
var src_css_dir = path.join(src_dir, "css/**/*.css");
gulp.task("css", function() {
  let plugins = [
    autoprefixer({
      browsers: [
        "last 2 versions",
        "Android >= 4",
        "iOS >= 8",
        "Firefox >= 20",
        "ie 6-11"
      ]
    })
  ];
  return gulp
    .src(src_css_dir)
    .pipe(postcss(plugins))
    .pipe(gulp.dest(dest_css_dir));
});

gulp.task("css:watch", function() {
  gulp.watch(css_src_dir, gulp.series("less"));
});

// image
var src_image_dir = path.join(src_dir, "images/**/*");
gulp.task("image", function() {
  let image = require("gulp-image");
  gulp
    .src("src/static/images/*")
    .pipe(
      image({
        pngquant: true,
        optipng: false,
        zopflipng: true,
        jpegRecompress: false,
        mozjpeg: true,
        guetzli: false,
        gifsicle: true,
        svgo: true,
        concurrent: 10
      })
    )
    .pipe(gulp.dest("dist/images"));
});

// copy
var copy_dir = path.join(__dirname, "assets/**/*");
var copy_dest = path.join(dest_dir, "assets");
gulp.task("copy", function() {
  gulp.src(copy_dir).pipe(gulp.dest(copy_dest));
});
gulp.task("copy:watch", function() {
  gulp.watch(copy_dir, ["copy"]);
});

// 静态服务器
gulp.task("serve", function() {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });
});

// 代理
// gulp.task('browser-sync', function () {
//   browserSync.init({
//     proxy: "你的域名或IP"
//   });
// });

// gulp.task('default', ['html', 'css']);
// gulp.task('dev', ['html', 'css']);
gulp.task("weixin", ["nunjucks:watch", "sass:watch"]);
