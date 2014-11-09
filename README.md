mcms-node-localization
======================

localization module for mcms-node

## What does it do
This package allows you to add localization files to your Node project. You can store the localization files in
different directories and add them asynchronously as needed. You can uses it as a standalone library or in conjunction
with a framework like Express.

## Why another localization library
Simply because i couldn't find one that fits my workflow. Most libraries have a lot of features but are highly opinionated
on how you need to work. Currently my need is for a localization library that can add translations incrementally in different
parts of my project. Also, i like to break my localization variables into multiple files for better organization, something
that most other libraries don't support.

## Install
npm install mcms-node-localization

## Folder structure
The library expects a structure like so :
```
/lang
        /en
            messages.php
        /es
            messages.php
```