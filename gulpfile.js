const gulp = require( "gulp" );
const babel = require( "gulp-babel" );
const uglify = require( "gulp-uglify-es" ).default;
const polyfiller = require( 'gulp-polyfiller' );
const concat = require( 'gulp-concat' );
const rename = require( 'gulp-rename' );
const sass = require( 'gulp-sass' );

function style() {
	return (
		gulp
		.src( "src/**/*.scss" )
		.pipe( sass({outputStyle: 'compressed'}) )
		.on( "error", sass.logError )

		.pipe( rename( 'customselect.css' ) )
		.pipe( gulp.dest( "dist/" ) )
	);
}


function js() {
	return gulp.src( [ 'src/jquery.customselect.js' ] )
		.pipe( babel() )
		.pipe( polyfiller( [ 'Array.prototype.find', 'Array.from' ] ) )
		.pipe( concat( 'jquery.customselect.js' ) )
		.pipe( gulp.dest( 'dist/' ) )
		.pipe( uglify() )
		.pipe( rename( 'jquery.customselect.min.js' ) )
		.pipe( gulp.dest( 'dist/' ) );
}

function watch() {
	gulp.watch( 'src/**/*.scss', style )
	gulp.watch('src/jquery.customselect.js', js);
}

exports.watch = watch;