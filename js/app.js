////////////////////////////////////////////////////////////////////////////////
/*
 * My Connection for FirefoxOS
 * Developed by Bruno Maia <brunoleaomaia@gmail.com>
 */
////////////////////////////////////////////////////////////////////////////////
var App = {};
App.url = 'http://owd.jqmphp.com';

////////////////////////////////////////////////////////////////////////////////
//<MAPS>
App.maps = {};
App.maps.animate = false;

App.maps.init = function() {

    this.mapOptions = {
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false
    };
    
    this.map = new google.maps.Map(document.getElementById('myMap'), this.mapOptions);
    
    this.map.setCenter(new google.maps.LatLng(0, 0));
    
    this.pinImage = new google.maps.MarkerImage('images/pin.png', new google.maps.Size(86, 86), new google.maps.Point(0,0), new google.maps.Point(43, 43));
    
    this.pin = new google.maps.Marker({
        position: new google.maps.LatLng(0, 0),
        map: this.map,
        icon: this.pinImage
    });
    
    this.circle = new google.maps.Circle({
        center: new google.maps.LatLng(0, 0),
        fillColor: '#4D7AFF',
        fillOpacity: 0.3,
        strokeColor: '#4D7AFF',
        strokeOpacity: 0.3,
        strokeWeight: 1,
        map: this.map,
        radius: this.getZoomEquivalent(3000000)
    }); 
    
    this.circleZoom = this.map.getZoom();
    
    this.openingCircle = false;

    if(this.animate) this.t = setInterval(this.animateCircle, 25);
    
}

App.maps.getZoomEquivalent = function(value) {
    var zoom = App.maps.map.getZoom();
    for (var i = 1; i < zoom; i++) {
        value = value / 2;
    }
    return value;
}

App.maps.animateCircle = function() {
    var max = App.maps.getZoomEquivalent(3000000);
    var min = App.maps.getZoomEquivalent(1000000);
    var inc = App.maps.getZoomEquivalent(60000);
    if(!App.maps.openingCircle && App.maps.circle.getRadius() > min) App.maps.circle.setRadius(App.maps.circle.getRadius() - inc);
    if(App.maps.openingCircle && App.maps.circle.getRadius() < max) App.maps.circle.setRadius(App.maps.circle.getRadius() + inc);
    if(App.maps.circle.getRadius() <= min || App.maps.circle.getRadius() >= max) App.maps.openingCircle = !App.maps.openingCircle;
    if(App.maps.circleZoom != App.maps.map.getZoom()) {
        App.maps.circleZoom = App.maps.map.getZoom();
        App.maps.circle.setRadius(max);
        App.maps.openingCircle = false;
    }
}
    
