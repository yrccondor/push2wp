<?php
/**
 * All functions here
 */
//Add language support

add_action('init', 'ptw_load_textdomain');

function ptw_load_textdomain(){
    load_plugin_textdomain('ptw', false, dirname( plugin_basename(__FILE__)).'/languages');
}
?>