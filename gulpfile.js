var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var scsslint = require('gulp-scsslint');

//Fix Node.js Child Process ENOENT Error on Windows
var jekyll = process.platform === "win32" ? "jekyll.bat" : "jekyll";

var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Copy the bower packages
 */
gulp.task('vendor', function() {
    gulp.src(['app/_bower_components/jquery/dist/jquery.min.js',
            'app/_bower_components/jquery/dist/jquery.min.map',
            'app/_bower_components/bootstrap/dist/js/bootstrap.min.js',
            'app/_bower_components/tooltipster/js/jquery.tooltipster.min.js',
            'app/_bower_components/bootstrap-validator/dist/validator.min.js'])
        .pipe(gulp.dest('js'));
    gulp.src(['app/_bower_components/bootstrap/dist/css/bootstrap.min.css',
            'app/_bower_components/tooltipster/css/tooltipster.css'])
        .pipe(gulp.dest('css'));
    gulp.src('app/_bower_components/bootstrap/dist/fonts/*')
        .pipe(gulp.dest('app/fonts'));
});

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    gulp.run('vendor');
    return cp.spawn(jekyll, ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
    gulp.run('lint');
    return gulp.src('_scss/main.scss')
        .pipe(sass({
            includePaths: ['scss'],
            onError: browserSync.notify,
            outputStyle: 'compressed'
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('_site/css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('css'));
});

/**
 * Generate sass lint report
 */
gulp.task('lint', function() {
    gulp.src('styles/*.scss')
        .pipe(scsslint())
        .pipe(scsslint.reporter());
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch('_scss/*.scss', ['sass']);
    gulp.watch(['*.html', '_layouts/*', '_posts/*', '_includes/*', 'js/*',
            'css/*'], ['jekyll-rebuild']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);
