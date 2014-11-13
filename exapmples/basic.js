var Lang = require('../lib/index');
var locales = ['en','de'];
var t = new Lang({
    directory : __dirname + '/locales',
    locales : locales
});
t.add();



console.log(t.get('messages.weekend',{name : 'Michael',surname : 'Bobos'}));
console.log(t.get('messages.tree','bob','dick'));
t.setLocale('de');
t.get('messages.weekend',{name : 'Michael',surname : 'Bouclas'});

//add some more translations from a different location
t.add({
    directory : __dirname + '/additionalLocales',
    locales : locales
},function(err,translations){

    console.log(t.get('msg.Hello',{name : 'Michael',surname : 'Bouclas'}));
});
console.log(t.choice('messages.cat',2,{name : 'Michael',surname : 'Bouclas'}));
console.log(t.choice('messages.cat',1,'is enough'));

var newTranslation = {
    en : {
        focus : 'Daniel san EN'
    },
    de : {
        focus : 'Daniel san DE'
    }
};

var newTranslation2 = {
    en : 'bob EN',
    de : 'bob DE'
};

t.inject('tester',newTranslation);
console.log(t.get('tester.focus'));
t.inject('tester.name',newTranslation2);
console.log(t.get('tester.name'));