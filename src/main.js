(function(root, factory) {
    'use strict';
    /*globals require, define, module */
    /* jshint unused: false */

    if (typeof define === 'function' && define.amd) {
        define(['jskeleton',
            'corbel-js',
            'backbone',
            'q'
        ], function(JSkeleton, corbel, Backbone, q) {
            return factory.call(root, root, corbel, JSkeleton, Backbone, q);
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        var corbel = require('corbel-js'),
            Backbone = require('backbone'),
            q = require('q'),
            JSkeleton = require('jskeleton');

        module.exports = factory(root, corbel, JSkeleton, Backbone, q);

    } else if (root !== undefined) {
        factory.call(root, root, root.corbel, root.Jskeleton, root.Backbone, root.q);
    }

})(this, function(root, corbel, JSkeleton, Backbone, q) {

    'use strict';

    /*globals*/

    /* jshint unused: false */


    return JSkeleton.corbel;

});