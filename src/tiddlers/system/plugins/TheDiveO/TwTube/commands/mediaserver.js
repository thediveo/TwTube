/*\
title: $:/plugins/TheDiveO/TwTube/commands/mediaserver.js
type: application/javascript
module-type: command

Serve tiddlers and additionally media(!) resources over HTTP.
When serving media resources, both single requests ("en bloc")
as well as range transfers are supported. Supported media types
are currently those registered with the TW core.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

if ($tw.node) {
	var fs = require("fs");
	var path = require("path");
	var serverCmd = require("$:/core/modules/commands/server.js");
}

exports.info = {
	name: "mediaserver",
	synchronous: true
};

// The --mediaserver command constructor. In our specific case,
// we make use of JavaScript's object-based and prototype-based
// language/runtime system: in order to inherit the base functionality
// of the existing --server command, we create an instance of it
// and then add in our additional stuff.
var Command = function(params, commander, callback) {
	// Store away the location of the media files; make sure to sanitize
	// the user parameter by, erm, slashing any leading or trailing slashes.
	var media = params[0] || "media";
	media = media.replace(/^\/|\/$/g, ""); // this is *NOT* ASCII art.

	// Construct an ordinary server command object which does the
	// heavy lifting, then add in our media handling. This way we
	// don't need to reinvent the wheel.
	var svrcmd = new serverCmd.Command(params.slice(1), commander, callback);

	// Augment the command execution from the --server logic with
	// handling of media resources...
	svrcmd.inheritedExecute = svrcmd.execute;
	svrcmd.execute = function() {
		if (media === "") {
			return "media path must not be empty";
		}
		$tw.utils.log("Media serving from ./" + media + " at path /" + media, "brown/orange");
		return this.inheritedExecute();
	};

	// Add in media resources handling route...
	svrcmd.server.addRoute({
		method: "GET",
		path: new RegExp("^/" + media + "/(.+)$"), // /^\/media\/(.+)$/,
		handler: function(request, response, state) {
			$tw.utils.log("media request for " + request.url);
			var mediapath = request.url.substr(1);

			// Make sure that the requested media exists and that it actually
			// is a file. We need this in order to determine the size of
			// the media to serve.
			var mediastat;
			try {
				mediastat = fs.statSync(mediapath);
			} catch (err) {
				// NOP: leave mediastat undefined.
			}
			if (mediastat === undefined || !mediastat.isFile()) {
				response.writeHead(404, {
					"Content-Type": "text/plain"
				});
				response.write("404 media resource not found");
				response.end();
				return;
			}
			var mediasize = mediastat.size;

			// Determine the media type from the media file extension.
			var filetypeinfo = $tw.utils.getFileExtensionInfo(path.extname(mediapath));
			if (filetypeinfo === null) {
				response.writeHead(500, {
					"Content-Type": "text/plain"
				});
				response.write("500 unknown media type");
				$tw.utils.log("unknown media type for /" + mediapath, "red");
				return;
			}
			var mediatype = filetypeinfo.type;

			var range = request.headers.range;
			if (range) {
				// an HTTP client requests only part of a media resource, so we
				// clamp the requested range to the limits of the requested media
				// file. We also inform the client of the available full media
				// range, so it can know in advance what to expect.
				var parts = range.replace(/bytes=/, "").split("-");
				var start = parseInt(parts[0], 10);
				var end = parts[1] ? parseInt(parts[1], 10) : mediasize - 1;
				$tw.utils.log("media served piece-wise from " + start + " to " + end + "/" + mediasize);
				response.writeHead(206, {
					"Content-Range": "bytes " + start + "-" + end + "/" + mediasize,
					"Accept-Ranges": "bytes",
					"Content-Length": end - start + 1,
					"Content-Type": mediatype
				});
				fs.createReadStream(mediapath, {start, end}).pipe(response);
			} else {
				// an HTTP client requests a media resource en bloc, so we give
				// the response the media file stream to send back. Sweet and simple.
				$tw.utils.log("media served en bloc");
				response.writeHead(200, {
					"Content-Length": mediasize,
					"Content-Type": mediatype
				});
				fs.createReadStream(mediapath).pipe(response);
			}
		}
	});
	// Done.
	return svrcmd;
};

// Finally export our modified --mediaserver command constructor.
exports.Command = Command;

})();
