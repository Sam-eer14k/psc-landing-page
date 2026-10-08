<?php
/**
 * Fallback template. WordPress requires index.php for a theme to activate.
 * The landing page itself is front-page.php; this file renders any other
 * page or post in the same visual style.
 *
 * @package PSC
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>

<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
  <?php wp_body_open(); ?>
  <header class="site-header is-scrolled" style="position:sticky">
    <div class="container header-row">
      <a class="brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="Pacific Softcom home">
        <img src="<?php psc_asset( 'assets/images/psc-logo-white.png' ); ?>" alt="Pacific Softcom Inc." width="520" height="316">
      </a>
      <div class="header-actions">
        <a class="call-btn" href="tel:+15624897760">Call 562-489-7760</a>
      </div>
    </div>
  </header>

  <main id="main" class="section">
    <div class="container" style="max-width:780px">
      <?php if ( have_posts() ) : ?>
        <?php while ( have_posts() ) : the_post(); ?>
          <article <?php post_class(); ?> style="margin-bottom:64px">
            <h1 class="h2" style="margin-bottom:24px"><?php the_title(); ?></h1>
            <?php the_content(); ?>
          </article>
        <?php endwhile; ?>
        <?php the_posts_pagination(); ?>
      <?php else : ?>
        <h1 class="h2">Page not found</h1>
        <p class="lead">This page doesn't exist. Head back to the <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="text-link">home page</a> or call 562-489-7760.</p>
      <?php endif; ?>
    </div>
  </main>

  <?php wp_footer(); ?>
</body>

</html>
