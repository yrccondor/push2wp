<?php
/**
 * All functions here
 * @author Axton
 */

// Add language support
function ptw_load_textdomain(){
    load_plugin_textdomain('ptw', false, dirname( plugin_basename(__FILE__)).'/languages');
}
add_action('init', 'ptw_load_textdomain');

// Generate secret for webhooks
function generateSecret($length) { 
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_/&%#!@+='; 
    $randomString = ''; 
    for ($i = 0; $i < $length; $i++) { 
        $randomString .= $characters[rand(0, strlen($characters) - 1)]; 
    } 
    return $randomString; 
}

// Create a webhook
function ptw_create(){
    if(current_user_can('edit_posts')){
        $response = json_encode(array('status' => true, 'data' => array('id' => 2, 'source' => $_GET["source"], 'secret' => generateSecret(32)), 'list' => array(array('id' => 1, 'source' => $_GET["source"]), array('id' => 2, 'source' => $_GET["source"]))));
        header("Content-Type: application/json");
        echo $response;
    }else{
        $response = json_encode(array('status' => false, 'list' => array(array('id' => 1, 'source' => $_GET["source"]))));
        header("Content-Type: application/json");
        echo $response;
    }
    wp_die();
}
add_action('wp_ajax_ptw_create', 'ptw_create');

// Remove a webhook
function ptw_remove(){
    if(current_user_can('edit_posts')){
        $response = json_encode(array('status' => true, 'data' => array('id' => 2, 'source' => $_GET["source"], 'secret' => generateSecret(32)), 'list' => array(array('id' => 1, 'source' => $_GET["source"]), array('id' => 2, 'source' => $_GET["source"]))));
        header("Content-Type: application/json");
        echo $response;
	}else{
        $response = json_encode(array('status' => false, 'list' => array(array('id' => 1, 'source' => $_GET["source"]))));
        header("Content-Type: application/json");
        echo $response;
    }
    wp_die();
}
add_action('wp_ajax_ptw_remove', 'ptw_remove');

// Print log
function ptw_log(){
    if(current_user_can('edit_posts')){
        $for_time = (int)$_GET["length"];
        if($for_time > 50){
            $for_time = 50;
        }
        $html_log = "";
        $time = new DateTime();
        for($i=0; $i<=$for_time; $i++){
            $html_log .= "[".$time -> format('Y-m-d H:i:s')."] 127.0.0.1 GitHub/2&nbsp;&nbsp;&nbsp;Success Add:1/Modify:2/Delete:0<br>";
        }
        $response = json_encode(array('status' => true, 'data' => $html_log, 'list' => array(array('id' => 1, 'source' => $_GET["source"]), array('id' => 2, 'source' => $_GET["source"]))));
        header("Content-Type: application/json");
        echo $response;
	}else{
        $response = json_encode(array('status' => false, 'list' => array(array('id' => 1, 'source' => $_GET["source"]))));
        header("Content-Type: application/json");
        echo $response;
    }
    wp_die();
}
add_action('wp_ajax_ptw_log', 'ptw_log');
?>