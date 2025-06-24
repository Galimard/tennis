const {src, dest, watch, parallel, series} = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const plumber = require('gulp-plumber');
const panini = require("panini");
const cssbeautify = require('gulp-cssbeautify');
const removeComments = require('gulp-strip-css-comments');
const imagemin = require('gulp-imagemin');
const del = require("del");
const flatten = require('gulp-flatten');
const svgSprite = require('gulp-svg-sprite');
const browserSync = require('browser-sync').create();

/* Paths */
const srcPath = 'src/';
const distPath = 'dist/';

const path = {
  build: {
      php: distPath + "php/",
      html: distPath + "public/",
      js: distPath + "assets/js/",
      vendor: distPath + "assets/js/vendor/",
      dist: distPath + "assets/js/dist/",
      css: distPath + "assets/css/",
      images: distPath + "assets/images/",
      fonts: distPath + "assets/fonts/",
      svg: distPath + "assets/sprites/",
      video: distPath + "assets/video/"
  },
  src: {
      html: srcPath + "public/**/*.html",
      js: srcPath + "assets/js/*.js",
      vendor: srcPath + "assets/js/vendor/*.js",
      dist: srcPath + "assets/js/dist/*.js",
      css: srcPath + "assets/scss/*.scss",
      images: srcPath + "assets/images/**/*.{jpg,png,gif,ico,webp,webmanifest,xml,json,pdf,jpeg}",
      fonts: srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}",
      svg: srcPath + "assets/icons/**/*.svg",
      video: srcPath + "assets/video/**/*.mp4"
  },
  watch: {
      html: srcPath + "public/**/*.html",
      js: srcPath + "assets/js/**/*.js",
      vendor: srcPath + "assets/js/vendor/*.js",
      dist: srcPath + "assets/js/dist/*.js",
      css: srcPath + "assets/scss/**/*.scss",
      images: srcPath + "assets/images/**/*.{jpg,png,gif,ico,webp,webmanifest,xml,json,pdf,jpeg}",
      fonts: srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}",
      svg: srcPath + "assets/icons/**/*.svg",
      video: srcPath + "assets/video/**/*.mp4"
  },
  clean: [
      "./" + distPath,
  ]
}

function server() {
  browserSync.init({
    server: {
      baseDir: "./" + distPath
    }
  });
}

function html(cb) {
  panini.refresh();
  return src(path.src.html, { base: srcPath })
      .pipe(plumber())
      .pipe(panini({
          root: srcPath + 'public/',
          layouts: srcPath + 'layouts/',
          partials: srcPath + 'partials/',
          helpers: srcPath + 'helpers/',
          data: srcPath + 'data/'
      }))
      .pipe(flatten({ subPath: [1] }))
      .pipe(dest(path.build.html))
      .pipe(browserSync.stream());

  cb();
}

function css() {
  return src(path.src.css, { base: srcPath + "assets/scss/" })
    .pipe(plumber())
    .pipe(postcss())
    .pipe(cssbeautify())
    .pipe(removeComments())
    .pipe(concat('style.css')) // объединить и переименовать
    .pipe(scss({
      // outputStyle: 'compressed', // сжать
      includePaths: './node_modules/'
    }))     
    .pipe(dest(path.build.css))
    .pipe(browserSync.stream());
}

function cssReplaceAbsolute() {
  return src(['./dist/assets/css/**/*.css'])
    .pipe(replace("../", "/assets/"))
    .pipe(dest(path.build.css));
}

function js() {
  return src(path.src.js, { base: srcPath + 'assets/js/' })
    .pipe(plumber())
    .pipe(concat('app.js'))
    .pipe(uglify()) // сжать js
    .pipe(dest(path.build.js))
    .pipe(browserSync.stream());
}

function jsVendor(){
  return src(path.src.vendor, { base: srcPath + 'assets/js/vendor'})
    .pipe(src('vendor/*.js'))
    .pipe(dest(path.build.vendor))
}

function jsDist() {
  return src(path.src.dist, { base: srcPath + 'assets/js/dist' })
      .pipe(src('dist/*.js'))
      .pipe(dest(path.build.dist));
}

function images() {
  return src(path.src.images)
    .pipe(imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 95, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
            plugins: [
                { removeViewBox: true },
                { cleanupIDs: false }
            ]
        })
    ]))
    .pipe(dest(path.build.images))
    .pipe(browserSync.stream());
}

function fonts() {
  return src(path.src.fonts)
    .pipe(dest(path.build.fonts))
    .pipe(browserSync.stream());
}

const svgspriteConfig = {
  shape: {
      dimension: { // Set maximum dimensions
        maxWidth: 50,
        maxHeight: 50
      },
      dest: path.build.svg + '/intermediate-svg' // Keep the intermediate files
  },
  mode: {
      view: { // Activate the «view» mode
        bust: false,
        render: {
          scss: true // Activate Sass output (with default options)
        }
      },
      symbol: true // Activate the «symbol» mode
    }
};

function sprites() {
  return src(path.src.svg)
    .pipe(svgSprite(svgspriteConfig))
    .pipe(dest(path.build.svg));
}

function video() {
  return src(path.src.video)
    .pipe(dest(path.build.video));
}

function cleanDist() {
  return del(path.clean);
}

function watchFiles() {
  watch([path.watch.html], html);
  watch([path.watch.css], css)
  watch([path.watch.js], js)
  watch([path.watch.vendor], jsVendor);
  watch([path.watch.images], images);
  watch([path.watch.fonts], fonts);
  watch([path.watch.svg], sprites);
  watch([path.watch.video], video);
  watch([path.watch.dist], jsDist);
}

/* Собирает файлы для 1С Битрикс*/
const build = series(cleanDist, parallel(html, css, js, jsVendor, jsDist, images, fonts, sprites, video));

/* Собирает файлы для Разработки и запускает watcher*/
// const dev = series(cleanDist, parallel(html, css, js, images, fonts, sprites), cssReplaceAbsolute);
const watching = parallel(build, watchFiles, server);

exports.server = server;
exports.html = html;
exports.css = css;
exports.js = js;
exports.cssReplaceAbsolute = cssReplaceAbsolute;
exports.images = images;
exports.fonts = fonts;
exports.sprites = sprites;
exports.video = video;
exports.cleanDist = cleanDist;
exports.watchFiles = watchFiles;
exports.build = build;
exports.watching = watching;
exports.default = watching;