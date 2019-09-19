"use strict";

exports.__esModule = true;
exports.getScrollingParent = exports.getEdgeOffset = exports.getPosition = exports.closest = exports.setTransitionDuration = exports.setTranslate3d = exports.setInlineStyles = void 0;

var setInlineStyles = function setInlineStyles(node, styles) {
  if (styles !== null) {
    Object.keys(styles).forEach(function (key) {
      if (node !== null) {
        node.style[key] = styles[key];
      }
    });
  }
};

exports.setInlineStyles = setInlineStyles;

var setTranslate3d = function setTranslate3d(node, translate) {
  if (node !== null) {
    node.style['transform'] = translate ? "translate3d(" + translate.x + "px," + translate.y + "px,0)" : '';
  }
};

exports.setTranslate3d = setTranslate3d;

var setTransitionDuration = function setTransitionDuration(node, duration) {
  if (node !== null) {
    node.style['transitionDuration'] = duration ? duration + "ms" : '';
  }
};

exports.setTransitionDuration = setTransitionDuration;

var isScrollable = function isScrollable(el) {
  var computedStyle = window.getComputedStyle(el);
  var overflowRegex = /(auto|scroll)/;
  var properties = ['overflow', 'overflowX', 'overflowY'];
  return properties.find(function (property) {
    return overflowRegex.test(computedStyle[property]);
  });
};

var closest = function closest(el, fn) {
  while (el) {
    if (fn(el)) {
      return el;
    }

    el = el instanceof Element && el.parentNode;
  }

  return null;
};

exports.closest = closest;

var getPosition = function getPosition(event) {
  return {
    x: event.pageX || 0,
    y: event.pageY || 0
  };
};

exports.getPosition = getPosition;

var getEdgeOffset = function getEdgeOffset(node, parent, offset) {
  if (offset === void 0) {
    offset = {
      left: 0,
      top: 0
    };
  }

  if (!node || !parent) {
    return {};
  } // Get the actual offsetTop / offsetLeft value, no matter how deep the node is nested


  var nodeOffset = {
    left: offset.left + node.offsetLeft,
    top: offset.top + node.offsetTop
  };

  if (node.parentNode === parent) {
    return nodeOffset;
  }

  return getEdgeOffset(node.parentNode, parent, nodeOffset);
};

exports.getEdgeOffset = getEdgeOffset;

var getScrollingParent = function getScrollingParent(el) {
  if (!(el instanceof HTMLElement)) {
    return null;
  } else if (isScrollable(el)) {
    return el;
  } else {
    return getScrollingParent(el.parentNode);
  }
};

exports.getScrollingParent = getScrollingParent;