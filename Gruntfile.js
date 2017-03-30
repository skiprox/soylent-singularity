module.exports = function(grunt) {

	require('load-grunt-tasks')(grunt);

	//Project configuration.
	grunt.initConfig({
		browserify: {
      dev: {
        options: {
          debug: true
        },
        files:{
          'public/app.built.js' : 'public/app.js'
        }
      }
    },
		watch: {
      js: {
        files: ['public/app.js'],
        tasks: ['browserify:dev']
      }
    }
	});

	//Task(s).
	grunt.registerTask('default', ['browserify']);
  grunt.registerTask('debug', ['watch']);

}