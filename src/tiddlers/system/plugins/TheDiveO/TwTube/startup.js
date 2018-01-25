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
exports.startup = function TwTubeStartup() {
  if ($tw.browser) {
    console.log("TwTube startup...");
    var videojs = $tw.modules.execute("$:/plugins/TheDiveO/TwTube/libraries/video.js");

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

    var twtuberequire = function TwTubeRequire(moduleTitle, contextTitle) {
      if ((moduleTitle.substr(0, 3) !== "$:/")
        && (moduleTitle.substr(0, 1) !== ".")) {
        // could be a pseudo-absolute module title which in fact should be
        // taken as relative to this module. So try to resolve as relative.
        try {
          console.log("trying ./"+moduleTitle);
          mod = $tw.modules.execute("./" + moduleTitle, contextTitle);
          console.log("succeeded.");
          return mod;
        } catch (e) {
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
      context.require = function(moduleTitle) {
        return twtuberequire(moduleTitle, "$:/plugins/TheDiveO/TwTube/libraries");
      };
      $tw.utils.evalSandboxed(vjsplugincode, context, pluginTitle);
    });

  } // if $tw.browser
};

})();
