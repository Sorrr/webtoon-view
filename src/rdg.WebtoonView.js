/**
 * @class
 * @ignore
 */
rdg.WebtoonView = function(){this.init.apply(this, arguments);};
rdg.WebtoonView.prototype = {

    /**
     * @author    ju.uyeong
     * @version   0.0.1
     * @copyright 2014 ju.uyeong Licensed under the MIT license.
     * @param {Object} options
     * @param {string} options.selector
     * @param {string} options.url
     * @constructs
     */
    init : function(options){
        var self = this;

        this._buildViews(options.selector);
        this._bindEvents();

        this._viewSidebars.delayHide(300);

        setTimeout(function(){
            self._viewScroller.refresh()
        },300);
    },

    /**
     * 뷰를 빌드한다.
     * @param {string} selector
     * @private
     */
    _buildViews : function(selector){
        this._viewSidebars = new rdg.view.Sidebars(this._pmodSidebars);
        this._viewScroller = new rdg.view.Scroller(selector);
    },

    /**
     * 뷰의 이벤트를 바인딩한다.
     * @private
     */
    _bindEvents : function(){
        this._viewScroller.on('scrollDown', $.proxy(this._onScrollHideSidebars, this));
        this._viewScroller.on('scrollBottom', $.proxy(this._onScrollShowSidebars, this));
        this._viewScroller.on('scrollUp', $.proxy(this._onScrollShowSidebars, this));
        this._viewScroller.on('scrollTop', $.proxy(this._onScrollShowSidebars, this));

        $(document).on('resize', $.proxy(this._onResizeScroller, this));
    },

    /**
     * scoller 뷰의 요청에따라 sidebars 뷰를 show한다.
     * @private
     */
    _onScrollShowSidebars : function(){
        this._viewSidebars.show();
    },

    /**
     * scoller 뷰의 요청에따라 sidebars 뷰를 hide한다.
     * @private
     */
    _onScrollHideSidebars : function(){
        this._viewSidebars.hide();
    },

    /**
     * document의 resize 이벤트 리스너
     * @private
     */
    _onResizeScroller : function(){
        window.scrollTo(0, 0);
    }
};
