const gulp = require('gulp');
const ts = require('gulp-typescript');
const babel = require('gulp-babel');
const filter = require('gulp-filter');
const tslint = require('tslint');
const gulpTsLint = require('gulp-tslint');
const del = require('del');
const buildcss = require('./buildcss');

const src = ['src/**/*.{ts,tsx}'];

gulp.task('default', () => {
  return createBuildTask();
});

gulp.task('clean', () => {
  return del(['lib', 'css']);
}); 

gulp.task('lint', () => {
  const program = tslint.Linter.createProgram('./tsconfig.json');
  return gulp.src(src)
    .pipe(gulpTsLint({ program }))
    .pipe(gulpTsLint.report());
});

gulp.task('watch', gulp.series('default'), () => {
  return gulp.watch(src, ['default']);
});

gulp.task('build-crash-on-error', gulp.series('lint'), () => {
  return createBuildTask(true);
});

function createBuildTask(crashOnError) {
  const tsProject = ts.createProject('./tsconfig.json');
  const f = filter(['**', '!**/*.d.ts'], { restore: true });
  return gulp.src(src)
    .pipe(tsProject())
    .once('error', function () {
      if (crashOnError) {
        this.once('finish', () => process.exit(1));
      }
    })
    .pipe(f)
    .pipe(babel())
    .pipe(f.restore)
    .pipe(gulp.dest('lib'))
    .once('finish', buildcss);
}
