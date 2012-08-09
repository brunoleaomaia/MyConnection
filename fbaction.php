<?php
require 'fbconfig.php';

$json               = array();
$json['success']    = false;
$json['loginUrl']   = '#';

if($apiId != '' && $apiSecret != '') {

    $facebook = new Facebook(array(
      'appId'  => $apiId,
      'secret' => $apiSecret,
    ));
    
    if ($_REQUEST['action'] == 'status') {
        $user = $facebook->getUser();
        if($user) {
            $json['success'] = true;
            $json['user'] = $user;
            $json['token'] = $facebook->getAccessToken();
            $json['logoutUrl'] = $facebook->getLogoutUrl(array('next' => $appUrl.'/fbreturn.php?action=logout'));
            try {
                $json['profile'] = $facebook->api('/me');
            } catch (Exception $e) {
                $json['profile'] = false;
            }
            $json['date'] = date('Hisdms');
        } else {
            $loginUrl = $facebook->getLoginUrl(array('display' => 'touch', 'redirect_uri' => $appUrl.'/fbreturn.php', 'scope' => 'publish_checkins, publish_stream'));
            $json['loginUrl'] = $loginUrl;
            $json['session'] = $_SESSION;
            $json['date'] = date('Hisdms');
        }
    }
    
    if ($_REQUEST['action'] == 'post') {
        $type = ($_REQUEST['type'] != 'UNKNOWN' && $_REQUEST['type'] != '') ? ' '.$_REQUEST['type'] : '';
        $user = $facebook->getUser();
        if($user) {
            $json['success'] = true;
            $json['user'] = $user;
            $json['token'] = $facebook->getAccessToken();
            $json['logoutUrl'] = $facebook->getLogoutUrl();
            $json['postArray'] = array(
                'message' => 'I got a speed of '.$_REQUEST['msg'].' Kbps with My'.$type.' Connection!',
                'link' => 'http://maps.googleapis.com/maps/api/staticmap?center='.$_REQUEST['geolocation'].'&zoom=14&size=640x480&maptype=roadmap&sensor=false&markers=color:red|'.$_REQUEST['geolocation'],
                'name' => 'My Connection',
                'description' => 'I got a speed of '.$_REQUEST['msg'].' Kbps with My'.$type.' Connection!'
            );
            $json['id'] = $facebook->api('/'.$user.'/feed', 'POST', $json['postArray']);
            try {
                $json['profile'] = $facebook->api('/me');
            } catch (Exception $e) {
                $json['profile'] = false;
            }
        } else {
            $loginUrl = $facebook->getLoginUrl(array('display' => 'touch', 'redirect_uri' => $appUrl.'/#fb', 'scope' => 'publish_checkins, publish_stream'));
            $json['loginUrl'] = $loginUrl;
        }
    }

}

echo json_encode($json);

?>