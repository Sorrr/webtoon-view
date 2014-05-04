/**
 * @class
 * @ignore
 */
rdg.view.Sidebars = function(){this.init.apply(this, arguments);};

/**
 * @enum {number}
 * @readonly
 */
rdg.view.Sidebars.STATUS = {
    SHOW : 0,
    HIDE : 1
};

rdg.view.Sidebars.prototype = {

    /**
     * HEADER와 FOOTER를 관리하는 뷰
     * @constructs
     */
    init : function(){
        this._welHeader = null;
        this._welFooter = null;
        this._hideTimer = 0;
        this._showTimer = 0;
        this._status = 0;

        this._assignElements();
    },

    /**
     * 엘리먼트를 어싸인한다.
     * @private
     */
    _assignElements : function(){
        this._welHeader = $('header');
        this._welFooter = $('footer');
    },

    /**
     * 헤더와 푸터를 감춘다.
     */
    hide : function(){
        if(this._status === rdg.view.Sidebars.STATUS.HIDE){return false;}

        var self = this;

        this._welHeader.addClass('hide');
        this._welFooter.addClass('hide');
        this._status = rdg.view.Sidebars.STATUS.HIDE;

        clearTimeout(this._showTimer);

        this._hideTimer = setTimeout(function(){
            self._welHeader.css('visibility', 'hidden');
            self._welFooter.css('visibility', 'hidden');
        }, 300);
    },

    /**
     * 헤더와 푸터를 보인다.
     */
    show : function(){
        if(this._status === rdg.view.Sidebars.STATUS.SHOW){return false;}

        var self = this;

        this._welHeader.css('visibility', 'visible');
        this._welFooter.css('visibility', 'visible');
        this._status = rdg.view.Sidebars.STATUS.SHOW;

        clearTimeout(this._hideTimer);

        this._showTimer = setTimeout(function(){
            self._welHeader.removeClass('hide');
            self._welFooter.removeClass('hide');
        }, 100);
    },

    /**
     * 헤더와 푸터를 딜레이 타임 후 감춘다.
     * @param {number} delay
     */
    delayHide : function(delay){
        var self = this;

        delay = delay || 0;

        setTimeout(function(){
            self.hide();
        }, delay);
    },

    /**
     * 헤더와 푸터를 딜레이 타임 후 보인다.
     * @param {number} delay
     */
    delayShow : function(delay){
        var self = this;

        delay = delay || 0;

        setTimeout(function(){
            self.show();
        }, delay);
    }
};
