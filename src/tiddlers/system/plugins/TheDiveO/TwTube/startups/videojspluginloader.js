/*\
created: 20140902083720188
type: application/javascript
title: $:/plugins/TheDiveO/TwTube/startups/videojspluginloader.js
modifier: TheDiveO
modified: 20180125125026949
creator: TheDiveO
module-type: startup
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

// Where the video.js (CommonJS) module is to be found in this plugin.
var TWTUBE_VIDEOJS = "$:/plugins/TheDiveO/TwTube/libraries/video.js";
// Filter expression matching videojs plugin tiddlers.
var VIDEOJS_PLUGIN_FILTER = "[type[application/javascript]tag[$:/tags/VideojsPlugin]]";

// Some necessary TiddylWiki startup module meta/configuration data:
// this startup module needs to be run after the "startup" startup
// module from the TW core. The reason is that we (1) need $tw.wiki
// to be properly populated, and (2) some performance measuring
// stuff we don't need, but which the tiddler filtering mechanism
// insists of getting. In consequence, or startup module needs to
// run after the startup startup module ... I like the crazy
// ring of this dependency definition...
exports.name = "videojspluginloader";
exports.after = ["startup"];
exports.synchronous = true;

// During the startup phase of a TiddlyWiki (or, rather near its end)
// we are pulling in the Video.js video player base module from its
// library tiddler. Next, we load any Video.js framework plugins we
// can find -- based on the special $:/tags/VideojsPlugin tag.
// Oh, did I mention that we need to run through all these loops
// only when we're running inside a browser?!
exports.startup = function TwTubeStartup() {
  if ($tw.browser) {
    // We *NEED* to get our Video.js library activated here, because
    // the videojs plugins rely on it being active by now. Albeit we
    // will later load the plugins as CommonJS modules, there might be
    // some that may choose to use the "global" videojs object reference
    // instead. Thus we simply pull in videojs now.
    var videojs = $tw.modules.execute(TWTUBE_VIDEOJS);

    // Prepare a template sandbox for loading video.js plugins; as
    // there may be multiple plugins we simply setup a clean context
    // once from which we later clone throw-away contexts just for
    // the purposes of video.js plugin activation.
    var sandbox = $tw.utils.extend({}, {
      console: console,
      setInterval: setInterval,
      clearInterval: clearInterval,
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      exports: {},
      videojs: videojs,
      $tw: $tw
    });

    // A (rather short) list of global aliases required in order to
    // correctly resolve absolute require()s used in some plugins.
    var aliases = {
        "video.js": TWTUBE_VIDEOJS
    };

    // A special-purpose require() implementation (solely) for use in
    // videojs plugins: as the modules of such videojs plugins will often
    // be packaged in a TiddlyWiki plugin with their titles somewhere
    // inside the TiddylWiki system namespace ($:/), we need to play some
    // games with the module names to tiddler titles mapping.
    var pluginrequire = function(moduleTitle, contextTitle) {
      if ((moduleTitle.substr(0, 3) !== "$:/")
        && (moduleTitle.substr(0, 1) !== ".")) {
        // So we got an absolute module title which wouldn't be usable
        // at all. So we first check with our (compact) list of known
        // aliases; if there's a match, then go for it!
        if (aliases[moduleTitle]) {
          return $tw.modules.execute(aliases[moduleTitle], "");
        }
        // It's none of the known aliases, thus we now try to resolve in
        // the context of the particular videojs plugin location (title).
        // This handles intra-plugin require()s which use absolute module
        // names where they should use relative ones instead. Sigh.
        try {
          var absmodtitle = contextTitle;
          if (absmodtitle.substr(-1) !== "/") {
            absmodtitle += "/";
          }
          absmodtitle += moduleTitle;
          console.log("local require:", moduleTitle, "in", contextTitle);
          var mod = $tw.modules.execute(absmodtitle, "");
          return mod;
        } catch (e) {
          console.log(e);
        };
      }
      // If nothing works, desparately attempt to load the module with
      // the module name taken verbatim...
      console.log("global require:", moduleTitle);
      return $tw.modules.execute(moduleTitle, "");
    };

    // Now load all video.js plugins we can find; these plugins need to be
    // tagged with $:/tags/VideojsPlugin and of type "application/javascript".
    // They should NOT have a "module-type" field set.
    var vjsplugins = $tw.wiki.filterTiddlers(VIDEOJS_PLUGIN_FILTER);
    $tw.utils.each(vjsplugins, function loadplugin(pluginTitle, index) {
      var vjsplugincode = $tw.wiki.getTiddlerText(pluginTitle, "");
      var pluginexports = {};
      var pluginsandbox = $tw.utils.extend({}, sandbox, {
        module: {exports: pluginexports},
        exports: pluginexports,
      });
      var lastslash = pluginTitle.lastIndexOf("/");
      var pluginRoot = lastslash >= 0 ? pluginTitle.substr(0, lastslash-1) : "";
      pluginsandbox.require = function(moduleTitle) {
        return pluginrequire(moduleTitle, pluginRoot);
      };
      $tw.utils.evalSandboxed(vjsplugincode, pluginsandbox, pluginTitle);
      // TODO: keep exports?
    });

  } // if $tw.browser
};

})();