App.maps.setCenter = function(lat, lng) {
    var pos = new google.maps.LatLng(lat, lng);
    App.maps.map.setCenter(pos);
    App.maps.circle.setCenter(pos);
    App.maps.pin.setPosition(pos);
}
//</MAPS>
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
//<STORAGE>
App.saveSetting = function(key, value) {
    if (localStorage) {
        localStorage.setItem(key, value);
    } else {
        setCookie(key, value, 365);
    }
}
App.getSetting = function(key) {
    if (localStorage) {
        return localStorage.getItem(key);
    } else {
        return getCookie(key);
    }
}
//</STORAGE>
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
//<GEOLOCATION_API>
App.getGeolocation = function(fnc) {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function onSuccess(position) {
                App.saveSetting('geolocation', position.coords.latitude+','+position.coords.longitude);
                App.maps.setCenter(position.coords.latitude, position.coords.longitude);
                if (fnc) fnc();
            }, 
            function onError() {
                App.maps.setCenter(-8.034626, -34.870682);
                App.saveSetting('geolocation', '-8.034626,-34.870682');
                if (fnc) fnc();
            },
            {
                timeout: 30000
            }
        );
    }
}
//</GEOLOCATION_API>
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
//<WEBAPPS_API>
App.checkInstall = function() {
    var request = window.navigator.mozApps.getSelf(); 
    request.onsuccess = function() {  
      if (request.result) {
        $('#installLabel').html('Application Installed');
        if (navigator.mozApps && navigator.mozApps.mgmt && navigator.mozApps.mgmt.uninstall) {
            $('#installLabel').html('Uninstall Application');
            $('#btInstall').click(function(){
                App.uninstall();
            });    
        }
      } else {  
        $('#installLabel').html('Install Application');
        $('#btInstall').click(function(){
            App.install();
        });
      }  
    }  
    request.onerror = function() {  
      $('#installLabel').html('Oops!');
    }
}
App.install = function() {
    var request = window.navigator.mozApps.install(App.url+'/manifest.webapp');
    request.onsuccess = function () {
      $('#installLabel').html('Application Installed');
    };
    request.onerror = function () {
      $('#installLabel').html('Oops!');
    }; 
}
App.uninstall = function() {
    var request = window.navigator.mozApps.mgmt.uninstall(App.url+'/manifest.webapp');
    request.onsuccess = function () {
      $('#installLabel').html('Application Uninstalled');
    };
    request.onerror = function () {
      $('#installLabel').html('Oops!');
    };
}
//</WEBAPPS_API>
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
//<NETWORK_API>
App.connectionType = function() {   
    /*
     * W3C Network API
     * http://dvcs.w3.org/hg/dap/raw-file/tip/network-api/Overview.html
     */
    if (window.navigator.connection) {
        switch(window.navigator.connection.type) {
            case window.navigator.connection.TYPE_UNKNOWN:
                return  'UNKNOWN';
            case window.navigator.connection.TYPE_ETHERNET:
                return  'ETHERNET';
            case window.navigator.connection.TYPE_IEEE802_11:
                return  'WIFI';
            case window.navigator.connection.TYPE_GSM:
                return  'GSM';
            case window.navigator.connection.TYPE_GPRS:
                return  'GPRS';
            case window.navigator.connection.TYPE_EDGE:
                return  'EDGE';
            case window.navigator.connection.TYPE_CDMA:
                return  'CDMA';
            case window.navigator.connection.TYPE_WiMAX:
                return  'WIMAX';
            case window.navigator.connection.TYPE_iDEN:
                return  'IDEN';
            case window.navigator.connection.TYPE_TETRA:
                return  'TETRA';
            case window.navigator.connection.TYPE_UMTS:
                return  'UMTS';
            case window.navigator.connection.TYPE_BLUETOOTH:
                return  'BLUETOOTH';
            case window.navigator.connection.TYPE_IRDA:
                return  'IRDA';
            case window.navigator.connection.TYPE_USB:
                return  'USB';
            default:
                return  'UNKNOWN';
        }
    } else {
        return 'UNKNOWN';
    }
}
//</NETWORK_API>
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
//<WEBSMS_API>
App.sendSms = function(number) {
    if (navigator.mozSms) {
        var txtConnection = (App.connectionType() == 'UNKNOWN') ? '' : ' '+App.connectionType();
        var request = navigator.mozSms.send(number, 'I got a speed of '+App.getSetting('lastSpeedKbps')+ ' Kbps with My' + txtConnection + ' Connection! GPS: '+App.getSetting('geolocation'));
        request.onsuccess = function() {
            App.alert({
                title: 'SMS',
                subTitle: '',
                message: 'SMS sent!'
            });
        }
        request.onerror = function() {
            App.alert({
                title: 'Erro',
                subTitle: 'Oops!',
                message: 'Error trying to send SMS!'
            });
        }
    } else {
        App.alert({
            title: 'SMS',
            subTitle: 'Oops!',
            message: 'SMS API not found!'
        });
    }
}
//<WEBSMS_API>
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
//<CONTACTS_API>
App.getContacts = function(popup) {
    if(!popup) popup = false;
    $.mobile.showPageLoadingMsg();
    if(navigator.mozContacts) {
        var options = {
            sortBy: 'givenName',
            sortOrder: 'ascending'
        };
        var request = navigator.mozContacts.find(options);
        request.onsuccess = function() {
            $.mobile.hidePageLoadingMsg();
            App.htmlContacts(request.result, popup);
        };
        request.onerror = function() {
            $.mobile.hidePageLoadingMsg();
            App.alert({
                title: 'Erro',
                subTitle: 'Oops!',
                message: 'Error trying to get contacts!'
            });
        }
    } else {
        $.mobile.hidePageLoadingMsg();
        //FAKE CONTACTS
        var request = {};
        request.result = [
            {
                id: 1,
                givenName: 'Alan',
                familyName: 'Delon',
                tel: [{
                    number: '+558199990002',
                    type: 'work'
                }]
            },
            {
                id: 2,
                givenName: 'Alexandre',
                familyName: 'Leao',
                tel: [{
                    number: '+558199990001',
                    type: 'work'
                }]
            },
            {
                id: 3,
                givenName: 'Bruno',
                familyName: 'Maia',
                tel: [{
                    number: '+558199990000',
                    type: 'work'
                }]
            }
        ];
        App.htmlContacts(request.result, popup);
    }
}

App.htmlContacts = function(result, popup) {
    var html = '';
    var l = '';
    App.saveSetting('contacts', JSON.stringify(result));
    for(c in result) {
        if (l != result[c].givenName.substr(0,1).toUpperCase()) {
            l = result[c].givenName.substr(0,1).toUpperCase();
            html += '<li data-role="list-divider">'+l+'</li>';
        }
        html += '<li><a href="javascript:App.openContact('+result[c].id+', '+popup+')">'+result[c].givenName+' '+result[c].familyName+'</a></li>';
    }
    $('#myContacts').html(html);
    $('#smsShareList').html(html);
    try { $('#smsShareList').listview('refresh'); } catch (e) {}
    try { $('#myContacts').listview('refresh'); } catch (e) {}
    if(popup) {
        $.mobile.changePage('#smsShare');
    } else {
        $.mobile.changePage('#contacts', { transition: 'slide' });   
    }
}

