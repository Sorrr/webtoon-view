/**
 * @class
 * @ignore
 */
rdg.view.Scroller = function(){this.init.apply(this, arguments);};
rdg.view.Scroller.prototype = {

    /**
     * 컨텐츠의 스크롤을 관리하는 뷰
     * @constructs
     */
    init : function(selector){
        this._selector = selector || '#webtoon-view';
        this._pastY = 0;
        this._oldY = 0;
        this._events = {
            scrollTop : [],
            scrollUp : [],
            scrollBottom : [],
            scrollDown : []
        };

        this._buildIScroll();
        this._bindEvents();
    },

    /**
     * 이벤트 리스너를 등록한다.
     * @param {string} eventname
     * @param {function} callback
     */
    on : function(eventname, callback){
        this._events[eventname].push(callback);
    },

    /**
     * 이벤트 리스너를 해제한다.
     * @param {string} eventname
     * @param {function} callback
     */
    off : function(eventname, callback){
        var i, n;

        for(i = 0, n = this._events[eventname].length; i < n; i++){
            if(this._events[eventname][i] === callback){
                this._events[eventname].splice(i, 1);
            }
        }
    },

    /**
     * 스크롤러를 리플레쉬한다.
     */
    refresh : function(){
        this._iscroll.refresh();
    },

    /**
     * IScroll을 빌드한다.
     * @private
     */
    _buildIScroll : function(){
        var options = {
                probeType: 2,
                scrollbars: true,
                useTransform: Modernizr.csstransforms,
                useTransition: Modernizr.csstransitions,
                fadeScrollbars: false,
                shrinkScrollbars: false
            };

        if(Modernizr.csstransforms3d){
            options.fadeScrollbars = true;
        }

        if(/iphone|ipad|ipod/i.test(navigator.userAgent)){
            options.shrinkScrollbars = 'scale';
        }

        this._iscroll = new IScroll(this._selector, options);
    },

    /**
     * 이벤트를 바인딩 한다.
     * @private
     */
    _bindEvents : function(){
        this._iscroll.on('scroll', $.proxy(this._onScrollFireEvent, this));
        this._iscroll.on('scrollEnd', $.proxy(this._onScrollEndFireEvent, this));
    },

    /**
     * iscroll의 scroll 이벤트 리스너
     * @private
     */
    _onScrollFireEvent : function(){
        if(this._isTop()){
            this._fireEvent('scrollTop');
        }else if(this._isScrollUp() && this._isSufficient()){
            this._fireEvent('scrollUp');
        }else if(this._isBottom()){
            this._fireEvent('scrollBottom');
        }else if(this._isScrollDown()){
            this._fireEvent('scrollDown');
        }

        this._pastY = this._iscroll.y;
    },

    /**
     * iscroll의 scrollEnd 이벤트 리스너
     * @private
     */
    _onScrollEndFireEvent : function(){
        this._oldY = this._iscroll.y;

        if(this._isTop(this._oldY)){
            this._fireEvent('scrollTop');
        }else if(this._isBottom(this._oldY)){
            this._fireEvent('scrollBottom');
        }
    },

    /**
     * 현재 스크롤이 제일 상단에 있는지 체크한다.
     * @param {number} y
     * @returns {boolean}
     * @private
     */
    _isTop : function(y){
        y = y === undefined? this._pastY : y;
        return y >= 0;
    },

    /**
     * 현재 스크롤이 제일 하단에 있는지 체크한다.
     * @param {number} y
     * @returns {boolean}
     * @private
     */
    _isBottom : function(y){
        y = y === undefined? this._pastY : y;
        return y <= this._iscroll.maxScrollY;
    },

    /**
     * 위로 스크롤 했는지 체크한다.
     * @returns {boolean}
     * @private
     */
    _isScrollUp : function(){
        return this._iscroll.y > this._pastY && this._iscroll.y > this._oldY;
    },

    /**
     * 아래로 스크롤 했는지 체크한다.
     * @returns {boolean}
     * @private
     */
    _isScrollDown : function(){
        return this._iscroll.y < this._pastY && this._iscroll.y < this._oldY;
    },

    /**
     * 위로 한꺼번 스크롤 했는지 체크한다.
     * @returns {boolean}
     * @private
     */
    _isSufficient : function(){
        return this._iscroll.y > this._oldY - -150;
    },

    /**
     * 이벤트를 발생한다.
     * @param {string} eventname
     * @private
     */
    _fireEvent : function(eventname){
        var callbacks = this._events[eventname],
            i, n;

        for(i = 0, n = callbacks.length; i < n; i++){
            callbacks[i](this._iscroll);
        }
    }
};
