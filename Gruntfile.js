/*jshint es3: false */

// *************************************************************************
// REQUIRE PATHS
// Add any paths here you want shortened. Relative to the 'js' dir.
// *************************************************************************

var amdModulePaths = {
    'pubsub': './lib/vendors/jquery/pubsub',
    'istats': './lib/vendors/istats/istats',
    'd3': './lib/vendors/d3/d3.v3.min',
//    'topojson': './lib/vendors/topojson/topojson.v1.min'
};

pathsHtml4 = pathsHtml5 = {
    'pubsub': './lib/vendors/jquery/pubsub',
    'istats': './lib/vendors/istats/istats'

};
pathsHtml4['jquery'] = './lib/vendors/jquery/jquery-1.9.1';
pathsHtml5['jquery'] = './lib/vendors/jquery/jquery-2.1.0';

// *************************************************************************
// PROJECT FILES
// Make a list of templates you want converted to files
// *************************************************************************

var projectFiles = {
    'index.html': 'index.html.tmpl',
    'index.inc':  'index.inc.tmpl',
    'test.html':  'test.html.tmpl'
};

// *************************************************************************
// GRUNT CONFIG
// You shouldn't need to edit anything below here
// *************************************************************************

var path = require('path'),
    _    = require('lodash-node');

var requirePathsForJquery1build = _.merge({
        'jquery': './lib/vendors/jquery/jquery-1.9.1'
    }, amdModulePaths),
    requirePathsForJquery2build = _.merge({
        'jquery': './lib/vendors/jquery/jquery-2.1.0'
    }, amdModulePaths);


