<?php
/*
Plugin Name: Push2WP
Plugin URI: https://ptw.flyhigher.top
Version: 1.0.0
Description: Write, push, done.
Author: Axton
Author URI: https://flyhigher.top
License: MIT
*/
/* Copyright (c) 2018 AxtonYao

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/**
 * Import functions
 */
include('ptw-functions.php');
/**
 * For activation && deactivation
 */
register_activation_hook(__FILE__, 'ptw_init');
register_deactivation_hook(__FILE__, 'ptw_disable');
function ptw_init(){
    if(version_compare(get_bloginfo('version'), '4.4', '<')){
        deactivate_plugins(basename(__FILE__)); //disable in old versions
    }else{
        if(!get_option('ptw_init')){
            include('version.php');
            update_option('ptw_version', $ptw_version);
            update_option('ptw_init', md5(date('Y-m-d H:i:s')));
        }else{
            //update version
            include('version.php');
            if(!get_option('ptw_version') || get_option('ptw_version')['version'] != $ptw_version['version']){
                update_option('ptw_version', $ptw_version);
            }
        }
    }
    
}
function ptw_disable(){
    //Not finished yet
}
/**
 * Set menus
 */
include('ptw-menus.php');
?>