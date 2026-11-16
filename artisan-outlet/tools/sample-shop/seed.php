<?php
/**
 * Sample shop for the Artisan Outlet manual: craft types, four fictional artisans, twelve crafts and the
 * store settings. Run with: wp eval-file seed.php
 */
require_once ABSPATH . 'wp-admin/includes/image.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';

define( 'AO_SEED_IMAGES', __DIR__ . '/images/' );
function ao_seed_image( $file, $title ) {
	$tmp = wp_tempnam( $file );
	copy( AO_SEED_IMAGES . $file . '.jpg', $tmp );
	$id = media_handle_sideload( array( 'name' => $file . '.jpg', 'tmp_name' => $tmp ), 0, $title );
	if ( is_wp_error( $id ) ) { WP_CLI::error( $id->get_error_message() ); }
	return $id;
}

// ── Settings ────────────────────────────────────────────────────────────────
$s = get_option( 'ao_settings', array() );
$s = array_merge( is_array( $s ) ? $s : array(), array(
	'store_name'   => 'Hastakala Crafts',
	'order_prefix' => 'HK-',
	'upi_id'       => 'hastakalacrafts@sbi',
	'upi_name'     => 'Hastakala Crafts',
) );
update_option( 'ao_settings', $s );

// ── Craft types ─────────────────────────────────────────────────────────────
$types = array();
foreach ( array( 'handloom' => 'Handloom', 'cane-bamboo' => 'Cane and bamboo', 'terracotta' => 'Terracotta', 'bell-metal' => 'Bell metal' ) as $slug => $name ) {
	$t = term_exists( $slug, 'ao_craft_type' ) ?: wp_insert_term( $name, 'ao_craft_type', array( 'slug' => $slug ) );
	$types[ $slug ] = (int) $t['term_id'];
}