module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            js: {
                files: ['Gruntfile.js', './source/js/**/*', '!**/node_modules/**'],
                tasks: ['js'],
                options: {
                    spawn: false
                }
            },
            css: {
                files: ['./source/scss/**/*', '!**/node_modules/**'],
                tasks: ['css'],
                options: {
                    spawn: false
                }
            },
            cssImg: {
                files: ['./source/scss/news_special/f/**/*', '!**/node_modules/**'],
                tasks: ['copy:cssFurniture'],
                options: {
                    spawn: false
                }
            },
            html: {
                files: ['./source/tmpl/**/*', './source/scss/news_special/inline.scss', '!**/node_modules/**'],
                tasks: ['html'],
                options: {
                    spawn: false
                }
            },
            img: {
                files: ['./source/img/**/*', '!**/node_modules/**'],
                tasks: ['responsive_images'],
                options: {
                    spawn: false
                }
            },
            // options: {
            //     livereload: false
            // }
        },
        requirejs: {
            jquery1: {
                options: {
                    baseUrl: './source/js',
                    paths: requirePathsForJquery1build,
                    optimize: 'uglify2',
                    generateSourceMaps: false,
                    preserveLicenseComments: false,
                    name: './app',
                    out: './<%= multi_lang_site_generator.default.options.vocabs[0] %>/js/all-legacyie.js'
                }
            },
            jquery2: {
                options: {
                    baseUrl: './source/js',
                    paths: requirePathsForJquery2build,
                    optimize: 'uglify2',
                    generateSourceMaps: false,
                    preserveLicenseComments: false,
                    name: './app',
                    out: './<%= multi_lang_site_generator.default.options.vocabs[0] %>/js/all-html5.js'
                }
            }
        },
        copy: {
            js: {
                files: [{
                    expand: true,
                    cwd:    'source/js/lib/vendors/',
                    src:    ['require/require-2.1.0.js', 'legacy-ie-polyfills.js'],
                    dest:   '<%= multi_lang_site_generator.default.options.vocabs[0] %>/js/lib/vendors/'
                }]
            },
            jsAll: {
                files: [{
                    expand: true,
                    cwd:    'source/js/',
                    src:    ['**'],
                    dest:   '<%= multi_lang_site_generator.default.options.vocabs[0] %>/js/'
                }]
            },
            cssFurniture: {
                files: [{
                    expand: true,
                    cwd:    'source/scss/news_special/f/',
                    src:    ['*.*'],
                    dest:   '<%= multi_lang_site_generator.default.options.vocabs[0] %>/css/f'
                }]
            },
            prepDeploy: {
                files: [
                    {expand: true, cwd: '<%= multi_lang_site_generator.default.options.vocabs[0] %>', src: ['**'], dest: 'tmp'}
                ]
            },
            stageDeploy: {
                files: [
                    {expand: true, cwd: 'tmp', src: ['**'], dest: '/Volumes/wwwlive/news/special/<%= pkg.year %>/newsspec_<%= pkg.project_number %>'}
                ]
            },
            liveDeploy: {
                files: [
                    {expand: true, cwd: 'tmp', src: ['**'], dest: '/Volumes/Inetpub/wwwlive/news/special/<%= pkg.year %>/newsspec_<%= pkg.project_number %>'}
                ]
            },
            standardImages: {
                files: [{
                    expand: true,
                    cwd: 'source/img',
                    src: '*.*',
                    dest: '<%= multi_lang_site_generator.default.options.vocabs[0] %>/img'
                }]
            }
        },
        multi_lang_site_generator: {
            default: {
                options: {
                    vocabs:             ['english'],
                    vocab_directory:    'source/vocabs',
                    template_directory: 'source/tmpl/',
                    data: {
                        version:             '<%= pkg.version %>',
                        inlineStyleElm:      '<style><%= grunt.file.read(multi_lang_site_generator.default.options.vocabs[0] + "/css/inline.css") %></style>',
                        inlineIframeManager: '<%= grunt.file.read("source/js/lib/news_special/iframemanager__host.js") %>',
                        path:                '<%= env.local.domain %>/news/special/<%= pkg.year %>/newsspec_<%= pkg.project_number %>',
                        pathStatic:          '<%= env.local.domainStatic %>/news/special/<%= pkg.year %>/newsspec_<%= pkg.project_number %>',
                        projectNumber:       '<%= pkg.project_number %>',
                        cpsId:               '<%= pkg.cps_id || pkg.project_number %>',
                        istatsName:          '<%= pkg.istatsName %>',
                        storyPageUrl:        '<%= pkg.storyPageUrl %>'
                    }
                },
                files: projectFiles
            },
            build_all_other_sites: {
                options: {
                    vocabs:             ['master', 'russian', 'persian', 'spanish', 'ukrainian', 'azeri', 'hindi', 'turkish'],
                    vocab_directory:    'source/vocabs',
                    template_directory: 'source/tmpl/',
                    data: {
                        version:             '<%= pkg.version %>',
                        inlineStyleElm:      '<style><%= grunt.file.read(multi_lang_site_generator.default.options.vocabs[0] + "/css/inline.css") %></style>',
                        inlineIframeManager: '<%= grunt.file.read("source/js/lib/news_special/iframemanager__host.js") %>',
                        path:                '<%= env.local.domain %>/news/special/<%= pkg.year %>/newsspec_<%= pkg.project_number %>',
                        pathStatic:          '<%= env.local.domainStatic %>/news/special/<%= pkg.year %>/newsspec_<%= pkg.project_number %>',
                        projectNumber:       '<%= pkg.project_number %>',
                        cpsId:               '<%= pkg.cps_id || pkg.project_number %>',
                        istatsName:          '<%= pkg.istatsName %>',
                        storyPageUrl:        '<%= pkg.storyPageUrl %>'
                    }
                },
                files: projectFiles
            }
        },
        cloudfile_to_vocab: {
            default: {
                options: {
                    output_directory:      'source/vocabs',
                    google_spreadsheet_id: '<%= env.vocabIds.newsspec_6925 %>',
                    username:              '<%= env.google.username %>',
                    password:              '<%= env.google.password %>'
                }
            }
        },
        sass: {
            main: {
                files: {
                    './<%= multi_lang_site_generator.default.options.vocabs[0] %>/css/main.css':   './source/scss/main.scss',
                    './<%= multi_lang_site_generator.default.options.vocabs[0] %>/css/legacy-ie.css': './source/scss/legacy-ie.scss',
                }
            },
            inline: {
                files: {
                    './<%= multi_lang_site_generator.default.options.vocabs[0] %>/css/inline.css': './source/scss/news_special/inline.scss'
                }
            }
        },
        responsive_images: {
            main: {
                options: {
                    sizes: [{
                        width: 320
                    }, {
                        width: 640
                    }, {
                        width: 1024
                    }]
                },
                files: [{
                    expand: true,
                    src: ['**.{jpg,gif,png}'],
                    cwd: 'source/img/responsive',
                    custom_dest: '<%= multi_lang_site_generator.default.options.vocabs[0] %>/img/{%= width %}/'
                }]
            }
        },
        imagemin: {
            dist: {
                options: {
                    optimizationLevel: 3,
                    progressive: true
                },
                files: [
                    {
                        expand: true,
                        src: ['<%= multi_lang_site_generator.default.options.vocabs[0] %>/img/**/*.*', '<%= multi_lang_site_generator.default.options.vocabs[0] %>/css/f/**.*'],
                        dest: './'
                    }
                ]
            }
        },
        jshint: {
            options: {
                es3: true,
                indent: 4,
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                quotmark: true,
                sub: true,
                boss: true,
                eqnull: true,
                trailing: true,
                white: true,
                force: true,
                ignores: ['source/js/lib/news_special/template_engine.js']
            },
            all: ['Gruntfile.js', 'source/js/lib/news_special/*.js', 'source/js/*.js', 'source/js/spec/*.js']
        },
        csslint: {
            options: {
                'known-properties'              : false,
                'box-sizing'                    : false,
                'box-model'                     : false,
                'compatible-vendor-prefixes'    : false,
                'regex-selectors'               : false,
                'duplicate-background-images'   : false,
                'gradients'                     : false,
                'fallback-colors'               : false,
                'font-sizes'                    : false,
                'font-faces'                    : false,
                'floats'                        : false,
                'star-property-hack'            : false,
                'outline-none'                  : false,
                'import'                        : false,
                'underscore-property-hack'      : false,
                'rules-count'                   : false,
                'qualified-headings'            : false,
                'shorthand'                     : false,
                'text-indent'                   : false,
                'unique-headings'               : false,
                'unqualified-attributes'        : false,
                'vendor-prefix'                 : false,
                'force': true
            },
            src: ['./<%= multi_lang_site_generator.default.options.vocabs[0] %>/css/main.css']
        },
        jasmine: {
            allTests: {
                src: 'source/js/newsspec_<%= pkg.project_number %>/*.js',
                options: {
                    keepRunner: false,
                    specs: 'source/js/spec/*Spec.js',
                    template: require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        requireConfig: {
                            baseUrl: '<%= requirejs.jquery1.options.baseUrl %>',
                            paths: '<%= requirejs.jquery1.options.paths %>'
                        }
                    }
                }
            }
        },
        uglify: {
            options: {
                mangle: true
            },
            my_target: {
                files: {
                    '<%= multi_lang_site_generator.default.options.vocabs[0] %>/js/lib/news_special/iframemanager__host.js': ['source/js/lib/news_special/iframemanager__host.js']
                }
            }
        },
        replace: {
            prepStageDeploy: {
                src: ['tmp/*/**.*'],
                overwrite: true,
                replacements: [{
                    from: '<%= env.local.domain %>',
                    to: '<%= env.stage.domain %>'
                }, {
                    from: '<%= env.local.domainStatic %>',
                    to: '<%= env.stage.domainStatic %>'
                }]
            },
            prepLiveDeploy: {
                src: ['tmp/*/**.*'],
                overwrite: true,
                replacements: [{
                    from: '<%= env.local.domain %>',
                    to: '<%= env.live.domain %>'
                }, {
                    from: '<%= env.local.domainStatic %>',
                    to: '<%= env.live.domainStatic %>'
                }]
            }
        },
        clean: ['<%= multi_lang_site_generator.default.options.vocabs[0] %>/js/news_special', '<%= multi_lang_site_generator.default.options.vocabs[0] %>/css/inline.css', 'tmp'],
        connect: {
            local: {
                options: {
                    hostname: '127.0.0.1',
                    port:     1031,
                    base:     '.',
                    directory: '<%= pkg.localhost %>',
                    middleware: function (connect, options) {
                        var middlewares = [];
                        if (!Array.isArray(options.base)) {
                            options.base = [options.base];
                        }
                        var directory = options.directory || options.base[options.base.length - 1];
                        options.base.forEach(function (base) {
                            middlewares.push(connect.static(base));
                        });
                        middlewares.push(connect.static(directory));
                        middlewares.push(connect.directory(directory));
                        return middlewares;
                    }
                }
            },
            localStatic: {
                options: {
                    hostname: '127.0.0.1',
                    port:     1033,
                    base:     '.',
                    directory: '<%= pkg.localhost %>',
                    middleware: function (connect, options) {
                        var middlewares = [];
                        if (!Array.isArray(options.base)) {
                            options.base = [options.base];
                        }
                        var directory = options.directory || options.base[options.base.length - 1];
                        options.base.forEach(function (base) {
                            middlewares.push(connect.static(base));
                        });
                        middlewares.push(connect.static(directory));
                        middlewares.push(connect.directory(directory));
                        return middlewares;
                    },
                    keepalive: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-responsive-images');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-rename');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-multi-lang-site-generator');
    grunt.loadNpmTasks('grunt-cloudfile-to-vocab');
    grunt.loadNpmTasks('grunt-contrib-csslint');

    grunt.registerTask('default',     ['add_environment_data', /*'jshint',*/ 'css', /*'jasmine',*/ 'requirejs', /*'uglify',*/ 'multi_lang_site_generator:default', 'copy:js', 'copy:cssFurniture', 'clean']);
    grunt.registerTask('debug',       ['add_environment_data', 'css', 'multi_lang_site_generator:default', 'copy:jsAll', 'copy:cssFurniture', 'clean']);
    grunt.registerTask('html',        ['add_environment_data', 'sass:inline', 'uglify', 'multi_lang_site_generator:default', 'clean']);
    grunt.registerTask('js',          [/*'jshint', 'jasmine',*/ 'requirejs', 'copy:js']);
    grunt.registerTask('test',        ['jasmine']);
    grunt.registerTask('images', [], function () {
        grunt.loadNpmTasks('grunt-contrib-imagemin');
        grunt.task.run('copy:standardImages', 'responsive_images', 'imagemin');
    });
    grunt.registerTask('css',         ['sass:main', 'sass:inline']);
    grunt.registerTask('stage',       [              'add_environment_data', 'prepDeploy', 'replace:prepStageDeploy', 'copy:stageDeploy', 'clean']);
    grunt.registerTask('live',        ['checkStage', 'add_environment_data', 'prepDeploy', 'replace:prepLiveDeploy',  'copy:liveDeploy',  'clean']);
    grunt.registerTask('server',      ['connect']);
    grunt.registerTask('translate',   ['add_environment_data', 'default', 'sass:inline', 'uglify', 'multi_lang_site_generator:build_all_other_sites', 'clean', 'copy_source']);
    grunt.registerTask('make_vocabs', ['add_environment_data', 'cloudfile_to_vocab']);
    grunt.registerTask('copy_source', [], function () {

        var wrench             = require('wrench'),
            fs                 = require('fs'),
            default_vocab_dir  = grunt.config.get('multi_lang_site_generator.default.options.vocabs'),
            rest_of_vocabs_dir = grunt.config.get('multi_lang_site_generator.build_all_other_sites.options.vocabs');

        rest_of_vocabs_dir.forEach(function (vocab_dir) {
            grunt.log.writeln('Copying ' + default_vocab_dir + ' source into ' + vocab_dir + '...');
            wrench.copyDirSyncRecursive(default_vocab_dir + '/js/', vocab_dir + '/js/');
            wrench.copyDirSyncRecursive(default_vocab_dir + '/css/', vocab_dir + '/css/');
            try {
                if (fs.lstatSync(default_vocab_dir + '/img').isDirectory()) {
                    wrench.copyDirSyncRecursive(default_vocab_dir + '/img/', vocab_dir + '/img/');
                }
            } catch (e) {}
        });

    });
    grunt.registerTask('prepDeploy', [], function () {
        var wrench = require('wrench'),
            fs     = require('fs'),
            vocabs = grunt.config.get('multi_lang_site_generator.default.options.vocabs').concat(grunt.config.get('multi_lang_site_generator.build_all_other_sites.options.vocabs'));

        vocabs = grunt.config.get('multi_lang_site_generator.default.options.vocabs');

        vocabs.forEach(function (vocab) {
            fs.mkdir('tmp');
            wrench.copyDirSyncRecursive(vocab, 'tmp/' + vocab);
            grunt.log.writeln(vocab);
        });
    });
    grunt.registerTask('checkStage', ['Checking content on stage'], function () {
        var path = require('path'),
            pkg  = grunt.file.readJSON('package.json'),
            done = this.async(),
            fs   = require('fs');

        try {
          // Query the entry
            stats = fs.lstatSync('/Volumes/wwwlive/news/special/' + pkg.year + '/newsspec_' + pkg.project_number + '/' + grunt.config.get('multi_lang_site_generator.default.options.vocabs'));
          // Is it a directory?
            if (stats.isDirectory()) {
                grunt.log.writeln('This content is on stage - OK');
                done();
            }
        } catch (e) {
            done(false);
            grunt.log.writeln('This content has not been staged - Fail');
        }
    });
    grunt.registerTask('add_environment_data', [], function () {
        var env = {
            'local': {
                'domain':       'http://local.bbc.co.uk:1031',
                'domainStatic': 'http://static.local.bbc.co.uk:1033'
            },
            'vm': {
                'domain':       'http://10.0.2.2:1031',
                'domainStatic': 'http://10.0.2.2:1033'
            }
        };
        var environmentFilePath = '../../env.json';
        if (grunt.file.exists(environmentFilePath)) {
            env = grunt.file.readJSON(environmentFilePath);
        }
        grunt.config('env', env);
    });
};