var gulp = require('gulp');
var path = require('path');
var sourcemaps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');
var del = require('del');
var concat = require('gulp-concat')
var runSequence = require('run-sequence');
var nodemon = require('nodemon');
var notify = require("gulp-notify");
var concatCss = require('gulp-concat-css');

// SERVER
gulp.task('clean', function(){
    return del('dist')
});

gulp.task('build:server', function () {
    var js = gulp.src('src/server/**/*.js')
		.pipe(gulp.dest('dist/server'))

    var views = gulp.src('src/server/views/*')
		.pipe(gulp.dest('dist/server/views'))

    var views = gulp.src('src/server/uploads/*')
		.pipe(gulp.dest('dist/server/uploads'))

    var views = gulp.src('src/server/exports/*')
		.pipe(gulp.dest('dist/server/exports'))
});

// CLIENT

/*
  cssNPMDependencies, sometimes order matters here! so becareful!
*/
var fontsDependencies = [
    'font-awesome/fonts/*'
];

var cssNPMDependencies = [
    'font-awesome/css/font-awesome.min.css',
    'codemirror/codemirror.css'
];

var jsDependencies = [
	'jquery-3.1.1.min.js',
    'codemirror/codemirror.js',
    'codemirror/mode/xml/xml.js',
    'codemirror/mode/htmlmixed/htmlmixed.js'
];

var tinyMceDependencies = [
    'tinymce/**/*'
];

gulp.task('build:index', function(){
    var mappedCssPaths = cssNPMDependencies.map(file => {return path.resolve('lib', file)});
    var mappedFontsPaths = fontsDependencies.map(file => {return path.resolve('lib', file)});
    var mappedJsPaths = jsDependencies.map(file => {return path.resolve('lib', file)});
    var mappedTinymcePaths = tinyMceDependencies.map(file => {return path.resolve('lib', file)});
	
    //Let's copy our head dependencies into a dist/libs
    var copyCssNPMDependencies = gulp.src(mappedCssPaths, {base:'lib'})
        .pipe(concatCss("dependencies.css"))    
        .pipe(gulp.dest('dist/client/css'));
    
    var copyFontsNPMDependencies = gulp.src(mappedFontsPaths, {base:'lib'})
        .pipe(gulp.dest('dist/client/css'));
    
    var copyJsNPMDependencies = gulp.src(mappedJsPaths, {base:'lib'})
        .pipe(concat("dependencies.js"))    
        .pipe(gulp.dest('dist/client/js'));

    var tinymceNPMDependencies = gulp.src(mappedTinymcePaths, {base:'lib'})
        .pipe(gulp.dest('dist/client/js'));

    return [
        copyCssNPMDependencies, 
        copyFontsNPMDependencies, 
        copyJsNPMDependencies,
        tinymceNPMDependencies
    ];
});

gulp.task('build:app', function(){
    var js = gulp.src('src/client/js/*.js')
        .pipe(concat("app.js"))
		.pipe(gulp.dest('dist/client/js'));    
    
    var css = gulp.src('src/client/css/*.css')
        .pipe(concat("app.css"))
		.pipe(gulp.dest('dist/client/css'))
});

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch('src/client/**/*', ['build:index', 'build:app']);
    gulp.watch('src/server/**/*', ['build:server']);
});

gulp.task('run:server', function (cb) {
    nodemon({
        script: 'sample/bin/www',
        watch: ['src/server/**/*'],
        ext: 'js'
    }).on('restart', function(){
        gulp.src('sample/bin/www')
            // I've added notify, which displays a message on restart. Was more for me to test so you can remove this
            .pipe(notify('Running the start tasks and stuff'));
        }
    );
})

gulp.task('dist', function(callback){
    runSequence('clean', 'build:server', 'build:index', 'build:app', callback);
});

gulp.task('build', function(callback){
    runSequence('clean', 'build:server', 'build:index', 'build:app', 'watch', 'run:server', callback);
});

gulp.task('default', ['build']);