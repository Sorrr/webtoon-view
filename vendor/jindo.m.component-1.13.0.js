/** Jindo Mobile Component(minify:0) : ../../www/docs/jindo-mobile/archive/1.13.0/
 *	jindo.m
 *	jindo.m.Component
 *	jindo.m.UIComponent
 *	jindo.m.Touch
 *	jindo.m.Scroll
 */
/**
    @fileOverview 진도모바일 컴포넌트의 기본 네임스페이스인 동시에, static 객체이다
    @author sculove
    @version 1.13.0
    @since 2011. 11. 16
**/
/**
    진도모바일 컴포넌트의 기본 네임스페이스인 동시에, static 객체이다

    @class jindo.m
    @group Component
    @update

    @history 1.13.0 Support Firefox 브라우저 지원
    @history 1.12.0 Update 안드로이드 크롬 브라우저 UserAgent 변경으로 인한 버전 정보 대응
    @history 1.7.0 Update 갤럭시S4 대응
    @history 1.7.0 Bug ie10 msPointerEnabled 값 버그 수정
    @history 1.5.0 Update Component 의존성 제거
    @history 1.5.0 Update Window Phone8 지원
    @history 1.4.0 Update iOS 6 지원
    @history 1.2.0 Update Chrome for Android 지원<br /> 갤럭시 S2 4.0.3 업데이트 지원
    @history 1.1.0 Update Android 3.0/4.0 지원<br /> jindo 2.0.0 mobile 버전 지원
    @history 1.1.0 Update Namespace, jindo의 Namespace 하위로 지정
    @history 0.9.5 Update getTouchPosition() Method 삭제<br />
                        hasTouchEvent() Method 삭제
    @history 0.9.0 Release 최초 릴리즈
**/
if(typeof jindo.m == "undefined" && typeof Node != "undefined") {
    /**
        addEventListener된 객체를 알기위한 함수
        A태그에 click 이벤트가 bind될 경우에만 적용
    **/
    var ___Old__addEventListener___ = Node.prototype.addEventListener;
    Node.prototype.addEventListener = function(type, listener, useCapture){
            var callee = arguments.callee;
            if(callee && type === "click" && this.tagName === "A"){
                (this.___listeners___ || (this.___listeners___=[]) ).push({
                    listener : listener,
                    useCapture : useCapture
                });
            }
            return ___Old__addEventListener___.apply(this, arguments);
    };

    /**
        removeEventListener된 객체를 알기위한 함수
        A태그에 click 이벤트가 unbind될 경우에만 적용
    **/
    var ___Old__removeEventListener___ = Node.prototype.removeEventListener;
    Node.prototype.removeEventListener = function(type, listener, useCapture){
            var callee = arguments.callee;
            if(callee && type === "click" && this.tagName === "A"){
                if(this.___listeners___) {
                    this.___listeners___.pop();
                }
            }
            return ___Old__removeEventListener___.apply(this, arguments);
    };
}

var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame|| window.msRequestAnimationFrame;
var caf = window.cancelAnimationFrame || window.webkitCancelAnimationFrame|| window.mozCancelAnimationFrame|| window.msCancelAnimationFrame;

if(raf&&!caf){
    var keyInfo = {};
    var oldraf = raf;
    raf = function(callback){
        function wrapCallback(){
            if(keyInfo[key]){
            callback();
            }
        }
        var key = oldraf(wrapCallback);
        keyInfo[key] = true;
        return key;
    };
    caf = function(key){
        delete keyInfo[key];
    };
    
}else if(!(raf&&caf)){
    raf = function(callback) { return window.setTimeout(callback, 16); };
    caf = window.clearTimeout;
}

window.requestAnimationFrame = raf;
window.cancelAnimationFrame = caf;
    
// window.requestAnimationFrame = (function() {
    // return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame|| window.msRequestAnimationFrame || function(callback) { return setTimeout(callback, 16); };
// })();
// 
// window.cancelAnimationFrame = (function () {
    // return window.cancelAnimationFrame || window.webkitCancelAnimationFrame|| window.mozCancelAnimationFrame|| window.msCancelAnimationFrame || clearTimeout;
// })();

