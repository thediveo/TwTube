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

// Stuff we need...
var Widget = require("$:/core/modules/widgets/widget.js").widget;

// Here be Dragons! During development we might be loaded and executed
// not only in a web browser as usual, but also in Node.js. However,
// the Video.js library won't work in Node.js -- for obvious reasons --
// and crash. Thus, when we're run inside Node.js we need to avoid
// doing anything with the Video.js library and thus just keep a
// useless stub.
var videojs = null;
if ($tw.browser) {
  videojs = require("$:/plugins/TheDiveO/TwTube/libraries/video.js");
}

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
  // Create our DOM elements...
  this.shellDomNode = this.document.createElement("div");
  this.shellDomNode.setAttribute("data-vjs-player", "");
  this.videojsDomNode = this.document.createElement("video-js");
  this.videojsDomNode.setAttribute("class", "video-js");
  this.videojsDomNode.setAttribute("width", "100%");
  this.shellDomNode.appendChild(this.videojsDomNode);
  // ...and insert them into the DOM.
  parent.insertBefore(this.shellDomNode, nextSibling);
  this.renderChildren(this.videojsDomNode, null);
  this.domNodes.push(this.shellDomNode);
  // Now let's do the Video.js library its magic...
  if (videojs !== null) {
    videojs(this.videojsDomNode);
  }
};

//
VideojsWidget.prototype.execute = function() {
  this.makeChildWidgets();
};

VideojsWidget.prototype.refresh = function(changedTiddlers) {
  return false;
};

// Finally export our Video.js player widget so that it can be
// used as <$videojs />.
exports.videojs = VideojsWidget;

})();
