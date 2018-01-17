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
  this.computeAttributes();
  this.execute();
  // Create our DOM elements...
  this.shellDomNode = this.document.createElement("div");
  this.shellDomNode.setAttribute("data-vjs-player", "");
  this.videojsDomNode = this.document.createElement("video-js");
  // General
  if (this.vidClass) {
    this.videojsDomNode.setAttribute("class", "video-js " + this.vidClass);
  } else {
    this.videojsDomNode.setAttribute("class", "video-js");
  }

  // Lump all the many video/video-js element attributes into
  // a JSON object and later hand that over in one go.
  var dataSetup = {};

  // Multikulti
  if (this.vidLanguage) {
    dataSetup["language"] = this.vidLanguage;
  }
  // Geometry
  if (this.vidAspectRatio) {
    dataSetup["aspectratio"] = this.vidAspectRatio;
  }
  if (this.vidFluid) {
    dataSetup["fluid"] = this.vidFluid;
  }
  if (this.vidWidth) {
    dataSetup["width"] = this.vidWidth;
  }
  if (this.vidHeight) {
    dataSetup["height"] = this.vidHeight;
  }
  // Player control
  if (this.vidAutoplay) {
    dataSetup["autoplay"] = this.vidAutoplay;
  }
  if (this.vidControls) {
    dataSetup["controls"] = this.vidControls;
  }
  if (this.vidLoop) {
    dataSetup["loop"] = this.vidLoop;
  }
  if (this.vidMuted) {
    dataSetup["muted"] = this.vidMuted;
  }
  if (this.vidPreload) {
    dataSetup["preload"] = this.vidPreload;
  }
  if (this.vidPoster) {
    dataSetup["poster"] = this.vidPoster;
  }

  // Finalize the setup parameters and then add our video element.
  this.videojsDomNode.setAttribute("data-setup", JSON.stringify(dataSetup));
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

// Compute the internal state of the videojs widget. Also make
// sure that all child widgets/elements get correctly created.
VideojsWidget.prototype.execute = function() {
  // Get our parameters...
  // General
  this.vidClass = this.getAttribute("class");
  // CSS classes: we take additional CSS class definitions from
  // skin plugins into account.
  var skinClasses = this.getVariable("twtube-skin-classes");
  if (skinClasses !== undefined) {
    this.vidClass += " " + skinClasses;
  }
  // Multikulti
  this.vidLanguage = this.getAttribute("language");
  //this.vidLanguages = this.getAttribute("languages");
  // Geometry
  this.vidAspectRatio = this.getAttribute("aspectratio");
  this.vidFluid = this.getAttribute("fluid");
  this.vidWidth = this.getAttribute("width");
  this.vidHeight = this.getAttribute("height");
  // Player control
  this.vidAutoplay = this.getAttribute("autoplay");
  this.vidControls = this.getAttribute("controls");
  this.vidLoop = this.getAttribute("loop");
  this.vidMuted = this.getAttribute("muted");
  this.vidPreload = this.getAttribute("preload");
  this.vidPoster = this.getAttribute("poster");

  // "Don't forget about the Children!"
  this.makeChildWidgets();
};

// Decide whether the video widget needs to be refreshed, either
// because its own state changed or its children.
VideojsWidget.prototype.refresh = function(changedTiddlers) {
  var changedAttributes = this.computeAttributes();
  if (
    changedAttributes["class"]
    || changedAttributes["language"]
    || changedAttributes["aspectratio"]
    || changedAttributes["fluid"]
    || changedAttributes.width
    || changedAttributes.height
    || changedAttributes["autoplay"]
    || changedAttributes["controls"]
    || changedAttributes["loop"]
    || changedAttributes["muted"]
    || changedAttributes["preload"]
    || changedAttributes["poster"]
  ) {
    this.refreshSelf();
    return true;
  }
  return false;
};

// Finally export our Video.js player widget so that it can be
// used as <$videojs />.
exports.videojs = VideojsWidget;

})();
