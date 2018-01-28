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

The following (TiddlyWiki) plugins are available:
- **TwTube**: the basic video player plugin.
   * Includes the **Pesistent Volume** player plugin which stores your volume
     and mute settings in your browser for "_a better user experience_". (How
     many times did we hear that ... and were reminded of that famous
     [Sledge Hammer](https://en.wikipedia.org/wiki/Sledge_Hammer!) bonmot:
     "_Trust me, I know what I'm doing_"?.
   * Please note that this plugin also includes media server extension to be
     used when developing -- but don't be afraid, as this is but a 9kB
     Javascript module, so it isn't really overhead and truely worth the
     much easier (plugin) handling.
- (_optional_) **YouTube-inspired player skin** plugin.
- (_optional_) **Sublime-inspired player skin** plugin.
- (_optional_) **iPlayer-inspired player skin** plugin.
- (_optional_) **Hotkeys player plugin**.

You can install multiple additional _player skin plugins_ simultaneously.
There's a new Control Panel tab "Media Player Skins" which shows the currently
installed Video.js skin plugins from which you can choose. Of course, there's
always the Default Skin.


# Live Demo

Visit our [TiddlyWiki Video.js live demo](http://thediveo.github.io/TwTube).


# Installation

To install, simply run:

```bash
$ git clone https://github.com/TheDiveO/TWTube
$ cd TwTube
$ npm install
```

Done; this clones the TwTube GitHub repository, and then installs the required
dependencies into your local copy. Sweet'n'simple.


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

Alternatively, you can simply run the `develop` script and stop the server then
using Ctrl-C:

```bash
$ npm run develop
```

## Generate Release Files

To generate release files:

```bash
$ npm run release
```

The actual release files to generate are wired up in the
`./editions/release/tiddlywiki.info` configuration file. When you look at it,
you'll notice several sections:

* currently four sections starting with `--packplugin` commands that package the
  contents of a plugin into its plugin tiddler, and then using
  `--rendertemplatedtiddler` render the plugin into a `.tid` file for easy
  drag-and-drop installation.

* The final `--rendertiddler` command then generates the demonstration wiki
  HTML file that also includes the final plugins, but not the individual plugin
  source tiddlers anymore. So this can be used to test that the plugins work
  as expected in a user's TiddlyWiki.
