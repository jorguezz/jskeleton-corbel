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

    JSkeleton.corbel = corbel;

    var corbelDriver = JSkeleton.corbelDriver = corbel.getDriver();

    JSkeleton.plugin('corbel', corbelDriver);

    var _sync = Backbone.sync;

    Backbone.sync = function(method, model, options) {

        var requestParams = model.requestParams || {};
        if (requestParams.resourceType || options.resourceType) {

            var success = function(result) {
                options.success.call(this, result);
                return model;
            };

            var reject = function(result) {
                options.error.call(this, result);
                return q.reject(result || {
                    error: 'invalid:operation'
                });
            };

            var fetchData = {

                resourceType: options.resourceType || requestParams.resourceType,
                data: options.data || requestParams.data,
                query: options.query || requestParams.query,
                queryDomain: options.queryDomain || requestParams.queryDomain,
                search: options.search || requestParams.search,
                page: options.page || requestParams.page,
                sort: options.sort || requestParams.sort,
                aggregation: options.aggregation || requestParams.aggregation
            };

            // deprecated notice
            if (options.rel || requestParams.rel) {
                console.warn('deprecated: rel param');
            }
            if (options.uri || requestParams.uri) {
                console.warn('deprecated: uri param');
            }

            var builder,
                isCollectionResponse = model instanceof Backbone.Collection,
                promise;

            var id;

            //----------IT IS NECESSARY 'RESOURCES' ----------
            if (isCollectionResponse || method === 'create') {
                builder = corbelDriver.resources.collection(fetchData.resourceType);
            } else {
                id = options.id || model.get('id');
                builder = corbelDriver.resources.resource(fetchData.resourceType, id);
            }

            switch (method) {
                case 'read':
                    if (isCollectionResponse) {
                        promise = builder.get(fetchData).then(function(data) {
                            return success(data);
                        });
                    } else {
                        promise = builder.get();

                        promise = promise.then(function(data) {
                            return success(data);
                        });
                    }
                    return promise.fail(function(error) {
                        return reject(error);
                    });
                case 'create':
                    if (!isCollectionResponse) {
                        promise = builder.add(model.toJSON());
                        return promise.then(function(id) {
                            return success({
                                id: id
                            });
                        }).fail(function(error) {
                            return reject(error);
                        });
                    }
                    return reject();
                case 'update':
                    if (!isCollectionResponse) {
                        return builder.update(model.toJSON()).then(function() {
                            return success(model.toJSON());
                        }).fail(function(error) {
                            return reject(error);
                        });
                    }
                    // @todo: a model fetched from relation with matrix uri should remove
                    // relation params in order to update like a normal model
                    return reject();
                case 'patch':
                    // Not supported
                    return reject();
                case 'delete':
                    if (!isCollectionResponse) {
                        return builder.delete().then(function() {
                            return success(model);
                        }).fail(function(error) {
                            return reject(error);
                        });
                    }
                    return reject();
                default:
                    return reject();
            }

        } else {
            return _sync(method, model, options);
        }
    };

    return JSkeleton.corbel;

});