/**
 * @class
 * @ignore
 */
rdg.WebtoonView = function(){this.init.apply(this, arguments);};
rdg.WebtoonView.prototype = {

    /**
     * WebtoonView 컨트롤러
     * @author    ju.uyeong
     * @version   0.0.1
     * @copyright 2014 ju.uyeong Licensed under the MIT license.
     * @param {string} elementId
     * @constructs
     */
    init : function(elementId){
        var self = this;

        this._buildViews(elementId);
        this._bindEvents();

        this._viewSidebars.delayHide(500);

        setTimeout(function(){
            self._viewScroller.refresh();
        },300);
    },

    /**
     * 뷰를 빌드한다.
     * @param {string} elementId
     * @private
     */
    _buildViews : function(elementId){
        this._viewSidebars = new rdg.view.Sidebars();
        this._viewScroller = new rdg.view.Scroller(elementId);
    },

    /**
     * 뷰의 이벤트를 바인딩한다.
     * @private
     */
    _bindEvents : function(){
        this._viewScroller.on('scrollDown', this._onScrollHideSidebars.bind(this));
        this._viewScroller.on('scrollBottom', this._onScrollShowSidebars.bind(this));
        this._viewScroller.on('scrollUp', this._onScrollShowSidebars.bind(this));
        this._viewScroller.on('scrollTop', this._onScrollShowSidebars.bind(this));
    },

    /**
     * scoller 뷰의 이벤트에 따라 sidebars 뷰를 show한다.
     * @private
     */
    _onScrollShowSidebars : function(){
        this._viewSidebars.show();
    },

    /**
     * scoller 뷰의 이벤트에 따라 sidebars 뷰를 hide한다.
     * @private
     */
    _onScrollHideSidebars : function(){
        this._viewSidebars.hide();
    }
};
