import {RequestDispatcher} from "./RequestDispatcher.js";

import {Ajv} from "ajv";
import { createRequire } from 'module';

const _REQUIRE = createRequire(import.meta.url);
const _AJV = new Ajv({allErrors: true});
const _SCHEMA_DEFAULTS = _REQUIRE('json-schema-defaults');

/**
 * @abstract
 */
export class ContractDispatcher extends RequestDispatcher {
    constructor(name, contract = null, options = null) {
        super(name, options);
        this._hasContract = false;
        this._contract = contract;
        if(contract) {
            _AJV.addSchema(this._contract, name);
            this._hasContract = true;
        }
    }

    /**
     * @description
     * @return {boolean}
     */
    get hasContract() {
        return this._hasContract;
    }

    /**
     * @description
     * @return {*}
     */
    get contract() {
        return this._contract;
    }

    /**
     * @description
     * @return {object}
     */
    get instance() {
        if(this._hasContract)
            return _SCHEMA_DEFAULTS(this._contract);
        else return {};
    }
}