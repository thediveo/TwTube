/*\
title: $:/plugins/TheDiveO/TwTube/commands/mediaserver.js
type: application/javascript
module-type: command

Serve tiddlers and additionally media(!) resources over HTTP.
When serving media resources, both single requests ("en bloc")
as well as range transfers are supported. Supported media types
are currently those registered with the TW core.

Media can be served not only en bloc, but additionally HTTP ranges
are supported. The only limitation is that only a single range
per GET request is supported.

Optional parameters:

1. location of media files (and optionally URL path "prefix").
   For instance "assets/media=media". Defaults to "media".
2. same as --server parameter.
3. ...

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

if ($tw.node) {
	var fs = require("fs");
	var url = require("url");
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
	// The first parameter of the --mediaserver command specifies
	// where to find the (subtree of) media files -- and optionally,
	// where the HTTP clients can address them in the URL namespace.
	// Format(s):
	// "media" ... media file location, = URL prefix
	// "assets/media=video" ... media files in assets/media, URL prefix /video
	var mediaparam = (params[0] || "media").split("=");
	var mediapath = path.resolve(mediaparam[0]);
	$tw.utils.log("media path: " + mediapath);
	
	var urlprefix = mediaparam[1];
	if (urlprefix) {
		// URL prefix explicitly specified, so we use that. For convenience,
		// we accept relative prefixes which are then interpreted as relative
		// to the prefix "/".
		urlprefix = new URL(urlprefix, "/").pathname;
	} else {
		// no URL prefix specified, so let's use either a prefix relative
		// to the CWD or an absolute prefix in case the media files are
		// not inside the CWD or any subdir thereof.
		urlprefix = mediapath;
		cwd = path.resolve();
		if (urlprefix.substr(0, cwd.length) == cwd) {
			urlprefix = urlprefix.substr(cwd.length);
		}
		// Ensure that the URL prefix is absolutely absolute.
		if (urlprefix.substr(0, 1) !== "/") {
			urlprefix = "/" + urlprefix;
		}
	}
	// Ensure that the URL prefix always end in a slash. This
	// simplifies processing later...
	if (urlprefix.substr(-1) != "/") {
		urlprefix += "/";
	}
	$tw.utils.log("url prefix: " + urlprefix);
	// Phew, the ugly preprocessing is finally done, now we can
	// do the heavy lifting ... or rather let the TW core server
	// command module do the work. :)

	// Construct an ordinary server command object which does the
	// heavy lifting, then add in our media handling. This way we
	// don't need to reinvent the wheel. Pass in the remaining
	// command parameters.
	var svrcmd = new serverCmd.Command(params.slice(1), commander, callback);

	// Augment the command execution from the --server logic with
	// handling of media resources...
	svrcmd.inheritedExecute = svrcmd.execute;
	svrcmd.execute = function() {
		$tw.utils.log("Media serving from " + mediapath + " at path " + urlprefix,
			"brown/orange");
		return this.inheritedExecute();
	};

	// Add in a new media resources GET handling route that covers
	// the URL prefix namespace in requests. Media resource files
	// are then served from the local mediapath file space.
	svrcmd.server.addRoute({
		method: "GET",
		path: new RegExp("^" + urlprefix + "(.+)$"),
		handler: function(request, response, state) {
			$tw.utils.log("media request for " + request.url);
			// Get the URL path and resource name, and make sure
			// that the client cannot play tricks on us by trying
			// to get outside the mediapath root using lots of
			// "../" path elements.
			try {
				var medrsc = mediapath + url.parse(request.url).pathname.substr(1);
			} except (err) {
				response.writeHead(400, {
					"Content-Type": "text/plain"
				});
				response.write("400 bad request");
				response.end();
				return;
			}

			// Make sure that the requested media exists and that it actually
			// is a file. We need this in order to determine the size of
			// the media to serve.
			var mediastat;
			try {
				mediastat = fs.statSync(medrsc);
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
			var filetypeinfo = $tw.utils.getFileExtensionInfo(path.extname(medrsc));
			if (filetypeinfo === null) {
				response.writeHead(500, {
					"Content-Type": "text/plain"
				});
				response.write("500 unknown media type");
				$tw.utils.log("unknown media type for " + med, "red");
				return;
			}
			var mediatype = filetypeinfo.type;

			var range = request.headers.range;
			if (range && range.length) {
				// an HTTP client requests only part of a media resource, so we
				// need to decode the requested range and then check if this
				// range is satisfiable. If yes, we respond with 206 partial
				// content, otherwise with 416 without content but the allowed
				// range.
				//
				// Ranges can be specified by clients as follows, see also
				// RFC 7233 for the gory details -- but note that we don't
				// support multiple ranges.
				//
				// (1) from-to ... range from-to (bytes) including,
				// (2) from-   ... range from to end (bytes).
				// (3) -last   ... range of only the last (bytes).
				//
				// In case a range is outside the resource limits, then
				// the server must respond with status 416.
				var start = 1, end = 0;
				var parts = range.replace(/bytes=/, "").split("-");
				if (parts.length != 2
				if (parts[0].length && parts[1].length) {
					// case (1) from-to
					start = parseInt(parts[0], 10);
					end = parseInt(parts[1], 10);
				} else if (parts[0].length && !parts[1].length) {
					// case (2) from-
					start = parseInt(parts[0], 10);
					end = mediasize - 1;
				} else if (!parts[0].length && parts[1].length) {
					// case (3) -last
					end = mediasize - 1;
					start = mediasize - parseInt(parts[1], 10);
					if (start < 0) { // see RFC 7233, 2.1
						start = 0;
					}
				}
				
				if (start > end || start >= mediasize || end >= mediasize) {
					// The range is not satisfiable, so it's time for a
					// status 416 response with the maximum allowed range.
					response.writeHead(416, {
						"Accept-Ranges": "bytes",
						"Content-Range": "bytes */" + mediasize,
						"Content-Type": "text/plain" 
					});
					response.write("416 requested range not satisfiable");
					response.end();
					return;
				}
				
				$tw.utils.log("media served piece-wise from " + start + " to " + end + "/" + mediasize);
				response.writeHead(206, {
					"Accept-Ranges": "bytes",
					"Content-Range": "bytes " + start + "-" + end + "/" + mediasize,
					"Content-Length": end - start + 1,
					"Content-Type": mediatype
				});
				fs.createReadStream(medrsc, {start: start, end: end}).pipe(response);
			} else {
				// an HTTP client requests a media resource en bloc, so we give
				// the response the media file stream to send back. Sweet and simple.
				// Nevertheless we indicate to the client that we would accept
				// ranges in GET requests to these media resources.
				$tw.utils.log("media served en bloc");
				response.writeHead(200, {
					"Accept-Ranges": "bytes",
					"Content-Type": mediatype,
					"Content-Length": mediasize
				});
				fs.createReadStream(medrsc).pipe(response);
			}
		}
	});
	// Done.
	return svrcmd;
};

// Finally export our modified --mediaserver command constructor.
exports.Command = Command;

})();
