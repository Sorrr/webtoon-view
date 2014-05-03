/**
 * @class
 * @ignore
 */
rdg.pmod.Sidebars = function(){this.init.apply(this, arguments);};

/**
 * @enum {number}
 * @readonly
 */
rdg.pmod.Sidebars.STATUS = {
    SHOW : 0,
    HIDE : 1
};

rdg.pmod.Sidebars.prototype = {

    /**
     * Sidebars 뷰의 presentation model
     * @constructs
     */
    init : function(status){
        this._status = status || 0;
    },

    /**
     * status를 셋하거나 반환한다.
     * @param {number|undefined} status
     * @returns {number|undefined}
     */
    status : function(status){
        if(status === undefined){
            return this._status;
        }

        this._status = status;
    }
};