App.openContact = function(id, popup) {
    var result = JSON.parse(App.getSetting('contacts'));
    for(c in result) {
        if (result[c].id == id) {
            var numbers = '';
            if (result[c].tel) {
                for (t in result[c].tel)    {
                    var url = '#';
                    if (popup) url = "javascript:App.sendSms('"+ result[c].tel[t].number + "');";
                    numbers += '<li><a href="'+url+'"><h2>'+result[c].tel[t].number+'</h2><p>'+result[c].tel[t].type+'</p></a></li>';
                }
            }
            $('#contactName').html(result[c].givenName + ' ' + result[c].familyName);
            $('#contactTels').html(numbers);
            try {$('#contactTels').listview('refresh'); } catch (e) {}
            $.mobile.changePage('#contact');
        }
    }
}

//</CONTACTS_API>
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
//<SPEED_TEST>
App.testSpeed = function() {
    var st = new SpeedTest(); //http://alexle.net/archives/257
    st.run({
        onEnd: function(speed) {
            App.saveSetting('lastSpeedKbps', Math.round(speed.Kbps));
            $('#mySpeed').html(App.getSetting('lastSpeedKbps'));
            $.mobile.hidePageLoadingMsg();
            $.mobile.changePage('#dialog');
        }  
    });
}
//</SPEED_TEST>
////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////
//<FACEBOOK>
App.fbStatus = function() {
    $.get('fbaction.php?action=status', function(data) {
        var json = JSON.parse(data);
        if (!json.success) {
            $('#fbContent').html('<a href="'+json.loginUrl+'" data-role="button" data-theme="b">Facebook Connect</a>');
            try {
                $('#fb').trigger('create');
            } catch(e) {
            }
        } else {
            var html = '<div style="padding:.5em; margin-bottom: 6px" class="ui-body-b ui-corner-all ui-shadow">';
            html += '<img id="myPicture" class="ui-corner-all ui-shadow" src="https://graph.facebook.com/'+json.user+'/picture">';
            html += '<p id="myName">'+json.profile.name+'</p>';
            if (json.profile.location && json.profile.location.name) html += '<p id="myLocation">'+json.profile.location.name+'</p>';
            html += '</div>';
            html += '<a href="'+json.logoutUrl+'" data-role="button" data-theme="b">Desconectar</a>';
            $('#fbContent').html(html);
            try {
                $('#fb').trigger('create');
            } catch(e) {
            }
        }
    });
}

App.fbShare = function() {
    $.mobile.showPageLoadingMsg();
    $.get('fbaction.php?action=post&msg='+App.getSetting('lastSpeedKbps')+'&geolocation='+App.getSetting('geolocation')+'&type='+App.connectionType(), function(data) {
        $.mobile.hidePageLoadingMsg();
        var json = JSON.parse(data);
        if (json.success) {
            App.alert({
                title: 'Facebook',
                subTitle: 'Shared!!',
                message: 'Your status has been updated!'
            });
        } else {
            App.alert({
                title: 'Facebook',
                subTitle: 'Oops!',
                message: 'Please check the sharing options in the application settings menu.'
            });
        }
    });
}
//</FACEBOOK>
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
//<APP_UI>
App.alert = function(c) {
    $('#alertTitle').html((c.title) ? c.title : '');
    $('#alertSubtitle').html((c.subTitle) ? c.subTitle : '');
    $('#alertMessage').html((c.message) ? c.message : '');
    $.mobile.changePage('#alert');
}
//</APP_UI>
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
//<APP_INIT>
App.initListeners = function() {
    $('#home').bind('pageshow', function(){
        var c = App.maps.map.getCenter();
        google.maps.event.trigger(App.maps.map, "resize");
        App.maps.map.setCenter(c);
    });
    $('#home').bind('pagecreate', function(){
        var c = App.maps.map.getCenter();
        google.maps.event.trigger(App.maps.map, "resize");
        App.maps.map.setCenter(c);
    });
    $(window).resize(function() {
       var c = App.maps.map.getCenter();
        google.maps.event.trigger(App.maps.map, "resize");
        App.maps.map.setCenter(c); 
    });
    $('#fb').bind('pageshow', function(){
        App.fbStatus();
    });
    $('#btShareFacebook').click(function() {
        App.fbShare();
    });
    $('#btShareSms').click(function() {
        App.getContacts(true);
    });
    $('#btTestNow').click(function() {
        $.mobile.showPageLoadingMsg();
        App.getGeolocation(App.testSpeed);
    });
    $('#btMyContacts').click(function() {
        App.getContacts();
    });
}

App.init = function() {
    if (navigator.geolocation) {  
      this.maps.init();
      this.getGeolocation();
      this.initListeners();
    } else {  
      $('#myMap').html('<h2>Sorry,</h2><p>your device don\'t supports geolocation.</p>');  
    }
    this.checkInstall();
    if(document.location.href.indexOf('#fb') > 0) this.fbStatus();
}
//</APP_INIT>
////////////////////////////////////////////////////////////////////////////////