// ── Artisans ────────────────────────────────────────────────────────────────
$artisans = array(
	'rupa' => array(
		'name' => 'Rupa Kalita', 'type' => 'handloom', 'photo' => 'artisan-rupa',
		'excerpt' => 'Third-generation Muga silk weaver from Sualkuchi, keeping her grandmother’s border patterns alive.',
		'story' => "Rupa learnt to weave at eight, sitting beside her grandmother at the family's throw-shuttle loom. Today she weaves Muga and Eri silk with her two daughters-in-law, using the same jacquard borders the family has woven for three generations.\n\nEvery mekhela chador takes between two and four weeks. Rupa still reels some of her own Muga yarn from cocoons bought from rearers in Lakhimpur.",
		'meta' => array( '_ao_village' => 'Sualkuchi', '_ao_district' => 'Kamrup', '_ao_state' => 'Assam', '_ao_craft_tradition' => 'Muga and Eri silk handloom weaving', '_ao_generations' => 3, '_ao_since_year' => 1958, '_ao_languages' => 'Assamese, Hindi', '_ao_awards' => "State Award for Master Weavers, 2016\nKamrup District Handloom Fair, first prize, 2011", '_ao_fulfilment' => 'website', '_ao_commission' => 20, '_ao_contact_name' => 'Rupa Kalita', '_ao_contact_phone' => '9800000101' ),
		'timeline' => array(
			array( 'year' => '1958', 'title' => 'Grandmother sets up the first loom', 'text' => 'A pit loom in the courtyard, weaving gamosas for the village.' ),
			array( 'year' => '1985', 'title' => 'The family moves to Muga silk', 'text' => 'Rupa’s mother starts weaving mekhela chadors for Sualkuchi traders.' ),
			array( 'year' => '2016', 'title' => 'State Award', 'text' => 'Rupa’s Kingkhap-border chador wins the State Award for Master Weavers.' ),
		),
	),
	'hemanta' => array(
		'name' => 'Hemanta Pal', 'type' => 'terracotta', 'photo' => 'artisan-hemanta',
		'excerpt' => 'Asharikandi potter who shapes terracotta horses and water pots on a hand-turned wheel.',
		'story' => "Hemanta's family has worked the clay of the Gangadhar river banks for five generations. He is known for the Asharikandi horse, a toy that once travelled to fairs across Bengal and Assam.\n\nHe packs and ships every piece himself, wrapped in straw and old newspaper, and you pay him directly by UPI.",
		'meta' => array( '_ao_village' => 'Asharikandi', '_ao_district' => 'Dhubri', '_ao_state' => 'Assam', '_ao_craft_tradition' => 'Asharikandi terracotta', '_ao_generations' => 5, '_ao_since_year' => 1930, '_ao_languages' => 'Assamese, Bengali', '_ao_fulfilment' => 'artisan', '_ao_upi_id' => 'hemantapal@okicici', '_ao_upi_name' => 'Hemanta Pal', '_ao_commission' => 15, '_ao_shipping' => 120 ),
		'timeline' => array(
			array( 'year' => '1930', 'title' => 'The family settles in Asharikandi', 'text' => 'Potters from the Brahmaputra plains settle by the river for its fine clay.' ),
			array( 'year' => '1999', 'title' => 'First exhibition in Guwahati', 'text' => '' ),
		),
	),
	'dipali' => array(
		'name' => 'Dipali Das', 'type' => 'cane-bamboo', 'photo' => 'artisan-dipali',
		'excerpt' => 'Cane and bamboo weaver from Barpeta who leads a self-help group of twelve women.',
		'story' => "Dipali turned her family's cane work into a self-help group of twelve women in Barpeta. They make baskets, trays, japis and water-hyacinth mats for homes and festivals.",
		'meta' => array( '_ao_village' => 'Barpeta Road', '_ao_district' => 'Barpeta', '_ao_state' => 'Assam', '_ao_craft_tradition' => 'Cane, bamboo and water-hyacinth weaving', '_ao_generations' => 2, '_ao_since_year' => 1990, '_ao_languages' => 'Assamese', '_ao_fulfilment' => 'website', '_ao_commission' => 20 ),
		'timeline' => array(),
	),
	'bikash' => array(
		'name' => 'Bikash Deka', 'type' => 'bell-metal', 'photo' => 'artisan-bikash',
		'excerpt' => 'Sarthebari bell-metal smith casting and hand-beating kahi and bati.',
		'story' => "In Sarthebari the sound of hammers starts before sunrise. Bikash and his brothers melt old bell metal, cast it and beat it by hand into the plates and bowls used at every Assamese feast.",
		'meta' => array( '_ao_village' => 'Sarthebari', '_ao_district' => 'Barpeta', '_ao_state' => 'Assam', '_ao_craft_tradition' => 'Sarthebari bell metal', '_ao_generations' => 4, '_ao_since_year' => 1946, '_ao_languages' => 'Assamese, Hindi', '_ao_fulfilment' => 'artisan', '_ao_upi_id' => 'bikashdeka@oksbi', '_ao_upi_name' => 'Bikash Deka', '_ao_commission' => 15, '_ao_shipping' => 150 ),
		'timeline' => array(),
	),
);
$aid = array();
foreach ( $artisans as $key => $a ) {
	$id = wp_insert_post( array( 'post_type' => 'ao_artisan', 'post_status' => 'publish', 'post_title' => $a['name'], 'post_content' => $a['story'], 'post_excerpt' => $a['excerpt'] ) );
	foreach ( $a['meta'] as $k => $v ) { update_post_meta( $id, $k, $v ); }
	update_post_meta( $id, '_ao_timeline', $a['timeline'] );
	set_post_thumbnail( $id, ao_seed_image( $a['photo'], $a['name'] ) );
	wp_set_object_terms( $id, array( $types[ $a['type'] ] ), 'ao_craft_type' );
	$aid[ $key ] = $id;
}
update_post_meta( $aid['rupa'], '_ao_gallery', implode( ',', array( ao_seed_image( 'process-loom', 'At the loom' ) ) ) );
update_post_meta( $aid['hemanta'], '_ao_gallery', implode( ',', array( ao_seed_image( 'process-firing', 'Firing the kiln' ) ) ) );

