/*
 * Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

/**
 * @description
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
 * @licence MIT
 */
export class EntityResolver {
    /**
     * @description
     * @param {string} name
     * @param {function():Promise<object>} [resolver]
     */
    constructor(name, resolver) {
        /**@type{function():Promise<object>}*/this._resolver = resolver;
        this._name = name;
    }

    /**
     * @description
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * @description
     * @returns {Promise<object>}
     */
    async load() {
        return this._resolver();
    }
}

/**
 * @description
 * @author Robert R Murrell
 * @copyright Copyright (c) 2024, Dark Fox Technology, llc. All rights reserved.
 * @licence MIT
 */
export class EntityMap {
    constructor() {
        this._entities = new Map();
        this._promises = new Map();
    }

    /**
     * @description
     * @param {string} name
     * @param {object|EntityResolver} entity
     */
    add(name, entity) {
        this._entities.set(name, entity);
    }

    /**
     * @description
     * @param name
     * @param id
     * @param resolver
     */
    wrap(name, id, resolver) {
        this._entities.set(name, new EntityResolver(name, id, resolver));
    }

    /**
     * @description
     * @param {string} name
     * @param {object} [defaultValue]
     * @returns {Promise<Object>}
     */
    async get(name, defaultValue = null) {
        if(this._promises.has(name)) return this._promises.get(name);

        let _entity =  this._entities.get(name);
        if(!_entity) return defaultValue;
        else if(_entity instanceof EntityResolver) {
            try {
                let _loadingEntity = _entity.load();
                this._promises.set(name, _loadingEntity);
                _entity = await _loadingEntity;
                this._entities.set(name, _entity); // replace the resolver with the entity.
            }
            finally {
                this._promises.delete(name);
            }
        }

        return _entity;
    }
}