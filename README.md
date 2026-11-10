# FutsalMe card game

PHP + MySQL futsal card game (packs, collections, formations). Runs on a local XAMPP install.

## Setup

1. Put this folder in `htdocs` as `CardGame` and import the `ncf` database.
2. Copy `config.example.php` to `config.local.php` and set your database login.
   `config.local.php` is gitignored, so passwords never get committed.

## Email (optional)

Email is off by default: new accounts are confirmed straight away.

To turn on confirmation emails, set `SMTP_USERNAME`, `SMTP_PASSWORD` (for Gmail,
an [app password](https://myaccount.google.com/apppasswords)) and `PHPMAILER_PATH`
in `config.local.php`.
