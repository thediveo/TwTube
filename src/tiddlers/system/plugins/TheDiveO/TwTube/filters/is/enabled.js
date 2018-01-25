/*\
created: 20180113145438225
modified: 20180113150322040
title: $:/plugins/TheDiveO/TwTube/filters/is/enabled.js
type: application/javascript
module-type: isfilteroperator

Filter function for `[is[enabled]]` -- which removes all
titles from the input which belong to disabled plugins.
Please note that this even covers tiddlers that overwrite
shadow tiddlers from a plugin.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

/*
Export our filter function
*/
exports.enabled = function(source, prefix, options) {
	var results = [];
	var noninvert = prefix !== "!";

	source(function(tiddler, title) {
		// Is the tiddler in question a shadow tiddler? Then the TW core will
		// tell us to which plugin it belongs; this is called the "source".
		var pluginTitle = options.wiki.getShadowSource(title);
		console.log("checking", title, "for shadow source:", pluginTitle);
		if (pluginTitle === null) {
			// Hmm. This tiddler is not a shadow tiddler. But it might be, erm,
			// shadowing the shadow tiddler in a plugin. This may be the case when
			// developing TW plugins inside TW itself (such as using ThirdFlow).
			// So we now try to find a corresponding plugin by climbing up the
			// titles namespace.
			var titleElements = title.split("/");
			do {
				var t = options.wiki.getTiddler(titleElements.join("/"));
				if (t) {
					if (t.hasField("plugin-type")) {
						// climbing up the namespace we're finally arrived at the
						// (logically) enclosing plugin.
						break;
					}
				}
				titleElements.pop(); // go up, erm, ... sorry ;)
			} while (titleElements.length);
			pluginTitle = titleElements.join("/");
		}
		// If we got a non-empty plugin title one way or the other, we
		// now check whether the plugin has been disabled. If not, add
		// the title to the result list.
		console.log("disable check on plugin:", pluginTitle);
		if (pluginTitle !== null && pluginTitle !== "") {
			var pluginConfigDisabled = options.wiki.getTiddler("$:/config/Plugins/Disabled/" + pluginTitle);
			if ((((pluginConfigDisabled && pluginConfigDisabled.fields.text) || "").trim() !== "yes")
					=== noninvert) {
				console.log("accepted:", title);
				results.push(title);
			}
		}
	});
	return results;
};

})();
