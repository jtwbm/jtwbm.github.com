'use strict';

const { parallel, series, watch, src, dest } = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    cssmin = require('gulp-clean-css'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload;

const config = {
    src: {
        folder: 'src',
        styles: 'src/styles/**/*.*css',
        scripts: 'src/scripts/*.js',
        html: 'src/*.html'
    },
    build: {
        folder: 'build',
        styles: 'build/css/',
        scripts: 'build/js/',
        html: 'build'
    },
};

const server = {
    server: {
        baseDir: config.build.folder
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "jtwbm"
};

function styles() {
    return src(config.src.styles)
            .pipe(sourcemaps.init())
            .pipe(sass())
            .pipe(autoprefixer({
                browsers: ['last 3 versions', 'ie > 10']
            }))
            .pipe(sourcemaps.write("./sourcemaps"))
            .pipe(dest(config.build.styles))
            .pipe(reload({stream: true}));
}

function scripts() {
    return src(config.src.scripts)
            .pipe(sourcemaps.init())
            .pipe(sourcemaps.write("./sourcemaps"))
            .pipe(dest(config.build.scripts))
            .pipe(reload({stream: true}));
}

function html() {
    return src(config.src.html)
            .pipe(dest(config.build.html))
            .pipe(reload({stream: true}));
}

// watch files
function watcher() {
    watch([config.src.styles], styles);
    watch([config.src.scripts], scripts);
    watch([config.src.html], html);
}

function webserver() {
    browserSync(server);
}

exports.build = parallel(styles, scripts, html);
exports.watch = series(parallel(styles, scripts, html), parallel(webserver, watcher));

// if (process.env.NODE_ENV === 'production') {
//   exports.build = series(transpile, minify);
// } else {
//   exports.build = series(transpile, livereload);
// }