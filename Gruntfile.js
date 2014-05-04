module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        jsdoc : {
            dist : {
                src : ['README.md', 'src/*.js'],
                options: {
                    destination: 'docs',
                    encoding : 'utf-8',
                    recurse : true,
                    private : true
                }
            }
        },
        concat : {
            dist : {
                src : [
                    'src/namespace.js',
                    'src/rdg.*.js'
                ],
                dest: 'build/rdg.WebtoonView-0.0.1.js'
            }
        },
        uglify : {
            my_target : {
                files : {
                    'build/rdg.WebtoonView-0.0.1.min.js' : [
                        'build/rdg.WebtoonView-0.0.1.js'
                    ]
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['jsdoc', 'concat', 'uglify']);
};
