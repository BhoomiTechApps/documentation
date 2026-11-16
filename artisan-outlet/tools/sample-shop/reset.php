<?php
/** Clears orders, settlements and artisan logins so the screenshot story can run from a clean shop. */
global $wpdb;
foreach ( array( 'ao_orders', 'ao_order_items', 'ao_order_events', 'ao_settlements' ) as $t ) {
	$wpdb->query( "DELETE FROM {$wpdb->prefix}{$t}" );
	$wpdb->query( $wpdb->prepare( 'DELETE FROM sqlite_sequence WHERE name = %s', $wpdb->prefix . $t ) );
}
require_once ABSPATH . 'wp-admin/includes/user.php';
foreach ( get_users( array( 'meta_key' => 'ao_artisan_id', 'fields' => 'ID' ) ) as $uid ) {
	wp_delete_user( $uid );
}
$stock = array( 'Muga silk mekhela chador' => 2, 'Eri silk stole' => 6, 'Gamosa with red border' => 25, 'Phanek wrap' => 3, 'Asharikandi terracotta horse' => 8, 'Terracotta water pot (kolsi)' => 10, 'Cane storage basket' => 12, 'Small cane basket' => 20, 'Japi (bamboo sun hat)' => 9, 'Water hyacinth floor mat' => 0, 'Bell metal kahi (dinner plate)' => 4, 'Bell metal bati (bowl)' => 7 );
foreach ( get_posts( array( 'post_type' => 'ao_craft', 'numberposts' => -1 ) ) as $c ) {
	if ( isset( $stock[ $c->post_title ] ) ) { update_post_meta( $c->ID, '_ao_stock', $stock[ $c->post_title ] ); }
}
$s = get_option( 'ao_settings', array() );
$s['photo_packed'] = 0; $s['photo_shipped'] = 0;
update_option( 'ao_settings', $s );
WP_CLI::success( 'Shop reset: ' . (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}ao_orders" ) . ' orders.' );
