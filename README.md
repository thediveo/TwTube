# TwTube

A [Video.js widget plugin](https://videojs.com/) together with
player skin plugins and a Nodejs-based TiddlyWiki media-serving
enhancement. All forged from the [TiddlyWiki](https://tiddlywiki.com) core.

# Installation

Clone the TwTube git repository https://github.com/TheDiveO/TwTube.git and change into the local copy.

```bash
$ git clone https://github.com/TheDiveO/TwTube.git
$ cd TwTube
```

Install the required dependencies:

```bash
$ npm install tiddlywiki
```

Done.


# Usage

## Live Demo and Development

Start the TwTube development TiddlyWiki server:

```bash
$ npm start
```

Visit http://localhost:8080

Watch the demo, read the documentation included in the demo TiddylWiki,
and muck around with the code and tiddlers to your likings.

To stop the server:

```bash
$ npm stop
```

Alternatively, you can simply run the `develop` script and stop the server then using Ctrl-C:

```bash
$ npm develop
```

## Release

To generate release files:

```bash
$ npm run-script release
```
