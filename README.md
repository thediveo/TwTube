# About

**TwTube** is a [Video.js widget plugin](https://videojs.com/) together
with some associated player skin plugins, all for
[TiddlyWiki 5](https://tiddlywiki.com).

In addition, the TwTube plugin comes with an enhanced TiddlyWiki media(!)
server for use on Node.js. This "media TiddlyWiki server" is intended to
be used during development of a TiddyWiki using especially video media,
but not for production use. For production, deploy the release TiddlyWiki
HTML file on your web (media) production server, such as a document sharing
point.

The following plugins are available:
- TwTube: the video player plugin. This plugin also includes media server
  extension, but this is just a 9kB Javascript module, so it isn't really
  overhead and worth the much easier handling.
- (optional) YouTube-inspired player skin plugin.
- (optional) Sublime-inspired player skin plugin.
- (optional) iPlayer-inspired player skin plugin.

You can install multiple player skin plugins simultaneously, but then you
need to ensure to disable all skin plugins except at most _one_ of them.
If no skin plugin is installed or enabled, then the default Video.js skin
gets used that comes with the TwTube plugin.


# Installation

Clone the TwTube git repository https://github.com/TheDiveO/TwTube.git and
change into the local copy.

```bash
$ git clone https://github.com/TheDiveO/TwTube.git
$ cd TwTube
```

Install the required dependencies (well, the only _one_):

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
