'use strict';

const { parallel, series, watch, src, dest } = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass'),
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    cssmin = require('gulp-clean-css'),
    rigger = require('gulp-rigger'),
    del = require('del'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload;

const config = {
    src: {
        folder: 'src',
        styles: 'src/styles/**/*.*css',
        scripts: 'src/scripts/*.js',
        html: 'src/*.html',
        fonts: 'src/fonts/**/*'
    },
    build: {
        folder: 'build',
        styles: 'build/css/',
        scripts: 'build/js/',
        html: 'build',
        fonts: 'build/fonts/'
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

function cleanBuild() {
    return del([config.build.folder, config.build.folder + '/**/*']);
}

function styles() {
    return src(config.src.styles)
            .pipe(sourcemaps.init())
            .pipe(sass())
            .pipe(autoprefixer({
                browsers: ['last 3 versions', 'ie > 10']
            }))
            .pipe(dest(config.build.styles))
            .pipe(sourcemaps.write("./sourcemaps"))
            .pipe(dest(config.build.styles))
            .pipe(reload({stream: true}));
}

function stylesProduction() {
     return src(config.src.styles)
            .pipe(sass())
            .pipe(autoprefixer({
                browsers: ['last 3 versions', 'ie > 10']
            }))
            .pipe(cssmin({compatibility: 'ie10'}))
            .pipe(dest(config.build.styles));
}

function scripts() {
    return src(config.src.scripts)
            .pipe(babel({
                presets: ['@babel/preset-env']
            }))
            .pipe(sourcemaps.init())
            .pipe(dest(config.build.scripts))
            .pipe(sourcemaps.write("./sourcemaps"))
            .pipe(reload({stream: true}));
}

function scriptsProduction() {
    return src(config.src.scripts)
            .pipe(babel({
                presets: ['@babel/preset-env']
            }))
            .pipe(uglify())
            .pipe(dest(config.build.scripts));
}

function html() {
    return src(config.src.html)
            .pipe(rigger())
            .pipe(dest(config.build.html))
            .pipe(reload({stream: true}));
}
function fonts() {
    return src(config.src.fonts)
            .pipe(dest(config.build.fonts))
            .pipe(reload({stream: true}));
}

// watch files
function watcher() {
    watch([config.src.styles], styles);
    watch([config.src.scripts], scripts);
    watch([config.src.html], html);
    watch([config.src.fonts], fonts);
}

function webserver() {
    browserSync(server);
}

exports.clean = cleanBuild;
exports.build = series(cleanBuild, parallel(styles, scripts, html, fonts));
exports.default = series(cleanBuild, parallel(styles, scripts, html, fonts), parallel(webserver, watcher));
exports.prod = series(cleanBuild, parallel(stylesProduction, scriptsProduction, html, fonts));
// if (process.env.NODE_ENV === 'production') {
//   exports.build = series(transpile, minify);
// } else {
//   exports.build = series(transpile, livereload);
// }