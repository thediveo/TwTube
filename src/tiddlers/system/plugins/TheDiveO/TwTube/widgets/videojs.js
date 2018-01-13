/*\
created: 20180113145438225
title: $:/plugins/TheDiveO/TwTube/widgets/videojs.js
tags:
modified: 20180113150322040
type: application/javascript
module-type: widget
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

console.log("videojs widget init");

// Stuff we need...
var Widget = require("$:/core/modules/widgets/widget.js").widget;

// Here be Dragons! During development we might be loaded and executed
// not only in a web browser as usual, but also in Node.js. However,
// the Video.js library won't work in Node.js -- for obvious reasons --
// and crash. Thus, when we're run inside Node.js we need to avoid
// doing anything with the Video.js library and thus just keep a
// useless stub.
var vjs = {};
if ($tw.browser) {
  vjs = require("$:/plugins/TheDiveO/TwTube/libraries/video.js");
}

console.log("Video.js library", vjs);

// Widget constructor
var VideojsWidget = function(parseTreeNode, options) {
  this.initialise(parseTreeNode, options);
};

// Inherit from the base widget "class".
VideojsWidget.prototype = new Widget();

// Render widget into the DOM...
VideojsWidget.prototype.render = function(parent, nextSibling) {
  this.parentDomNode = parent;
  this.execute();
};

//
VideojsWidget.prototype.execute = function() {
};

VideojsWidget.prototype.refresh = function(changedTiddlers) {
  return false;
};

// Finally export our Video.js player widget so that it can be
// used as <$videojs />.
exports.videojs = VideojsWidget;

})();
