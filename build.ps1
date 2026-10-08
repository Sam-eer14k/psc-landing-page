# Assembles index.html from the sources in src/, then regenerates the
# WordPress theme files so the two deliverables stay in step.
#
#   powershell -ExecutionPolicy Bypass -File build.ps1
#
# Edit src/_head.html, src/_body.html, src/css/theme.css, or src/js/main.js.
# Never edit index.html, wordpress-theme/style.css, wordpress-theme/front-page.php
# or wordpress-theme/assets/js/main.js directly: all four are generated and
# will be overwritten. functions.php and index.php are edited in place.

$ErrorActionPreference = 'Stop'
$root  = Split-Path -Parent $MyInvocation.MyCommand.Path
$src   = Join-Path $root 'src'
$theme = Join-Path $root 'wordpress-theme'
$utf8  = New-Object System.Text.UTF8Encoding($false)

$head = [System.IO.File]::ReadAllText((Join-Path $src '_head.html'))
$css  = [System.IO.File]::ReadAllText((Join-Path $src 'css\theme.css'))
$body = [System.IO.File]::ReadAllText((Join-Path $src '_body.html'))
$js   = [System.IO.File]::ReadAllText((Join-Path $src 'js\main.js'))

# ---------------------------------------------------------------- index.html
$out = "<!DOCTYPE html>`n<html lang=`"en`">`n`n<head>`n" + $head + "  <style>`n" + $css + "  </style>`n</head>`n`n<body>`n" + $body + "  <script>`n" + $js + "  </script>`n</body>`n`n</html>`n"
[System.IO.File]::WriteAllText((Join-Path $root 'index.html'), $out, $utf8)

# ---------------------------------------------------------------- theme: style.css
$themeHeader = @'
/*
Theme Name: Pacific Softcom
Theme URI: http://pacificsoftcom.com/
Author: Pacific Softcom Inc.
Author URI: http://pacificsoftcom.com/
Description: One-page landing theme for Pacific Softcom: 3CX phone systems, SIP trunking, hotel PMS integration and remote office telephony. Video hero, interactive savings calculator, before/after case studies, and a bill review form with file upload that emails leads through wp_mail. No plugin dependencies.
Version: 2.0.0
Requires at least: 6.3
Tested up to: 6.6
Requires PHP: 7.4
License: GNU General Public License v2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Text Domain: psc
Tags: one-column, custom-logo, translation-ready
*/

/* WordPress admin bar offset for the fixed header. */
body.admin-bar .site-header { top: 32px; }
@media screen and (max-width: 782px) { body.admin-bar .site-header { top: 46px; } }

'@
[System.IO.File]::WriteAllText((Join-Path $theme 'style.css'), $themeHeader + $css.Trim() + "`n", $utf8)

# ---------------------------------------------------------------- theme: main.js
New-Item -ItemType Directory -Force (Join-Path $theme 'assets\js') | Out-Null
[System.IO.File]::WriteAllText((Join-Path $theme 'assets\js\main.js'), $js.Trim() + "`n", $utf8)

# ---------------------------------------------------------------- theme: front-page.php
$b = $body

# theme asset URLs
$b = [regex]::Replace($b, '(src|poster|href)="assets/([^"]+)"', '$1="<?php psc_asset( ''assets/$2'' ); ?>"')

# bill review form posts to admin-post.php (multipart, so the bill can be attached)
$b = [regex]::Replace($b, '<form class="appt-form"[^>]*>', {
  param($m)
  "<?php list( `$psc_cls, `$psc_msg ) = psc_form_status( 'contact' ); `$psc_sent = ( 'is-ok' === `$psc_cls ); ?>`n          " +
  '<form class="appt-form" id="appt-form" action="<?php echo esc_url( admin_url( ''admin-post.php'' ) ); ?>" method="post" enctype="multipart/form-data" data-mode="post" data-status="<?php echo $psc_sent ? ''sent'' : ''''; ?>" novalidate aria-labelledby="form-title">' + "`n            " +
  '<input type="hidden" name="action" value="psc_contact">' + "`n            " +
  "<?php wp_nonce_field( 'psc_contact', 'psc_nonce' ); ?>"
})
$b = $b.Replace(
  '<div class="form-status" id="form-status" role="alert"></div>',
  '<div class="form-status <?php echo $psc_sent ? '''' : esc_attr( $psc_cls ); ?>" id="form-status" role="alert"><?php echo $psc_sent ? '''' : esc_html( $psc_msg ); ?></div>')
$b = $b.Replace('<h3 id="success-title">Request ready to send</h3>', '<h3 id="success-title">Thanks, your request is in</h3>')
$b = [regex]::Replace($b, '<p id="success-text">.*?</p>', '<p id="success-text">We will go through your bill and get back to you by phone or email. Questions before then? Call 562-489-7760.</p>')

# footer call-back form
$b = [regex]::Replace($b, '<form class="callback"[^>]*>', {
  param($m)
  "<?php list( , `$psc_cb_msg ) = psc_form_status( 'callback' ); ?>`n          " +
  '<form class="callback" id="callback-form" action="<?php echo esc_url( admin_url( ''admin-post.php'' ) ); ?>" method="post" data-mode="post" novalidate>' + "`n            " +
  '<input type="hidden" name="action" value="psc_callback">' + "`n            " +
  "<?php wp_nonce_field( 'psc_callback', 'psc_nonce' ); ?>"
})
$b = $b.Replace(
  '<p class="cb-msg" id="cb-msg" role="status" aria-live="polite"></p>',
  '<p class="cb-msg" id="cb-msg" role="status" aria-live="polite"><?php echo esc_html( $psc_cb_msg ); ?></p>')

# copyright year
$b = $b.Replace('<span id="year">2026</span>', '<span id="year"><?php echo esc_html( wp_date( ''Y'' ) ); ?></span>')

# sanity: nothing static left that would break inside WordPress
if ($b -match '"assets/')        { throw 'front-page.php: unconverted asset path remains' }
if ($b -match 'action="mailto')  { throw 'front-page.php: mailto form action remains' }

$php = @'
<?php
/**
 * Front page template: Pacific Softcom landing page.
 *
 * GENERATED by build.ps1 from src/_body.html. Do not edit by hand.
 * Styles live in style.css and behaviour in assets/js/main.js, both
 * enqueued from functions.php.
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

'@
$php += $b.TrimEnd() + "`n  <?php wp_footer(); ?>`n</body>`n`n</html>`n"
[System.IO.File]::WriteAllText((Join-Path $theme 'front-page.php'), $php, $utf8)

# ---------------------------------------------------------------- theme: assets
foreach ($dir in 'images', 'video') {
  $from = Join-Path $root "assets\$dir"
  $to   = Join-Path $theme "assets\$dir"
  New-Item -ItemType Directory -Force $to | Out-Null
  Get-ChildItem -LiteralPath $from -File | ForEach-Object { Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $to $_.Name) -Force }
}

$kb = [math]::Round((Get-Item (Join-Path $root 'index.html')).Length / 1KB, 1)
Write-Output "built index.html ($kb KB) and regenerated the theme (style.css, front-page.php, assets/js/main.js, assets)"
