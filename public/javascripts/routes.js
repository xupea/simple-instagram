!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.page=e()}}(function(){var define,module,exports;return(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){(function(process){'use strict';var pathtoRegexp=require('path-to-regexp');module.exports=page;var clickEvent=('undefined'!==typeof document)&&document.ontouchstart?'touchstart':'click';var location=('undefined'!==typeof window)&&(window.history.location||window.location);var dispatch=true;var decodeURLComponents=true;var base='';var running;var hashbang=false;var prevContext;function page(path,fn){if('function'===typeof path){return page('*',path);}
if('function'===typeof fn){var route=new Route(path);for(var i=1;i<arguments.length;++i){page.callbacks.push(route.middleware(arguments[i]));}}else if('string'===typeof path){page['string'===typeof fn?'redirect':'show'](path,fn);}else{page.start(path);}}
page.callbacks=[];page.exits=[];page.current='';page.len=0;page.base=function(path){if(0===arguments.length)return base;base=path;};page.start=function(options){options=options||{};if(running)return;running=true;if(false===options.dispatch)dispatch=false;if(false===options.decodeURLComponents)decodeURLComponents=false;if(false!==options.popstate)window.addEventListener('popstate',onpopstate,false);if(false!==options.click){document.addEventListener(clickEvent,onclick,false);}
if(true===options.hashbang)hashbang=true;if(!dispatch)return;var url=(hashbang&&~location.hash.indexOf('#!'))?location.hash.substr(2)+location.search:location.pathname+location.search+location.hash;page.replace(url,null,true,dispatch);};page.stop=function(){if(!running)return;page.current='';page.len=0;running=false;document.removeEventListener(clickEvent,onclick,false);window.removeEventListener('popstate',onpopstate,false);};page.show=function(path,state,dispatch,push){var ctx=new Context(path,state);page.current=ctx.path;if(false!==dispatch)page.dispatch(ctx);if(false!==ctx.handled&&false!==push)ctx.pushState();return ctx;};page.back=function(path,state){if(page.len>0){history.back();page.len--;}else if(path){setTimeout(function(){page.show(path,state);});}else{setTimeout(function(){page.show(base,state);});}};page.redirect=function(from,to){if('string'===typeof from&&'string'===typeof to){page(from,function(e){setTimeout(function(){page.replace(to);},0);});}
if('string'===typeof from&&'undefined'===typeof to){setTimeout(function(){page.replace(from);},0);}};page.replace=function(path,state,init,dispatch){var ctx=new Context(path,state);page.current=ctx.path;ctx.init=init;ctx.save();if(false!==dispatch)page.dispatch(ctx);return ctx;};page.dispatch=function(ctx){var prev=prevContext,i=0,j=0;prevContext=ctx;function nextExit(){var fn=page.exits[j++];if(!fn)return nextEnter();fn(prev,nextExit);}
function nextEnter(){var fn=page.callbacks[i++];if(ctx.path!==page.current){ctx.handled=false;return;}
if(!fn)return unhandled(ctx);fn(ctx,nextEnter);}
if(prev){nextExit();}else{nextEnter();}};function unhandled(ctx){if(ctx.handled)return;var current;if(hashbang){current=base+location.hash.replace('#!','');}else{current=location.pathname+location.search;}
if(current===ctx.canonicalPath)return;page.stop();ctx.handled=false;location.href=ctx.canonicalPath;}
page.exit=function(path,fn){if(typeof path==='function'){return page.exit('*',path);}
var route=new Route(path);for(var i=1;i<arguments.length;++i){page.exits.push(route.middleware(arguments[i]));}};function decodeURLEncodedURIComponent(val){if(typeof val!=='string'){return val;}
return decodeURLComponents?decodeURIComponent(val.replace(/\+/g,' ')):val;}
function Context(path,state){if('/'===path[0]&&0!==path.indexOf(base))path=base+(hashbang?'#!':'')+path;var i=path.indexOf('?');this.canonicalPath=path;this.path=path.replace(base,'')||'/';if(hashbang)this.path=this.path.replace('#!','')||'/';this.title=document.title;this.state=state||{};this.state.path=path;this.querystring=~i?decodeURLEncodedURIComponent(path.slice(i+1)):'';this.pathname=decodeURLEncodedURIComponent(~i?path.slice(0,i):path);this.params={};this.hash='';if(!hashbang){if(!~this.path.indexOf('#'))return;var parts=this.path.split('#');this.path=parts[0];this.hash=decodeURLEncodedURIComponent(parts[1])||'';this.querystring=this.querystring.split('#')[0];}}
page.Context=Context;Context.prototype.pushState=function(){page.len++;history.pushState(this.state,this.title,hashbang&&this.path!=='/'?'#!'+this.path:this.canonicalPath);};Context.prototype.save=function(){history.replaceState(this.state,this.title,hashbang&&this.path!=='/'?'#!'+this.path:this.canonicalPath);};function Route(path,options){options=options||{};this.path=(path==='*')?'(.*)':path;this.method='GET';this.regexp=pathtoRegexp(this.path,this.keys=[],options.sensitive,options.strict);}
page.Route=Route;Route.prototype.middleware=function(fn){var self=this;return function(ctx,next){if(self.match(ctx.path,ctx.params))return fn(ctx,next);next();};};Route.prototype.match=function(path,params){var keys=this.keys,qsIndex=path.indexOf('?'),pathname=~qsIndex?path.slice(0,qsIndex):path,m=this.regexp.exec(decodeURIComponent(pathname));if(!m)return false;for(var i=1,len=m.length;i<len;++i){var key=keys[i-1];var val=decodeURLEncodedURIComponent(m[i]);if(val!==undefined||!(hasOwnProperty.call(params,key.name))){params[key.name]=val;}}
return true;};var onpopstate=(function(){var loaded=false;if('undefined'===typeof window){return;}
if(document.readyState==='complete'){loaded=true;}else{window.addEventListener('load',function(){setTimeout(function(){loaded=true;},0);});}
return function onpopstate(e){if(!loaded)return;if(e.state){var path=e.state.path;page.replace(path,e.state);}else{page.show(location.pathname+location.hash,undefined,undefined,false);}};})();function onclick(e){if(1!==which(e))return;if(e.metaKey||e.ctrlKey||e.shiftKey)return;if(e.defaultPrevented)return;var el=e.target;while(el&&'A'!==el.nodeName)el=el.parentNode;if(!el||'A'!==el.nodeName)return;if(el.hasAttribute('download')||el.getAttribute('rel')==='external')return;var link=el.getAttribute('href');if(!hashbang&&el.pathname===location.pathname&&(el.hash||'#'===link))return;if(link&&link.indexOf('mailto:')>-1)return;if(el.target)return;if(!sameOrigin(el.href))return;var path=el.pathname+el.search+(el.hash||'');if(typeof process!=='undefined'&&path.match(/^\/[a-zA-Z]:\//)){path=path.replace(/^\/[a-zA-Z]:\//,'/');}
var orig=path;if(path.indexOf(base)===0){path=path.substr(base.length);}
if(hashbang)path=path.replace('#!','');if(base&&orig===path)return;e.preventDefault();page.show(orig);}
function which(e){e=e||window.event;return null===e.which?e.button:e.which;}
function sameOrigin(href){var origin=location.protocol+'//'+location.hostname;if(location.port)origin+=':'+location.port;return(href&&(0===href.indexOf(origin)));}
page.sameOrigin=sameOrigin;}).call(this,require('_process'))},{"_process":2,"path-to-regexp":3}],2:[function(require,module,exports){var process=module.exports={};process.nextTick=(function(){var canSetImmediate=typeof window!=='undefined'&&window.setImmediate;var canMutationObserver=typeof window!=='undefined'&&window.MutationObserver;var canPost=typeof window!=='undefined'&&window.postMessage&&window.addEventListener;if(canSetImmediate){return function(f){return window.setImmediate(f)};}
var queue=[];if(canMutationObserver){var hiddenDiv=document.createElement("div");var observer=new MutationObserver(function(){var queueList=queue.slice();queue.length=0;queueList.forEach(function(fn){fn();});});observer.observe(hiddenDiv,{attributes:true});return function nextTick(fn){if(!queue.length){hiddenDiv.setAttribute('yes','no');}
queue.push(fn);};}
if(canPost){window.addEventListener('message',function(ev){var source=ev.source;if((source===window||source===null)&&ev.data==='process-tick'){ev.stopPropagation();if(queue.length>0){var fn=queue.shift();fn();}}},true);return function nextTick(fn){queue.push(fn);window.postMessage('process-tick','*');};}
return function nextTick(fn){setTimeout(fn,0);};})();process.title='browser';process.browser=true;process.env={};process.argv=[];function noop(){}
process.on=noop;process.addListener=noop;process.once=noop;process.off=noop;process.removeListener=noop;process.removeAllListeners=noop;process.emit=noop;process.binding=function(name){throw new Error('process.binding is not supported');};process.cwd=function(){return'/'};process.chdir=function(dir){throw new Error('process.chdir is not supported');};},{}],3:[function(require,module,exports){var isarray=require('isarray')
module.exports=pathToRegexp
module.exports.parse=parse
module.exports.compile=compile
module.exports.tokensToFunction=tokensToFunction
module.exports.tokensToRegExp=tokensToRegExp
var PATH_REGEXP=new RegExp(['(\\\\.)','([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'].join('|'),'g')
function parse(str){var tokens=[]
var key=0
var index=0
var path=''
var res
while((res=PATH_REGEXP.exec(str))!=null){var m=res[0]
var escaped=res[1]
var offset=res.index
path+=str.slice(index,offset)
index=offset+m.length
if(escaped){path+=escaped[1]
continue}
if(path){tokens.push(path)
path=''}
var prefix=res[2]
var name=res[3]
var capture=res[4]
var group=res[5]
var suffix=res[6]
var asterisk=res[7]
var repeat=suffix==='+'||suffix==='*'
var optional=suffix==='?'||suffix==='*'
var delimiter=prefix||'/'
var pattern=capture||group||(asterisk?'.*':'[^'+delimiter+']+?')
tokens.push({name:name||key++,prefix:prefix||'',delimiter:delimiter,optional:optional,repeat:repeat,pattern:escapeGroup(pattern)})}
if(index<str.length){path+=str.substr(index)}
if(path){tokens.push(path)}
return tokens}
function compile(str){return tokensToFunction(parse(str))}
function tokensToFunction(tokens){var matches=new Array(tokens.length)
for(var i=0;i<tokens.length;i++){if(typeof tokens[i]==='object'){matches[i]=new RegExp('^'+tokens[i].pattern+'$')}}
return function(obj){var path=''
var data=obj||{}
for(var i=0;i<tokens.length;i++){var token=tokens[i]
if(typeof token==='string'){path+=token
continue}
var value=data[token.name]
var segment
if(value==null){if(token.optional){continue}else{throw new TypeError('Expected "'+token.name+'" to be defined')}}
if(isarray(value)){if(!token.repeat){throw new TypeError('Expected "'+token.name+'" to not repeat, but received "'+value+'"')}
if(value.length===0){if(token.optional){continue}else{throw new TypeError('Expected "'+token.name+'" to not be empty')}}
for(var j=0;j<value.length;j++){segment=encodeURIComponent(value[j])
if(!matches[i].test(segment)){throw new TypeError('Expected all "'+token.name+'" to match "'+token.pattern+'", but received "'+segment+'"')}
path+=(j===0?token.prefix:token.delimiter)+segment}
continue}
segment=encodeURIComponent(value)
if(!matches[i].test(segment)){throw new TypeError('Expected "'+token.name+'" to match "'+token.pattern+'", but received "'+segment+'"')}
path+=token.prefix+segment}
return path}}
function escapeString(str){return str.replace(/([.+*?=^!:${}()[\]|\/])/g,'\\$1')}
function escapeGroup(group){return group.replace(/([=!:$\/()])/g,'\\$1')}
function attachKeys(re,keys){re.keys=keys
return re}
function flags(options){return options.sensitive?'':'i'}
function regexpToRegexp(path,keys){var groups=path.source.match(/\((?!\?)/g)
if(groups){for(var i=0;i<groups.length;i++){keys.push({name:i,prefix:null,delimiter:null,optional:false,repeat:false,pattern:null})}}
return attachKeys(path,keys)}
function arrayToRegexp(path,keys,options){var parts=[]
for(var i=0;i<path.length;i++){parts.push(pathToRegexp(path[i],keys,options).source)}
var regexp=new RegExp('(?:'+parts.join('|')+')',flags(options))
return attachKeys(regexp,keys)}
function stringToRegexp(path,keys,options){var tokens=parse(path)
var re=tokensToRegExp(tokens,options)
for(var i=0;i<tokens.length;i++){if(typeof tokens[i]!=='string'){keys.push(tokens[i])}}
return attachKeys(re,keys)}
function tokensToRegExp(tokens,options){options=options||{}
var strict=options.strict
var end=options.end!==false
var route=''
var lastToken=tokens[tokens.length-1]
var endsWithSlash=typeof lastToken==='string'&&/\/$/.test(lastToken)
for(var i=0;i<tokens.length;i++){var token=tokens[i]
if(typeof token==='string'){route+=escapeString(token)}else{var prefix=escapeString(token.prefix)
var capture=token.pattern
if(token.repeat){capture+='(?:'+prefix+capture+')*'}
if(token.optional){if(prefix){capture='(?:'+prefix+'('+capture+'))?'}else{capture='('+capture+')?'}}else{capture=prefix+'('+capture+')'}
route+=capture}}
if(!strict){route=(endsWithSlash?route.slice(0,-2):route)+'(?:\\/(?=$))?'}
if(end){route+='$'}else{route+=strict&&endsWithSlash?'':'(?=\\/|$)'}
return new RegExp('^'+route,flags(options))}
function pathToRegexp(path,keys,options){keys=keys||[]
if(!isarray(keys)){options=keys
keys=[]}else if(!options){options={}}
if(path instanceof RegExp){return regexpToRegexp(path,keys,options)}
if(isarray(path)){return arrayToRegexp(path,keys,options)}
return stringToRegexp(path,keys,options)}},{"isarray":4}],4:[function(require,module,exports){module.exports=Array.isArray||function(arr){return Object.prototype.toString.call(arr)=='[object Array]';};},{}]},{},[1])(1)});
