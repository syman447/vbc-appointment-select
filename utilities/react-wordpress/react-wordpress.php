<?php
/**
 * @wordpress-plugin
 * Plugin Name:       Embedding React In Wordpress
 */

defined( 'ABSPATH' ) or die( 'Direct script access disallowed.' );

define( 'ERW_ASSET_MANIFEST', 'https://www.virtualbabysittersclub.com/appointment-select/asset-manifest.json' );
define( 'ERW_INCLUDES', plugin_dir_path( __FILE__ ) . '/includes' );

require_once( ERW_INCLUDES . '/enqueue.php' );
require_once( ERW_INCLUDES . '/shortcode.php' );