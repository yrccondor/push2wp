<?php
/**
 * This file was prepared for uninstallation
 */
if(!defined('WP_UNINSTALL_PLUGIN')){
    exit();
}
//Delete all options. Goodbye.
delete_option('ptw_options');
delete_option('ptw_init');
delete_option('ptw_version');
?>