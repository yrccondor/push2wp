<?php
/**
 * Add menus to the admin pannel
 */
//Add menu
function ptw_admin_menu(){
    add_menu_page('Push2WP' , 'Push2WP', 'edit_pages', 'ptw_admin','ptw_display_main_menu','dashicons-admin-tools');
}
//Add sub menus
function ptw_add_admin(){
    add_submenu_page('ptw_admin', __('Settings', 'ptw'), __('Settings', 'ptw'), 'edit_pages', 'ptw_settings', 'ptw_display_sub_menu_settings');
    add_submenu_page('ptw_admin', __('Logs', 'ptw'), __('Logs', 'ptw'), 'edit_pages', 'ptw_logs', 'ptw_display_sub_menu_logs');
    add_submenu_page('ptw_admin', __('About', 'ptw'), __('About', 'ptw'), 'edit_pages', 'ptw_about', 'ptw_display_sub_menu_about');
}
function ptw_display_main_menu(){
    echo '<h1>Push2WP</h1>';
}
function ptw_remove_sub_menu() {
    remove_submenu_page('ptw_admin', 'ptw_admin');
}
add_action('admin_menu', 'ptw_admin_menu');
add_action('admin_menu', 'ptw_add_admin');
add_action('admin_menu', 'ptw_remove_sub_menu');
//Display sub menus
function ptw_display_sub_menu_settings(){
    include('includes/submenu-settings.php');
}
function ptw_display_sub_menu_logs(){
    include('includes/submenu-logs.php');
}
function ptw_display_sub_menu_about(){
    wp_register_style('ptw_admin_about', plugins_url('css/admin-about.css',__FILE__));
    wp_enqueue_style('ptw_admin_about');
    include('includes/submenu-about.php');
}
?>