<?php
    if (isset($_REQUEST['action']) && $_REQUEST['action'] == 'logout') {
        session_start();
        session_destroy();
    }
    
    require 'fbconfig.php';

    $facebook = new Facebook(array(
      'appId'  => $apiId,
      'secret' => $apiSecret,
    ));
    
    $user = $facebook->getUser();

    if($user) {
        $json['success'] = true;
        $json['user'] = $user;
        $json['token'] = $facebook->getAccessToken();
        $json['logoutUrl'] = $facebook->getLogoutUrl();
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
    
    header('Location: /#fb');
    
?>