var Sprintf = require('sprintf'),
    sprintf = Sprintf.sprintf,
    vsprintf = Sprintf.vsprintf,
    fs = require('fs'),
    path = require('path'),
    wrench = require('wrench'),
    async = require('async'),
    lodash = require('lodash');


function Lang(options){

    this.options = lodash.merge({
        defaultLocale : 'en',
        locale : 'en'
    },options);

    this.locale = this.options.locale;
    this.translations = {};
    return this;
}

Lang.prototype.add = function(options,callback){
    if (typeof options == 'undefined'){
        options = {};
    }

    var asyncObj = {};
    var _this = this;
    var directory = (typeof options.directory == 'undefined') ? this.options.directory : options.directory;
    var locales = (typeof options.locales == 'undefined') ? this.options.locales : options.locales;

    //load translations
    for (var a in locales){
        var locale = locales[a];
        if (typeof this.translations[locale] == 'undefined'){
            this.translations[locale] = {};
        }

        asyncObj[locale] = function(dir,locale,callback){
            _this.readFiles(dir,locale,function(err,translation){
                _this.translations[locale] = lodash.merge(translation,_this.translations[locale]);
                callback(null,locale + ' done');
            });
        }.bind(null,directory + '/' + locale,locale);
    }


    async.parallel(asyncObj,function(err,translations){
        if (typeof callback != 'undefined'){
            callback(null,translations);
        }
    });
};

Lang.prototype.setLocale = function(locale){
    this.locale = locale;
};

Lang.prototype.getLocale = function(){
    return this.locale;
};

Lang.prototype.findMissing = function(){

};

Lang.prototype.readFiles = function(dir,locale,cb){
    var obj = {};
    var files = wrench.readdirSyncRecursive(dir);

    for (var a in files){
        var file = files[a];
        if (path.extname(file) == '.json'){
            var localeFile = fs.readFileSync(dir + '/' + file);
            obj[path.basename(file,'.json')] = JSON.parse(localeFile);
        }
    }

    cb(null,obj);
};

function translate(phrase){
    var namedValues = {};
    //we are calling with named parameters like {name : 'mike'}
    if (typeof arguments[1] == 'object'){
        namedValues = arguments[1];
        return sprintf(phrase, namedValues);
    }

    //we are calling it with array params like %s,%s
    var args = Array.prototype.slice.call(arguments);
    args.shift();
    return vsprintf(phrase,args);

}

function translatePlural(singular, plural, count){
    var namedValues = {};

    //we are calling with named parameters like {name : 'mike'}
    if (typeof arguments[3] == 'object'){
        namedValues = arguments[3];
        namedValues = lodash.merge({count : count},namedValues);
        if (count == 1){
            return sprintf(singular,namedValues);
        } else {
            return sprintf(plural,namedValues);
        }
    }

    //we are calling it with array params like %s,%s
    var args = Array.prototype.slice.call(arguments);
    args.shift();//get rid of singular
    args.shift();;//get rid of plural

    if (count == 1){
        return vsprintf(singular,args);
    } else {
        return vsprintf(plural,args);
    }


}

Lang.prototype.get = function(translation){
    var locale = this.getLocale();
    var args = Array.prototype.slice.call(arguments,1);
    try {
        if (translation.indexOf('.') != -1){
            var phrase = Object.byString(this.translations[locale], translation);
            args.unshift(phrase);
            return translate.apply(this,args);
        }

        return translate.apply(this.translations[locale][translation],args);
    }
    catch (e){
        return '';
    }
};
/**
 *
 * @param translation
 * @param count
 * @returns {*}
 */
Lang.prototype.choice = function(translation,count){
    var locale = this.getLocale();
    var args = Array.prototype.slice.call(arguments,1);

    try {
        if (translation.indexOf('.') != -1){
            var phrase = Object.byString(this.translations[locale], translation);
            args.unshift(phrase.one,phrase.other);
            return translatePlural.apply(this,args);
        }

        return translate(this.translations[locale][translation],args);
    }
    catch (e){
        return '';
    }

};


/**
 *
 * @param translation. expects something like messages OR message.trans
 * @param value. expects locales object like {en : 'trans', de : 'trans'} or {en : {var:'value'},de: {var:'value'}
 */
Lang.prototype.inject = function(translation,value){
    if (translation.indexOf('.') == -1){//we expect an entire object
        this.addToTranslations(translation,value,false);
        return;
    }

    this.addToTranslations(translation,value,true);

    return;
};
/**
 *
 * @param translation
 * @param value
 * @param isSingle. Defines whether we expect a full object or just a sub one
 */
Lang.prototype.addToTranslations = function(translation,value,isSingle){

    for (var a in this.translations){

        if (typeof value[a] != 'undefined'){
            if (!isSingle){
                this.translations[a][translation] = value[a];
            }
            else {
                set(translation,value[a],this.translations[a]);
            }
        }
    }
};

Object.byString = function(o, s) {

    s = s.replace(/\[(\w+)\]/g, '.$1');  // convert indexes to properties
    s = s.replace(/^\./, ''); // strip leading dot
    var a = s.split('.');
    while (a.length) {
        var n = a.shift();
        if (n in o) {
            o = o[n];
        } else {
            return;
        }
    }

    return o;
};

function set(path, value,obj) {
    var schema = obj;  // a moving reference to internal objects within obj
    var pList = path.split('.');
    var len = pList.length;
    for(var i = 0; i < len-1; i++) {
        var elem = pList[i];
        if( !schema[elem] ) schema[elem] = {}
        schema = schema[elem];
    }

    schema[pList[len-1]] = value;
}

module.exports = Lang;