jindo.m = (function() {
    var _isVertical = null,
        _nPreWidth = -1,
        _nRotateTimer = null,
        _htHandler = {},
        _htDeviceInfo = {},
        _htAddPatch = {},
        _htOsInfo = {},
        _htBrowserInfo = {},
        _htTouchEventName = {
            start : 'mousedown',
            move : 'mousemove',
            end : 'mouseup',
            cancel : null
        },
        _htDeviceList = {
            "galaxyTab" : ["SHW-M180"],
            "galaxyTab2" : ["SHW-M380"],
            "galaxyS" : ["SHW-M110"],
            "galaxyS2" : ["SHW-M250","GT-I9100"],
            "galaxyS2LTE" : ["SHV-E110"],
            "galaxyS3" : ["SHV-E210", "SHW-M440", "GT-I9300"],
            "galaxyNote" : ["SHV-E160"],
            "galaxyNote2" : ["SHV-E250"],
            "galaxyNexus" : ["Galaxy Nexus"],
            "optimusLte2" : ["LG-F160"],
            "optimusVu" : ["LG-F100"],
            "optimusLte" : ["LG-LU6200", "LG-SU640", "LG-F120K"]
        },
        _htClientSize = {
            "galaxyTab" : {
                "4" : {
                    "portrait" : 400
                },
                "default" : {
                    "portrait" : 300,
                    "landscape" : 100
                }
            },
            "galaxyTab2" : {
                "default" : {
                    "portrait" : 500,
                    "landscape" : 100
                }
            },
            "galaxyNexus" : {
                "default" : { 
                    "portrait" : 800,
                    "address" : 30,
                    "landscape" : 100
                }
            }
        };

    /**
         터치이벤트 명 정제
     */
    function _initTouchEventName() {
        if('ontouchstart' in window){
            _htTouchEventName.start = 'touchstart';
            _htTouchEventName.move  = 'touchmove';
            _htTouchEventName.end = 'touchend';
            _htTouchEventName.cancel = 'touchcancel';
        } else if(window.navigator.msPointerEnabled && window.navigator.msMaxTouchPoints > 0) {
            _htTouchEventName.start = 'MSPointerDown';
            _htTouchEventName.move  = 'MSPointerMove';
            _htTouchEventName.end = 'MSPointerUp';
            _htTouchEventName.cancel = 'MSPointerCancel';
        }
    }

    /**
         resize 이벤트 정제해서 리턴.
        @return {String} 이벤트명
        @date 2011. 11. 11
        @author sculove
     */
    function _getOrientationChangeEvt(){
        var bEvtName = 'onorientationchange' in window ? 'orientationchange' : 'resize';
        /**
         * andorid 버그
         * 2.3에서는 orientationchange 이벤트가 존재하나, orientationchange를 적용할 경우, width와 height가 바꿔서 나옴 (setTimeout 500ms 필요)
         *  : 삼성안드로이드 2.3에서는 방향전환을 resize 이벤트를 이용하여 확인할 경우,
         *    만약, 사용자가 window에 resize이벤트를 bind할 경우 브라우저가 죽는 버그가 있음
         * 2.2에서는 orientationchange 이벤트가 2번 발생함. (처음에는 width,height가 바뀌고, 두번째는 정상적으로 나옴)
         * 그 이하는 resize로 처리
         * in-app 버그
         * in-app인 경우 orientationChange발생시, width,height값이 바꿔서 나옴 (setTimeout 200ms 필요)
         */
        if( (_htOsInfo.android && _htOsInfo.version === "2.1") ) {//|| htInfo.galaxyTab2) {
            bEvtName = 'resize';
        }
        return bEvtName;
    }

    /**
        디바이스 기기의 가로,세로 여부를 판단함.
        @date 2011. 11. 11
        @author sculove
     */
    function _getVertical() {
        var bVertical = null,
            sEventType = _getOrientationChangeEvt();
        if(sEventType === "resize") {
            var screenWidth = document.documentElement.clientWidth;
            if (screenWidth < _nPreWidth) {
                bVertical = true;
            } else if (screenWidth == _nPreWidth) {
                if(!jindo.$Agent().navigator().mobile || jindo.$Agent().os().ipad) {
                    bVertical = screenWidth < document.documentElement.clientHeight;
                } else {
                    bVertical = _isVertical;
                }
            } else {
                bVertical = false;
            }
            _nPreWidth = screenWidth;
            // console.log("getVertical : resize로 판별 -> " + bVertical);
        } else {
            var windowOrientation = window.orientation;
            if (windowOrientation === 0 || windowOrientation == 180) {
                bVertical = true;
            } else if (windowOrientation == 90 || windowOrientation == -90) {
                bVertical = false;
            }
            // console.log("getVertical : orientationChange로 판별 -> " + bVertical);
        }
        return bVertical;
    }

    /**
        indo.m. 공통 이벤트 attach
        @date 2011. 11. 11
        @author sculove
     */
    function _attachEvent() {
       var fnOrientation = jindo.$Fn(_onOrientationChange, this).attach(window, _getOrientationChangeEvt()).attach(window, 'load');
       var fnPageShow = jindo.$Fn(_onPageshow, this).attach(window, 'pageshow');
    }

    /**
        브라우저 정보와 버전 정보를 갖는 this._htDeviceInfo를 초기화한다
        @date 2011. 11. 11
        @modify 2012.03.05 bInapp 추가
        @modify 2012.05.09 android 버전 정규식 수정
        @modify oyang2 2012.07.30 optimus 추가
        @modify oyang2 2012.09.17 단말기 정보 추가
        @author oyang2, sculove
     */
    function _initDeviceInfo() {
        // 1.8.0 이전 deprecate
        // _htOsInfo = jindo.$Agent().os();
        // _htBrowserInfo = jindo.$Agent().navigator();
        _setOsInfo();
        _setBrowserInfo();

        var sName = navigator.userAgent;
        var ar = null;
        function f(s,h) {
            return ((h||"").indexOf(s) > -1);
        }
        _htDeviceInfo = {
            "iphone" : _htOsInfo.iphone,
            "ipad" : _htOsInfo.ipad,
            "android" : _htOsInfo.android,
            "win" : f('Windows Phone', sName),
            "galaxyTab" : /SHW-M180/.test(sName),
            "galaxyTab2" : /SHW-M380/.test(sName),
            "galaxyS" : /SHW-M110/.test(sName),
            "galaxyS2" : /SHW-M250|GT-I9100/.test(sName),
            "galaxyS2LTE" : /SHV-E110/.test(sName),
            "galaxyS3" : /SHV-E210|SHW-M440|GT-I9300/.test(sName),
            "galaxyNote" : /SHV-E160/.test(sName),
            "galaxyNote2" : /SHV-E250/.test(sName),
            "galaxyNexus" : /Galaxy Nexus/.test(sName),
            "optimusLte2" : /LG-F160/.test(sName),
            "optimusVu" : /LG-F100/.test(sName),
            "optimusLte" : /LG-LU6200|LG-SU640|LG-F120K'/.test(sName),
            "galaxyS4" : /SHV-E300|GT-I9500|GT-I9505|SGH-M919|SPH-L720|SGH-I337|SCH-I545/.test(sName),
            "bChrome" : _htBrowserInfo.chrome,
            "bSBrowser" : _htBrowserInfo.bSBrowser,
            "bInapp" : false,
            "version" : _htOsInfo.version,
            "browserVersion" : _htBrowserInfo.version
        };
     
        // device name 설정
        for(var x in _htDeviceInfo){
            if (typeof _htDeviceInfo[x] == "boolean" && _htDeviceInfo[x] && _htDeviceInfo.hasOwnProperty(x)) {
                if(x[0] !== "b") {
                    _htDeviceInfo.name = x;
                }
            }
        }

        //제조사 추가
        _htDeviceInfo["samsung"] = /GT-|SCH-|SHV-|SHW-|SPH|SWT-|SGH-|EK-|Galaxy Nexus|SAMSUNG/.test(sName);
        _htDeviceInfo["lg"] = /LG-/.test(sName);
        _htDeviceInfo["pantech"] = /IM-/.test(sName);

        //inapp여부 추가.true 일경우는 확실한 inapp이며,false - 웹브라우저 혹은 알수없는 경우
        if(_htDeviceInfo.iphone || _htDeviceInfo.ipad) {
             if(!f('Safari', sName)){
                 _htDeviceInfo.bInapp = true;
             }
        }else if(_htDeviceInfo.android){
            sName = sName.toLowerCase();
            if( f('inapp', sName) || f('app', sName.replace('applewebkit',''))){
                _htDeviceInfo.bInapp = true;
            }
        }
    }

    /**
     * os 정보 조회
     *      jindo.$Agent().os() 정보를 이용하며 info 데이터 또한 동일하다.
     *      하지만 version 정보는 jindo 2.3.0 이상부터 지원하고 있어 이를 보완하는 작업 진행 
     */    
    function _setOsInfo(){
        _htOsInfo = jindo.$Agent().os();
        _isInapp();
        _htOsInfo.version = _htOsInfo.version || _getOsVersion();
        _htOsInfo.ios = typeof _htOsInfo.ios == "undefined" ? (_htOsInfo.ipad || _htOsInfo.iphone) : _htOsInfo.ios;
    }
    
    /**
     *  browser 정보 조회
     *      jindo.$Agent().navigator() 정보를 이용하며 info 데이터 또한 동일하다.
     *      SBrowser 정보 추가로 browser 정보에 SBrowser 정보 추가하는 함수 호출.
     */
    function _setBrowserInfo(){
        _htBrowserInfo = jindo.$Agent().navigator();
        // iOS의 크롬인 경우 UA정보가 틀림.
        if(_htOsInfo.ios && /CriOS/.test(navigator.userAgent)) {
            _htBrowserInfo.chrome = true;
        }
        // FireFox인 경우 추가 (jindo 2.8.3 이하 버전에서 지원하지 않음)
        if(typeof _htBrowserInfo.firefox == "undefined") {
            _htBrowserInfo.firefox = /Firefox/.test(navigator.userAgent);
        }
        _isSBrowser();
        _updateUnderVersion();
    }
    
    /**
     * 크롬 브라우저 User Agent 변경 (Safari -> Mobile Safari) 으로 인한 Jindo.2.8.2 이하 대응 - 2013.12.05 by mania
     */
    function _updateUnderVersion(){
        if(_htBrowserInfo.msafari && _htBrowserInfo.chrome){
            if(_htOsInfo.ios) {
                _htBrowserInfo.version = parseFloat(navigator.userAgent.match(/CriOS[ \/]([0-9.]+)/)[1]);
            } else {
                _htBrowserInfo.version = parseFloat(navigator.userAgent.match(/Chrome[ \/]([0-9.]+)/)[1]);
            }
        } else if(_htBrowserInfo.firefox){
            _htBrowserInfo.version = parseFloat(navigator.userAgent.match(/Firefox[ \/]([0-9.]+)/)[1]);
        }   
    }
    /**
     *  inapp 여부 조회
     *      _htOsInfo에 정보를 추가한다.
     *      _htOsInfo.bInapp = true | false
     */
    function _isInapp(){
        var sName = navigator.userAgent;
        _htOsInfo.bInapp = false;
        if(_htOsInfo.ios) {
            if(sName.indexOf('Safari') == -1 ){
                _htOsInfo.bInapp = true;
            }
        }else if(_htOsInfo.android){
            sName = sName.toLowerCase();
            if( sName.indexOf('inapp') != -1 || sName.replace('applewebkit','').indexOf('app') != -1){
                _htOsInfo.bInapp = true;
            }
        }
    }
    /**
     *  samsung 기기 이면서 chrome 인 경우 galaxyS4 sbrowser 여부 판단
     *      _htBrowserInfo 에 정보를 추가한다. 
     *      _htBrowserInfo.bSBrowser = true | false
     */
    function _isSBrowser(){
        _htBrowserInfo.bSBrowser = false;
        var sUserAgent = navigator.userAgent;
        var aMatchReturn = sUserAgent.match(/(SAMSUNG|Chrome)/gi) || "";
        if(aMatchReturn.length > 1){
            _htBrowserInfo.bSBrowser = true;
        }
    }
    
    /**
     *  디바이스 버전
     *  @return {String} 디바이스 버전 정보
     */
    function _getOsVersion(){
        if(!_htOsInfo.version){
            var sName = navigator.userAgent,
                sVersion = "",
                ar;
    
            if(_htOsInfo.iphone || _htOsInfo.ipad){
                ar = sName.match(/OS\s([\d|\_]+\s)/i);
                if(ar !== null&& ar.length > 1){
                    sVersion = ar[1];
                }
            } else if(_htOsInfo.android){
                ar = sName.match(/Android\s([^\;]*)/i);
                if(ar !== null&& ar.length > 1){
                    sVersion = ar[1];
                }
            } else if(_htOsInfo.mwin){
                ar = sName.match(/Windows Phone\s([^\;]*)/i);
                if(ar !== null&& ar.length > 1){
                    sVersion = ar[1];
                }
            }
            return sVersion.replace(/\_/g,'.').replace(/\s/g, "");
        }
    }

    /**
        가로,세로 변경 여부 확인
        @date 2011. 11. 11
        @author sculove
        @history 1.13.0 Bug iOS 에서 키패드가 나타난 상태에서 rotate 시 정상적으로 처리되지 않는 이슈 수정 
        @history 1.8.0 Update 안드로이드 orientattionChange 의 delay 값을 정수가 아닌 상태 변화에 따르도록 대응.
     */
    function _onOrientationChange(we) {
        var self = this;
        if(we.type === "load") {
            _nPreWidth = document.documentElement.clientWidth;
            /**
             * 웹 ios에서는 사이즈가 아닌 orientationChange로 확인
             * 왜? iphone인 경우, '개발자콘솔'이 설정된 경우 초기 처음 오동작
             */
            if(!_htOsInfo.bInapp && ( _htOsInfo.iphone || _htOsInfo.ipad || _getOrientationChangeEvt() !== "resize")) {    // 웹ios인 경우
                _isVertical = _getVertical();
            } else {
                if(_nPreWidth > document.documentElement.clientHeight) {
                    _isVertical = false;
                } else {
                    _isVertical = true;
                }
            }
            // console.log("Rotate init isVertical : " + this._isVertical);
            return;
        }
        if (_getOrientationChangeEvt() === "resize") { // android 2.1 이하...
            // console.log("Rotate Event is resize");
            setTimeout(function(){
                _orientationChange(we);
            }, 0);
        } else {
            var screenWidth = jindo.$Document().clientSize().width;
            var nTime = 300;
            if(_htDeviceInfo.android) {  // android 2.2이상
                if (we.type == "orientationchange" && screenWidth == _nPreWidth) {
                    setTimeout(function(){
                    _onOrientationChange(we);
                    }, 500);
                    return false;
                }
                _nPreWidth = screenWidth; 
                // nTime = 200;
            }
            clearTimeout(_nRotateTimer);
            _nRotateTimer = setTimeout(function() {
                _orientationChange(we);
            },nTime);
            //console.log("Rotate Event is orientationChange");
        }
    }

    /**
        현재 폰의 위치가 가로인지 세로인지 확인
        @date 2011. 11. 11
        @author sculove
     */
    function _orientationChange(we) {
        var nPreVertical = _isVertical;
        _isVertical = _getVertical();
        //console.log("회전 : " + nPreVertical + " -> " + this._isVertical);
        if (jindo.$Agent().navigator().mobile || jindo.$Agent().os().ipad) {
            if (nPreVertical !== _isVertical) {
                we.sType = "rotate";
                we.isVertical = _isVertical;
                _fireEvent("mobilerotate", we);
            }
        // } else {    // PC일 경우, 무조건 호출
        //     _fireEvent("mobilerotate", {
        //         isVertical: _isVertical
        //     });
        }
    }

    /**
         pageShow 이벤트
         @date 2011. 11. 11
         @author sculove
     */
    function _onPageshow(we) {
        // pageShow될 경우, 가로/세로 여부를 다시 확인
        _isVertical = _getVertical();
        we.sType = "pageShow";
        setTimeout(function() {
            _fireEvent("mobilePageshow", we);
        },300);
    }

    /**
        WebKitCSSMatrix를 이용하여 left, top 값을 추출
        @return {HashTable} top, left
     */
    function _getTranslateOffsetFromCSSMatrix(element) {
        var curTransform  = new WebKitCSSMatrix(window.getComputedStyle(element).webkitTransform);
        return {
            top : curTransform.m42,
            left : curTransform.m41
        };
    }

    function _fireEvent(sType, ht) {
        if(_htHandler[sType]) {
            var aData = _htHandler[sType].concat();
            for (var i=0, len=aData.length; i < len; i++){
                aData[i].call(this, ht);
            }
        }
    }

    /**
        transform에서 translate,translate3d의 left와 top 값을 추출
        @return {HashTable} top,left
     */
    function _getTranslateOffsetFromStyle(element) {
        var nTop = 0,
            nLeft = 0,
            aTemp = null,
            s = element.style[jindo.m.getCssPrefix() == "" ? "transform" : jindo.m.getCssPrefix() + "Tranform"];
        if(!!s && s.length >0){
            aTemp = s.match(/translate.{0,2}\((.*)\)/);
            if(!!aTemp && aTemp.length >1){
                var a = aTemp[1].split(',');
                if(!!a && a.length >1){
                    nTop = parseInt(a[1],10);
                    nLeft = parseInt(a[0],10);
                }
            }
        }
        return {
            top : nTop,
            left : nLeft
        };
    }

    // 내부 변수 m
    var __M__ = {
        /** MOVE 타입 */
        MOVETYPE : {
            0 : 'hScroll',
            1 : 'vScroll',
            2 : 'dScroll',
            3 : 'tap',
            4 : 'longTap',
            5 : 'doubleTap',
            6 : 'pinch',
            7 : 'rotate',
            8 : 'pinch-rotate'
        },
        sVersion : "unknown",   // deprecated (jindo.m.Component.VERSION 으로 이관)

        /** @lends jindo.m.prototype */
        /**
            초기화 함수

            @constructor
            @ignore
            @static
        **/
        $init : function() {
            _initDeviceInfo();
            _initTouchEventName();
            _attachEvent();
        },

        /**
            모바일 기기 회전시, 적용할 함수를 bind 함

            @method bindRotate
            @param {Object} fHandlerToBind
            @history 1.10.0 Bug rotate 핸들러 안에서 자신을 dettach, attach했을 경우 버그 수정
            @history 1.8.0 Update 이벤트발생시 sType속성에 'rotate' 으로 표기되도록 수정
            @history 1.7.0 Bug PC일 경우, 초기 로딩시 rotate이벤트가 발생하는 문제 제거
            @history 0.9.5 Bug rotate 인식오류 문제 해결
            @date 2011. 11. 11
            @author sculove
            @example
                var f = jindo.$Fn(this.setSize, this).bind();

                jindo.m.bindRotate(f);  // bind함
                jindo.m.unbindRotate(f);    // unbind함
        **/

        bindRotate : function(fHandlerToBind) {
            var aHandler = _htHandler["mobilerotate"];
            if (typeof aHandler == 'undefined'){
                aHandler = _htHandler["mobilerotate"] = [];
            }
            aHandler.push(fHandlerToBind);
        },
        /**
            모바일 기기 회전시, 적용할 함수를 unbind 함

            @method unbindRotate
            @param {Object} fHandlerToUnbind
            @date 2011. 11. 11
            @author sculove
            @example
                var f = jindo.$Fn(this.setSize, this).bind();

                jindo.m.bindRotate(f);  // bind함
                jindo.m.unbindRotate(f);    // unbind함
        **/
        unbindRotate : function(fHandlerToUnbind) {
            var aHandler = _htHandler["mobilerotate"];
            if (aHandler) {
                for (var i = 0, fHandler; (fHandler = aHandler[i]); i++) {
                    if (fHandler === fHandlerToUnbind) {
                        aHandler.splice(i, 1);
                        break;
                    }
                }
            }
        },

        /**
            pageshow호출, 함수 bind

            @method bindPageshow
            @param {Object} fHandlerToBind
            @history 1.10.0 Bug pageshow 핸들러 안에서 자신을 dettach, attach했을 경우 버그 수정
            @history 1.9.0 Update 이벤트발생시 persisted 속성 제공
            @history 1.8.0 Update 이벤트발생시 sType속성에 'pageShow' 으로 표기되도록 수정
            @history 1.8.0 Bug pageshow 이벤트 바인드되지 않는 오류 수정
            @history 0.9.5 Update Method 추가
            @author sculove
            @date 2011. 11. 11
            @example
                var f = jindo.$Fn(this.setSize, this).bind();

                jindo.m.bindPageshow(f);    // bind함
                jindo.m.unbindPageshow(f);  // unbind함
        **/
        bindPageshow : function(fHandlerToBind) {
            var aHandler = _htHandler["mobilePageshow"];
            if (typeof aHandler == 'undefined'){
                aHandler = _htHandler["mobilePageshow"] = [];
            }
            aHandler.push(fHandlerToBind);
            // this.attach("mobilePageshow", fHandlerToBind);
        },

        /**
            pageshow호출, 함수 unbind

            @method unbindPageshow
            @param {Object} fHandlerToBind
            @history 0.9.5 Update Method 추가
            @author sculove
            @date 2011. 11. 11
            @example
                var f = jindo.$Fn(this.setSize, this).bind();

                jindo.m.bindPageshow(f);    // bind함
                jindo.m.unbindPageshow(f);  // unbind함
        **/
        unbindPageshow : function(fHandlerToUnbind) {
            var aHandler = _htHandler["mobilePageshow"];
            if (aHandler) {
                for (var i = 0, fHandler; (fHandler = aHandler[i]); i++) {
                    if (fHandler === fHandlerToUnbind) {
                        aHandler.splice(i, 1);
                        break;
                    }
                }
            }
        },

        /**
            브라우저 정보와 버전 정보를 제공한다.

            @method getDeviceInfo
            @author oyang2, sculove
            @date 2011. 11. 11
            @deprecated
            @return {Object}
            @history 1.8.0 deprecated getDeviceName() 을 통해 갤럭시, 옵티머스 등의 정보는 얻을 수 있고, iphone, android, version 정보등은 $jindo.$agent() 정보로 확인한다.
            @history 1.7.0 Bug 갤럭시S4, bSBrowser, browserVersion 속성 추가
            @history 1.7.0 Bug name 잘못 나오는 오류 수정
            @history 1.7.0 Bug 갤럭시S3 해외판(GT-I9300) 갤럭시S3로 인지못하는 버그 수정
            @history 1.6.0 Bug name에 제조사 이름이 들어가는 버그 수정
            @history 1.5.0 Upate win,galaxyNote2 속성 추가
            @history 1.5.0 Upate samsung, lg 속성 추가
            @history 1.5.0 Upate pentech 속성 추가
            @history 1.4.0 Upate 단말기 정보(samsung, lg, pentech) 추가
            @history 1.3.5 Upate 단말기 속성 추가<br /> (optimusLte, optimusLte2, optimusVu)
            @history 1.2.0 Upate bChrome 속성 추가
            @history 1.1.0 Upate bInapp 속성 추가,<br /> galaxyTab2 속성 추가
            @history 0.9.5 Upate bInapp galaxyU 속성 추가<br /> galaxyS 속성 추가
            @example
                jindo.m.getDeviceInfo().iphone      //아이폰 여부
                jindo.m.getDeviceInfo().ipad        //아이패드 여부
                jindo.m.getDeviceInfo().android  //안드로이드 여부
                jindo.m.getDeviceInfo().galaxyTab   //갤럭시탭 여부
                jindo.m.getDeviceInfo().galaxyTab2  //갤럭시탭2 여부
                jindo.m.getDeviceInfo().galaxyS  //갤럭시S 여부
                jindo.m.getDeviceInfo().galaxyS2    //갤럭시S2 여부
                jindo.m.getDeviceInfo().galaxyS2LTE    //갤럭시S2 LTE 여부
                jindo.m.getDeviceInfo().galaxyNexus    //갤럭시 넥서스 LTE 여부
                jindo.m.getDeviceInfo().optimusLte2    //옵티머스 LTE2 여부
                jindo.m.getDeviceInfo().optimusVu    //옵티머스뷰 여부
                jindo.m.getDeviceInfo().optimusLte    //옵티머스 LTE 여부
                jindo.m.getDeviceInfo().version  //안드로이드, 아이폰시 버젼정보 제공
                jindo.m.getDeviceInfo().bChrome  //크롬 브라우저 여부
                jindo.m.getDeviceInfo().bInapp      //인앱여부, true- 인앱, false - 웹브라우저 혹은 알수없는 경우
                jindo.m.getDeviceInfo().win        //MS Window 인경우
                jindo.m.getDeviceInfo().pantech    //팬텍 단말기인 경우
                jindo.m.getDeviceInfo().samsung    //삼성 단말기인 경우
                jindo.m.getDeviceInfo().lg          //엘지 단말기인 경우
                jindo.m.name                        //현재 단말기기 정보제공
        **/
        getDeviceInfo : function(){
            return _htDeviceInfo;
        },

        /**
         * OS 정보 반환을 위한 함수
         * @method getOsInfo
         *
         *  @history 1.10.0 New ios 속성 추가
         *  @history 1.8.0 Update jindo.m 에서 Agent 체크 부분을 jindo.$Agent().os() 로 이관. jindo.$Agent().os() 참고 
         */
        getOsInfo : function(){
            return _htOsInfo;
        },
        
        /**
         * 브라우저 정보 반환을 위한 함수
         * @method getBrowserInfo
         * 
         * @history 1.8.0 Update jindo.m 에서 Agent 체크 부분을 jindo.$Agent().navigator() 로 이관, jindo.$Agent().navigator() 참고  
         * @history 1.13.0 Bug 크롬 for iOS에서 chome여부가 비정상적으로 반환되는 문제 
         */
        getBrowserInfo : function(){
            return _htBrowserInfo;
        },

         /**
            현재 모바일기기의 가로,세로 여부를 반환한다.

            @method isVertical
            @author sculove
            @history 1.9.0 Bug pageShow되었을 경우, 가로/세로 여부의 기존 정보를 유지하는 버그
            @history 1.3.0 Bug 페이지 캐쉬될 경우, rotate 값이 갱신되지 않는 버그 수정
            @history 1.1.0 Update 초기 로드시 가로일경우 값이 제대로 나오지 않는 문제 해결
            @example
                jindo.m.isVertical; // 수직여부 반환
            
        **/
        isVertical : function() {
            if(_isVertical === null) {
                return _getVertical();
            } else {
                return _isVertical;
            }
        },

        /**
            TextNode를 제외한 상위노드를 반환한다.

            @return {HTMLElement} el
            @date 2011. 11. 11
            @method getNodeElement
            @deprecated
            @history 1.5.0 Update deprecated
            @history 0.9.5 Update Method 추가
            @author oyang2
            @example
                var elParent=jindo.m.getNodeElement(el); // TextNode를 제외한 상위노드를 반환한다.
        **/
        getNodeElement : function(el){
            while(el.nodeType != 1){
                el = el.parentNode;
            }
            return el;
        },

        /**
            현재 Element의 offet을 구한다.

            @method getTranslateOffset
            @date 2011. 11. 11
            @author sculove
            @param {jindo.$Element|HTMLElement} element  ComputedStyle 값을 이용하여 offset을 얻는 함수
            @return {Object} {top,left}
            @history 1.8.0 Update getCssOffset -> getTranslateOffset 으로 변경
            @history 1.1.0 Update 웹킷 이외의 브라우저도 처리 가능하도록 기능 개선
            @example
                var oObject=jindo.m.getTranslateOffset(el); // CSSOffset을 반환한다.
        **/
        getTranslateOffset : function(wel){
            wel = jindo.$Element(wel);

            var element = wel.$value(),
                htOffset;
            /** Andorid 3.0대에서는 WebKitCSSMatrix가 있지만, 안됨. 버그 */
            if(_htOsInfo.android && parseInt(_htOsInfo.version,10) === 3) {
               htOffset = _getTranslateOffsetFromStyle(element);
            } else {
               if('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix()){
                  htOffset = _getTranslateOffsetFromCSSMatrix(element);
               } else {
                  htOffset = _getTranslateOffsetFromStyle(element);
               }
            }
            return htOffset;
        },


        /**
            Style의 left,top을 반환함
            @date 2013. 5. 10
            @author sculove
            @method getStyleOffset
            @history 1.8.0 Update Method 추가
            @param {jindo.$Element} wel
            @return {Object} {top,left}
        **/
        getStyleOffset : function(wel) {
            var nLeft = parseInt(wel.css("left"),10),
              nTop = parseInt(wel.css("top"),10);
            nLeft = isNaN(nLeft) ? 0 : nLeft;
            nTop = isNaN(nTop) ? 0 : nTop;
            return {
              left : nLeft,
              top : nTop
            };
        },
        /**
            TransitionEnd 이벤트 bind

            @method attachTransitionEnd
            @author sculove, oyang2
            @date 2011. 11. 11
            @param {HTMLElement} element attach할 엘리먼트
            @param {Function} fHandlerToBind attach할 함수
            @example
                jindo.m.attachTransitionEnd(el, function() { alert("attach"); }); // el에 transitionEnd 이벤트를 attach한다.
                jindo.m.detachTransitionEnd(el, function() { alert("detach"); }); // el에 transitionEnd 이벤트를 detach한다.

        **/
        attachTransitionEnd : function(element,fHandlerToBind) {
            var nVersion = + jindo.$Jindo().version.replace(/[a-z.]/gi,"");
            // console.log(nVersion);
            /* 진도 1.5.1에서 정상 동작. 그 이하버젼은 버그 */
            if(nVersion > 230) {   // jindo
                element._jindo_fn_ = jindo.$Fn(fHandlerToBind,this).attach(element, "transitionend");
            } else {
                var sEvent = ((this.getCssPrefix() === "ms")? "MS": this.getCssPrefix()) + "TransitionEnd";
                element.addEventListener(sEvent, fHandlerToBind, false);
            }
        },

        /**
            TransitionEnd 이벤트 unbind

            @method detachTransitionEnd
            @date 2011. 11. 11
            @author sculove, oyang2
            @param {HTMLElement} element dettach할 엘리먼트
            @param {Function} fHandlerToUnbind dettach할 함수
            @example
                jindo.m.attachTransitionEnd(el, function() { alert("attach"); }); // el에 transitionEnd 이벤트를 attach한다.
                jindo.m.detachTransitionEnd(el, function() { alert("detach"); }); // el에 transitionEnd 이벤트를 detach한다.
        **/
        detachTransitionEnd : function(element, fHandlerToUnbind) {
            var nVersion = + jindo.$Jindo().version.replace(/[a-z.]/gi,"");
            // console.log(nVersion);
            /* 진도 1.5.1에서 정상 동작. 그 이하버젼은 버그 */
            if(nVersion > 230) {   // jindo
                if(element._jindo_fn_) {
                    element._jindo_fn_.detach(element, "transitionend");
                    delete element._jindo_fn_;
                }
            } else {
                var sEvent = ((this.getCssPrefix() === "ms")? "MS": this.getCssPrefix()) + "TransitionEnd";
                element.removeEventListener(sEvent, fHandlerToUnbind, false);
            }
        },

        /**
             MSPointerEvent 처럼 신규 이벤트들이 2.3.0이하 진도에서 attach안되는 문제를 해결하기 위한 코드
            jindo 2.4.0 이상 버전에서는 사용가능, 하위 버전에서는 _notSupport namespace  진도 사용
            @date 2012. 12.06
            @author oyang2
            @example
            jindo.m._attachFakeJindo(el, function(){alert('MSPointerDown'), 'MSPointerDown' });a
         */
        _attachFakeJindo : function(element, fn, sEvent){
            var nVersion = + jindo.$Jindo().version.replace(/[a-z.]/gi,"");
            var wfn = null;
            if(nVersion < 230 && (typeof _notSupport !== 'undefined')) {
                //use namespace jindo
                wfn = _notSupport.$Fn(fn).attach(element, sEvent);
            }else{
                //use jindo
                wfn = jindo.$Fn(fn).attach(element, sEvent);
            }
            return wfn;
        },

        /*
            브라우저별 대처 가능한 이벤트명을 리턴한다.
            @date 2012. 12.06
            @author oyang2
            @example
            jindo.m._getTouchEventName();
        */ 
        _getTouchEventName : function(){
            return  _htTouchEventName;
        },

        /**
            브라우저 CssPrefix를 얻는 함수

            @method getCssPrefix
            @author sculove
            @date 2011. 11. 11
            @return {String} return cssPrefix를 반환. webkit, Moz, O,...
            @history 0.9.5 Update Method 추가
            @example
                jindo.m.getCssPrefix(); // 브라우저별 prefix를 반환한다.
        **/
        getCssPrefix : function() {
            var sCssPrefix = "";
            if(typeof document.body.style.webkitTransition !== "undefined") {
                sCssPrefix = "webkit";
            } else if(typeof document.body.style.transition !== "undefined") {
            } else if(typeof document.body.style.MozTransition !== "undefined") {
                sCssPrefix = "Moz";
            } else if(typeof document.body.style.OTransition !== "undefined") {
                sCssPrefix = "O";
            } else if(typeof document.body.style.msTransition !== 'undefined'){
                sCssPrefix = "ms";
            }
            return sCssPrefix;
        },

        /**
            자신을 포함하여 부모노드중에 셀렉터에 해당하는 가장 가까운 엘리먼트를 구함

            @method getClosest
            @date 2012. 02. 20
            @author sculove
            @param {String} sSelector CSS클래스명 또는 태그명
            @param {HTMLElement} elBaseElement 기준이 되는 엘리먼트
            @return {HTMLElement} 구해진 HTMLElement
            @history 1.1.0 Update Method 추가
            @example
                jindo.m.getClosest("cssName", elParent);   // elParent하위에 cssName 클래스명이 아닌 첫번째 Element를 반환한다.
        **/
        getClosest : function(sSelector, elBaseElement) {
            //console.log("[_getClosest]", sSelector, elBaseElement)
            var elClosest;
            var welBaseElement = jindo.$Element(elBaseElement);

            var reg = /<\/?(?:h[1-5]|[a-z]+(?:\:[a-z]+)?)[^>]*>/ig;
            if (reg.test(sSelector)) {
                // 태그 일경우
                 if("<" + elBaseElement.tagName.toUpperCase() + ">" == sSelector.toUpperCase()) {
                     elClosest = elBaseElement;
                 } else {
                     elClosest = welBaseElement.parent(function(v){
                         if("<" + v.$value().tagName.toUpperCase() + ">" == sSelector.toUpperCase()) {
                            //console.log("v", v)
                            return v;
                        }
                    });
                    elClosest = elClosest.length ? elClosest[0].$value() : false;
                 }
            } else {
                //클래스명일 경우
                 if(sSelector.indexOf('.') == 0) { sSelector = sSelector.substring(1,sSelector.length); }
                 if(welBaseElement.hasClass(sSelector)) {
                    elClosest = elBaseElement;
                 } else {
                    elClosest = welBaseElement.parent(function(v){
                        if(v.hasClass(sSelector)) {
                            //console.log("v", v)
                            return v;
                        }
                    });
                    elClosest = elClosest.length ? elClosest[0].$value() : false;
                }
            }
            //console.log("elClosest", elClosest)
            return elClosest;
        },

        /**
            CSS3d를 사용할수 있는 기기 값 불린 반환.
            @method useCss3d
            @param {Boolean} flicking 에서 사용하는지 여부
            @return {Boolean} CSS3d를 사용할 수 있는 기기일 경우 true를 반환
            @since 2012. 6. 22
            @history 1.11.0 Update 갤럭시S2 4.0.4 에서 false나오는 문제 수정
            @history 1.8.0 Update 사용자가 패치하여 사용할 수 있도록 사용자 인터페이스 제공
            @history 1.7.0 Update Method 추가
            @history 1.7.0 Update 안드로이드 4.1이상에서는 CSS3d가속을 사용하도록 변경 (안드로이드 4.1부터는 BlackList 기반)<br/>
            네이버 메인 호환 장비 추가 등록
            @param {Boolean} isLongRange 긴 거리 이동에서 사용여부 (ex> 스크롤 컴포넌트)
        **/
        useCss3d : function(isLongRange) {
            if(_htAddPatch.useCss3d && typeof _htAddPatch.useCss3d == "function"){
                switch (_htAddPatch.useCss3d()){
                    case -1 :
                        return false;
                    case 1 :
                        return true;
                }
            }
            
            if(typeof isLongRange === 'undefined'){
                isLongRange = false;
            }

            var bRet = false;
            // 크롬일 경우, false처리 (why? 크롬은 글짜가 약간 틀어져 보임. 속도상도 css3d적용 전후와 크게 차이가 나지 않음)
            // 크롬 25이상일 경우에는 글짜가 blur되는 버그가 수정됨.
            // 또한 삼섬 SBrowser에서도 이러한 문제가 수정됨.
            if(_htBrowserInfo.chrome && _htBrowserInfo.version < "25" && !_htBrowserInfo.bSBrowser) {
                return bRet;
            }
            if(_htOsInfo.ios) {
                bRet = true;
            } else if(_htBrowserInfo.firefox){
                bRet = true;
            } else if(_htOsInfo.android){
                var s = navigator.userAgent.match(/\(.*\)/)[0];
                if(_htOsInfo.version >= "4.1.0") {
                    // 안드로이드 젤리빈 이상은 BlackList 기반으로 관리
                    // 갤럭시 카메라인경우, css3d제거
                    if(/EK-GN120|SM-G386F/.test(s)) {
                        bRet = false;
                    } else {
                        bRet = true;
                    }
                } else {
                    
                    // 짧은 거리(Flicking) 에서 4.0이상 인 경우 css3d : true.
                    if(!isLongRange && _htOsInfo.version >= "4.0"){
                        bRet = true;
                    }
                    
                    if(_htOsInfo.version >= "4.0.3" && 
                        /SHW-|SHV-|GT-|SCH-|SGH-|SPH-|LG-F160|LG-F100|LG-F180|LG-F200|EK-|IM-A|LG-F240|LG-F260/.test(s) &&
                        !/SHW-M420|SHW-M200|GT-S7562/.test(s)) {    // SHW-M420 : 갤럭시 넥서스 , SHW-M200 : 넥서스S , GT-S7562 : 갤럭시 S 듀오스
                        bRet = true;
                    } 
                }
            }
            return bRet;
        },

        /**
         *  jindo.m 을 사용자가 특정 인터페이스를 통해 사용할 수 있도록 제공하기 위한 패치 버전 정의<br />
         * 입력한 버전보다 하위 JMC 에 대해서만 적용되며 상위 JMC 에 대해서는 적용되지 않는다.
         *  @method patch
         *  
         *  @param {String} ver     패치를 위한 패치 버전 정보 
         *  @history 1.8.0 Update   디바이스 정보를 사용자가 추가 및 업데이트 등을 위한 패치 함수 제공 
         */
        patch : function(ver){
            _htAddPatch.ver = ver;
            return this;
        },

        /**
         *  컴포넌트의 버전과 패치 버전을 비교하여 등록 여부 결정
         *  @return {Boolean}   버전을 비교하여 패치가 가능하다면 true, 아니면 false
         */
        _checkPatchVersion : function(){
            var aVer = jindo.m.Component.VERSION.split("."),
                sVer = aVer.slice(0,3).join(".");
            if(_htAddPatch.ver >= sVer){
                return true;
            }
            return false;
        },

        /**
         *  jindo.m 패치 인터페이스
         * @method add
         * 
         *  @paran {HashTable}  htOption    패치하고자 하는 {함수명, 함수} 형태로 정의
         * @history 1.8.0 Update   디바이스 정보를 사용자가 추가 및 업데이트 등을 위한 add 함수 제공
         *  @example
                jindo.m.patch("1.7.0").add({
                    "useCss3d" : function(){
                        if(jindo.$Agent().os().android){
                            return 1;   // true
                        }
                        else if(jindo.$Agent().os().ios){
                            return -1;  // false
                        }else{
                            return 0;   // continue
                        }
                    },
                    "useTimingFunction" : function(){
                        if(jindo.$Agent().os().android){
                            return 1;   // true
                        }
                        else if(jindo.$Agent().os().ios){
                            return -1;  // false
                        }else{
                            return 0;   // continue
                        }
                    },
                    "hasClickBug" : function(){
                        if(jindo.$Agent().os().android){
                            return 1;   // true
                        }
                        else if(jindo.$Agent().os().ios){
                            return -1;  // false
                        }else{
                            return 0;   // continue
                        }
                    },
                    "getDeviceName" : function(){
                        if(navigator.userAgent.indexOf("Galaxy Nexus") > -1){
                            return "galaxyNexus";
                        }
                    },
                    "useFixed" : function(){
                        if(jindo.$Agent().os().android){
                            return 1;   // true
                        }
                        else if(jindo.$Agent().os().ios){
                            return -1;  // false
                        }else{
                            return 0;   // continue
                        }
                    },
                    "hasOffsetBug" : function(){
                        if(jindo.$Agent().os().android){
                            return 1;   // true
                        }
                        else if(jindo.$Agent().os().ios){
                            return -1;  // false
                        }else{
                            return 0;   // continue
                        }
                    }
                })
         */
        add : function(htOption){
            if(this._checkPatchVersion()){
                for ( var i in htOption){
                    _htAddPatch[i] = htOption[i];
                }
            }
            return this;
        },

        /**
         *  디바이스 이름(galaxyS, optimusLTE 등..) 정보 반환
         *  @method getDeviceName 
         * 
         *  @return {String}    디바이스 이름 - _htDeviceList에 정의되어 있는 key가 name 이 되어 반환된다.
         *                              (디바이스 이름이 존재하지 않으면 iphone, ipad, android 등의 정보 반환한다.)
         *  @history 1.8.0 Update   디바이스 이름 정보 반환을 위한 함수 추가     
         */
        getDeviceName : function(){
            if(_htAddPatch.getDeviceName && typeof _htAddPatch.getDeviceName == "function"){ 
                if(_htAddPatch.getDeviceName()){
                    return _htAddPatch.getDeviceName();
                }
            }
            var sUserAgent = navigator.userAgent;
            for (var i in _htDeviceList){
                if(eval("/" + _htDeviceList[i].join("|") + "/").test(sUserAgent)){
                    // _htDeviceInfo[i] = true;
                    return i;
                    break;
                }
            }

            // 아무런 정보도 넘어오지 않았을때 iphone, ipad, android 여부 리턴.
            var htInfo = jindo.$Agent().os();
            for ( var x in htInfo){
                if(htInfo[x] === true && htInfo.hasOwnProperty(x)){
                    return x;
                    break;
                }
            }
        },
        
        /**
            fixed  속성을 지원하는지 확인하는 함수
            @method useFixed
            @since 2012. 6. 22
            @return {Boolean} isFixed
            @history 1.8.0 Update 사용자가 패치하여 사용할 수 있도록 사용자 인터페이스 제공
            @history 1.7.0 Update Method 추가
            @remark
                1. ios
                - ios5 (scrollTo가 발생된 경우 랜더링 되지 않는 버그)
                2. android
                - 3.x 부터 지원함 (그전에도 지원했지만, 하이라이트 적용문제로 처리할 수 없음)
                scroll, flicking과 함께 사용할 경우, 깜빡거림
        **/
        useFixed : function() {
            if(_htAddPatch.useFixed && typeof _htAddPatch.useFixed == "function"){
                switch (_htAddPatch.useFixed()){
                    case -1 :
                        return false;
                    case 1 :
                        return true;
                }
            }
            
            var isFixed = false;
            if(_htBrowserInfo.chrome || 
                _htBrowserInfo.firefox ||
               (_htOsInfo.android && parseInt(_htOsInfo.version,10) >= 3) ||
               (_htOsInfo.ios && parseInt(_htOsInfo.version,10) >= 5) ||
               (_htOsInfo.mwin && parseInt(_htOsInfo.version,10) >= 8)) {
                isFixed = true;
            }
            return isFixed;
        },



        /**
            TimingFunction를 사용할수 있는 기기 값 불린 반환.
            @method useTimingFunction
            @since 2012. 6. 30
            @history 1.13.0 Bug iOS 6,7 은 false 로 처리 
            @history 1.11.0 Update iOS는 true로 변경 (애니메이션을 Morph로 변경후, iOS에서는 true로 변경)
            @history 1.10.0 Update iOS6.0 이상일 경우, timingFunction=false되도록 수정
            @history 1.8.0 Update 사용자가 패치하여 사용할 수 있도록 사용자 인터페이스 제공
            @history 1.7.1 Bug iOS6.0일 경우에만, timingFunction=false되도록 수정
            @history 1.7.0 Update Method 추가
            @param {Boolean} bUseFlicking flicking 컴포넌트에서 사용여부
            @return {Boolean} TimingFunction를 사용할 수 있는 기기일 경우 true를 반환
        **/
        useTimingFunction : function(isLongRange) {
            if(_htAddPatch.useTimingFunction && typeof _htAddPatch.useTimingFunction == "function"  && _htAddPatch.useTimingFunction()){
                switch (_htAddPatch.useTimingFunction()){
                    case -1 :
                        return false;
                    case 1 :
                        return true;
                }
            }
            
            if(typeof isLongRange === 'undefined'){
                isLongRange = false;
            }
            var bUse = this.useCss3d();
            if(_htOsInfo.android) {
                bUse = false;
                if(!isLongRange && _htOsInfo.version >= "4.0"){
                    bUse = true;
                }
                // ios7 에서 스크롤 이후 플리킹 동작을 했을때 멈추는 현상 대응 
            } else if(_htOsInfo.ios && parseInt(_htOsInfo.version,10) >= 6) {
                // 먼 거리를 이동할 경우에는 timingFunction, 자잘하게 움직일때는 timer
                bUse = isLongRange ? true : false;
                // bUse = false;
            }
            return bUse;
        },

        /**
            RequestAnimationFrame를 사용할수 있는 기기 값 불린 반환.
            @since 2013. 6. 20
            @return {Boolean} RequestAnimationFrame를 사용할 수 있는 기기일 경우 true를 반환
        **/
        // useRequestAnimationFrame : function() {
        //     var htOs = jindo.m.getOsInfo(),
        //         bResult = true;
        //     if(htOs.android) {
        //       if(htOs.version < "4.0") {
        //         bResult = false;
        //       }
        //     }
        //     return bResult;
        // },

        /**
         *  브라우저 사이즈 정보 반환
         *  _htClientSize 변수에 정의되어 있는 값을 참조로 리턴한다.
         *  @return {HashTable} adress , 브라우저 height  값을 반환한다. 
         */
        // getClientHeight : function(){
            // var sDeviceName = this.getDeviceName();
            // var sWay = this.isVertical() ? "portrait" : "landscape";
            // var htRet = {};
// 
             // if(_htAddPatch.getClientHeight && typeof _htAddPatch.getClientHeight == "function"){
                // if(htRet = _htAddPatch.getClientHeight({
                    // "sDeviceName" : sDeviceName,
                    // "sVersion" : _htOsInfo.version
                // })){
                    // return htRet;
                // }
            // }
// 
            // var aSearch = [sDeviceName, _htOsInfo.version, sWay];
            // htRet = jindo.$Document().clientSize();
// 
            // function getDefault(htData, oRet){
                // if(htData.hasOwnProperty("default")){
                    // htRet.address = htData["default"]["address"] || htRet.address;
                    // htRet.height = htData["default"][sWay] || htRet.height;
                    // // return htData["default"][sWay];
                // }
            // }
            // var htTmpData = _htClientSize;
            // if(sDeviceName){
                // for ( var i = 0 , nFor = aSearch.length ; i < nFor ; i++ ){
                    // if(htTmpData.hasOwnProperty(aSearch[i])){
                        // htTmpData = htTmpData[aSearch[i]];
                        // htRet.height = htTmpData[sWay] || htRet.height;
                        // htRet.address = htTmpData.address || htRet.address;
                    // }else{
                        // getDefault(htTmpData, htRet);
                        // break;
                    // }
                // }
            // }
            // return htRet;
        // },

        /**
            디바이스 화면 사이즈를 반환 (viewport가 device-width 속성으로 지정되었을때의 크기)

            @since 2012. 6. 22
            @param {Boolean} isMinSize
            @return {Object} width, height
        **/
        // _clientSize : function(isMinSize) {
        //     if(typeof isMinSize === 'undefined'){
        //         isMinSize = false;
        //     }
        //     var oSize = {};
        //     var oRet = jindo.$Document().clientSize();
        //     var nVersion = parseInt(_htOsInfo.version,10);

        //     if( (_htOsInfo.ipad || _htOsInfo.iphone) || _htBrowserInfo.chrome) {
        //         if(isMinSize && _htOsInfo.iphone) {
        //             oRet.height = this.isVertical()? 356 : 268;
        //         }
        //         return oRet;
        //     }

        //     switch(_htDeviceInfo.name){
        //         case "galaxyTab"    : oSize = { portrait : 400,  landscape : 683 };
        //             oSize.landscape -= 92;
        //             oSize.portrait -= 66;
        //             break;
        //         case "galaxyTab2"   : oSize = { portrait : 1280,  landscape : 800 };
        //             oSize.landscape -= 152;
        //             oSize.portrait -= 152;
        //             break;
        //         case "galaxyS"      : oSize = { portrait : 320,  landscape : 533 };
        //             oSize.landscape -= 81;  // android 2.2/2.3
        //             oSize.portrait -= 81;
        //             break;
        //         case "galaxyS2LTE"  :
        //         case "galaxyS2"     : oSize = { portrait : 320,  landscape : 533 };
        //             if(nVersion==4) {
        //                 oSize.landscape -= 77;
        //                 oSize.portrait -= 77;
        //             } else {
        //                 oSize.landscape -= 83;
        //                 oSize.portrait -= 83;
        //             }
        //             break;
        //         case "galaxyS3"     : oSize = { portrait : 360,  landscape : 640 };
        //             oSize.landscape -= 73;
        //             oSize.portrait -= 73;
        //             break;
        //         case "galaxyNote"   :
        //         case "galaxyNote2"   : oSize = { portrait : 400,  landscape : 640 };
        //             if(nVersion==4) {
        //                 oSize.landscape -= 77;
        //                 oSize.portrait -= 77;
        //             } else {
        //                 oSize.landscape -= 103;
        //                 oSize.portrait -= 103;
        //             }
        //             break;
        //         case "galaxyNexus"  : oSize = { portrait : 360,  landscape : 598 };
        //             oSize.landscape -= 83;
        //             oSize.portrait -= 83;
        //             break;
        //         case "optimusLte" : oSize = { portrait : 360,  landscape : 640 };
        //             oSize.landscape -= 73;
        //             oSize.portrait -= 73;
        //             break;
        //         case "optimusLte2" : oSize = { portrait : 360,  landscape : 640 };
        //             oSize.landscape -= 73;
        //             oSize.portrait -= 73;
        //             break;
        //         case "optimusVu" : oSize = { portrait : 439,  landscape : 585 };
        //             oSize.landscape -= 73;
        //             oSize.portrait -= 73;
        //             break;
        //     }
        //     if(this.isVertical()) {
        //         if(isMinSize || (oSize.landscape && oSize.landscape > oRet.height)) {
        //             oRet.height = oSize.landscape;
        //         }
        //     } else {
        //         if(isMinSize || (oSize.portrait && oSize.portrait > oRet.height)) {
        //             oRet.height = oSize.portrait;
        //         }
        //     }
        //     return oRet;
        // },

        /**
            기기별 주소창 높이를 구한다.
            @author oyang2
            @return {Number} nHeight
         */
        // _getAdressSize : function(){
        //     var nSize = 0;
        //     if(_htOsInfo.bInapp){
        //         return nSize;
        //     }
        //      var nVersion = parseInt(_htOsInfo.version,10);
        //     if( _htOsInfo.iphone){
        //         nSize = 60;
        //     }else if(_htOsInfo.android){
        //         switch(_htOsInfo.name ){
        //             case "galaxyTab"    :
        //                 nSize = 66;
        //                 break;
        //             case "galaxyTab2"   :
        //                 nSize = 48;
        //                 break;
        //             case "galaxyS"      :
        //                 nSize = 56;  // android 2.2/2.3
        //                 break;
        //             case "galaxyS2LTE"  :
        //             case "galaxyS2"     :
        //                 if(nVersion==4) {
        //                     nSize = 52;
        //                 } else {
        //                    nSize = 58;
        //                 }
        //                 break;
        //             case "galaxyS3"     :
        //                 nSize  = 48;
        //                 break;
        //             case "galaxyNote"   :
        //             case "galaxyNote2"   :
        //                 if(nVersion==4) {
        //                     nSize = 52;
        //                 } else {
        //                     nSize = 78;
        //                 }
        //                 break;
        //             case "galaxyNexus"  :
        //                 nSize = 52;
        //                 break;
        //             case "optimusVu" :  //lg ics는 모두 48인
        //             case "optimusLte" :
        //             case "optimusLte2" :
        //                 nSize = 48;
        //                 break;
        //          }
        //     }
        //     return nSize;
        // },
        

        _cacheMaxClientSize : {},
        _fullSizeCheckElement : null,
        _allEventStop : function(fp, type) {
            if(!this._htEvent){
                this._htEvent = {};
            }
            if(type == "detach"){
                this._htEvent["touchstart"].detach(document.body, "touchstart").detach(document.body, "touchmove");
                this._htEvent = {};
            }else if(!this._htEvent["touchstart"] && type == "attach"){
                this._htEvent["touchstart"] = jindo.$Fn(fp, this).attach(document.body , "touchstart").attach(document.body, "touchmove");
            }
            // jindo.$Element(document.body)[type]("touchstart",fp)[type]("touchmove", fp);
        },
        
        _stopDefault : function(e){
            e.stop();
        },
        _hasOrientation : window.orientation !== undefined,
        
        
        /**
         * 모바일 기기의 높이 full size 를 구하는 함수.
         * 해당 함수 호출 시 주소창이 사라짐.
         * 페이지 로드시 해당 함수 호출 시 터치가 되지 않는다는 문의로 초기화시 호출 여부의 변수 추가
         *  bInit :  true(딜레이 없이 바로 사이즈 계산) / false (딜레이 후 사이즈 계산)
         */
        _maxClientSize : function(fpCallBack, bInit) {
            //-@@$Document.clientSizeAsync-@@//
            var _htOsInfo = this.getOsInfo();
            
            this._allEventStop(this._stopDefault, "attach");
            if (!this._fullSizeCheckElement) {
                this._fullSizeCheckElement = document.createElement("div");
            }
            var delay = _htOsInfo.android ? 500 : 100;
            delay = bInit ? 1 : delay;
            
            var type;
            if (this._hasOrientation) {
                type = Math.abs(window.orientation / 90) % 2;
                delay = this._cacheMaxClientSize[type] !== undefined ? 0 : delay;
            }
            var that = this;
            if (document.body.scrollTop <= 1) {
                    document.body.appendChild(that._fullSizeCheckElement);
                    that._fullSizeCheckElement.style.cssText = 'position:absolute; top: 0px; width:100%;height:' + parseInt(window.innerHeight+200, 10) + 'px;';
                    window.scrollTo(0, 1);
                    setTimeout(function() {
                        that._checkSize(that._hasOrientation, that._cacheMaxClientSize, type, fpCallBack, that, delay);
                    }, delay);
            } else {
                this._fullSizeCheckElement.style.height = window.innerHeight + 'px';
                this._checkSize(this._hasOrientation, this._cacheMaxClientSize, type, fpCallBack, that, delay);
            }

        },

        _checkSize : function(hasOrientation, cacheMaxClientSize, type, fpCallBack, that, delay) {
            
            var _htOsInfo = this.getOsInfo();
            var _htBrowserInfo = this.getBrowserInfo();

            this._allEventStop(this._stopDefault, "attach");
            var size;
            if (hasOrientation && cacheMaxClientSize[type]) {
                size = cacheMaxClientSize[type];
            } else {
                
                that._fullSizeCheckElement.style.cssText = 'position:absolute; top: 0px; width:100%;height:' + window.innerHeight+ 'px;overflow:hidden';
                
                size = _htBrowserInfo.mobile || _htOsInfo.ipad ? {
                    "width" : window.innerWidth,
                    "height" : window.innerHeight
                } : {
                    "width" : document.documentElement.clientWidth,
                    "height" : document.documentElement.clientHeight
                };
                // console.log(size);
                if (hasOrientation) {
                    cacheMaxClientSize[type] = size;
                }
            }

            fpCallBack.call(that, size);
            var self = this;
            this._allEventStop(this._stopDefault, "detach");
            if (delay === 0) {
                this._fullSizeCheckElement.style.height = "0px";
            } else {
                setTimeout(function() {
                    self._fullSizeCheckElement.style.height = "0px";
                }, delay);
            }
        },
        

        /**
            엘리먼트 offset 변경 이후, 하이라이트/롱탭/클릭 이 기존 offset에서 발생하는 버그를 가지고 있는 지 판단
            @date 2013.05.10
            @method hasOffsetBug
            @return {Boolean}
            @author sculove
            @history 1.10.0 Bug patch 적용이 안되는 버그 수정
            @history 1.8.0 Update Method 추가
         */
        hasOffsetBug : function() {
            if(_htAddPatch.hasOffsetBug && typeof _htAddPatch.hasOffsetBug == "function"){
                switch (_htAddPatch.hasOffsetBug()){
                    case -1 :
                        return false;
                    case 1 :
                        return true;
                }
            }
            var bResult = false;
            if(_htOsInfo.android) {
                if(_htBrowserInfo.chrome || _htBrowserInfo.firefox) {
                    bResult = false;
                } else {
                    if(_htOsInfo.version < "4") {
                        bResult = true;
                    } else {
                        bResult = false;
                    }
                }
            } else {
                bResult = false;
            }
            return bResult;
        },

        /**
            터치이벤트에 따라 엘리먼트 애니메이션 진행후 클릭되는 이슈를 가진 브라우저인지 판단
            @date 2012.11.05
            @method hasClickBug
            @return {Boolean}
            @author sculove
            @history 1.9.0 Bug Window8 IE10 확인 모듈 수정
            @history 1.8.0 Update Method 추가
         */
        hasClickBug : function(){
            if(_htAddPatch.hasClickBug && typeof _htAddPatch.hasClickBug == "function"){
                switch (_htAddPatch.hasClickBug()){
                    case -1 :
                        return false;
                    case 1 :
                        return true;
                }
            }
            
            // (_htOsInfo.mwin && ((_htOsInfo.version *1) >= 8)
            return ( _htOsInfo.ios || (window.navigator.msPointerEnabled && window.navigator.msMaxTouchPoints > 0) || false );
        }
    };
    __M__._isUseFixed = __M__.useFixed;
    __M__._isUseTimingFunction = __M__.useTimingFunction;
    __M__._isUseCss3d = __M__.useCss3d;
    __M__.getCssOffset = __M__.getTranslateOffset;
    __M__.$init();
    return __M__;
})();

