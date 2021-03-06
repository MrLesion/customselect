const gulp = require( "gulp" );
const babel = require( "gulp-babel" );
const uglify = require( "gulp-uglify-es" ).default;
const polyfiller = require( 'gulp-polyfiller' );
const concat = require( 'gulp-concat' );
const rename = require( 'gulp-rename' );
const sass = require( 'gulp-sass' );
const eslint = require( 'gulp-eslint' );

const paths = {
    js: 'src/js/**/*.js',
    scss: 'src/scss/**/*.scss',
    dist: 'dist/'
};

function style() {
    return (
        gulp
        .src( paths.scss )
        .pipe( sass( { outputStyle: 'compressed' } ) )
        .on( "error", sass.logError )
        .pipe( rename( 'jquery.customselect.css' ) )
        .pipe( gulp.dest( paths.dist ) )
    );
};


function js() {
    return gulp.src( paths.js )
        .pipe( babel() )
        .pipe( eslint() )
        .pipe( eslint.format() )
        .pipe( eslint.failAfterError() )
        .pipe( polyfiller( [ 'Array.from' ] ) )
        .pipe( concat( 'jquery.customselect.js' ) )
        .pipe( gulp.dest( paths.dist ) )
        .pipe( uglify( {
            output: {
                beautify: false,
                comments: /^!|\b(copyright|license)\b|@(preserve|license|cc_on)\b/i,
            },
            compress: {
                sequences: true,
                booleans: true,
                conditionals: true,
                hoist_funs: false,
                hoist_vars: false,
                warnings: false,
            },
            mangle: true
        } ) )
        .pipe( rename( 'jquery.customselect.min.js' ) )
        .pipe( gulp.dest( paths.dist ) );
};

function dev( cb ) {
    gulp.watch( paths.scss, style )
    gulp.watch( paths.js, js );
    cb();
};

function build( cb ) {
    gulp.series( style, js );
    cb();
};

exports.dev = dev;
exports.build = build;
exports.default = dev;