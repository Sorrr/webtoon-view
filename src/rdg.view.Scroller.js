/**
 * @class
 * @ignore
 */
rdg.view.Scroller = function(){this.init.apply(this, arguments);};
rdg.view.Scroller.prototype = {

    /**
     * 최상단으로 스크롤하면 발생하는 이벤트
     * @event rdg.view.Scroller#scrollTop
     * @type {IScroll}
     */

    /**
     * 최하단으로 스크롤하면 발생하는 이벤트
     * @event rdg.view.Scroller#scrollBottom
     * @type {IScroll}
     */

    /**
     * 위로 스크롤하면 발생하는 이벤트
     * @event rdg.view.Scroller#scrollUp
     * @type {IScroll}
     */

    /**
     * 아래로 스크롤하면 발생하는 이벤트
     * @event rdg.view.Scroller#scrollDown
     * @type {IScroll}
     */

    /**
     * 컨텐츠의 스크롤을 관리하는 뷰
     * @param {string} elementId
     * @constructs
     */
    init : function(elementId){
        this._elementId = elementId || 'webtoon-view';
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

        // ipad ios7의 safari에서 height 값이
        // 안맞는 버그가 있어 방어코드로 삽입함.
        if(navigator.userAgent.match(/iPad;.*CPU.*OS 7_\d/i)){
            document.getElementsByTagName('html')[0].className = 'ipad ios7';
        }
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

        this._iscroll = new IScroll('#'+ this._elementId, options);
    },

    /**
     * 이벤트를 바인딩 한다.
     * @private
     */
    _bindEvents : function(){
        this._iscroll.on('scroll', this._onScrollFireEvent.bind(this));
        this._iscroll.on('scrollEnd', this._onScrollEndFireEvent.bind(this));
        document.addEventListener('resize', this._onResizeNativeScrollTop.bind(this));
        document.addEventListener('touchmove', function(e) {e.preventDefault()});
    },

    /**
     * iscroll의 scroll 이벤트 리스너
     * @fires rdg.view.Scroller#scrollTop
     * @fires rdg.view.Scroller#scrollBottom
     * @fires rdg.view.Scroller#scrollUp
     * @fires rdg.view.Scroller#scrollDown
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
     * @fires rdg.view.Scroller#scrollTop
     * @fires rdg.view.Scroller#scrollBottom
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
     * document의 resize 이벤트 리스너
     * @private
     */
    _onResizeNativeScrollTop : function(){
        window.scrollTo(0, 0);
    },

    /**
     * 현재 스크롤이 제일 상단에 있는지 체크한다.
     * @param {number?} y
     * @returns {boolean}
     * @private
     */
    _isTop : function(y){
        y = y === undefined? this._pastY : y;
        return y >= 0;
    },

    /**
     * 현재 스크롤이 제일 하단에 있는지 체크한다.
     * @param {number?} y
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
     * 이벤트를 발생시킨다.
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