/*
    @jindo 2.2.0
    @since 1.10.0
 */
if(!("mixin" in jindo.$Jindo)) {
    jindo.$Jindo.mixin = function(oDestination, oSource){
        var oReturn = {};
        
        for(var i in oDestination){
            oReturn[i] = oDestination[i];
        }
        
        for (i in oSource) if (oSource.hasOwnProperty(i)) {
            oReturn[i] = oSource[i];
        }
        return oReturn;
    };
}
/**
    @fileOverview 진도 컴포넌트를 구현하기 위한 코어 클래스
    @version 1.13.0
    @since 2011. 7. 13.
**/

/**
    진도 모바일 컴포넌트를 구현하기 위한 코어 클래스.
    다른 컴포넌트가 상속받는 용도로 사용된다.

    @class jindo.m.Component
    @uses jindo.m
    @keyword component, base, core
    @group Component
    @update
    @invisible
**/
jindo.m.Component = jindo.$Class({
	/** @lends jindo.m.Component.prototype */

	_htEventHandler : null,
	_htOption : null,

	/**
		jindo.m.Component를 초기화한다.
		
		@constructor
	**/
	$init : function() {
		this._htEventHandler = {};
		this._htOption = {};
		this._htOption._htSetter = {};
	},
	
	/**
		옵션 값을 가져온다. 
		
		@method option
		@param {String} sName 옵션의 이름
		@return {Variant} 옵션의 값
	**/
	/**
		옵션 값을 설정한다. 
		htCustomEventHandler 옵션을 선언해서 attach() 메서드를 사용하지 않고 커스텀 이벤트핸들러를 등록할 수 있다.
		
		@method option
		@syntax sName, vValue
		@syntax oValue
		@param {String} sName 옵션의 이름
		@param {Variant} vValue 옵션의 값
		@param {Object} oValue 하나 이상의 이름과 값을 가지는 옵션 객체
		@return {this} 옵션 값을 설정한 인스턴스 자신
		@example
			var MyComponent = jindo.$Class({
				method : function() {
					alert(this.option("foo"));
				}
			}).extend(jindo.m.Component);
			
			var oInst = new MyComponent();
			oInst.option("foo", 123); // 또는 oInst.option({ foo : 123 });
			oInst.method(); // 결과 123
		@example
			//커스텀 이벤트핸들러 등록예제
			oInst.option("htCustomEventHandler", {
				test : function(oCustomEvent) {
					
				}
			});
			
			//이미 "htCustomEventHandler" 옵션이 설정되어있는 경우에는 무시된다.
			oInst.option("htCustomEventHandler", {
				change : function(oCustomEvent) {
					
				}
			});
	**/
	option : function(sName, vValue) {
		switch (typeof sName) {
			case "undefined" :
				var oOption = {};
				for(var i in this._htOption){
					if(!(i == "htCustomEventHandler" || i == "_htSetter")){
						oOption[i] = this._htOption[i];
					}
				}
				return oOption;
			case "string" : 
				if (typeof vValue != "undefined") {
					if (sName == "htCustomEventHandler") {
						if (typeof this._htOption[sName] == "undefined") {
							this.attach(vValue);
						} else {
							return this;
						}
					}
					
					this._htOption[sName] = vValue;
					if (typeof this._htOption._htSetter[sName] == "function") {
						this._htOption._htSetter[sName](vValue);	
					}
				} else {
					return this._htOption[sName];
				}
				break;
			case "object" :
				for(var sKey in sName) {
					if (sKey == "htCustomEventHandler") {
						if (typeof this._htOption[sKey] == "undefined") {
							this.attach(sName[sKey]);
						} else {
							continue;
						}
					}
					if(sKey !== "_htSetter"){
						this._htOption[sKey] = sName[sKey];
					}
					
					if (typeof this._htOption._htSetter[sKey] == "function") {
						this._htOption._htSetter[sKey](sName[sKey]);	
					}
				}
				break;
		}
		return this;
	},
	
	/**
		옵션의 setter 함수를 가져온다. 
		옵션의 setter 함수는 지정된 옵션이 변경되면 수행되는 함수이다.
		
		@method optionSetter
		@param {String} sName setter의 이름
		@return {Function} setter 함수
	**/
	/**
		옵션의 setter 함수를 설정한다. 
		옵션의 setter 함수는 지정된 옵션이 변경되면 수행되는 함수이다.
		
		@method optionSetter
		@syntax sName, fSetter
		@syntax oValue
		@param {String} sName setter의 이름
		@param {Function} fSetter setter 함수
		@param {Object} oValue 하나 이상의 setter 이름과 setter 함수를 가지는 객체
		@return {this} 옵션의 setter 함수를 설정한 인스턴스 자신
		@example
			oInst.option("sMsg", "test");
			oInst.optionSetter("sMsg", function(){
				alert("sMsg 옵션 값이 변경되었습니다.");
			});
			oInst.option("sMsg", "change"); -> alert발생
		@example
			//HashTable 형태로 설정가능
			oInst.optionSetter({
				"sMsg" : function(){
				},
				"nNum" : function(){
				}
			});
	**/
	optionSetter : function(sName, fSetter) {
		switch (typeof sName) {
			case "undefined" :
				return this._htOption._htSetter;
			case "string" : 
				if (typeof fSetter != "undefined") {
					this._htOption._htSetter[sName] = jindo.$Fn(fSetter, this).bind();
				} else {
					return this._htOption._htSetter[sName];
				}
				break;
			case "object" :
				for(var sKey in sName) {
					this._htOption._htSetter[sKey] = jindo.$Fn(sName[sKey], this).bind();
				}
				break;
		}
		return this;
	},
	
	/**
		이벤트를 발생시킨다.
		
		@method fireEvent
		@param {String} sEvent 커스텀 이벤트명
		@param {Object} oEvent 커스텀 이벤트 핸들러에 전달되는 객체.
		@return {Boolean} 핸들러의 커스텀 이벤트객체에서 stop메서드가 수행되면 false를 리턴
		@example
			//커스텀 이벤트를 발생시키는 예제
			var MyComponent = jindo.$Class({
				method : function() {
					this.fireEvent('happened', {
						sHello : 'world',
						nAbc : 123
					});
				}
			}).extend(jindo.m.Component);
			
			var oInst = new MyComponent().attach({
				happened : function(oCustomEvent) {
					alert(oCustomEvent.sHello + '/' + oCustomEvent.nAbc); // 결과 : world/123
				}
			});
			
			<button onclick="oInst.method();">Click me</button> 
	**/
	fireEvent : function(sEvent, oEvent) {
		oEvent = oEvent || {};
		var fInlineHandler = this['on' + sEvent],
			aHandlerList = this._htEventHandler[sEvent] || [],
			bHasInlineHandler = typeof fInlineHandler == "function",
			bHasHandlerList = aHandlerList.length > 0;
			
		if (!bHasInlineHandler && !bHasHandlerList) {
			return true;
		}
		aHandlerList = aHandlerList.concat(); //fireEvent수행시 핸들러 내부에서 detach되어도 최초수행시의 핸들러리스트는 모두 수행
		
		oEvent.sType = sEvent;
		if (typeof oEvent._aExtend == 'undefined') {
			oEvent._aExtend = [];
			oEvent.stop = function(){
				if (oEvent._aExtend.length > 0) {
					oEvent._aExtend[oEvent._aExtend.length - 1].bCanceled = true;
				}
			};
		}
		oEvent._aExtend.push({
			sType: sEvent,
			bCanceled: false
		});
		
		var aArg = [oEvent], 
			i, nLen;
			
		for (i = 2, nLen = arguments.length; i < nLen; i++){
			aArg.push(arguments[i]);
		}
		
		if (bHasInlineHandler) {
			fInlineHandler.apply(this, aArg);
		}
	
		if (bHasHandlerList) {
			var fHandler;
			for (i = 0, fHandler; (fHandler = aHandlerList[i]); i++) {
				fHandler.apply(this, aArg);
			}
		}
		
		return !oEvent._aExtend.pop().bCanceled;
	},

	/**
		커스텀 이벤트 핸들러를 등록한다.
		
		@method attach
		@param {String} sEvent 커스텀 이벤트 명
		@param {Function} fHandlerToAttach 등록 할 커스텀 이벤트 핸들러
			@param {Object} fHandlerToAttach.oCustomEvent 커스텀 이벤트 객체
		@return {this} 컴포넌트 인스턴스 자신
		@example
			//이벤트 등록 방법 예제
			//아래처럼 등록하면 appear 라는 사용자 이벤트 핸들러는 총 3개가 등록되어 해당 이벤트를 발생시키면 각각의 핸들러 함수가 모두 실행됨.
			//attach 을 통해 등록할때는 이벤트명에 'on' 이 빠지는 것에 유의.
			function fpHandler1(oEvent) { .... };
			function fpHandler2(oEvent) { .... };
			
			var oInst = new MyComponent();
			oInst.onappear = fpHandler1; // 직접 등록
			oInst.attach('appear', fpHandler1); // attach 함수를 통해 등록
			oInst.attach({
				appear : fpHandler1,
				more : fpHandler2
			});
	**/
	attach : function(sEvent, fHandlerToAttach) {
		if (arguments.length == 1) {
			
			jindo.$H(arguments[0]).forEach(jindo.$Fn(function(fHandler, sEvent) {
				this.attach(sEvent, fHandler);
			}, this).bind());
		
			return this;
		}
		
		var aHandler = this._htEventHandler[sEvent];
		
		if (typeof aHandler == 'undefined'){
			aHandler = this._htEventHandler[sEvent] = [];
		}
		
		aHandler.push(fHandlerToAttach);
		
		return this;
	},
	
	/**
		커스텀 이벤트 핸들러를 해제한다.
		
		@method detach
		@param {String} sEvent 커스텀 이벤트 명
		@param {Function} fHandlerToDetach 등록 해제 할 커스텀 이벤트 핸들러
		@return {this} 컴포넌트 인스턴스 자신
		@example
			//이벤트 해제 예제
			oInst.onappear = null; // 직접 해제
			oInst.detach('appear', fpHandler1); // detach 함수를 통해 해제
			oInst.detach({
				appear : fpHandler1,
				more : fpHandler2
			});
	**/
	detach : function(sEvent, fHandlerToDetach) {
		if (arguments.length == 1) {
			jindo.$H(arguments[0]).forEach(jindo.$Fn(function(fHandler, sEvent) {
				this.detach(sEvent, fHandler);
			}, this).bind());
		
			return this;
		}

		var aHandler = this._htEventHandler[sEvent];
		if (aHandler) {
			for (var i = 0, fHandler; (fHandler = aHandler[i]); i++) {
				if (fHandler === fHandlerToDetach) {
					aHandler = aHandler.splice(i, 1);
					break;
				}
			}
		}

		return this;
	},
	
	/**
		등록된 모든 커스텀 이벤트 핸들러를 해제한다.
		
		@method detachAll
		@param {String} sEvent 이벤트명. 생략시 모든 등록된 커스텀 이벤트 핸들러를 해제한다. 
		@return {this} 컴포넌트 인스턴스 자신
		@example
			//"show" 커스텀 이벤트 핸들러 모두 해제
			oInst.detachAll("show");
			
			//모든 커스텀 이벤트 핸들러 해제
			oInst.detachAll();
	**/
	detachAll : function(sEvent) {
		var aHandler = this._htEventHandler;
		
		if (arguments.length) {
			
			if (typeof aHandler[sEvent] == 'undefined') {
				return this;
			}
	
			delete aHandler[sEvent];
	
			return this;
		}	
		
		for (var o in aHandler) {
			delete aHandler[o];
		}
		return this;				
	}
});

/**
	다수의 컴포넌트를 일괄 생성하는 Static Method
	
	@method factory
	@static
	@param {Array} aObject 기준엘리먼트의 배열
	@param {HashTable} htOption 옵션객체의 배열
	@return {Array} 생성된 컴포넌트 객체 배열
	@example
		var Instance = jindo.m.Component.factory(
			cssquery('li'),
			{
				foo : 123,
				bar : 456
			}
		);
**/
jindo.m.Component.factory = function(aObject, htOption) {
	var aReturn = [],
		oInstance;

	if (typeof htOption == "undefined") {
		htOption = {};
	}
	
	for(var i = 0, el; (el = aObject[i]); i++) {
		oInstance = new this(el, htOption);
		aReturn[aReturn.length] = oInstance;
	}

	return aReturn;
};

/**
	컴포넌트의 생성된 인스턴스를 리턴한다.
	
	@static
	@deprecated
	
	@remark 본 메서드는 deprecated 되었으며 멀지 않은 릴리즈부터 사라질 예정입니다. 
	
	@return {Array} 생성된 인스턴스의 배열
**/
jindo.m.Component.getInstance = function(){
	throw new Error('JC 1.11.0 or JMC 1.13.0 later, getInstance method of Component is not longer supported.');
};

/**
	사용하는 컴포넌트의 버전
	
	@property VERSION
	@static
	
	@type String
	@default "1.3.0"
	
	@example
		console.log(jindo.m.Component.VERSION); // "1.3.0"

	@since 1.3.0
 */
jindo.m.Component.VERSION = '1.13.0'; /**
	@fileOverview UI 컴포넌트를 구현하기 위한 코어 클래스
	@version 1.13.0
**/
/**
	UI Component에 상속되어 사용되는 Jindo Mobile Component의 Core

	@class jindo.m.UIComponent
	@extends jindo.m.Component
	@keyword uicomponent, component, 유아이컴포넌트
	@group Component
	@invisible
**/
jindo.m.UIComponent = jindo.$Class({
	/** @lends jindo.m.UIComponent.prototype */
		
	/**
		@constructor
		jindo.m.UIComponent를 초기화한다.
	**/
	$init : function() {
		this._bIsActivating = false; //컴포넌트의 활성화 여부
	},

	/**
		컴포넌트의 활성여부를 가져온다.
		
		@method isActivating
		@return {Boolean}
	**/
	isActivating : function() {
		return this._bIsActivating;
	},

	/**
		컴포넌트를 활성화한다.
		_onActivate 메서드를 수행하므로 반드시 상속받는 클래스에 _onActivate 메서드가 정의되어야한다.
		
		@method activate
		@return {this}
	**/
	activate : function() {
		if (this.isActivating()) {
			return this;
		}
		this._bIsActivating = true;
		
		if (arguments.length > 0) {
			this._onActivate.apply(this, arguments);
		} else {
			this._onActivate();
		}
				
		return this;
	},
	
	/**
		컴포넌트를 비활성화한다.
		_onDeactivate 메서드를 수행하므로 반드시 상속받는 클래스에 _onDeactivate 메서드가 정의되어야한다.
		
		@method deactivate
		@return {this}
	**/
	deactivate : function() {
		if (!this.isActivating()) {
			return this;
		}
		this._bIsActivating = false;
		
		if (arguments.length > 0) {
			this._onDeactivate.apply(this, arguments);
		} else {
			this._onDeactivate();
		}
		
		return this;
	}
}).extend(jindo.m.Component);	
/**
    @fileOverview 모바일 터치 컴포넌트
    @(#)jindo.m.Touch.js 2011. 8. 24.
    @author oyang2
    @version 1.13.0
    @since 2011. 8. 24.
**/
/**
    기준 레이어에서의 사용자 터치 움직임을 분석하여 scroll,tap 등의 동작을 분석하는 컴포넌트

    @class jindo.m.Touch
    @extends jindo.m.UIComponent
    @keyword touch
    @group Component
    @update
        
    @history 1.9.0 Bug Window8 IE10 플리킹 적용시 스크롤이 안되는 이슈 처리
    @history 1.5.0 Support Window Phone8 지원
    @history 1.5.0 Update [nEndEventThreshold] 옵션 추가
    @history 1.2.0 Support Chrome for Android 지원<br />
                    갤럭시 S2 4.0.3 업데이트 지원
    @history 1.1.0 Support Android 3.0/4.0 지원<br />jindo 2.0.0 mobile 버전 지원
    @history 0.9.0 Release 최초 릴리즈
 */
