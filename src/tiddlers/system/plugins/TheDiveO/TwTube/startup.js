/*\
created: 20140902083720188
type: application/javascript
title: $:/plugins/TheDiveO/TwTube/startup.js
modifier: TheDiveO
modified: 20180125125026949
creator: TheDiveO
module-type: startup
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";


// Specific startup settings; make sure to run this startup module
// strictly after the load-modules and startup startup -- because we
// need the $tw.wiki wikimethods to be present. Without this dependency
// we might (will) end up being run before $tw.wiki has been populated
// with the more interesting wiki methods. To add insult to injury, we
// also need to run after the startup startup module. Oh well...
exports.name = "twtubestartup";
exports.after = ["startup"];
exports.synchronous = true;


// The function to run during the startup phase of a TiddlyWiki.
// We then pull in the Video.js video player base module from its
// library tiddler. Afterwards, we load any Video.js framework
// plugins we find...
//
// ...oh, did I mention that we need to run through all these loops
// only when we're running inside a browser?!
exports.startup = function TwTubeStartup() {
  if ($tw.browser) {
    // We *NEED* to get our Video.js library activated here, because
    // the videojs plugins rely on it being active by now.
    var videojs = $tw.modules.execute("$:/plugins/TheDiveO/TwTube/libraries/video.js");

    // Prepare a template context for loading video.js plugins; as
    // there may be multiple plugins we simply setup a clean context
    // once from which we later clone throw-away contexts just for
    // the purposes of video.js plugin activation.
    var context = $tw.utils.extend({}, {
      console: console,
      setInterval: setInterval,
      clearInterval: clearInterval,
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      exports: {},
      videojs: videojs,
      $tw: $tw
    });

    // TODO
    var twtuberequire = function TwTubeRequire(moduleTitle, contextTitle) {
      if ((moduleTitle.substr(0, 3) !== "$:/")
        && (moduleTitle.substr(0, 1) !== ".")) {
        // could be a pseudo-absolute module title which in fact should be
        // taken as relative to this module. So try to resolve as relative.
        try {
          var absmodtitle = contextTitle + "/" + moduleTitle;
          console.log("trying", absmodtitle);
          var mod = $tw.modules.execute(absmodtitle, "");
          console.log("succeeded.");
          return mod;
        } catch (e) {
          console.log(e);
        };
      }
      console.log("falling back to trying "+moduleTitle);
      return $tw.modules.execute(moduleTitle, "");
    };

    // Now load all video.js plugins we can find; these plugins need to be
    // tagged with $:/tags/VideojsPlugin and of type "application/javascript".
    // They should NOT have a "module-type" field set.
    console.log("loading plugins...");
    var vjsplugins = $tw.wiki.filterTiddlers("[type[application/javascript]tag[$:/tags/VideojsPlugin]]");
    $tw.utils.each(vjsplugins, function loadplugin(pluginTitle, index) {
      console.log("loading plugin", pluginTitle);
      var vjsplugincode = $tw.wiki.getTiddlerText(pluginTitle, "");
      var pluginexports = {};
      var plugincontext = $tw.utils.extend({}, context, {
        module: {exports: pluginexports},
        exports: pluginexports,
      });
      plugincontext.require = function(moduleTitle) {
        return twtuberequire(moduleTitle, "$:/plugins/TheDiveO/TwTube/libraries");
      };
      $tw.utils.evalSandboxed(vjsplugincode, plugincontext, pluginTitle);
    });

  } // if $tw.browser
};

})();