// ── Crafts ──────────────────────────────────────────────────────────────────
$crafts = array(
	array( 'Muga silk mekhela chador', 'rupa', 'handloom', 'muga-mekhela', 18500, null, 2, true,
		'Golden Muga silk with a deep red Kingkhap border, woven on a jacquard throw-shuttle loom. The natural sheen of Muga deepens with every wash.',
		array( '_ao_materials' => 'Muga silk, mercerised cotton for the border', '_ao_technique' => 'Jacquard throw-shuttle weaving', '_ao_making_time' => '3 weeks', '_ao_origin' => 'Sualkuchi, Assam', '_ao_care' => "Dry clean the first time.\nAfterwards hand wash in cold water with a mild soap, and dry in the shade." ),
		array( array( 'title' => 'Reeling the yarn', 'text' => 'Muga cocoons are boiled and the silk is reeled by hand onto a bamboo frame.' ), array( 'title' => 'Setting the loom', 'text' => 'Two thousand warp threads are drawn through the reed, one by one.' ), array( 'title' => 'Weaving the border', 'text' => 'The jacquard cards lift the threads for the Kingkhap motif row by row.' ) ) ),
	array( 'Eri silk stole', 'rupa', 'handloom', 'eri-stole', 2400, 1950, 6, true,
		'Warm, matte Eri silk, the "peace silk" spun after the moth has left the cocoon, with a woven brown border.',
		array( '_ao_materials' => 'Hand-spun Eri silk', '_ao_technique' => 'Handloom plain weave', '_ao_making_time' => '4 days', '_ao_origin' => 'Sualkuchi, Assam', '_ao_care' => 'Hand wash in cold water. Do not wring.' ),
		array( array( 'title' => 'Spinning', 'text' => 'Eri cocoons are degummed and spun on a takuri drop spindle.' ), array( 'title' => 'Weaving', 'text' => 'Woven on a frame loom with a simple stripe in the warp.' ) ) ),
	array( 'Gamosa with red border', 'rupa', 'handloom', 'gamosa', 450, null, 25, false,
		'The Assamese gamosa: white cotton with a red woven border, given as a mark of respect at Bihu and every welcome.',
		array( '_ao_materials' => 'Cotton', '_ao_technique' => 'Handloom', '_ao_making_time' => '1 day', '_ao_origin' => 'Sualkuchi, Assam', '_ao_care' => 'Machine wash cold.' ), array() ),
	array( 'Phanek wrap', 'rupa', 'handloom', 'phanek', 3200, null, 3, false,
		'A deep maroon wrap with a woven geometric border, in the style worn across the hills of the North-East.',
		array( '_ao_materials' => 'Cotton and silk blend', '_ao_technique' => 'Handloom with supplementary weft', '_ao_making_time' => '1 week', '_ao_origin' => 'Sualkuchi, Assam' ), array() ),
	array( 'Asharikandi terracotta horse', 'hemanta', 'terracotta', 'terracotta-horse', 1200, null, 8, true,
		'The famous Asharikandi horse, shaped by hand, burnished and fired in a wood kiln, with white clay dots.',
		array( '_ao_materials' => 'River clay, white slip', '_ao_technique' => 'Hand-built, wood-fired', '_ao_making_time' => '10 days including drying', '_ao_origin' => 'Asharikandi, Dhubri, Assam', '_ao_care' => 'Dust with a dry cloth. Not for outdoor use in rain.' ),
		array( array( 'title' => 'Preparing the clay', 'text' => 'River clay is soaked, sieved and kneaded with fine sand.' ), array( 'title' => 'Shaping', 'text' => 'The body is rolled and the legs, neck and head are joined by hand.' ), array( 'title' => 'Firing', 'text' => 'Dried for a week, then fired overnight in a wood kiln.' ) ) ),
	array( 'Terracotta water pot (kolsi)', 'hemanta', 'terracotta', 'terracotta-pot', 850, null, 10, false,
		'A thrown water pot that keeps water cool through the summer, decorated with white rings.',
		array( '_ao_materials' => 'River clay', '_ao_technique' => 'Wheel-thrown', '_ao_making_time' => '1 week', '_ao_origin' => 'Asharikandi, Assam', '_ao_care' => 'Rinse before first use. Keep on a stand.' ), array() ),
	array( 'Cane storage basket', 'dipali', 'cane-bamboo', 'cane-basket', 1350, null, 12, true,
		'A sturdy round basket woven from split cane, for rice, wool or laundry.',
		array( '_ao_materials' => 'Cane', '_ao_technique' => 'Hand-woven twill', '_ao_making_time' => '2 days', '_ao_origin' => 'Barpeta, Assam', '_ao_care' => 'Keep dry. Wipe with a damp cloth.' ),
		array( array( 'title' => 'Splitting the cane', 'text' => 'Cane is soaked and split into even strips with a dao.' ), array( 'title' => 'Weaving', 'text' => 'The base is woven flat, then the strips are turned up for the walls.' ) ) ),
	array( 'Small cane basket', 'dipali', 'cane-bamboo', 'bamboo-tray', 650, 590, 20, false,
		'A smaller basket for fruit, threads or the dining table.',
		array( '_ao_materials' => 'Cane', '_ao_technique' => 'Hand-woven', '_ao_making_time' => '1 day', '_ao_origin' => 'Barpeta, Assam' ), array() ),
	array( 'Japi (bamboo sun hat)', 'dipali', 'cane-bamboo', 'japi', 980, null, 9, true,
		'The traditional Assamese japi, woven from bamboo and tokou palm leaf, with a red and yellow decorative band.',
		array( '_ao_materials' => 'Bamboo, tokou palm leaf, cloth', '_ao_technique' => 'Double-layer weaving', '_ao_making_time' => '3 days', '_ao_origin' => 'Barpeta, Assam', '_ao_care' => 'Hang on a wall away from damp.' ), array() ),
	array( 'Water hyacinth floor mat', 'dipali', 'cane-bamboo', 'hyacinth-mat', 1100, null, 0, false,
		'A soft, thick floor mat woven from dried water hyacinth, a weed turned into a livelihood.',
		array( '_ao_materials' => 'Water hyacinth', '_ao_technique' => 'Plaited and stitched', '_ao_making_time' => '2 days', '_ao_origin' => 'Barpeta, Assam' ), array() ),
	array( 'Bell metal kahi (dinner plate)', 'bikash', 'bell-metal', 'kahi-bowl', 3600, null, 4, true,
		'Cast and hand-beaten bell metal, polished to a warm gold. Bell metal is believed to keep food fresh.',
		array( '_ao_materials' => 'Bell metal (copper and tin)', '_ao_technique' => 'Cast and hand-beaten', '_ao_making_time' => '2 days', '_ao_origin' => 'Sarthebari, Assam', '_ao_care' => 'Wash with tamarind or lemon and ash; dry at once.' ),
		array( array( 'title' => 'Melting', 'text' => 'Old bell metal is melted in a clay crucible.' ), array( 'title' => 'Beating', 'text' => 'The cast disc is heated and beaten into shape by three smiths in turn.' ), array( 'title' => 'Polishing', 'text' => 'Turned on a lathe and polished to a mirror finish.' ) ) ),
	array( 'Bell metal bati (bowl)', 'bikash', 'bell-metal', 'bota-tray', 1450, null, 7, false,
		'A deep bowl for dal and payas, in hand-beaten bell metal.',
		array( '_ao_materials' => 'Bell metal', '_ao_technique' => 'Cast and hand-beaten', '_ao_making_time' => '1 day', '_ao_origin' => 'Sarthebari, Assam', '_ao_care' => 'Wash and dry at once.' ), array() ),
);
$i = 0;
foreach ( $crafts as $c ) {
	list( $title, $artisan, $type, $img, $price, $sale, $stock, $featured, $excerpt, $meta, $steps ) = $c;
	$id = wp_insert_post( array( 'post_type' => 'ao_craft', 'post_status' => 'publish', 'post_title' => $title, 'post_excerpt' => $excerpt, 'post_content' => $excerpt . "\n\n" . 'Each piece is made by hand, so colours and sizes vary a little from the photo.', 'post_date' => gmdate( 'Y-m-d H:i:s', time() - ( 40 - $i ) * 3600 ) ) );
	update_post_meta( $id, '_ao_artisan_id', $aid[ $artisan ] );
	update_post_meta( $id, '_ao_price', $price );
	if ( $sale ) { update_post_meta( $id, '_ao_sale_price', $sale ); }
	update_post_meta( $id, '_ao_stock', $stock );
	update_post_meta( $id, '_ao_sku', 'HK-' . strtoupper( substr( $type, 0, 3 ) ) . '-' . ( 101 + $i ) );
	if ( $featured ) { update_post_meta( $id, '_ao_featured', '1' ); }
	foreach ( $meta as $k => $v ) { update_post_meta( $id, $k, $v ); }
	update_post_meta( $id, '_ao_process_steps', $steps );
	set_post_thumbnail( $id, ao_seed_image( $img, $title ) );
	wp_set_object_terms( $id, array( $types[ $type ] ), 'ao_craft_type' );
	$i++;
}
// shop page
$shop = wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'Shop', 'post_name' => 'shop', 'post_content' => '<!-- wp:shortcode -->[ao_outlet]<!-- /wp:shortcode -->' ) );
// The two demo pages used in the manual
foreach ( array( 'card-templates' => array( 'Card templates', implode( '', array_map( function ( $st ) { return '<!-- wp:shortcode -->[ao_crafts card_style="' . $st . '" per_page="3" columns="3" add_to_cart="yes"]<!-- /wp:shortcode -->'; }, array( 'paired', 'simple', 'overlay', 'list', 'story', 'minimal' ) ) ) ), 'shop-app' => array( 'Shop app', '<!-- wp:shortcode -->[ao_outlet mode="app" height="760"]<!-- /wp:shortcode -->' ) ) as $slug => $pg ) {
	wp_insert_post( array( 'post_type' => 'page', 'post_status' => 'publish', 'post_name' => $slug, 'post_title' => $pg[0], 'post_content' => $pg[1] ) );
}
// Site icon (the app's home-screen icon), app texts, India time
$tmp = wp_tempnam( 'site-icon' ); copy( AO_SEED_IMAGES . 'site-icon.png', $tmp );
$icon = media_handle_sideload( array( 'name' => 'site-icon.png', 'tmp_name' => $tmp ), 0, 'Site icon' );
if ( ! is_wp_error( $icon ) ) { update_option( 'site_icon', $icon ); }
update_option( 'aom_settings', array( 'name' => 'Hastakala Crafts', 'short_name' => 'Hastakala', 'headline' => 'Handmade in Assam', 'tagline' => 'Weaving, cane, clay and bell metal, straight from the families who make them.' ) );
update_option( 'timezone_string', 'Asia/Kolkata' );
update_option( 'blogname', 'Hastakala Crafts' );
update_option( 'blogdescription', 'Handmade by rural artisans of Assam' );

WP_CLI::success( 'Seeded: ' . count( $aid ) . ' artisans, ' . $i . ' crafts, shop page ' . $shop . ', artisans ' . wp_json_encode( $aid ) );