jindo.m.Touch = jindo.$Class({
    /* @lends jindo.m.Touch.prototype */
    /**
        초기화 함수

       @constructor
       @extends jindo.m.UIComponent
       @param {String | HTMLElement} vEl Touch이벤트를 분석할 타켓 엘리먼트 혹은 아이디.
       @param {Object} htOption 초기화 옵션 설정을 위한 객체.
            @param {Number} [htOption.nMomentumDuration=350] 가속에 대해 판단하는 기준시간(단위 ms)
            <ul>
            <li>touchstart, touchend 간격의 시간이 nMomentumDuration 보다 작을 경우 가속값을 계산한다.</li>
            <li>일반적으로 android가 iOS보다 반응 속도가 느리므로 iOS보다 큰값을 세팅한다.</li>
            <li>android의 경우 500~1000 정도가 적당하다.</li>
            <li>iOS의 경우 200~350이 적당하다.</li>
            </ul>
            @param {Number} [htOption.nMoveThreshold=7] touchMove 커스텀 이벤트를 발생시키는 최소 단위 움직임 픽셀
            <ul>
            <li>세로모드의 스크롤 작업일 경우 0~2 정도가 적당하다</li>
            <li>가로모드의 스크롤 작업일 경우 4~7 정도가 적당하다</li>
            </ul>
            @param {Number} [htOption.nSlopeThreshold=25] scroll 움직임에 대한 방향성(수직,수평,대각선)을 판단하는 움직인 거리
            <ul>
            <li>사용자가 터치를 시작한 이후에 25픽셀 이상 움직일 경우 scroll에 대한 방향을 판단한다.</li>
            <li>25픽셀이하로 움직였을 경우 방향성에 대해서 판단하지 않는다.</li>
            </ul>
            @param {Number} [htOption.nLongTapDuration=1000] 롱탭을 판단하는 기준 시간(단위ms)
            <ul>
            <li>600~1000정도의 값이 적당하다.</li>
            </ul>
            @param {Number} [htOption.nDoubleTapDuration=400] 더블탭을 판단하는 탭간의 기준 시간(단위ms)
            <ul>
            <li>이 값을 길게 설정하면 Tap 커스텀 이벤트의 발생이 늦어지기 때문에 1500 이상의 값은 세팅하지 않는것이 적당하다.</li>
            </ul>
            @param {Number} [htOption.nTapThreshold=6] tap에 대해 판단할때 최대 움직인 거리 (단위 px)
            <ul>
            <li>사용자 터치를 시작한 이후 수직,수평방향으로 nTapThreshold 이하로 움직였을때 tap이라고 판단한다.</li>
            <li>doubleTap을 사용할 경우에는 이 값을 좀더 크게 5~8 정도 설정하는 것이 적당하다.</li>
            <li>doubleTap을 사용하지 않을 때 iOS에서는 0~2정도 설정하는 것이 적당하다.</li>
            <li>doubleTap을 사용하지 않을 때 android에서는 4~6 정도 설정하는 것이 적당하다.</li>
            </ul>
            @param {Number} [htOption.nPinchThreshold=0.1] pinch를 판단하는 최소 scale 값
            <ul>
            <li>최초의 멀티터치간의 거리를 1의 비율로 보았을때 움직이는 터치간의 간격이 이 값보다 크거나 작게 변하면 pinch로 분석한다.</li>
            </ul>
            @param {Number} [htOption.nRotateThreshold=5] rotate 판단하는 최소 angle 값
            @param {Number} [htOption.nEndEventThreshold=0] touchmove 이후 touchend 이벤트를 강제로 발생시키는 기준 시간 
            <ul>
            <li>0일경우 강제로 touchend 이벤트를 발생시키지 않는다.</li>
            </ul>
            @param {Boolean} [htOption.bActivateOnload=true] Touch 컴포넌트가 로딩 될때 활성화 시킬지 여부를 결정한다.<br />false로 설정하는 경우에는 oTouch.activate()를 호출하여 따로 활성화 시켜야 한다.

     */
    $init : function(sId, htUserOption){
        this._el = jindo.$(sId);

        var htDefaultOption = {
            nMomentumDuration :350,
            nMoveThreshold : 7,
            nSlopeThreshold : 25,
            nLongTapDuration : 1000,
            nDoubleTapDuration : 400,
            nTapThreshold : 6,
            nPinchThreshold : 0.1,
            nRotateThreshold : 5,
            nEndEventThreshold : 0, 
            bActivateOnload : true,
            bVertical : true,               // private
            bHorizental : false         // private
        };

        this.option(htDefaultOption);
        this.option(htUserOption || {});
        
        this._initVariable();       
        this._setSlope();
        //활성화
        if(this.option("bActivateOnload")) {
            this.activate(); //컴포넌트를 활성화한다.
        }

    },

    /**
        jindo.m.Touch 인스턴스 변수를 초기화한다.
    **/
    _initVariable : function(){
        this._hasTouchEvent = false;
        
        this._htEventName = jindo.m._getTouchEventName();
        if(this._htEventName.start.indexOf('touch') > -1){
            this._hasTouchEvent  = true;
        }else if(this._htEventName.start.indexOf('MSPointer') > -1 && typeof this._el.style.msTouchAction != 'undefined'){
             var type = "none";
             if(this.option("bHorizental")&&!this.option("bVertical")){
                 type = "pan-x";//세로 막음
             }
             if(this.option("bVertical")&&!this.option("bHorizental")){
                type = "pan-y";//가로 막음
             }
             this._el.style.msTouchAction = type;
        }
        this._radianToDegree  =  180/Math.PI;

        this._htMoveInfo={
            nStartX : 0,
            nStartY :0,
            nBeforeX : 0,
            nBeforeY : 0,
            nStartTime :0,
            nBeforeTime : 0,
            nStartDistance : 0,
            nBeforeDistance :0,
            nStartAngle : 0,
            nLastAngle : 0
        };

        this.bStart = false;
        this.bMove = false;
        this.nMoveType = -1;
        this.htEndInfo ={};
        this._nVSlope = 0;
        this._nHSlope = 0;
        this.bSetSlope = false;
    },

    /**
        jindo.m.Touch 사용하는 이벤트 attach 한다
    **/
    _attachEvents : function(){
        this._htEvent = {};
        var bTouch = this._hasTouchEvent;
        this._htEvent[this._htEventName.start] = {
            fn : jindo.$Fn(this._onStart, this).bind(),
            el : this._el
        };
        
        //jindo.m._attachFakeJindo(this._el, this._htEvent[this._htEventName.start].fn, this._htEventName.start);
        
        this._htEvent[this._htEventName.move] = {
            fn : jindo.$Fn(this._onMove, this).bind(),
            el : this._el
        };
        
        this._htEvent[this._htEventName.end] = {
            fn : jindo.$Fn(this._onEnd, this).bind(),
            el : this._el
        };

        //resize event
        this._htEvent["rotate"] = jindo.$Fn(this._onResize, this).bind();
        jindo.m.bindRotate(this._htEvent["rotate"]);    
        
        if(this._htEventName.cancel){
            this._htEvent[this._htEventName.cancel] = {
                fn : jindo.$Fn(this._onCancel, this).bind(),
                el : this._el
            };
        }
        
        //attach events
        for(var p in this._htEvent){
            if(this._htEvent[p].fn){
                this._htEvent[p].ref  = jindo.m._attachFakeJindo(this._htEvent[p].el, this._htEvent[p].fn, p);
            }
        }
    },

    /**
        jindo.m.Touch 사용하는 이벤트 detach 한다
    **/
    _detachEvents : function(){
        for(var p in this._htEvent){
            var htTargetEvent = this._htEvent[p];
            if (htTargetEvent.ref) {
                htTargetEvent.ref.detach(htTargetEvent.el, p);
            }
        }
        jindo.m.unbindRotate(this._htEvent["rotate"]);
        this._htEvent = null;
    },

    /**
        touchcancel 발생시에 touchEnd이벤트로 바로 호출한다.
        ios3 에서는 클립보드 활성화 되면 바로 touchcancel 발생
        android 계열에서 빠르고 짧게 스크롤 하면 touchcancel 발생함
        @param {$Event}  jindo.$Event
    **/
    _onCancel : function(oEvent){
        this._onEnd(oEvent);
    },


    /**
        touchstart(mousedown) 이벤트 핸들러
        @param {$Event}  jindo.$Event
        
        @history 1.13.0 Update touchStart 이벤트 발생시 aX, aY 정보 추가 반환 
    **/
    _onStart : function(oEvent){
        //touch 정보들의 초기화
        this._resetTouchInfo();

        var htInfo = this._getTouchInfo(oEvent);

        var aX = [];
        var aY = [];
        
        for(var i=0,nLen= htInfo.length; i<nLen; i++){
            aX.push(htInfo[i].nX);
            aY.push(htInfo[i].nY);
        }

        var htParam ={
            element : htInfo[0].el,
            nX : htInfo[0].nX,
            nY : htInfo[0].nY,
            aX : aX,
            aY : aY,
            oEvent : oEvent
        };

        /**
            사용자가 터치 영역에 터치하는 순간 발생한다.<br />가장 처음 발생하는 커스텀이벤트

            @event touchStart
            @param {String} sType 커스텀 이벤트명
            @param {HTMLElement} element 현재 터치된 영역의 Element
            @param {Number} nX 터치영역의 X좌표
            @param {Number} nY 터치 영역의 Y좌표
            @param {Object} oEvent jindo.$Event object
            @param {Function} stop 이후 모든 커스텀 이벤트를 중지한다.
        **/
        if(!this._fireCustomEvent('touchStart', htParam)){
            return;
        }

        //touchstart 플래그 세팅
        this.bStart = true;

        //move info update
        this._htMoveInfo.nStartX = htInfo[0].nX;
        this._htMoveInfo.nBeforeX = htInfo[0].nX;
        this._htMoveInfo.nStartY = htInfo[0].nY;
        this._htMoveInfo.nBeforeY = htInfo[0].nY;
        this._htMoveInfo.nStartTime = htInfo[0].nTime;
        this._htMoveInfo.aStartInfo = htInfo;

        this._startLongTapTimer(htInfo, oEvent);
    },

    /**
        touchMove(mousemove) 이벤트 핸들러
        @param {$Event}  jindo.$Event
    **/
    _onMove : function(oEvent){
        if(!this.bStart){
            return;
        }
        this.bMove = true;

        var htInfo = this._getTouchInfo(oEvent);
        //addConsole('[touchMove]'+htInfo.length);
        
        //커스텀 이벤트에 대한 파라미터 생성.
        var htParam = this._getCustomEventParam(htInfo, false);

        //싱글터치는 3,4 일때 다시 계산한다.
        if(htInfo.length === 1){            
            if(this.nMoveType < 0 || this.nMoveType == 3 || this.nMoveType == 4){
                var nMoveType = this._getMoveType(htInfo);
                if(!((this.nMoveType == 4) && (nMoveType == 3)) ){
                    this.nMoveType = nMoveType;
                }
            }           
        }else{ //멀티터치일경우 8번이 아니면 다시 계산한다.
            if(this.nMoveType !== 8){
                this.nMoveType = this._getMoveType(htInfo);
            }
        }

        //커스텀 이벤트에 대한 파라미터 생성.
        htParam = this._getCustomEventParam(htInfo, false);

        //longtap timer 삭제
        if((typeof this._nLongTapTimer != 'undefined') && this.nMoveType != 3){
            this._deleteLongTapTimer();
        }

        htParam.oEvent = oEvent;

        var nDis = 0;
        if(this.nMoveType == 0){ //hScroll일 경우
            nDis = Math.abs(htParam.nVectorX);
        }else if(this.nMoveType == 1){ //vScroll일 경우
            nDis = Math.abs(htParam.nVectorY);
        }else{ //dScroll 일 경우
            nDis = Math.abs(htParam.nVectorX) + Math.abs(htParam.nVectorY);
        }

        //move간격이 옵션 설정 값 보다 작을 경우에는 커스텀이벤트를 발생하지 않는다
        if(nDis < this.option('nMoveThreshold')){
            return;
        }

        /**
            nMoveThreshold 옵션값 이상 움직였을 경우 발생한다

            @event touchMove
            @param {String} sType 커스텀 이벤트명
            @param {String} sMoveType 현재 분석된 움직임
                @param {String} sMoveType.hScroll 가로스크롤 (jindo.m.MOVETYPE[0])
                @param {String} sMoveType.vScroll 세로스크롤 (jindo.m.MOVETYPE[1])
                @param {String} sMoveType.dScroll 대각선스크롤 (jindo.m.MOVETYPE[2])
                @param {String} sMoveType.tap 탭 (jindo.m.MOVETYPE[3])
                @param {String} sMoveType.longTap 롱탭 (jindo.m.MOVETYPE[4])
                @param {String} sMoveType.doubleTap 더블탭 (jindo.m.MOVETYPE[5])
                @param {String} sMoveType.pinch 핀치 (jindo.m.MOVETYPE[6])
                @param {String} sMoveType.rotate 회전 (jindo.m.MOVETYPE[7])
                @param {String} sMoveType.pinch-rotate 핀치와 회전 (jindo.m.MOVETYPE[8])
            @param {HTMLElement} element 현재 터치된 영역의 Element
            @param {Number} nX 터치영역의 X좌표
            @param {Number} nY 터치 영역의 Y좌표
            @param {Array} aX 모든 터치 영역의 X좌표
            @param {Array} aY 모든 터치 영역의 Y좌표
            @param {Number} nVectorX 이전 touchMove(혹은 touchStart)의 X좌표와의 상대적인 거리.(직전 좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
            @param {Number} nVectorY 이전 touchMove(혹은 touchStart)의 Y좌표와의 상대적인 거리.(직전 좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
            @param {Number} nDistanceX touchStart의 X좌표와의 상대적인 거리.(touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
            @param {Number} nDistanceY touchStart의 Y좌표와의 상대적인 거리.(touchStart좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
            @param {Number} nStartX touchStart의 X좌표
            @param {Number} nStartY touchStart의 Y좌표
            @param {Number} nStartTimeStamp touchStart의 timestamp 값
            @param {Number} nScale 멀티터치일경우 계산된 scale값 (싱글터치의 경우 이 프로퍼티가 없다)
            @param {Number} nRotation 멀티터치일경우 계산된 rotation값 (싱글터치의 경우 이 프로퍼티가 없다)
            @param {Object} oEvent jindo.$Event object
            @param {Function} stop stop 이후 커스텀이벤트는 발생하지 않는다.
        **/
        if(!this.fireEvent('touchMove', htParam)){
            this.bStart = false;
            return;
        }
        //touchInfo 정보의  before 정보만 업데이트 한다.
        this._htMoveInfo.nBeforeX = htInfo[0].nX;
        this._htMoveInfo.nBeforeY = htInfo[0].nY;
        this._htMoveInfo.nBeforeTime = htInfo[0].nTime;
    },

    /**
        touchend(mouseup) 이벤트 핸들러
        @param {$Event}  jindo.$Event
    **/
    _onEnd : function(oEvent){
        //addConsole(oEvent.type);
        //console.log(oEvent);
       if(!this.bStart){
            return;
        }
       //addConsole('---- '+oEvent.type);
        var self = this;                
        this._deleteLongTapTimer();
        this._deleteEndEventTimer();
        
        //touchMove이벤트가 발생하지 않고 현재 롱탭이 아니라면 tap으로 판단한다.
        if(!this.bMove && (this.nMoveType != 4)){
            this.nMoveType = 3;
        }
        
        //touchEnd 시점에 판단된  moveType이 없으면 리턴한다. 
        if(this.nMoveType < 0){
            return;
        }
        
        var htInfo = this._getTouchInfo(oEvent);
        
        //현재 touchEnd시점의 타입이 doubleTap이라고 판단이 되면
        if(this._isDblTap(htInfo[0].nX, htInfo[0].nY, htInfo[0].nTime)){            
            clearTimeout(this._nTapTimer);
            delete this._nTapTimer;
            this.nMoveType = 5; //doubleTap 으로 세팅
        }
        
        // TapThreshold 와 nSlopeThreshold 옵션 값 사이의 움직임에 대해서는 MoveType 값이 정의되지 않는 이슈.
        // var nX = Math.abs(this._htMoveInfo.nStartX - htInfo[0].nX);
        // var nY = Math.abs(this._htMoveInfo.nStartY - htInfo[0].nY);
        // if(this.nMoveType < 0 && (nX > this.option('nTapThreshold') || nY > this.option('nTapThreshold'))){
            // if(nX > nY){
                // this.nMoveType = 0;
            // }else{
                // this.nMoveType = 1;
            // }
        // }
        //커스텀 이벤트에 대한 파라미터 생성.
        var htParam = this._getCustomEventParam(htInfo, true);
        htParam.oEvent = oEvent;
        var sMoveType = htParam.sMoveType;
        

                /**
                    nMoveThreshold 옵션값 이상 움직였을 경우 발생한다

                    @event touchEnd
                    @param {String} sType 커스텀 이벤트명
                    @param {String} sMoveType 현재 분석된 움직임
                        @param {String} sMoveType.hScroll 가로스크롤 (jindo.m.MOVETYPE[0])
                        @param {String} sMoveType.vScroll 세로스크롤 (jindo.m.MOVETYPE[1])
                        @param {String} sMoveType.dScroll 대각선스크롤 (jindo.m.MOVETYPE[2])
                        @param {String} sMoveType.tap 탭 (jindo.m.MOVETYPE[3])
                        @param {String} sMoveType.longTap 롱탭 (jindo.m.MOVETYPE[4])
                        @param {String} sMoveType.doubleTap 더블탭 (jindo.m.MOVETYPE[5])
                        @param {String} sMoveType.pinch 핀치 (jindo.m.MOVETYPE[6])
                        @param {String} sMoveType.rotate 회전 (jindo.m.MOVETYPE[7])
                        @param {String} sMoveType.pinch-rotate 핀치와 회전 (jindo.m.MOVETYPE[8])
                    @param {HTMLElement} element 현재 터치된 영역의 Element
                    @param {Number} nX 터치영역의 X좌표
                    @param {Number} nY 터치 영역의 Y좌표
                    @param {Array} aX 모든 터치 영역의 X좌표
                    @param {Array} aY 모든 터치 영역의 Y좌표
                    @param {Number} nVectorX 이전 touchMove(혹은 touchStart)의 X좌표와의 상대적인 거리.(직전 좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
                    @param {Number} nVectorY 이전 touchMove(혹은 touchStart)의 Y좌표와의 상대적인 거리.(직전 좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
                    @param {Number} nDistanceX touchStart의 X좌표와의 상대적인 거리.(touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
                    @param {Number} nDistanceY touchStart의 Y좌표와의 상대적인 거리.(touchStart좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
                    @param {Number} nStartX touchStart의 X좌표
                    @param {Number} nStartY touchStart의 Y좌표
                    @param {Number} nStartTimeStamp touchStart의 timestamp 값
                    @param {Number} nScale 멀티터치일경우 계산된 scale값 (싱글터치의 경우 이 프로퍼티가 없다)
                    @param {Number} nRotation 멀티터치일경우 계산된 rotation값 (싱글터치의 경우 이 프로퍼티가 없다)
                    @param {Object} oEvent jindo.$Event object
                    @param {Function} stop stop 이후 커스텀이벤트는 발생하지 않는다.
                **/
        //doubletap 핸들러가  있고, 현재가  tap 인 경우
        if( (typeof this._htEventHandler[jindo.m.MOVETYPE[5]] != 'undefined' && (this._htEventHandler[jindo.m.MOVETYPE[5]].length > 0))&& (this.nMoveType == 3) ){
            this._nTapTimer = setTimeout(function(){
                self.fireEvent('touchEnd', htParam);
                self._fireCustomEvent(sMoveType, htParam);              
                delete self._nTapTimer;
            }, this.option('nDoubleTapDuration'));  
            
        }else{
            this.fireEvent('touchEnd', htParam);
            if(this.nMoveType != 4){
                if(this.nMoveType === 8){
                    htParam.sMoveType = jindo.m.MOVETYPE[6];
                    this._fireCustomEvent(jindo.m.MOVETYPE[6], htParam);
                    htParam.sMoveType = jindo.m.MOVETYPE[7];
                    this._fireCustomEvent(jindo.m.MOVETYPE[7], htParam);
                }else{
                    setTimeout(function(){
                        self._fireCustomEvent(sMoveType, htParam);
                    },0);
                }
            }
        }       
            
        this._updateTouchEndInfo(htInfo);       
        this._resetTouchInfo();
    },

    /**
     * touchend 를 임의적으로 만드는 타이머를 생성한다.
     */
    _startEndEventTimer : function(oEvent){
        var self = this;
        //console.log('_start');
        this._nEndEventTimer = setTimeout(function(){
                self._onEnd(oEvent);             
                delete self._nEndEventTimer;
        },self.option('nEndEventThreshold'));
    },
    
    
    /**
     *touchend 를 임의적으로 만드는 타이머를 지운다. 
     */
    _deleteEndEventTimer : function(){
        if(typeof this._nEndEventTimer != 'undefined'){
          // console.log('_delete');
            clearTimeout(this._nEndEventTimer);
            delete this._nEndEventTimer;
        }
    },
    
    /**
     * sEvent 명으로 커스텀 이벤트를 발생시킨다 
     * @param {String} sEvent
     * @param {HashTable} 커스텀이벤트 파라미터
     * @return {Boolean} fireEvent의 리턴값
     */
    _fireCustomEvent :  function(sEvent, htOption){
        return this.fireEvent(sEvent, htOption);
    },

    /**
        커스텀이벤트를 발생시킬 때 필요한 파라미터를 생성한다.

        @param {Object} 현재 터치 정보들을 담고 있는 해시테이블
        @param {Boolean} touchEnd 시점인지 여부, touchEnd일 경우 가속에 대한 추가 정보를 필요로 한다.
        @return {Object}
            - {HTMLElement} element 현재 이벤트 객체의 대상 엘리먼트
            - {Number} nX x좌표
            - {Number} nY y좌표
            - {Number} nVectorX 이전 x 좌표와의 차이
            - {Number} nVectorY 이전 y 좌표와의 차이
            - {Number} nDistanceX touchstart와의 x 좌표 거리
            - {Number} nDistanceY touchstart와의 y 좌표 거리
            - {String} sMoveType 현재 분석된 움직임의 이름
            - {Number} nStartX touchstart시점의 x 좌표
            - {Number} nStartY touchstart시점의 y 좌표
            - {Number} nStartTimeStamp touchstart시점의 timestamp
            - {Number} nMomentumX x 좌표의 가속 값 (touchEnd일경우에만 발생)
            - {Number} nMomentumY y 좌표의 가속 값 (touchEnd일경우에만 발생)
            - {Number} nSpeedX x 좌표의 속도값 (touchEnd일경우에만 발생)
            - {Number} nSpeedY y 좌표의 속도값 (touchEnd일경우에만 발생)
            - {Number} nDuration touchstart와 touchEnd사이의 시간값
            - {Array} aX 터치지점의 x 좌표
            - {Array} aY 터치지점의 y 좌표
            - {Number} nScale 멀티터치일경우 계산된 scale값
            - {Number} nRotation 멀티터치일경우 계산된 rotate값
    **/
    _getCustomEventParam : function(htTouchInfo, bTouchEnd){
        var sMoveType = jindo.m.MOVETYPE[this.nMoveType];
        var nDuration = htTouchInfo[0].nTime - this._htMoveInfo.nStartTime;
        var nVectorX = 0,
            nVectorY = 0,
            nMomentumX = 0,
            nMomentumY = 0,
            nSpeedX= 0,
            nSpeedY = 0,
            nDisX= 0,
            nDisY= 0;

        nDisX = (this.nMoveType === 1)? 0 : htTouchInfo[0].nX - this._htMoveInfo.nStartX; //vScroll
        nDisY = (this.nMoveType === 0)? 0 : htTouchInfo[0].nY -this._htMoveInfo.nStartY ; //hScroll

        nVectorX = htTouchInfo[0].nX - this._htMoveInfo.nBeforeX;
        nVectorY = htTouchInfo[0].nY - this._htMoveInfo.nBeforeY;
        //scroll 이벤트만 계산 한다
        if(bTouchEnd && (this.nMoveType == 0 || this.nMoveType == 1 || this.nMoveType == 2 )){
            if(nDuration <= this.option('nMomentumDuration')){
                nSpeedX = Math.abs(nDisX)/nDuration ;
                nMomentumX = (nSpeedX*nSpeedX) / 2;

                nSpeedY = Math.abs(nDisY)/nDuration ;
                nMomentumY =  (nSpeedY*nSpeedY) / 2;
            }
        }

        var htParam  = {
            element : htTouchInfo[0].el,
            nX : htTouchInfo[0].nX,
            nY : htTouchInfo[0].nY,
            nVectorX : nVectorX,
            nVectorY : nVectorY,
            nDistanceX : nDisX,
            nDistanceY : nDisY,
            sMoveType : sMoveType,
            nStartX : this._htMoveInfo.nStartX,
            nStartY : this._htMoveInfo.nStartY,
            nStartTimeStamp : this._htMoveInfo.nStartTime
        };

        if((htTouchInfo.length) > 1 || (this.nMoveType >= 6)){
            htParam.nScale = this._getScale(htTouchInfo);
            htParam.nRotation = this._getRotation(htTouchInfo);
            if(htParam.nScale === null){
                htParam.nScale = this._htMoveInfo.nBeforeScale;
            }
            if(htParam.nRotation === null){
                htParam.nRotation = this._htMoveInfo.nBeforeRotation;
            }

        }

        if(htTouchInfo.length >= 1){
            var aX = [];
            var aY =[];
            var aElement = [];
            for(var i=0,nLen= htTouchInfo.length; i<nLen; i++){
                aX.push(htTouchInfo[i].nX);
                aY.push(htTouchInfo[i].nY);
                aElement.push(htTouchInfo[i].el);
            }
            
            // 아이패드 미니에서 pinch 처리시 두번째 정보가 undefined 로 나타나는 이슈로 인해 처리.
            htTouchInfo[htTouchInfo.length -1].nX;
             
            htParam.aX = aX;
            htParam.aY = aY;
            htParam.aElement = aElement;
        }

        //touchend 에는 가속에 대한 계산값을 추가로 더 필요로 한다.
        if(bTouchEnd){
            htParam.nMomentumX = nMomentumX;
            htParam.nMomentumY = nMomentumY;
            htParam.nSpeedX = nSpeedX;
            htParam.nSpeedY = nSpeedY;
            htParam.nDuration = nDuration;
        }

        return htParam;
    },

    /**
        doubleTap을 판단하기 위해서 마지막 touchend의 정보를 업데이트 한다.
        doubleTap을 분석 할 경우 가장 마지막의 touch에 대한 정보를 비교해야 하기 때문에 이 값을 업데이트 한다.

        @param {Object} touchEnd에서의 좌표 및 엘리먼트 정보 테이블
            - {HTMLElement} touchEnd시점의 엘리먼트
            - {Number} touchEnd timestamp
            - {Number} touchEnd의 x 좌표
            - {Number} touchEnd의 y 좌표
    **/
    _updateTouchEndInfo : function(htInfo){
        this.htEndInfo = {
            element: htInfo[0].el,
            time : htInfo[0].nTime,
            movetype : this.nMoveType,
            nX : htInfo[0].nX,
            nY : htInfo[0].nY
        };
    },

    /**
        longTap 타이머를 삭제한다.
    **/
    _deleteLongTapTimer : function(){
        if(typeof this._nLongTapTimer != 'undefined'){
            clearTimeout(this._nLongTapTimer);
            delete this._nLongTapTimer;
        }
    },

    /**
        longTap 커스텀 핸들러가 존재 할 경우 longTap 타이머를 시작한다.

        @param {Object} longTap에 대한 정보 객체
        @param {Object} event 객체
    **/
    _startLongTapTimer : function(htInfo, oEvent){
        var self = this;

        //long tap handler 가 있을경우
        if((typeof this._htEventHandler[jindo.m.MOVETYPE[4]] != 'undefined') && (this._htEventHandler[jindo.m.MOVETYPE[4]].length > 0)){
            self._nLongTapTimer = setTimeout(function(){

                /**
                    사용자의 터치 시작 이후로 일정 기준시간 동안 계속 움직임이 tap으로 분석되면 발생 한다.

                    @event longTap
                    @param {String} sType 커스텀 이벤트명
                    @param {HTMLElement} element 현재 터치된 영역의 Element
                    @param {Number} nX 터치영역의 X좌표
                    @param {Number} nY 터치 영역의 Y좌표
                    @param {Object} oEvent jindo.$Event object
                    @param {Function} stop stop를 호출하여 영향 받는 것이 없다.
                **/
                self.fireEvent('longTap',{
                    element :  htInfo[0].el,
                    oEvent : oEvent,
                    nX : htInfo[0].nX,
                    nY : htInfo[0].nY
                });
                delete self._nLongTapTimer;
                //현재 moveType 세팅
                self.nMoveType = 4;
            }, self.option('nLongTapDuration'));
        }
    },

    /**
        화면 전환시에 스크롤 기준 값을 다시 구한다.
    **/
    _onResize : function(){
        this._setSlope();
    },

    /**
        이전 탭의 정보와 비교하여 현재 동작이 더블탭임을 판단한다
        @param {Number} nX pageX 좌표
        @param {Number} nY pageY 좌표
        @param {Number} nTimeStamp 이벤트 timestamp
    **/
    _isDblTap : function(nX, nY, nTime){
        if((typeof this._nTapTimer != 'undefined') && this.nMoveType == 3){
            var nGap = this.option('nTapThreshold');
            if( (Math.abs(this.htEndInfo.nX - nX) <= nGap) && (Math.abs(this.htEndInfo.nY-nY) <= nGap) ){
                return true;
            }
        }
        return false;
    },

    /**
        vScroll, hScroll을 판단하는 기준 기울기를 계산한다
        단말기 스크린을 기준으로 계산한다

        hScroll = (세로/2)/가로
        vScroll = 세로/(가로/2)
    **/
    _setSlope : function(){
        if(!this.bSetSlope){
            this._nHSlope = ((window.innerHeight/2) / window.innerWidth).toFixed(2)*1;
            this._nVSlope = (window.innerHeight / (window.innerWidth/2)).toFixed(2)*1;
        }
    },

    /**
        vScroll, hScroll을 판단하는 기준 기울기를 설정한다.

        @method setSlope
        @param {Number} nVSlope 수직스크롤 판단 기울기
        @param {Number} nHSlope 수평스크롤 판단 기울기
        @remark
            nVSlope 기울기 보다 클 경우 수직 스크롤로 판단한다.
            nHSlope 기울기 보다 작을 경우 수평 스크롤로 판단한다.
            nVSlope와 nHSlope 사이값인 경우 대각선 스크롤로 판단한다.
    **/
    setSlope : function(nVSlope, nHSlope){
        this._nHSlope = nHSlope;
        this._nVSlope = nVSlope;

        this.bSetSlope = true;
    },

    /**
        vScroll, hScroll을 판단하는 기준 기울기를 리턴한다

        @method getSlope
        @return {Object} elBody 아코디언 블럭의 body 엘리먼트
        @remark
            - {Number} nVSlope 수직스크롤 판단 기울기
            - {Number} nHSlope 수평스크롤 판단 기울기
    **/
    getSlope : function(){
        return{
            nVSlope :  this._nVSlope,
            nHSlope : this._nHSlope
        };
    },

    /**
        터치의 기본정보를 모두 초기화 한다.
    **/
    _resetTouchInfo : function(){
        for(var x in this._htMoveInfo){
            this._htMoveInfo[x] = 0;
        }
        this._deleteLongTapTimer();
        this.bStart = false;
        this.bMove = false;
        this.nMoveType = -1;
    },

    /**
        현재 x,y 좌표값으로 현재 움직임이 무엇인지 판단한다.
        @param {Number} x
        @param {Number} y
    **/
    _getMoveTypeBySingle: function(x, y){
        var nType = this.nMoveType;

        var nX = Math.abs(this._htMoveInfo.nStartX - x);
        var nY = Math.abs(this._htMoveInfo.nStartY - y);
        var nDis = nX + nY;

        //tap정의
        var nGap = this.option('nTapThreshold');
        if((nX <= nGap) && (nY <= nGap)){
            nType = 3;
        }else{
            nType = -1;
        }

        if(this.option('nSlopeThreshold') <= nDis){
            var nSlope = parseFloat((nY/nX).toFixed(2),10);

            if((this._nHSlope === -1) && (this._nVSlope === -1)){
                nType = 2;
            }else{
                if(nSlope <= this._nHSlope){
                    nType = 0;
                }else if(nSlope >= this._nVSlope){
                    nType = 1;
                }else {
                    nType = 2;
                }
            }
        }

        return nType;
    },
    /**

    **/
    _getMoveTypeByMulti : function(aPos){
        var nType = -1;

        //console.log('scale : '+this._htMoveInfo.nBeforeScale);
        if((this.nMoveType === 6) ||  Math.abs(1- this._htMoveInfo.nBeforeScale) >= this.option('nPinchThreshold')){
            nType = 6;
        }

        if((this.nMoveType === 7) ||  Math.abs(0- this._htMoveInfo.nBeforeRotation) >= this.option('nRotateThreshold')){
            if(nType === 6){
                nType = 8;
            }else{
                nType = 7;
            }
        }

        //멀티터치이면서 rotate도 아니고 pinch도 아닐경우
        if(nType === -1){
            return this.nMoveType;
            //nType = this._getMoveTypeBySingle(aPos[0].nX, aPos[0].nY);
        }

        return nType;
    },

    /**

    **/
    _getScale : function(aPos){
        var nScale = -1;

        var nDistance = this._getDistance(aPos);
        if(nDistance <= 0){
            return null;
        }

        if(this._htMoveInfo.nStartDistance === 0){
            nScale = 1;
            this._htMoveInfo.nStartDistance = nDistance;
        }else{
            nScale = nDistance/this._htMoveInfo.nStartDistance;
            //this._htMoveInfo.nBeforeDistance = nDistance;
        }

        this._htMoveInfo.nBeforeScale = nScale;

        return nScale;
    },

    _getRotation : function(aPos){
        var nRotation = -1;

        var nAngle = this._getAngle(aPos);

        if(nAngle === null){
            return null;
        }

        if(this._htMoveInfo.nStartAngle === 0){
            this._htMoveInfo.nStartAngle = nAngle;
            nRotation = 0;
        }else{
            nRotation = nAngle- this._htMoveInfo.nStartAngle;
        }

        this._htMoveInfo.nLastAngle = nAngle;
        this._htMoveInfo.nBeforeRotation = nRotation;

        //console.log('rotate - ' + nRotation);
        return nRotation;
    },

    /**
        현재 x,y 좌표값으로 현재 움직임이 무엇인지 판단한다.
        @param {Number} x
        @param {Number} y
    **/
    _getMoveType : function(aPos){
        var nType = this.nMoveType;

        if(aPos.length === 1){
            nType = this._getMoveTypeBySingle(aPos[0].nX, aPos[0].nY);
        }else if(aPos.length === 2){ //pinch or rotate
            nType = this._getMoveTypeByMulti(aPos);
            //nType = 6;
        }

        return nType;
    },


    _getDistance : function(aPos){
        if(aPos.length === 1){
            return -1;
        }
         return Math.sqrt(
                 Math.pow(Math.abs(aPos[0].nX - aPos[1].nX), 2) +
                 Math.pow(Math.abs(aPos[0].nY - aPos[1].nY), 2)
            );
    },

     _getAngle: function(aPos) {
         if(aPos.length === 1){
            return null;
         }
            var deltaX = aPos[0].nX - aPos[1].nX,
                deltaY = aPos[0].nY - aPos[1].nY;

         var nAngle =  Math.atan2(deltaY, deltaX) * this._radianToDegree;

         if(this._htMoveInfo.nLastAngle !== null){
             var nDiff = Math.abs(this._htMoveInfo.nLastAngle - nAngle);
             var nNext = nAngle + 360;
             var nPrev = nAngle - 360;

             if(Math.abs(nNext - this._htMoveInfo.nLastAngle) < nDiff){
                 nAngle = nNext;
             }else if(Math.abs(nPrev - this._htMoveInfo.nLastAngle) < nDiff){
                 nAngle = nPrev;
             }
         }
         //console.log('angle : '+ nAngle);
         return nAngle;
     },


    /**
        touch 이벤트에서 필요한 좌표값과 엘리먼트, timestamp를 구한다
        @param {$Event} jindo.$Event
        @return {Array}
    **/
    _getTouchInfo : function(oEvent){
        var aReturn = [];
        var nTime = oEvent.$value().timeStamp;
        var oTouch = null;

        if(this._hasTouchEvent){
             if(oEvent.type === 'touchend'){
                oTouch = oEvent.$value().changedTouches;
            }else{
                oTouch = oEvent.$value().targetTouches;
            } 
            for(var i=0, nLen = oTouch.length; i<nLen; i++){
                aReturn.push({
                    el : jindo.m.getNodeElement(oTouch[i].target),
                    nX : oTouch[i].pageX,
                    nY : oTouch[i].pageY,
                    nTime : nTime
                });
            }

        }else{
            aReturn.push({
                el : oEvent.element,
                nX : oEvent.pos().pageX,
                nY : oEvent.pos().pageY,
                nTime : nTime
            });
        }

        return aReturn;
    },

    /**
        기준엘리먼트를 el을 리턴한다.

        @method getBaseElement
        @return {HTMLElement} el
    **/
    getBaseElement : function(el){
        return this._el;
    },

    /**
        jindo.m.Touch 컴포넌트를 비활성화한다.
        deactivate 실행시 호출됨
    **/
    _onDeactivate : function(){
        this._detachEvents();
    },

    /**
        jindo.m.Touch 컴포넌트를 활성화한다.
        activate 실행시 호출됨
    **/
    _onActivate : function(){
        this._attachEvents();
    },

    /**
        jindo.m.Touch 에서 사용하는 모든 객체를 release 시킨다.
        @method destroy
    **/
    destroy : function() {
        var p;
        this.deactivate();

        this._el = null;

        for(p in this._htMoveInfo){
            this._htMoveInfo[p] = null;
        }
        this._htMoveInfo = null;

        for(p in this.htEndInfo){
            this.htEndInfo[p] = null;
        }
        this.htEndInfo = null;

        this.bStart = null;
        this.bMove = null;
        this.nMoveType = null;
        this._nVSlope = null;
        this._nHSlope = null;
        this.bSetSlope = null;
    }

    /**
        사용자의 터치가 끝난 이후에 움직임이 tap으로 분석되었을 경우 발생한다.(touchEnd이후에 발생)
        @remark 만약 doubleTap의 커스텀 이벤트 핸들러가 있는 경우 doubleTap에 대한 분석을 위해 touchEnd 이후에 기준 시간 이후에 tap이 발생한다

        @event tap
        @param {String} sType 커스텀 이벤트명
        @param {String} sMoveType 현재 분석된 움직임
            @param {String} sMoveType.hScroll 가로스크롤 (jindo.m.MOVETYPE[0])
            @param {String} sMoveType.vScroll 세로스크롤 (jindo.m.MOVETYPE[1])
            @param {String} sMoveType.dScroll 대각선스크롤 (jindo.m.MOVETYPE[2])
            @param {String} sMoveType.tap 탭 (jindo.m.MOVETYPE[3])
            @param {String} sMoveType.longTap 롱탭 (jindo.m.MOVETYPE[4])
            @param {String} sMoveType.doubleTap 더블탭 (jindo.m.MOVETYPE[5])
            @param {String} sMoveType.pinch 핀치 (jindo.m.MOVETYPE[6])
            @param {String} sMoveType.rotate 회전 (jindo.m.MOVETYPE[7])
            @param {String} sMoveType.pinch-rotate 핀치와 회전 (jindo.m.MOVETYPE[8])
        @param {HTMLElement} element 현재 터치된 영역의 Element
        @param {Number} nX 현재 터치영역의 X좌표
        @param {Number} nY 현재 터치 영역의 Y좌표
        @param {Number} nVectorX 이전 touchMove 혹은 touchStart의 X좌표와의 상대적인 거리(직전 좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
        @param {Number} nVectorY 이전 touchMove 혹은 touchStart의 Y좌표와의 상대적인 거리(직전 좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
        @param {Number} nDistanceX touchStart의 X좌표와의 상대적인 거리 (touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
        @param {Number} nDistanceY touchStart의 Y좌표와의 상대적인 거리 (touchStart좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
        @param {Object} oEvent jindo.$Event object
        @param {Function} stop stop를 호출하여 영향 받는 것이 없다.
    **/

    /**
        tap과 tap사이의 발생간격이 기준 시간 이하일경우 발생한다.

        @event doubleTap
        @param {String} sType 커스텀 이벤트명
        @param {HTMLElement} element 현재 터치된 영역의 Element
        @param {Number} nX 터치영역의 X좌표
        @param {Number} nY 터치 영역의 Y좌표
        @param {Object} oEvent jindo.$Event object
        @param {Function} stop stop를 호출하여 영향 받는 것이 없다.
    **/

    /**
        사용자의 터치가 끝난 이후에 움직임이 수평 스크롤으로 분석되었을 경우 발생한다.
        @remark touchEnd이후에 발생.분석 기준의 픽셀 이하로 움직였을 경우에는 분석되지 않아서 커스텀 이벤트 발생하지 않는다.

        @event hScroll
        @param {String} sType 커스텀 이벤트명
        @param {HTMLElement} element 현재 터치된 영역의 Element
        @param {Number} nX 현재 터치영역의 X좌표
        @param {Number} nY 현재 터치 영역의 Y좌표
        @param {Array} aX 모든 터치 영역의 X좌표
        @param {Array} aY 모든 터치 영역의 Y좌표
        @param {Number} nVectorX 이전 touchMove 혹은 touchStart의 X좌표와의 상대적인 거리 (직전 좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
        @param {Number} nVectorY 이전 touchMove 혹은 touchStart의 Y좌표와의 상대적인 거리 (직전 좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
        @param {Number} nDistanceX touchStart의 X좌표와의 상대적인 거리 (touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
        @param {Number} nDistanceY touchStart의 Y좌표와의 상대적인 거리 (touchStart좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
        @param {Number} nSpeedX 가속 발생 구간일 경우 현재 터치움직임의 수평방향 속도, 가속 구간이 아닐경우 0
        @param {Number} nSpeedY 가속 발생 구간일 경우 현재 터치움직임의 수직방향 속도, 가속 구간이 아닐경우 0
        @param {Number} nMomentumX 가속 발생 구간일 경우 현재 터치 움직임의 수평방향 운동에너지값,가속 구간이 아닐경우 0
        @param {Number} nMomentumY 가속 발생 구간일 경우 현재 터치 움직임의 수직방향 운동에너지값,가속 구간이 아닐경우 0
        @param {Number} nStartX touchStart의 X좌표
        @param {Number} nStartY touchStart의 Y좌표
        @param {Number} nStartTimeStamp touchStart의 timestamp 값
        @param {Object} oEvent jindo.$Event object
        @param {Function} stop stop를 호출하여 영향 받는 것이 없다.
    **/

    /**
        사용자의 터치가 끝난 이후에 움직임이 수직 스크롤으로 분석되었을 경우 발생한다.
        @remark touchEnd이후에 발생.분석 기준의 픽셀 이하로 움직였을 경우에는 분석되지 않아서 커스텀 이벤트 발생하지 않는다.

        @event vScroll
        @param {String} sType 커스텀 이벤트명
        @param {Number} element 현재 터치된 영역의 Element
        @param {Number} nX 현재 터치영역의 X좌표
        @param {Number} nY 현재 터치 영역의 Y좌표
        @param {Array} aX 모든 터치 영역의 X좌표
        @param {Array} aY 모든 터치 영역의 Y좌표
        @param {Number} nVectorX 이전 touchMove 혹은 touchStart의 X좌표와의 상대적인 거리 (직전 좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
        @param {Number} nVectorY 이전 touchMove 혹은 touchStart의 Y좌표와의 상대적인 거리 (직전 좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
        @param {Number} nDistanceX touchStart의 X좌표와의 상대적인 거리 (touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
        @param {Number} nDistanceY touchStart의 Y좌표와의 상대적인 거리 (touchStart좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
        @param {Number} nSpeedX 가속 발생 구간일 경우 현재 터치움직임의 수평방향 속도, 가속 구간이 아닐경우 0
        @param {Number} nSpeedY 가속 발생 구간일 경우 현재 터치움직임의 수직방향 속도, 가속 구간이 아닐경우 0
        @param {Number} nMomentumX 가속 발생 구간일 경우 현재 터치 움직임의 수평방향 운동에너지값,가속 구간이 아닐경우 0
        @param {Number} nMomentumY 가속 발생 구간일 경우 현재 터치 움직임의 수직방향 운동에너지값,가속 구간이 아닐경우 0
        @param {Number} nStartX touchStart의 X좌표
        @param {Number} nStartY touchStart의 Y좌표
        @param {Number} nStartTimeStamp touchStart의 timestamp 값
        @param {Object} oEvent jindo.$Event object
        @param {Function} stop stop를 호출하여 영향 받는 것이 없다.
    **/

    /**
        사용자의 터치가 끝난 이후에 움직임이 대각선 스크롤으로 분석되었을 경우 발생.
        @remark touchEnd이후에 발생.분석 기준의 픽셀 이하로 움직였을 경우에는 분석되지 않아서 커스텀 이벤트 발생하지 않는다

        @event dScroll
        @param {String} sType 커스텀 이벤트명
        @param {HTMLElement} element 현재 터치된 영역의 Element
        @param {Number} nX 현재 터치영역의 X좌표
        @param {Number} nY 현재 터치 영역의 Y좌표
        @param {Array} aX 모든 터치 영역의 X좌표
        @param {Array} aY 모든 터치 영역의 Y좌표
        @param {Number} nVectorX 이전 touchMove 혹은 touchStart의 X좌표와의 상대적인 거리 (직전 좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
        @param {Number} nVectorY 이전 touchMove 혹은 touchStart의 Y좌표와의 상대적인 거리 (직전 좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
        @param {Number} nDistanceX touchStart의 X좌표와의 상대적인 거리 (touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
        @param {Number} nDistanceY touchStart의 Y좌표와의 상대적인 거리 (touchStart좌표에서 위쪽방향이면 음수, 아래쪽 방향이면 양수)
        @param {Number} nSpeedX 가속 발생 구간일 경우 현재 터치움직임의 수평방향 속도, 가속 구간이 아닐경우 0
        @param {Number} nSpeedY 가속 발생 구간일 경우 현재 터치움직임의 수직방향 속도, 가속 구간이 아닐경우 0
        @param {Number} nMomentumX 가속 발생 구간일 경우 현재 터치 움직임의 수평방향 운동에너지값,가속 구간이 아닐경우 0
        @param {Number} nMomentumY 가속 발생 구간일 경우 현재 터치 움직임의 수직방향 운동에너지값,가속 구간이 아닐경우 0
        @param {Number} nStartX touchStart의 X좌표
        @param {Number} nStartY touchStart의 Y좌표
        @param {Number} nStartTimeStamp touchStart의 timestamp 값
        @param {Object} oEvent jindo.$Event object
        @param {Function} stop stop를 호출하여 영향 받는 것은 없다.
    **/


    /**
        사용자의 터치가 끝난 이후에 움직임이 pinch로 분석되었을 경우 발생.
        @remark touchEnd이후에 발생.분석 기준의 scale값 이하일 경우 분석되지 않아서 커스텀 이벤트 발생하지 않는다

        @event pinch
        @param {String} sType 커스텀 이벤트명
        @param {HTMLElement} element 현재 터치된 영역의 Element
        @param {Number} nX 현재 터치영역의 X좌표
        @param {Number} nY 현재 터치 영역의 Y좌표
        @param {Array} aX 모든 터치 영역의 X좌표
        @param {Array} aY 모든 터치 영역의 Y좌표
        @param {Number} nScale 멀티터치일경우 계산된 scale값
        @param {Number} nRotation 멀티터치일경우 계산된 rotation값 (pinch이면서 rotate일 경우 이 값도 존재한다)
        @param {Number} nStartTimeStamp touchStart의 timestamp 값
        @param {Object} oEvent jindo.$Event object
        @param {Function} stop stop를 호출하여 영향 받는 것은 없다.

        @history 1.2.0 Update (MultiTouch) Custom Event 추가
    **/

    /**
        사용자의 터치가 끝난 이후에 움직임이 rotate로 분석되었을 경우 발생.
        @remark touchEnd이후에 발생.분석 기준의 rotate값 이하일 경우 분석되지 않아서 커스텀 이벤트 발생하지 않는다.

        @event rotate
        @param {String} sType 커스텀 이벤트명
        @param {HTMLElement} element 현재 터치된 영역의 Element
        @param {Number} nX 현재 터치영역의 X좌표
        @param {Number} nY 현재 터치 영역의 Y좌표
        @param {Array} aX 모든 터치 영역의 X좌표
        @param {Array} aY 모든 터치 영역의 Y좌표
        @param {Number} nRotation 멀티터치일경우 계산된 rotation값
        @param {Number} nScale 멀티터치일경우 계산된 scale값 (pinch이면서 rotate일 경우 이 값도 존재한다)
        @param {Number} nStartTimeStamp touchStart의 timestamp 값
        @param {Object} oEvent jindo.$Event object
        @param {Function} stop stop를 호출하여 영향 받는 것은 없다.

        @history 1.2.0 Update (MultiTouch) Custom Event 추가

    **/

}).extend(jindo.m.UIComponent);/**
    @fileOverview 페이지의 고정영역 내부를 터치하여 스크롤링 할 수 있는 컴포넌트
    @author sculove
    @version 1.13.0
    @since 2011. 8. 18.
*/
/**
    페이지의 고정영역 내부를 터치하여 스크롤링 할 수 있는 컴포넌트

    @class jindo.m.Scroll
    @extends jindo.m.UIComponent
    @uses jindo.m.Touch
    @keyword scroll, 스크롤
    @group Component
    @update

    @history 1.13.0 Support Firefox 브라우저 지원
    @history 1.11.0 Bug view와 scroller의 크기가 같고, 스크롤바를 사용할 경우, 스크립트 오류 수정
    @history 1.11.0 Bug beforePosition 이벤트에서 stop 을 해도 updater 가 계속 동작되는 오류 수정 
    @history 1.10.0 Bug 대용량 플러그인 사용시, bUseTimingFunction=true일 경우, 스크롤의 모멘텀이 되지 않는 오류 수정
    @history 1.10.0 Bug bUseTimingFunction=true일 경우, scrollTo로 이동시 스크롤바가 움직이지 않는 버그 수정
    @history 1.10.0 Bug bUseTimingFunction=true일 경우, 스크롤이 멈추었을 때 움찔거리는 문제 제거
    @history 1.10.0 Bug 스크롤이 멈추었을 때 스크롤바가 노출되는 문제 수정
    @history 1.10.0 Bug iOS에서 스크롤 이후 선택이 안되는 문제 해결
    @history 1.9.0 Bug beforeTouchMove 의 발생 시점을 실제 touchMove가 발생했을 시점으로 변경
    @history 1.9.0 Bug Window8 IE10 플리킹 적용시 스크롤이 안되는 이슈 처리
    @history 1.9.0 Update Scroll 성능 개선
    @history 1.7.0 Bug bUseHighlight=fasle일 경우, 안드로이드 4.x 갤럭시 시리즈에서 하이라이트 사라지지 않는 문제 제거 
    @history 1.7.0 Update base엘리먼트에 z-index = 2000으로 설정 (Css3d사용시 충돌하는 버그 수정)
    @history 1.7.0 Update 불필요 노출 메소드 deprecated<br/>
    getPosLeft, getPostTop, getStyleOffset, makeStylePos, restorPos, setLayer, setScroller
    @history 1.6.0 스크롤 컴포넌트 플러그인 구조로 구조개선
    @history 1.5.0 Bug jindo 1.5.3 이하 버전에서 대용량 스크롤시 스크롤바가 보이지 않는 문제 수정
    @history 1.5.0 Support Window Phone8 지원
    @history 1.5.0 Update  touchStart, touchMove , touchEnd 이벤트에서 중지할 경우 뒤 이벤트 안타도록 수정
    @history 1.4.0 Support iOS 6 지원
    @history 1.4.0 Update {bUseBounce} bUseBounce : false일 경우, 스크롤을 더이상 할수 없을 때 시스템 스크롤이 발생하는 기능 추가
    @history 1.4.0 Bug 가로 스크롤일경우, 터치 위치의 y가 30보다 작을경우 스크롤이 안되는 버그 수정
    @history 1.3.5 Bug 스크롤바 이동시, bUseTranslate, bUseTimingFunction 옵션 적용되도록 수정
    @history 1.3.5 Update 스크롤바 fade in-out 효과 제거<br />스크롤바 border-radius, opacity 효과 제거
    @history 1.3.0 Support Android 젤리빈(4.1) 대응
    @history 1.3.0 Support 갤럭시 4.0.4 업데이트 지원
    @history 1.3.0 Update Wrapper의 position이 static 일 경우, relative로 변경<br/>그외는 position이 변경되지 않도록 수정
    @history 1.3.0 Update Wrapper와 scroller가 동일하고 bUseBounce가 true인 경우, 스크롤바가 안보이고, 스크롤이 가능하도록 변경
    @history 1.3.0 Bug Scroll과 Flicking 함께 사용할때 A link가 클릭안되는 문제 수정
    @history 1.2.0 Update pullDown/pullUp 상태가 아닌 경우, pullDown/pullUp 엘리먼트를 hide시키는 UI 변경
    @history 1.2.0 Support Chrome for Android 지원<br />갤럭시 S2 4.0.3 업데이트 지원
    @history 1.1.0 Bug destroy() 호출시 Scroll객체 destroy 호출 안되는 문제 해결<br />
                    중복 scroll 사용시, scroll이 정상 동작하지 않는 문제 해결<br />
                    뒤로가기시 스크롤의 속성값이 초기화 되지않는 문제 해결
    @history 1.1.0 Support jindo 2.0.0 mobile 버전 지원
    @history 1.1.0 Support Android 3.0/4.0 지원
    @history 1.1.0 Update 따로 클래스명을 정의하지 않아도 wrapper내의 첫번째 엘리먼트를 무조건 Scroller 엘리먼트로 처리하도록 수정
    @history 1.1.0 Update document 선택시 wrapper이 visible이 true일 경우에만 작동하도록 수정
    @history 1.1.0 Update 스크롤 여부에 따른 마크업 지정 편의 개선 (가로스크롤은 scroller의 높이값 100% 설정, 세로스크롤 경우 scroller의 넓이값 100% 설정)
    @history 0.9.5 Bug iOS에서 클릭영역 누른 상태에서, 이동후 버튼을 놓았을시, 초기에 선택한 위치에 clickable 엘리먼트가 존재할 경우, click 되는 문제 해결
    @history 0.9.5 Update [bUseBounce] false인 경우, 이동,가속시 외부영역으로 이동되지 않도록 수정
    
    @history 0.9.0 Release 최초 릴리즈
**/
jindo.m.Scroll = jindo.$Class({
    /* @lends jindo.m.Scroll.prototype */
       /**
        초기화 함수

        @constructor
        @param {String|HTMLElement} el CoreScroll할 Element (필수)
        @param {Object} [htOption] 초기화 옵션 객체
            @param {Number} [htOption.nHeight=0] Wrapper의 height값. 값이 0일 경우 wrapper의 height로 설정됨
            @param {Number} [htOption.nWidth=0] Wrapper의 width값. 값이 0일 경우 wrapper의 width로 설정됨
            @param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate 여부
            @param {Boolean} [htOption.bUseHScroll=false] 수평 스크롤 사용 여부. 스크롤영역의 width가 wrapper의 width보다 클 경우 적용 가능함.
            @param {Boolean} [htOption.bUseVScroll=true] 수직 스크롤 사용 여부. 스크롤영역의 height가 wrapper의 height보다 클 경우 적용 가능함.
            @param {Boolean} [htOption.bUseMomentum=true] 스크롤시 가속도 사용여부
            @param {Number} [htOption.nDeceleration=0.0006] 가속도의 감속계수. 이 값이 클수록, 가속도는 감소한다
            @param {Boolean} [htOption.bUseBounce=true] 가속 이동후, 바운스 처리되는 여부
            @param {Boolean} [htOption.bUseHighlight=true] 하이라이트 사용 여부
            @param {String} [htOption.sClassPrefix='scroll_'] CoreScroll 내부 엘리먼트 구분 클래스 prefix
            @param {Boolean} [htOption.bAutoResize=false] 기기 회전시, 크기 자동 재갱신
            @param {Boolean} [htOption.bUseCss3d=jindo.m._isUseCss3d()] 하드웨어 3d 가속 여부<br />
                모바일 단말기별로 다르게 설정된다. 상세내역은 <auidoc:see content="jindo.m">[jindo.m]</auidoc:see>을 참조하기 바란다.
            @param {Boolean} [htOption.bUseTimingFunction=jindo.m._isUseTimingFunction()] 스크롤 애니메이션 동작방식을 결정한다.<br />
                bUseTimingFunction가 true일 경우, CSS3로 애니메이션을 구현하고, false일 경우, 스크립트로 애니메이션을 구현한다.<br />
                모바일 단말기별로 다르게 설정된다. 상세내역은 <auidoc:see content="jindo.m">[jindo.m]</auidoc:see>을 참조하기 바란다.<br />
            @param {Boolean} [htOption.bUseTranslate=true] 컨텐츠의 좌표이동 방법을 결정한다.<br />
                bUseTranslate가 true일 경우, CSS3의 Translate으로 이동하고, false일 경우, style의 left,top으로 이동한다.
            @param {Boolean} [htOption.bUseScrollbar=true] 스크롤바 사용 여부
            @param {Boolean} [htOption.bUseFixedScrollbar=false] 고정 스크롤바 적용 여부
            @param {String} [htOption.sScrollbarBorder="1px solid white"] 스크롤바 보더 스타일을 지정
            @param {String} [htOption.sScrollbarColor="#8e8e8e"] 스크롤바의 색상을 지정
            @param {Number} [htOption.nScrollbarHideThreshold=0] 스크롤 바를 hide 시킬때 딜레이 타임
            @param {Boolean} [htOption.bUseScrollBarRadius=true] 스크롤 바의 radius 설정 여부

            @param {String} [htOption.bUsePullDown=false] pull down update 기능 사용 여부
            @param {Boolean} [htOption.bUsePullUp=false] pull up update 기능 사용 여부
            @param {Number} [htOption.fnPullDownIdle=null] bUsePullDown 가 true일 시, pullDown 미발생 시 엘리먼트를 구성하는 함수.<br />
                첫번째 파라미터로 pullDown의 jindo.$Element가 넘어져 온다.
            @param {Number} [htOption.fnPullDownBeforeUpdate=null] bUsePullDown 가 true일 시, pullDown 발생 전 엘리먼트를 구성하는 함수.<br />
                첫번째 파라미터로 pullDown의 jindo.$Element가 넘어져 온다.
            @param {Number} [htOption.fnPullDownUpdating=null] bUsePullDown 가 true일 시, pullDown 발생 시 엘리먼트를 구성하는 함수.<br />
                첫번째 파라미터로 pullDown의 jindo.$Element가 넘어져 온다.
            @param {Number} [htOption.fnPullUpIdle=null] bUsePullUp이 true일 시, pullUp 미발생 시 엘리먼트를 구성하는 함수.<br />
                첫번째 파라미터로 pullUp의 jindo.$Element가 넘어져 온다.
            @param {Number} [htOption.fnPullUpBeforeUpdate=null] bUsePullUp이 true일 시, pullUp 발생 전 엘리먼트를 구성하는 함수.<br />
                첫번째 파라미터로 pullUp의 jindo.$Element가 넘어져 온다.
            @param {Number} [htOption.fnPullUpUpdating=null] bUsePullUp이 true일 시, pullUp 발생 시 엘리먼트를 구성하는 함수.<br />
                첫번째 파라미터로 pullUp의 jindo.$Element가 넘어져 온다.

            @param {String} [htOption.sListElement=''] sListElement는 리스트의 구성요소가 되는 엘리먼트 명이다.<br />
                sListElement 옵션값을 지정한 상태에서 스크롤이 일어날 경우, 이동 경로 방향으로 고정 범위의 scroller 영역만을 동적으로 유지한다.<br />
                여기서 ‘고정범위’는 ‘화면에 보이는 View영역의 높이 X nRatio’ 옵션 값이다.<br />
                이 옵션이 적용될 경우, bUseCss3d와 bUseTimingFunction은 false값을 가진다.<br />
            @param {Number} [htOption.nRatio=1.5] sListElement가 설정되었을때, 유지하는 고정범위 비이다.
            @param {Boolean} [htOption.bUseDiagonalTouch=true] 대각선스크롤 방향의 터치도 플리킹으로 사용할지 여부
            @param {Number} [htOption.nZIndex=2000] 컴포넌트 base엘리먼트 z-Index 값
        @history 1.8.0 Update [nZIndex] 옵션 추가
        @history 1.6.0 Update [bUseDiagonalTouch] Option 추가
        @history 1.5.0 Update [bUseScrollBarRadius] Option 추가
        @history 1.5.0 Update [nScrollbarHideThreshold] Option 추가
        @history 1.3.5 Update [sScrollbarBorder] Option 기본값 수정 ("1px solid rgba(255,255,255,0.9)" → "1px solid white")
        @history 1.3.5 Update [sScrollbarColor] Option 기본값 수정 ("rgba(0,0,0,0.5)" → "#8e8e8e")
        @history 1.3.0 Update [sListElement] Option 추가
        @history 1.3.0 Update [nRatio] Option 추가
        @history 1.3.0 Update [bUseTimingFunction] Option 추가
        @history 1.3.0 Update [bUseTranslate] Option 추가
        @history 1.3.0 Update [sScrollbarBorder] Option 추가
        @history 1.3.0 Update [sScrollbarColor] Option 추가
        @history 1.3.0 Update [bUseCss3d] Option 기본값 변경. 모바일 단말기에 맞게 3d 사용여부를 설정함
        @history 1.3.0 Update [bUseMomentum] Option 기본값 변경. iOS는 true, Android는 false → 모두 true
        @history 1.2.0 Update [nOffsetTop] Option 추가
        @history 1.2.0 Update [nOffsetBottom] Option 추가
        @history 1.2.0 Update [bUseTransition → bUseCss3d] Option Name 수정
        @history 1.1.0 Update [bUseTransition] Option 기본값 수정<br>iOS, 갤럭시 S2 : true, 그외 : false
        @history 1.1.0 Update [bUseHighlight] Option 추가
        @history 0.9.5 Update [bUseFixedScrollbar] Option 추가
        @history 0.9.5 Update [sClassPrefix] Option 추가
        @history 0.9.5 Update [bUseTransition] Option 추가
        @history 0.9.5 Update [sPrefix → sClassPrefix] Option명 수정
        @history 0.9.5 Update [bUseFocus] Option명 삭제
        @history 0.9.5 Update [sPullDownId] Option명 삭제
        @history 0.9.5 Update [sPullUpId] Option명 삭제

    **/
    $init : function(el,htUserOption) {
        this.option({
            bActivateOnload : true,
            bUseHScroll : false,
            bUseVScroll : true,
            bUseMomentum : true,
            nDeceleration : 0.0006,
            nOffsetTop : 0,
            nOffsetBottom : 0,
            nHeight : 0,
            nWidth : 0,
            bUseBounce : true,
            bUseHighlight : true,
            sClassPrefix : 'scroll_',
            bUseCss3d : jindo.m.useCss3d(true),
            bUseTimingFunction : jindo.m.useTimingFunction(true),
            bUseTranslate : true,
            bAutoResize : false,
            bUseDiagonalTouch : true,
            nZIndex : 2000,
            
            /* 대용량 옵션 */
            sListElement : '',
            nRatio : 1.5,

            /* 스크롤바 옵션 */
            bUseScrollbar : true,
            nScrollbarHideThreshold : 0,
            bUseFixedScrollbar : false,
            sScrollbarBorder : "1px solid white",
            sScrollbarColor : "#8e8e8e",
            bUseScrollBarRadius : true,

            /* PullDown/PullUp 옵션 */
            bUsePullDown : false,
            bUsePullUp : false,
            fnPullDownIdle : null,
            fnPullDownBeforeUpdate : null,
            fnPullDownUpdating : null,
            fnPullUpIdle : null,
            fnPullUpBeforeUpdate : null,
            fnPullUpUpdating : null
        });
        this.option(htUserOption || {});
        this._initVar();
        this._setWrapperElement(el);

        if(this instanceof jindo.m.Scroll) {
          if(this.option("bActivateOnload")) {
            this.activate();
          }
        }
        // console.log("bUseHighlight : " + this.option("bUseHighlight") + ", bUseCss3d:" + this.option("bUseCss3d") + ", bUseTimingFunction : " + this.option("bUseTimingFunction") + ", bUseTranslate : " + this.option("bUseTranslate"));
    },

    _p : function(str) {
        if(str.length <= 0) {
            return str;
        }
        if(this.sCssPrefix == "") {
            str = str.charAt(0).toLowerCase() + str.substr(1);
        } else {
            str = str.charAt(0).toUpperCase() + str.substr(1);
        }
        return this.sCssPrefix + str;
    },

    /**
        jindo.m.Scroll 에서 사용하는 모든 인스턴스 변수를 초기화한다.
    **/
    _initVar: function() {
        this.isPositionBug = jindo.m.hasOffsetBug();
        this.isClickBug = jindo.m.hasClickBug();
        this.nVersion = parseFloat(jindo.m.getDeviceInfo().version.substr(0,3));
        this.sCssPrefix = jindo.m.getCssPrefix();
        this.sTranOpen = null;
        this.sTranEnd = null;
        this.nWrapperW = null;
        this.nWrapperH = null;
        this.nScrollW = null;
        this.nScrollH = null;
        this.nMaxScrollLeft = null;
        this.nMaxScrollTop = null;
        this.nMinScrollTop = 0;
        this.bUseHScroll = null;
        this.bUseVScroll = null;
        this.bUseHighlight = this.option("bUseHighlight");
        this._nPropHScroll = null;
        this._nPropVScroll = null;

        this._nLeft = 0;
        this._nTop = 0;
        this._aAni = [];

        this._htTimer = {
            "ani" : -1,
            "fixed" : -1,
            "touch" : -1,
            "scrollbar" : -1
        };
        this._htPlugin = {
            "dynamic" : {},
            "pull" : {}
        };

        this._oTouch = null;
        this._isAnimating = false;      // 순수 animate 처리
        this._isControling = false;     // 사용자가 움직이고 있는가?
        this._isStop = false;

        
        // DynamicScroll을 사용한다고 할경우, bUseTimingFunction는 항상 false
        if(this.option("sListElement")) {
            this.option("bUseTimingFunction", false);
        }
        this._setTrans();

        /**
         *  하이라이트 기능을 사용할 경우에만 적용됨.
         *  android 경우, css,offset, translate에 의해 이동된 영역의 하이라이트 및 영역이 갱신되지 않는 문제
         * translate의 위치를 초기화하고 css, offset에 맞게 위치를 변경해준다. 또한 대상 영역하위의 a tag에 focus를 준다.
         */
        if(this.bUseHighlight) {
            if(this.isPositionBug) {
                this._elDummyTag = null;    //for focus
            }
            /**
             *  iOS를 위한 anchor 처리
             * ios일 경우, touchstart시 선택된 영역에 anchor가 있을 경우, touchend 시점에 touchstart영역에 click이 타는 문제
             * 모든 a link에 bind된, onclick 이벤트를 제거한다.
             */
            if(this.isClickBug) {
                this._aAnchor = null;
                this._fnDummyFnc = function(){return false;};
                this._bBlocked = false;
            }
        }

        this._nUpdater = -1;
        this._oMoveData = { 
            nLeft : 0,
            nTop : 0
        };
    },

    /**
        3d Trans 또는 Trans를 기기별로 적용
    **/
    _setTrans : function() {
        if(this.option("bUseCss3d")) {
            this.sTranOpen = "3d(";
            this.sTranEnd = ",0)";
        } else {
            this.sTranOpen = "(";
            this.sTranEnd = ")";
        }
    },

    /**
        현재 포지션을 반환함.

        @method getCurrentPos
        @return {Object} nTop, nLeft의 값을 반환한다.
        @history 1.1.0 Update Method 추가
    **/
    getCurrentPos : function() {
        return {
            nTop : this._nTop,
            nLeft : this._nLeft
        };
    },

    /**
        wrapper 엘리먼트와 scroller 엘리먼트를 설정한다.
        @deprecated 
        @method setLayer
        @param {Varient} el 엘리먼트를 가리키는 문자열이나, HTML엘리먼트
    **/
    setLayer : function(el) {
        this._htWElement["wrapper"] = jindo.$Element(el);
        // zIndex 2000 값 추가
        this._htWElement["wrapper"].css({
            "overflow" : "hidden",
            "zIndex" : this.option("nZIndex")
        });
        if(this._htWElement["wrapper"].css("position") == "static") {
            this._htWElement["wrapper"].css("position", "relative");
        }
        if(!this.bUseHighlight) {
            this._htWElement["wrapper"].css(this._p("TapHighlightColor"),"rgba(0,0,0,0)");
            // firefox에서는 사용이 안됨
        }
        this.setScroller();
    },

    /**
        스크롤러관련 엘리먼트를 설정함
        @deprecated 
        @method setScroller
    **/
    setScroller : function() {
        this._htWElement["scroller"] = this._htWElement["wrapper"].first();
        /**
         * Transform : translate이 초기에 적용될 경우,
         * ios계열에서 깜빡거리거나, 이벤트 행이 걸리는 문제가 발생함
         * hide시킨후, 적용을 하면 이러한 현상이 완화됨.
         *
         * 따라서, hide -> Transfom : translate 적용 -> show
         */
        this._htWElement["scroller"].css({
                "position" : "absolute",
                "zIndex" : 1,
                "left" : 0,
                "top" : 0
        });
        if(this.option("bUseTranslate") || this.option("bUseCss3d")) {
            this._htWElement["scroller"].css(this._p("TransitionProperty"),
             this.sCssPrefix == "" ? "transform" : "-" + this.sCssPrefix + "-transform")
                .css(this.sCssPrefix + "Transform", "translate" + this.sTranOpen + "0,0" + this.sTranEnd);
        }
        if(this.option("bUseTimingFunction")) {
            this._htWElement["scroller"].css(this._p("TransitionTimingFunction"), "cubic-bezier(0.33,0.66,0.66,1)");
        }
        // 안드로이드 버그 수정 (android 2.x 이하 버젼)
        if(this.isPositionBug && this.bUseHighlight) {
            this._elDummyTag = this._htWElement["scroller"].query("._scroller_dummy_atag_");
            if(!this._elDummyTag) {
                this._elDummyTag = jindo.$("<a href='javascript:void(0);' style='position:absolute;height:0px;width:0px;' class='_scroller_dummy_atag_'></a>");
                this._htWElement["scroller"].append(this._elDummyTag);
            } else{
                this._elDummyTag = this._elDummyTag.$value();
            }
        }
    },

    /**
        width값을 설정하거나, 반환한다.

        @method width
        @param {Number} nValue
    **/
    width : function(nValue) {
        if(nValue) {
            this.option("nWidth", nValue);
            this.refresh();
        } else {
            if(this.option("nWidth")) {
                return parseInt(this.option("nWidth"),10);
            } else {
                return this._htWElement["wrapper"].width();
            }
        }
    },

    /**
        height값을 설정하거나, 반환한다.

        @method height
        @param {Number} nValue
    **/
    height : function(nValue) {
        if(nValue) {
            this.option("nHeight", nValue);
            this.refresh();
        } else {
            if(this.option("nHeight")) {
                return parseInt(this.option("nHeight"),10);
            } else {
                return this._htWElement["wrapper"].height();
            }
        }
    },

    /**
        jindo.m.Scroll 에서 사용하는 모든 엘리먼트의 참조를 가져온다.
        @param {Varient} el 엘리먼트를 가리키는 문자열이나, HTML엘리먼트
    **/
    _setWrapperElement: function(el) {
        this._htWElement = {};
        this.setLayer(el);
    },

    /**
        수평 스크롤 여부를 반환한다.
        @method hasHScroll
        @return {Boolean} 스크롤가능 여부를 반환한다.
        @history 1.2.0 Update Method 추가
    **/
    hasHScroll : function() {
        return this.bUseHScroll;
    },

    /**
        수직 스크롤 여부를 반환한다.

        @method hasVScroll
        @return {Boolean} 스크롤가능 여부를 반환한다.
        @history 1.2.0 Update Method 추가
    **/
    hasVScroll : function() {
        return this.bUseVScroll;
    },


    /**
        jindo.m.DynamicPlugin 생성 / refresh
        @param  {String} sDirection V(수직), H(수평)
    **/
    _createDynamicPlugin : function(sDirection) {
        var ht = {
            nRatio : this.option("nRatio"),
            sListElement : this.option("sListElement"),
            sDirection : sDirection
        };
        if(this._inst("dynamic")) {
            this._inst("dynamic").option(ht);
        } else {
            this._htPlugin["dynamic"].o = new jindo.m.DynamicPlugin(this._htWElement["wrapper"], ht);
        }
        this._inst("dynamic").refresh(sDirection == "V" ? this._nTop : this._nLeft);
        this.option("bUseTimingFunction", false);
        this._htPlugin["dynamic"].bUse = true;
    },

    /**
     * 범위(nRation * 2) 보다 scroller가 작을 경우는 적용되지 않는다.
     */
    _refreshDynamicPlugin : function() {
        this._htPlugin["dynamic"].bUse = false;
        if(this.option("sListElement") && !(this.bUseVScroll && this.bUseHScroll) ) {
            var nRange = this.option("nRatio") * 2;
            if( this.bUseVScroll && (this.nScrollH > (this.nWrapperH * nRange)) ) {
                this._createDynamicPlugin("V");
            } else if( this.bUseHScroll && (this.nScrollW > (this.nWrapperW * nRange)) ) {
                this._createDynamicPlugin("H");
            }
        }
    },

    /**
     * Pulldown/up 기능 제
     */
    _refreshPullPlugin : function(){
        this._htPlugin["pull"].bUse = this.option("bUsePullDown") || this.option("bUsePullUp");
        if(!this._isUse("pull")) {
            return false;
        }
        
        if(!this._inst("pull")) {
            this._htPlugin["pull"].o = new jindo.m.PullPlugin(this);
        }
        this._inst("pull").refresh();
        return true;
    },
    
    /**
     * IndexScroll 기능 제공 
     */
    // _refreshIndexPlugin : function(){
    //  this._htPlugin["index"].bUse = this.option("bUseIndex");
    //     if(!this._isUse("index")) { 
    //      return;
    //     }
        
    //     if(!this._inst("index")) {
    //         this._htPlugin["index"].o = new jindo.m.IndexPlugin(this);
    //     }
    //     this._inst("index").refresh();
    // },

    /**
        스크롤러를 위한 환경을 재갱신함

        @method refresh
        @param {Object} bNoRepos true 일 경우, 포지션을 갱신하지 않음
    **/
    refresh : function(bNoRepos) {
        if(!this.isActivating()) {
            return;
        }
        // wrapper와 스크롤러의 크기 판별
        if(this.option("nWidth")) {
            this._htWElement["wrapper"].width(parseInt(this.option("nWidth"),10));
        }
        if(this.option("nHeight")) {
            this._htWElement["wrapper"].height(parseInt(this.option("nHeight"),10));
        }
        
        var nWidthLeft = parseInt(this._htWElement["wrapper"].css("border-left-width"),10),
            nWidthRight = parseInt(this._htWElement["wrapper"].css("border-right-width"),10),
            nHeightTop = parseInt(this._htWElement["wrapper"].css("border-top-width"),10),
            nHeightBottom = parseInt(this._htWElement["wrapper"].css("border-bottom-width"),10);
        nWidthLeft = isNaN(nWidthLeft) ? 0 : nWidthLeft;
        nWidthRight = isNaN(nWidthRight) ? 0 : nWidthRight;
        nHeightTop = isNaN(nHeightTop) ? 0 : nHeightTop;
        nHeightBottom = isNaN(nHeightBottom) ? 0 : nHeightBottom;
        
        this.nWrapperW = this._htWElement["wrapper"].width() - nWidthLeft - nWidthRight;
        this.nWrapperH = this._htWElement["wrapper"].height() - nHeightTop - nHeightBottom;
        

        if(!this._refreshPullPlugin()) {
            this.nScrollW = this._htWElement["scroller"].width();
            this.nScrollH = this._htWElement["scroller"].height() - this.option("nOffsetBottom");
            this.nMinScrollTop = -this.option("nOffsetTop");
            this.nMaxScrollTop = this.nWrapperH - this.nScrollH;
        }
        this.nMaxScrollLeft = this.nWrapperW - this.nScrollW;

        // 모든 A태그
        if(this.bUseHighlight && this.isClickBug) {
            this._aAnchor = jindo.$$("A", this._htWElement["scroller"].$value());
        }

        // 스크롤 여부 판별
        this.bUseHScroll = this.option("bUseHScroll") && (this.nWrapperW <= this.nScrollW);
        this.bUseVScroll = this.option("bUseVScroll") && (this.nWrapperH <= this.nScrollH);
//      console.log(this.bUseHScroll, this.bUseVScroll, this._htWElement["wrapper"].height(), this._htWElement["wrapper"].$value().offsetHeight);

        // 스크롤 여부에 따른 스타일 지정
        if(this.bUseHScroll && !this.bUseVScroll) { // 수평인 경우
            this._htWElement["scroller"].$value().style["height"] = "100%";
        }
        if(!this.bUseHScroll && this.bUseVScroll) { // 수직인 경우
            this._htWElement["scroller"].$value().style["width"] = "100%";
        }

        // Pulgin refresh
        this._refreshDynamicPlugin();
        // this._refreshIndexPlugin();

        // 스크롤바 refresh (없을시 자동 생성)
        if(this.option("bUseScrollbar")) {
            this._refreshScroll("V");
            this._refreshScroll("H");
        }

        if(!this.bUseHScroll && !this.bUseVScroll) { // 스크롤이 발생하지 않은 경우, 안드로이드인경우 포지션을 못잡는 문제
            this._fixPositionBug();
        }

        if(!bNoRepos) {
            this.restorePos(0);
        }
    },

    /**
        스크롤의 위치를 지정함
        @param {Number} nLeft
        @param {Number} nTop
    **/
    _setPos : function(nLeft,nTop) {
        var sDirection;
        nLeft = this.bUseHScroll ? nLeft : 0;
        nTop = this.bUseVScroll ? nTop : 0;
        
        // console.log("setPos : " + this._nLeft + ", " + this._nTop + ", (nLeft,nTop) : " + nLeft + ", " + nTop);
        if(this._isUse("dynamic")) {
            sDirection = this._checkDirection(nLeft,nTop);
        }
        /**
            스크롤러 위치 변경되기 전

            @event beforePosition
            @param {String} sType 커스텀 이벤트명
            @param {Number} nLeft Scroller의 left 값
            @param {Number} nTop Scroller의 top 값
            @param {Number} nMaxScrollLeft Scroller의 최대 left 값
            @param {Number} nMaxScrollTop Scroller의 최대 top 값
            @param {Function} stop 수행시 position 이벤트가 발생하지 않음
        **/
        if (this._fireEvent("beforePosition")) {
            this._isControling = true;
            this._nLeft = nLeft;
            this._nTop = nTop;
            if(this._isUse("dynamic")) {
                this._inst("dynamic").updateListStatus(sDirection, this.bUseVScroll ? this._nTop : this._nLeft);
            }
            if(this.option("bUseTranslate")) {
                if (this.bUseHighlight && this.isPositionBug) {
                    var htStyleOffset = this.getStyleOffset(this._htWElement["scroller"]);
                    nLeft -= htStyleOffset.left;
                    nTop -= htStyleOffset.top;
                }
                
                this._htWElement["scroller"].css(this._p("Transform"), "translate" + this.sTranOpen + nLeft + "px, " + nTop + "px" + this.sTranEnd);
            } else {
                this._htWElement["scroller"].css({
                    "left" : nLeft + "px",
                    "top" : nTop + "px"
                });
            }

            if(this.option("bUseScrollbar")) {
                this._htTimer["scrollbar"] = clearTimeout(this._htTimer["scrollbar"]);
                this._setScrollBarPos("V", this._nTop);
                this._setScrollBarPos("H", this._nLeft);
            }
            // this.tick();
            this._oMoveData = {
                nLeft : this._nLeft,
                nTop : this._nTop
            };

             /**
                스크롤러 위치 변경된 후

                @event position
                @param {String} sType 커스텀 이벤트명
                @param {Number} nLeft Scroller의 left 값
                @param {Number} nTop Scroller의 top 값
                @param {Number} nMaxScrollLeft Scroller의 최대 left 값
                @param {Number} nMaxScrollTop Scroller의 최대 top 값
                @param {Function} stop 수행시 영향을 받는것이 없음
            **/
            this._fireEvent("position");
            
            // if(this._isUse("index")){
            //     this._inst("index").setPosFixedIndex(this._nTop);
            // }
            
        }else{
            this._isAnimating = false;
        }
    },


    /**
     * Plugin 사용 여부 상태 조회
     * @param {String} sName
     */
    _isUse : function(sName) {
        return this._htPlugin[sName].bUse;
    },

    /**
     * Plugin 객채 조
     * @param {String} sName
     */
    _inst : function(sName) {
        return this._htPlugin[sName].o;
    },

    /**
     * @to-do Dynamic으로 빼고 싶음.
     */
    _checkDirection : function(nLeft, nTop) {
        var nBeforePos = this.bUseVScroll ? this._nTop : this._nLeft,
            nAfterPos = this.bUseVScroll ? nTop : nLeft,
            sDirection;
        if(nBeforePos > nAfterPos) {
            sDirection = "forward";
        } else {
            sDirection = "backward";
        }
        return sDirection;
    },

    /**
        스크롤영역으로 복원함
        @deprecated 
        @method restorePos
        @param {Number} nDuration
    **/
    restorePos : function(nDuration) {
        if(!this.bUseHScroll && !this.bUseVScroll) {
            return;
        }
        // 최대, 최소범위 지정

        var nNewLeft = this.getPosLeft(this._nLeft),
            nNewTop = this.getPosTop(this._nTop);
        if (nNewLeft === this._nLeft && nNewTop === this._nTop) {
            this._isControling = false;
            this._isStop = false;   // 애니메이션이 완전 종료했을 경우, isStop값을 초기화
            // this._isActivateUpdater = false;
            this._fireAfterScroll();
            this._fixPositionBug();
            return;
        } else {
            this._scrollTo(nNewLeft, nNewTop , nDuration);
        }
    },

    /**
        모멘텀을 계산하여 앞으로 이동할 거리와 시간을 속성으로 갖는 객체를 반환함
        @param {Number} nDistance
        @param {Number} nSpeed
        @param {Number} nMomentum
        @param {Number} nSize
        @param {Number} nMaxDistUpper
        @param {Number} nMaxDistLower
    **/
    _getMomentum: function (nDistance, nSpeed, nMomentum, nSize, nMaxDistUpper, nMaxDistLower) {
        var nDeceleration = this.option("nDeceleration"),
            nNewDist = nMomentum / nDeceleration,
            nNewTime = 0,
            nOutsideDist = 0;
        //console.log("momentum : " + nDistance + ", " + nSpeed + ", " + nMomentum + ",  " + nSize + ", " + nMaxDistUpper + " , " + nMaxDistLower + ", " + nNewDist);
        if (nDistance < 0 && nNewDist > nMaxDistUpper) {
            nOutsideDist = nSize / (6 / (nNewDist / nSpeed * nDeceleration));
            nMaxDistUpper = nMaxDistUpper + nOutsideDist;
            nSpeed = nSpeed * nMaxDistUpper / nNewDist;
            nNewDist = nMaxDistUpper;
        } else if (nDistance > 0 && nNewDist > nMaxDistLower) {
            nOutsideDist = nSize / (6 / (nNewDist / nSpeed * nDeceleration));
            nMaxDistLower = nMaxDistLower + nOutsideDist;
            nSpeed = nSpeed * nMaxDistLower / nNewDist;
            nNewDist = nMaxDistLower;
        }
        nNewDist = nNewDist * (nDistance > 0 ? -1 : 1);
        nNewTime = nSpeed / nDeceleration;
        //console.log("momentum nSpeed : " + nSpeed + ", nMomentum : " + nMomentum + ", nNewDist : " + nNewDist + ", nTop : " + this._nTop + ", nNewTime : " + nNewTime);
        return {
            nDist: nNewDist,
            nTime: Math.round(nNewTime)
        };
    },

    /**
        애니메이션을 초기화한다.
    **/
    _stop : function() {
        if(this.option("bUseTimingFunction")) {
            jindo.m.detachTransitionEnd(this._htWElement["scroller"].$value(), this._htEvent["TransitionEnd"]);
            this._transitionTime(0);
        } else {
            cancelAnimationFrame(this._htTimer["ani"]);
            this._stopUpdater();
        }
        this._setPos(this._nLeft, this._nTop);
        this._aAni = [];
        this._isAnimating = false;
        this._isStop = true;
    },

    _scrollTo: function (nLeft, nTop , nDuration) {
        this._stop();
        nLeft = this.bUseHScroll ? nLeft : 0;
        nTop = this.bUseVScroll ? nTop : 0;
        this._aAni.push({
            nLeft: nLeft,
            nTop: nTop,
            nDuration: nDuration || 0
        });
        this._animate();
    },


    /**
        left, top 기준으로 스크롤을 이동한다.
        스크롤을 해당 위치(nLeft, nTop)로 이동한다.<br/>
        @method scrollTo
        @param {Number} nLeft 0~양수 만 입력 가능하다. (-가 입력된 경우는 절대값으로 계산된다)
        @param {Number} nTop 0~양수 만 입력 가능하다. (-가 입력된 경우는 절대값으로 계산된다)
        @param {Number} nDuration 기본값은 0ms이다.
        @remark
            최상위의 위치는 0,0 이다. -값이 입력될 경우는 '절대값'으로 판단한다.<br/>
            스크롤의 내용을 아래로 내리거나, 오른쪽으로 이동하려면 + 값을 주어야 한다.<br/>
        @example
            oScroll.scrollTo(0,100); //목록이 아래로 100px 내려간다.
            oScroll.scrollTo(0,-100); //목록이 아래로 100px 내려간다. (절대값이 100이므로)

        @history 1.1.0 Update nLeft, nTop 값이 양수일 경우 아래쪽, 오른쪽 방향으로 가도록 변경 (음수일 경우 "절대값"으로 계산됨)

    **/

    scrollTo : function(nLeft, nTop, nDuration) {
        nDuration = nDuration || 0;
        nLeft = -Math.abs(nLeft);
        nTop = -Math.abs(nTop);
        nTop += this.getTop();

        this._scrollTo( (nLeft >= this.getLeft() ? this.getLeft() : (nLeft <= this.getRight() ? this.getRight() : nLeft) ),
            (nTop >= this.getTop() ? this.getTop() : (nTop <= this.getBottom() ? this.getBottom() : nTop) ),
            nDuration);
    },

    /**
        오른쪽 위치 반환

        @method getRight
        @return {Number}
    **/
    getRight : function() {
        return this.nMaxScrollLeft;
    },

    /**
        왼쪽 위치 반환

        @method getLeft
        @return {Number}
    **/
    getLeft : function() {
        return 0;
    },

    /**
        아래쪽 위치 반환

        @method getBottom
        @return {Number}
    **/
    getBottom : function() {
        return this.nMaxScrollTop;
    },

    /**
        위쪽 위치 반환

        @method getTop
        @return {Number}
    **/
    getTop : function() {
        return this.nMinScrollTop;
    },

    /**
        동작 여부를 반환

        @method isMoving
        @return {Boolean}  동작 여부
    **/
    isMoving : function() {
        return this._isControling;
    },

    /**
        애니메이션을 호출한다.
    **/
    _animate : function() {
        var self = this,
            oStep;
        if (this._isAnimating) {
            return;
        }
        if(!this._aAni.length) {
            this.restorePos(300);
            return;
        }
        // 동일할 경우가 아닐때 까지 큐에서 Step을 뺌.
        do {
            oStep = this._aAni.shift();
            if(!oStep) {
                return;
            }
        } while( oStep.nLeft == this._nLeft && oStep.nTop == this._nTop );
        if(oStep.nDuration == 0) {
            if (this.option("bUseTimingFunction")) {
                this._transitionTime(0);
            }
            this._setPos(oStep.nLeft, oStep.nTop);
            this._animate();
        } else {
            // this.start();
            this._isAnimating = true;
            // Transition을 이용한 animation
            if (this.option("bUseTimingFunction")) {
                this._transitionTime(oStep.nDuration);
                this._setPos(oStep.nLeft, oStep.nTop);
                this._isAnimating = false;
                jindo.m.attachTransitionEnd(this._htWElement["scroller"].$value(), this._htEvent["TransitionEnd"]);
            } else {
                // AnimationFrame을 이용한 animation
                self._startUpdater();
                var startTime = (new Date()).getTime(),
                    nStartLeft = this._nLeft, nStartTop = this._nTop;
                (function animate () {
                    var now = (new Date()).getTime(),nEaseOut;
                    if (now >= startTime + oStep.nDuration) {

                        // updater를 중지시키고, 바로 셋팅
                        self._stopUpdater();
                        self._setPos(oStep.nLeft, oStep.nTop);
                        self._isAnimating = false;
                        self._animate();
                        return;
                    }
                    now = (now - startTime) / oStep.nDuration - 1;
                    nEaseOut = Math.sqrt(1 - Math.pow(now,2));
                    // self._setPos((oStep.nLeft - nStartLeft) * nEaseOut + nStartLeft, (oStep.nTop - nStartTop) * nEaseOut + nStartTop);
                    
                    self._oMoveData = {
                        nLeft : (oStep.nLeft - nStartLeft) * nEaseOut + nStartLeft,
                        nTop : (oStep.nTop - nStartTop) * nEaseOut + nStartTop
                    };
                    if (self._isAnimating) {
                        self._htTimer["ani"] = requestAnimationFrame(animate);
                    }else{
                        self._stopUpdater();
                        // self._animate();
                    }
                })();
            }
        }
    },

    /**
        디바이스 회전시, 처리
        @param {jindo.$Event} we
    **/
    _onRotate : function(we) {
        this.refresh();
    },


    /**
        transition duration 지정
        @param {Nubmer} nDuration
    **/
    _transitionTime: function (nDuration) {
        nDuration += 'ms';
        this._htWElement["scroller"].css(this._p("TransitionDuration"), nDuration);
        if(this.option("bUseScrollbar")) {
            this._setScrollbarDuration(nDuration);
        }
    },

    _setScrollbarDuration : function(nDuration) {
        if (this.bUseHScroll && this._htWElement["HscrollbarIndicator"]) {
            this._htWElement["HscrollbarIndicator"].css(this._p("TransitionDuration"), nDuration);
        }
        if (this.bUseVScroll && this._htWElement["VscrollbarIndicator"]) {
            this._htWElement["VscrollbarIndicator"].css(this._p("TransitionDuration"), nDuration);
        }
    },

    /**
        Anchor 삭제. for iOS
    **/
    _clearAnchor : function() {
        // console.log("clear : " + !!this._aAnchor + " | " + this._bBlocked + " | " + this.isClickBug);
        if(this.isClickBug && this._aAnchor && !this._bBlocked) {
            var aClickAddEvent = null;
            for(var i=0, nILength=this._aAnchor.length; i<nILength; i++) {
                if(!this._aAnchor[i].___isClear___) {
                    if (this._fnDummyFnc !== this._aAnchor[i].onclick) {
                        this._aAnchor[i]._onclick = this._aAnchor[i].onclick;
                    }
                    this._aAnchor[i].onclick = this._fnDummyFnc;
                    this._aAnchor[i].___isClear___ = true;
                    aClickAddEvent = this._aAnchor[i].___listeners___ || [];
                    for(var j=0, nJLength = aClickAddEvent.length; j<nJLength; j++) {
                        ___Old__removeEventListener___.call(this._aAnchor[i], "click", aClickAddEvent[j].listener, aClickAddEvent[j].useCapture);
                    }
                }
            }
            this._bBlocked = true;
            // addConsole("삭제");
        }
    },

    /**
        Anchor 복원. for iOS
    **/
    _restoreAnchor : function() {
        //console.log("restore : " + this._aAnchor + " , " + this._bBlocked);
        if(this.isClickBug && this._aAnchor && this._bBlocked) {
            var aClickAddEvent = null;
            for(var i=0, nILength=this._aAnchor.length; i<nILength; i++) {
                if(this._aAnchor[i].___isClear___) {
                    if(this._fnDummyFnc !== this._aAnchor[i]._onclick) {
                        this._aAnchor[i].onclick = this._aAnchor[i]._onclick;
                    } else {
                        this._aAnchor[i].onclick = null;
                    }
                    this._aAnchor[i].___isClear___ = null;
                    aClickAddEvent = this._aAnchor[i].___listeners___ || [];
                    for(var j=0, nJLength = aClickAddEvent.length; j<nJLength; j++) {
                        ___Old__addEventListener___.call(this._aAnchor[i], "click", aClickAddEvent[j].listener, aClickAddEvent[j].useCapture);
                    }
                }
            }
            this._bBlocked = false;
        }
    },

    /**
        이동중 멈추는 기능. 이때 멈춘 위치의 포지션을 지정
    **/
    _stopScroll : function() {
        var htCssOffset = jindo.m.getTranslateOffset(this._htWElement["scroller"].$value()),
            htStyleOffset ={left : 0, top : 0}, nTop, nLeft;

        if(this.isPositionBug && this.bUseHighlight || !this.option("bUseTranslate")) {
            htStyleOffset = this.getStyleOffset(this._htWElement["scroller"]);
        }
        nLeft = htCssOffset.left + htStyleOffset.left;
        nTop = htCssOffset.top + htStyleOffset.top;
        if(!this.option("bUseFixedScrollbar")) {
            this._hideScrollBar("V");
            this._hideScrollBar("H");
        }
        if(parseInt(nLeft,10) !== parseInt(this._nLeft,10) || parseInt(nTop,10) !== parseInt(this._nTop,10)) {
        // console.log(nLeft + "," + this._nLeft + "|" + nTop + "," +this._nTop);
            this._stop();
            this._setPos(this.getPosLeft(nLeft), this.getPosTop(nTop));
            this._isControling = false;
            this._fireAfterScroll();
            this._fixPositionBug();
        } else {
            this._stopUpdater();
        }
    },

    /**
        Style의 left,top을 반환함
        @deprecated 
        @method getStyleOffset
        @param {jindo.$Element} wel
    **/
    getStyleOffset : function(wel) {
        var nLeft = parseInt(wel.css("left"),10),
            nTop = parseInt(wel.css("top"),10);
        nLeft = isNaN(nLeft) ? 0 : nLeft;
        nTop = isNaN(nTop) ? 0 : nTop;
        return {
            left : nLeft,
            top : nTop
        };
    },

    /**
        Boundary를 초과하지 않는 X (left) 포지션 반환
        @deprecated 
        @method getPosLeft
        @param {Number} nPos
    **/
    getPosLeft : function(nPos) {
        if(this.bUseHScroll) {
            return (nPos >= 0 ? 0 : (nPos <= this.nMaxScrollLeft ? this.nMaxScrollLeft : nPos) );
        } else {
            return 0;
        }
    },

    /**
        Boundary를 초과하지 않는 Y (top) 포지션 반환
        @deprecated 
        @method getPosTop
        @param {Number} nPos
    **/
    getPosTop : function(nPos) {
        if(this.bUseVScroll) {
            return (nPos >= this.nMinScrollTop ? this.nMinScrollTop : (nPos <= this.nMaxScrollTop ? this.nMaxScrollTop : nPos) );
        } else {
            return 0;
        }
    },

    /**
        scrollbar를 숨긴다
        @param {String} sDirect H,V 수평과 수직을 나타낸다.
    **/
    _hideScrollBar : function(sDirection) {
        if(!this._htWElement) { return; }
        var wel = this._htWElement[sDirection + "scrollbar"],
            bUseScroll = (sDirection === "H" ? this.bUseHScroll : this.bUseVScroll);
        if(bUseScroll && wel) {
            wel.hide();
            /* 갤럭시 S3인 경우 hide된 후 reflow가 발생하지 않으면 스크롤바가 사라지지 않는다. */
            wel.css("left",wel.css("left") + "px");
            if(this.isPositionBug && this.bUseHighlight) {
                this.makeStylePos(this._htWElement[sDirection + "scrollbarIndicator"]);
            }
        }
        
    },

    _fireAfterScroll : function() {
        if (this.option("bUseScrollbar")) {
            var self = this;
            this._htTimer["scrollbar"] = setTimeout(function(){
                if(!self.option("bUseFixedScrollbar")) {
                    self._hideScrollBar("V");
                    self._hideScrollBar("H");
                }
            }, this.option('nScrollbarHideThreshold'));
        }
        /**
            스크롤러 위치 변경이 최종적으로 끝났을 경우

            @event afterScroll
            @param {String} sType 커스텀 이벤트명
            @param {Number} nLeft Scroller의 left 값
            @param {Number} nTop Scroller의 top 값
            @param {Number} nMaxScrollLeft Scroller의 최대 left 값
            @param {Number} nMaxScrollTop Scroller의 최대 top 값
            @param {Function} stop 수행시 영향을 받는것이 없음
        **/
        this._fireEvent("afterScroll");
    },

    /**
        beforeScroll 사용자 이벤트 호출
    **/
    _fireEventbeforeScroll : function(htParam) {
           /**
            touchEnd시 스크롤인 경우, 스크롤러의 위치가 변경되기 전
            여기에서 넘어가는 파라미터를 변경시, 변경된 값이 스크롤러의 위치 변경에 영향을 미침

            @event beforeScroll
            @param {String} sType 커스텀 이벤트명
            @param {Number} nDistanceX touchStart의 X좌표와의 상대적인 거리.(touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
            @param {Number} nDistanceY touchStart의 Y좌표와의 상대적인 거리.(touchStart좌표에서 위쪽방향이면 양수, 아래쪽 방향이면 음수)
            @param {Number} nMomentumX 가속 발생 구간일 경우 현재 터치 움직임의 수평방향 운동에너지값,가속 구간이 아닐경우 0
            @param {Number} nMomentumY 가속 발생 구간일 경우 현재 터치 움직임의 수직방향 운동에너지값,가속 구간이 아닐경우 0
            @param {Number} nLeft Scroller의 left 값
            @param {Number} nTop Scroller의 top 값
            @param {Number} nNextLeft 가속 발생시, 변경될 scroller의 left값 (가속 미발생시, nLeft와 동일)
            @param {Number} nNextTop 가속 발생시, 변경될 scroller의 top값 (가속 미발생시, nTop와 동일)
            @param {Number} nTime 가속 발생시, 가속이 적용될 ms시간 (가속 미발생시, 0)
            @param {Function} stop 수행시 scroll 이벤트가 발생하지 않음
        **/
        return this.fireEvent("beforeScroll", htParam);
    },

    /**
        scroll 사용자 이벤트 호출
    **/
    _fireEventScroll : function(htParam) {
        /**
            touchEnd시 스크롤인 경우, 스크롤러의 위치가 변경된 후
            여기에서 넘어가는 파라미터를 변경시, 변경된 값이 스크롤러의 위치 변경에 영향을 미침

            @event scroll
            @param {String} sType 커스텀 이벤트명
            @param {Number} nDistanceX touchStart의 X좌표와의 상대적인 거리.(touchStart좌표에서 오른쪽방향이면 양수, 왼쪽 방향이면 음수)
            @param {Number} nDistanceY touchStart의 Y좌표와의 상대적인 거리.(touchStart좌표에서 위쪽방향이면 양수, 아래쪽 방향이면 음수)
            @param {Number} nMomentumX 가속 발생 구간일 경우 현재 터치 움직임의 수평방향 운동에너지값,가속 구간이 아닐경우 0
            @param {Number} nMomentumY 가속 발생 구간일 경우 현재 터치 움직임의 수직방향 운동에너지값,가속 구간이 아닐경우 0
            @param {Number} nLeft Scroller의 left 값
            @param {Number} nTop Scroller의 top 값
            @param {Number} nNextLeft 가속 발생시, 변경될 scroller의 left값 (가속 미발생시, nLeft와 동일)
            @param {Number} nNextTop 가속 발생시, 변경될 scroller의 top값 (가속 미발생시, nTop와 동일)
            @param {Number} nTime 가속 발생시, 가속이 적용될 ms시간 (가속 미발생시, 0)
            @param {Function} stop 수행시 영향을 받는것이 없음
        **/
        this.fireEvent("scroll", htParam);
    },

    /**
        범용 사용자 이벤트 호출
    **/
    _fireEvent : function(sType) {
        return this.fireEvent(sType, this._getNowPosition());
    },

    /**
        범용 touch 사용자 이벤트
    **/
    _fireTouchEvent : function(sType, we) {
        return this.fireEvent(sType, this._getNowPosition(we));
    },
    
    /**
     * 공통 현재 위치 정보 return 처리
     */
    _getNowPosition : function(we) {
        return {
            nLeft : this._nLeft,
            nTop : this._nTop,
            nMaxScrollLeft : this.nMaxScrollLeft,
            nMaxScrollTop : this.nMaxScrollTop,
            oEvent : we || {}
        };
    },

     /**
        pullDown 사용여부를 지정할수 있습니다.

        @method setUsePullDown
        @param {Boolean} bUse
    **/
    setUsePullDown : function(bUse) {
        if(this._isUse("pull")) {
            this.option("bUsePullDown", bUse);
            this.refresh();
        }
    },

    /**
        pullUp 사용여부를 지정할 수 있습니다.

        @method setUsePullUp
        @param {Boolean} bUse
    **/
    setUsePullUp : function(bUse) {
        if(this._isUse("pull")) {
            this.option("bUsePullUp", bUse);
            this.refresh();
        }
    },

    _onUpdater : function(we) {
        // if(this._isActivateUpdater) {
        // console.debug("updater...");
        if(this._oMoveData.nLeft != this._nLeft || this._oMoveData.nTop != this._nTop) {
            // console.log("updating",this._oMoveData.nTop, this._nTop, this._oMoveData.nLeft ,this._nLeft );
            this._setPos(this._oMoveData.nLeft, this._oMoveData.nTop);
        }
        // }
        this._startUpdater();
    },

    _startUpdater : function() {
        this._stopUpdater();
        this._nUpdater = window.requestAnimationFrame(this._htEvent["updater"]);
        // console.debug("start-updater");
    },

    _stopUpdater : function() {
        window.cancelAnimationFrame(this._nUpdater);
        this._nUpdater = -1;
        // console.debug("stop-updater");
    },

    /**
        Touchstart시점 이벤트 핸들러
        @param {jindo.$Event} we
    **/
    _onStart : function(we) {
        // console.log  ("touchstart (" + we.nX + "," + we.nY + ") this._isAnimating " + this._isAnimating);
        this._clearPositionBug();
        /**
            touchStart 내부 스크롤로직이 실행되기 전

            @event beforeTouchStart
            @param {String} sType 커스텀 이벤트명
            @param {Number} nLeft Scroller의 left 값
            @param {Number} nTop Scroller의 top 값
            @param {Number} nMaxScrollLeft Scroller의 최대 left 값
            @param {Number} nMaxScrollTop Scroller의 최대 top 값
            @param {jindo.$Event} oEvent touchStart 이벤트 객체
            @param {Function} stop 수행시 touchStart 이벤트가 발생하지 않음
        **/
        if(this._fireTouchEvent("beforeTouchStart",we)) {
            this._clearAnchor();
            this._isAnimating = false;
            this._isControling = true;
            this._isStop = false;
            if (this.option("bUseTimingFunction")) {
                this._transitionTime(0);
            }
            // 이동중 멈추었을 경우
            this._stopScroll();
            /**
                touchStart 내부 스크롤로직이 실행된 후

                @event touchStart
                @param {String} sType 커스텀 이벤트명
                @param {Number} nLeft Scroller의 left 값
                @param {Number} nTop Scroller의 top 값
                @param {Number} nMaxScrollLeft Scroller의 최대 left 값
                @param {Number} nMaxScrollTop Scroller의 최대 top 값
                @param {jindo.$Event} oEvent touchStart 이벤트 객체
                @param {Function} stop 수행시 영향을 받는것이 없음
            **/
            if(!this._fireTouchEvent("touchStart",we)) {
                we.stop();
            }
        } else {
            we.stop();
        }
    },

    /**
        이동시점 이벤트 핸들러
        @param {jindo.$Event} we
    **/
    _onMove : function(we) {
        var nNewLeft=0, nNewTop =0;
        this._clearTouchEnd();
        this._clearPositionBug();
        // console.log("touchmove (" + we.nX + "," + we.nY + "), Vector (" + we.nVectorX + "," + we.nVectorY + ") sMoveType : " + we.sMoveType);
        /**
            touchMove 내부 스크롤로직이 실행되기 전

            @event beforeTouchMove
            @param {String} sType 커스텀 이벤트명
            @param {Number} nLeft Scroller의 left 값
            @param {Number} nTop Scroller의 top 값
            @param {Number} nMaxScrollLeft Scroller의 최대 left 값
            @param {Number} nMaxScrollTop Scroller의 최대 top 값
            @param {jindo.$Event} oEvent touchMove  이벤트 객체
            @param {Function} stop 수행시 move 이벤트가 발생하지 않음
        **/
        if (this._fireTouchEvent("beforeTouchMove",we)) {
            if(this._isUse("pull")) {
                this._inst("pull").touchMoveForUpdate(we, this.nMaxScrollTop);
            }
            /** 시스템 스크롤 막기 */
            var weParent = we.oEvent;
            if(we.sMoveType === jindo.m.MOVETYPE[0]) {  //수평이고, 수평스크롤인 경우 시스템 스크롤 막기
                if(this.bUseHScroll) {
                    if( !this.option("bUseBounce") && ( (this._nLeft >= 0 && we.nVectorX > 0) || (this._nLeft <= this.nMaxScrollLeft && we.nVectorX < 0) )  ) {
                        this._forceRestore(we);
                        return;
                    } else {
                        weParent.stop(jindo.$Event.CANCEL_ALL);
                    }
                } else {
                    return true;
                }
            } else if(we.sMoveType === jindo.m.MOVETYPE[1]) {   //수직이고, 수직스크롤인 경우 시스템 스크롤 막기
                if(this.bUseVScroll) {
                    if( !this.option("bUseBounce") && ( (this._nTop >= this.nMinScrollTop && we.nVectorY > 0) || (this._nTop <= this.nMaxScrollTop && we.nVectorY < 0) )  ) {
                        this._forceRestore(we);
                        return;
                    } else {
                        weParent.stop(jindo.$Event.CANCEL_ALL);
                    }
                } else {
                    return true;
                }
            } else if(we.sMoveType === jindo.m.MOVETYPE[2]) {   //대각선일 경우, 시스템 스크롤 막기
                if(this.option('bUseDiagonalTouch')){
                    weParent.stop(jindo.$Event.CANCEL_ALL);
                } else{
                    return;
                }
            } else {    // 탭, 롱탭인 경우, 다 막기
                weParent.stop(jindo.$Event.CANCEL_ALL);
                return true;
            }
            
            if(this.option("bUseBounce")) {
                if(this.bUseHScroll) {
                    nNewLeft = this._nLeft + (this._nLeft >=0 || this._nLeft <= this.nMaxScrollLeft ? we.nVectorX/2 : we.nVectorX);
                }
                if(this.bUseVScroll) {
                    nNewTop = this._nTop + (this._nTop >= this.nMinScrollTop || this._nTop <= this.nMaxScrollTop ? we.nVectorY/2 : we.nVectorY);
                }
                /** 갤럭시S3에서는 상단영역을 벗어나면 touchEnd가 발생하지 않음
                 * 상단영역 30이하로 잡힐 경우 복원
                 */
                var self=this;
                this._htTimer["touch"] = setTimeout(function() {
                    self._forceRestore(we);
                },500);
            } else {
                nNewLeft = this.getPosLeft(this._nLeft + we.nVectorX);
                nNewTop = this.getPosTop(this._nTop + we.nVectorY);
            }
            this._setPos(nNewLeft, nNewTop);
            /**
                touchMove 내부 스크롤로직이 실행된 후

                @event touchMove
                @param {String} sType 커스텀 이벤트명
                @param {Number} nLeft Scroller의 left 값
                @param {Number} nTop Scroller의 top 값
                @param {Number} nMaxScrollLeft Scroller의 최대 left 값
                @param {Number} nMaxScrollTop Scroller의 최대 top 값
                @param {jindo.$Event} oEvent touchMove  이벤트 객체
                @param {Function} stop 수행시 영향을 받는것이 없음
            **/
           
            if(!this._fireTouchEvent("touchMove",we)) {
                we.stop();
            }

        } else {
            we.stop();
        }
    },


    /**
        Touchend 시점 이벤트 핸들러
        @param {jindo.$Event} we
    **/
    _onEnd : function(we) {
        // console.log("touchend [" + we.sMoveType + "](" + we.nX + "," + we.nY + "), Vector(" + we.nVectorX + "," + we.nVectorY + "), MomentumY : "+ we.nMomentumY + ", speedY : " + we.nSpeedY);
        // addConsole("OnEndProcess");
        /**
            touchEnd 내부 스크롤로직이 실행되기 전

            @event beforeTouchEnd
            @param {String} sType 커스텀 이벤트명
            @param {Number} nLeft Scroller의 left 값
            @param {Number} nTop Scroller의 top 값
            @param {Number} nMaxScrollLeft Scroller의 최대 left 값
            @param {Number} nMaxScrollTop Scroller의 최대 top 값
            @param {jindo.$Event} oEvent touchEnd 이벤트 객체
            @param {Function} stop 수행시 touchEnd 이벤트가 발생하지 않음
        **/

        if(this._isUse("pull")){
            this._inst("pull").pullUploading();
        }

        if (this._fireTouchEvent("beforeTouchEnd",we)) {
            this._clearPositionBug();
            this._clearTouchEnd();
            // addConsole("end : " + we.sMoveType);
            // 1) 스크롤인 경우
            if (we.sMoveType === jindo.m.MOVETYPE[0] || we.sMoveType === jindo.m.MOVETYPE[1] || we.sMoveType === jindo.m.MOVETYPE[2]) {
                this._endForScroll(we);
                if(this.isClickBug || this.nVersion < 4.1) {
                    we.oEvent.stop(jindo.$Event.CANCEL_DEFAULT);
                }
            } else {    // 2) 스크롤이 아닌 경우
                // 클릭 이후 페이지 뒤로 돌아왔을 경우, 문제가됨. 동작중인 상태를 초기화함
                this._isControling = false;
                if (!this._isStop) {
                    if(this.bUseHighlight) {
                        this._restoreAnchor();
                    }
                }
            }
            /**
                touchEnd 내부 스크롤로직이 실행된 직후

                @event touchEnd
                @param {String} sType 커스텀 이벤트명
                @param {Number} nLeft Scroller의 left 값
                @param {Number} nTop Scroller의 top 값
                @param {Number} nMaxScrollLeft Scroller의 최대 left 값
                @param {Number} nMaxScrollTop Scroller의 최대 top 값
                @param {jindo.$Event} oEvent touchEnd 이벤트 객체
                @param {Function} 수행시 영향 받는것 없음.
            **/
            if(!this._fireTouchEvent("touchEnd",we)) {
                we.stop();
            }
        } else {
            we.stop();
        }
    },


    /**
        스크롤을 강제로 복귀한다.
        @param  {jindo.$Event} we 이벤트
    **/
    _forceRestore : function(we) {
        we.nMomentumX = we.nMomentumY = null;
        this._endForScroll(we);
        this._clearPositionBug();
        this._clearTouchEnd();
    },

    /**
        touchEnd 시점 스크롤 처리
        @param {jindo.$Event} we
    **/
    _endForScroll : function(we) {
        clearTimeout(this._nFixedDubbleEndBugTimer);

        var htMomentumX = { nDist:0, nTime:0 },
            htMomentumY = { nDist:0, nTime:0 },
            htParam = {
                nMomentumX : we.nMomentumX,
                nMomentumY : we.nMomentumY,
                nDistanceX : we.nDistanceX,
                nDistanceY : we.nDistanceY,
                nLeft : this._nLeft,
                nTop : this._nTop
            };
        if (this.option("bUseMomentum") && (we.nMomentumX || we.nMomentumY) ) {
            if (this.bUseHScroll) {
                htMomentumX = this._getMomentum(-we.nDistanceX, we.nSpeedX, we.nMomentumX, this.nWrapperW, -this._nLeft, -this.nMaxScrollLeft + this._nLeft);
            }
            if (this.bUseVScroll) {
                htMomentumY = this._getMomentum(-we.nDistanceY, we.nSpeedY, we.nMomentumY, this.nWrapperH, -this._nTop, -this.nMaxScrollTop + this._nTop);
            }
            htParam.nNextLeft = this._nLeft + htMomentumX.nDist;
            htParam.nNextTop = this._nTop + htMomentumY.nDist;
            htParam.nTime = Math.max(Math.max(htMomentumX.nTime, htMomentumY.nTime),10);
            if (this._fireEventbeforeScroll(htParam)) {
                if(this.option("bUseBounce")) {
                    this._scrollTo(htParam.nNextLeft, htParam.nNextTop, htParam.nTime);
                } else {
                    this._scrollTo(this.getPosLeft(htParam.nNextLeft), this.getPosTop(htParam.nNextTop), htParam.nTime);
                }
                this._fireEventScroll(htParam);
            }
        } else {
            htParam.nNextLeft = this._nLeft;
            htParam.nNextTop = this._nTop;
            htParam.nTime = 0;
            if (this._fireEventbeforeScroll(htParam)) {
                if( this._nLeft !== htParam.nNextLeft || this._nTop !== htParam.nNextTop ) {
                    this._scrollTo(htParam.nNextLeft, htParam.nNextTop, htParam.nTime);
                } else {
                    this.restorePos(300);
                }
                this._fireEventScroll(htParam);
            }
        }
    },

    /**
        TransitionEnd 이벤트 핸들러
        @param {jindo.$Event} we
    **/
    _onTransitionEnd : function(we) {
        jindo.m.detachTransitionEnd(this._htWElement["scroller"].$value(), this._htEvent["TransitionEnd"]);
        this._animate();
    },

    /**
        스크롤 도중 scroll 영역 바깥을 선택하였을시, 스크롤을 중지시킴
        @param {jindo.$Event} we
    **/
    _onDocumentStart : function(we) {
        if(this._htWElement["wrapper"].visible()) {
            if(this._htWElement["wrapper"].isChildOf(we.element)) {
                return true;
            } else {
                // 전체 스크롤 사용시 막음
                if(this.isMoving()) {
                    this._stopScroll();
                }
            }
        }
    },

    /**
        jindo.m.Scroll 컴포넌트를 활성화한다.
        activate 실행시 호출됨
    **/
    _onActivate : function() {
        if(!this._oTouch) {
            this._oTouch = new jindo.m.Touch(this._htWElement["wrapper"].$value(), {
                nMoveThreshold : 0,
                nMomentumDuration : (jindo.m.getDeviceInfo().android ? 500 : 200),
                nTapThreshold : 1,
                nSlopeThreshold : 5,
                nEndEventThreshold : (jindo.m.getDeviceInfo().win8 ? 100 : 0),
                bHorizental : this.option("bUseHScroll"),
                bVertical : this.option("bUseVScroll")
            });
        } else {
            this._oTouch.activate();
        }
        this._attachEvent();
        this.refresh();
    },

    /**
        jindo.m.Scroll 컴포넌트를 비활성화한다.
        deactivate 실행시 호출됨
    **/
    _onDeactivate : function() {
        this._detachEvent();
        this._oTouch.deactivate();
    },

    /**
        jindo.m.Scroll 에서 사용하는 모든 이벤트를 바인드한다.
    **/
    _attachEvent : function() {
        this._htEvent = {};
        /* Touch 이벤트용 */
        this._htEvent["touchStart"] = jindo.$Fn(this._onStart, this).bind();
        this._htEvent["touchMove"] = jindo.$Fn(this._onMove, this).bind();
        this._htEvent["touchEnd"] = jindo.$Fn(this._onEnd, this).bind();
        this._htEvent["TransitionEnd"] = jindo.$Fn(this._onTransitionEnd, this).bind();
        this._htEvent["document"] = jindo.$Fn(this._onDocumentStart, this).attach(document, "touchstart");
        this._oTouch.attach({
            touchStart : this._htEvent["touchStart"],
            touchMove : this._htEvent["touchMove"],
            touchEnd :  this._htEvent["touchEnd"]
        });
        if(this.option("bAutoResize")) {
            this._htEvent["rotate"] = jindo.$Fn(this._onRotate, this).bind();
            jindo.m.bindRotate(this._htEvent["rotate"]);
        }

        if(!this.option("bUseTimingFunction")) {
            this._htEvent["updater"] = jindo.$Fn(this._onUpdater, this).bind();
        }
    },

    /**
        안드로이드 계열 버그
        css3로 스타일 변경 후, 하이라이트안되는 문제
        [해결법] transition관련 property를 null로 처리
     *       offset 변경
     *       a tag focus 하면 됨
    **/
    _fixPositionBug : function() {
        if(this.isPositionBug && this.bUseHighlight && this.option("bUseTranslate")) {
            var self = this;
            this._clearPositionBug();
            this._htTimer["fixed"] = setTimeout(function() {
                if(self._htWElement && self._htWElement["scroller"]) {
                    self.makeStylePos(self._htWElement["scroller"]);
                    if(self.nVersion < 3) {
                        self._elDummyTag.focus();
                    }
                }
            }, 200);
        }
        // this.end();
    },

    /**
        translate의 포지션을 스타일로 바꾼다.
        @deprecated 
        @method makeStylePos
        @param {jindo.$Element} wel
    **/
    makeStylePos : function(wel) {
        var ele = wel.$value();
        var htCssOffset = jindo.m.getTranslateOffset(ele);
        var htScrollOffset = wel.offset();
        if(this.nVersion >= 4) {
            ele.style[this._p("Transform")] = "translate" + this.sTranOpen + "0px, 0px" + this.sTranEnd;
        } else {
            ele.style[this._p("Transform")] = null;
        }
        ele.style[this._p("TransitionDuration")] = null;
        //alert(htCssOffset.top + " , " + htCssOffset.left + " --- " + htScrollOffset.top + " , " + htScrollOffset.left);
        wel.offset(htCssOffset.top + htScrollOffset.top, htCssOffset.left + htScrollOffset.left);
    },

    /**
        android인 경우, 버그수정 timer를 제거
    **/
    _clearPositionBug : function() {
        if(this.isPositionBug && this.bUseHighlight) {
            clearTimeout(this._htTimer["fixed"]);
            this._htTimer["fixed"] = -1;
        }
    },

    _clearTouchEnd : function() {
        clearTimeout(this._htTimer["touch"]);
        this._htTimer["touch"] = -1;
    },

    /**
        jindo.m.Scroll 에서 사용하는 모든 이벤트를 해제한다.
    **/
    _detachEvent : function() {
        jindo.m.detachTransitionEnd(this._htWElement["scroller"].$value(), this._htEvent["TransitionEnd"]);
        this._htEvent["document"].detach(document,"touchstart");

        if(this.option("bAutoResize")) {
            jindo.m.unbindRotate(this._htEvent["rotate"]);
        }

        this._oTouch.detachAll();
        if (this._elDummyTag) {
            this._htWElement["scroller"].remove(this._elDummyTag);
        }
        if(!this.option("bUseTimingFunction")) {
            this._stopUpdater();
        }
    },


    /**
        스크롤바를 생성한다.
        @param {String} sDirection 수평, 수직 방향
    **/
    _createScroll : function(sDirection) {
        if( !(sDirection === "H" ? this.bUseHScroll : this.bUseVScroll) ) {
            return;
        }
        var welScrollbar = this._htWElement[sDirection + "scrollbar"],
            welScrollbarIndicator = this._htWElement[sDirection + "scrollbarIndicator"],
            welWrapper = this._htWElement["wrapper"];

        // 기존에 존재하면 삭제
        if(welScrollbar) {
            welWrapper.remove(welScrollbar);
            this._htWElement[sDirection + "scrollbar"] = this._htWElement[sDirection + "scrollbarIndicator"] = null;
        }

        // scrollbar $Element 생성
        welScrollbar = this._createScrollbar(sDirection);
        welScrollbarIndicator = this._createScrollbarIndicator(sDirection);
        this._htWElement[sDirection + "scrollbar"]= welScrollbar;
        this._htWElement[sDirection + "scrollbarIndicator"] = welScrollbarIndicator;
        welScrollbar.append(welScrollbarIndicator);
        welWrapper.append(welScrollbar);
        // scrollbar 갱신
        // this._refreshScroll(sDirection);
    },

    /**
        스크롤바 Wrapper를 생성한다
        @param {String} sDirection
    **/
    _createScrollbar : function(sDirection) {
        var welScrollbar = jindo.$Element("<div>");
        welScrollbar.css({
            "position" : "absolute",
            "zIndex" : 100,
            "bottom" : (sDirection === "H" ? "1px" : (this.bUseHScroll ? '7' : '2') + "px"),
            "right" : (sDirection === "H" ? (this.bUseVScroll ? '7' : '2') + "px" : "1px"),
            "pointerEvents" : "none"
            // "overflow" : "hidden"
        });
        if(this.option("bUseFixedScrollbar")) {
            welScrollbar.show();
        } else {
            welScrollbar.hide();
        }
        if (sDirection === "H") {
            welScrollbar.css({
                height: "5px",
                left: "2px"
            });
        } else {
            welScrollbar.css({
                width: "5px",
                top: "2px"
            });
        }
        return welScrollbar;
    },

    /**
        스크롤바 Indicator를 생성한다.
        @param {String} sDirection
    **/
    _createScrollbarIndicator : function(sDirection) {
        // scrollbar Indivator 생성
        var welScrollbarIndicator = jindo.$Element("<div>").css({
            "position" : "absolute",
            "zIndex" : 100,
            "border": this.option("sScrollbarBorder"),
            "pointerEvents" : "none",
            "left" : 0,
            "top" : 0,
            "backgroundColor" : this.option("sScrollbarColor")});
        if(jindo.m.getOsInfo().ios && this.option('bUseScrollBarRadius')) {
            welScrollbarIndicator.css(this._p("BorderRadius"), "12px");
        }
        if(this.option("bUseTranslate") || this.option("bUseCss3d")) {
            welScrollbarIndicator.css(this._p("TransitionProperty"), this.sCssPrefix == "" ? "transform" : "-" + this.sCssPrefix + "-transform")
                .css(this._p("Transform"), "translate" + this.sTransOpen + "0,0" + this.sTransEnd);
        }
        if(this.option("bUseTimingFunction")) {
            welScrollbarIndicator.css(this._p("TransitionTimingFunction"), "cubic-bezier(0.33,0.66,0.66,1)");
        }
        if(sDirection === "H") {
            welScrollbarIndicator.height(5);
        } else {
            welScrollbarIndicator.width(5);
        }
        return  welScrollbarIndicator;
    },

    /**
        스크롤 바의 상태를 갱신한다.
        @param {String} sDirection 수평, 수직 방향
    **/
    _refreshScroll : function(sDirection) {
        // 스크롤이 사용 불가하거나, 사이즈가 동일한 경우는 스크롤바를 생성하지 않는다.
        if(sDirection === "H") {
            if(!this.bUseHScroll || this.nWrapperW == this.nScrollW) {
                return;
            }
        } else {
            if(!this.bUseVScroll || this.nWrapperH == this.nScrollH) {
                return;
            }
        }
        // 스크롤바가 존재하지 않을 경우 새로 생성함
        if(!this._htWElement[sDirection + "scrollbar"]) {
            this._createScroll(sDirection);
        }
        var welScrollbar = this._htWElement[sDirection + "scrollbar"],
            welScrollbarIndicator = this._htWElement[sDirection + "scrollbarIndicator"],
            nSize = 0;
        if(sDirection === "H" ) {
            nSize = Math.max(Math.round(Math.pow(this.nWrapperW,2) / this.nScrollW), 8);
            this._nPropHScroll = (this.nWrapperW - nSize) / this.nMaxScrollLeft;
            welScrollbar.width(this.nWrapperW);
            welScrollbarIndicator.width(isNaN(nSize) ? 0 : nSize);
        } else {
            nSize = Math.max(Math.round(Math.pow(this.nWrapperH,2) / this.nScrollH), 8);
            this._nPropVScroll = (this.nWrapperH - nSize) / this.nMaxScrollTop;
            welScrollbar.height(this.nWrapperH);
            welScrollbarIndicator.height(isNaN(nSize) ? 0 : nSize);
        }
    },

    _setScrollBarPos: function (sDirection, nPos) {
        if(!(sDirection === "H" ? this.bUseHScroll : this.bUseVScroll)) {
            return;
        }
        var welIndicator = this._htWElement[sDirection + "scrollbarIndicator"],
            welScrollbar = this._htWElement[sDirection + "scrollbar"];

        // indicator, scrollbar가 존재하지 않을 경우
        if(!welIndicator || !welScrollbar) {
            return;
        }

        nPos = this["_nProp" + sDirection + 'Scroll'] * nPos;
        if(!this.option("bUseFixedScrollbar") && welScrollbar && !welScrollbar.visible()) {
            welScrollbar.show();

            // timingfunction으로 이동시 랜더링을 재갱신하면 애니메이션이 동작한다.
            if(this.option("bUseTimingFunction")) {
                welScrollbar.$value().clientHeight;
            }
        }
        if(welIndicator) {
            if(this.option("bUseTranslate")) {
                if (this.isPositionBug && this.bUseHighlight)  {
                    var nBufferPos = parseInt( ( sDirection === "H" ? welIndicator.css("left") : welIndicator.css("top") ), 10);
                    nPos -= isNaN(nBufferPos) ? 0 : nBufferPos;
                }
                welIndicator.css(this._p("Transform"), "translate" + this.sTranOpen + (sDirection === "H" ? nPos + "px,0" : "0," + nPos + "px") + this.sTranEnd);
            } else {
                if(sDirection === "H") {
                    welIndicator.css("left", nPos + "px");
                } else {
                    welIndicator.css("top", nPos + "px");
                }
            }
        }
    },

    /** Temporary **/
    /** FPS 확인 Start **/
    // start : function() {
    //     this._nCount = 0;
    //     this._nElapse = 0;
    //     this._nStart = Date.now();
    //     this._aData = [];
    // },

    // _fps : function() {
    //     if (this._nElapse > 300) {
    //         var cur = this._nCount / (this._nElapse / 1000);
    //         this._aData.push(cur);
    //         var nSum = 0;
    //         for(var i=0, nLength = this._aData.length; i< nLength; i++) {
    //              nSum += this._aData[i];
    //         }
    //         var o = {
    //             cur: cur,
    //             max: Math.max.apply(null, this._aData),
    //             min: Math.min.apply(null, this._aData),
    //             avg : nSum / this._aData.length
    //         };
    //         console.log("FPS current : " + o.cur + ", max : " + o.max + ", min : " + o.min + ", avg : " + o.avg);
    //         return o;
    //     }
    // },

    // end : function() {
    //     return this._fps();
    // },

    // tick : function() {
    //     var now = Date.now();
    //     this._nCount++;
    //     this._nElapse = Date.now() - this._nStart;
    //     return this._fps();
    // },
    /** FPS 확인 End **/

    /**
        jindo.m.Scroll 에서 사용하는 모든 객체를 release 시킨다.
        @method destroy
    **/
    destroy: function() {
        this.deactivate();
        for(var p in this._htWElement) {
            this._htWElement[p] = null;
        }
        this._htWElement = null;
        this._oTouch.destroy();
        delete this._oTouch;
    }
}).extend(jindo.m.UIComponent);