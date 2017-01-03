/**
 * reload.js: https://github.com/justinforce/reload.js
 * Copyright Justin Force; Licensed under the ISC License
 */
;(function () {
  'use strict'

  var ivalNode = document.querySelector('[data-reloadjs-ival]')
  var interval = ivalNode ? ivalNode.dataset.reloadjsIval : 1000;
  var nodes = document.querySelectorAll('[data-reloadjs="true"]');
  var timestamps = {};

  function url(node) {
    return node.src || node.href;
  }

  function download(node) {
    return new Promise(function (resolve) {
      var request = new XMLHttpRequest();
      request.open('GET', url(node));
      request.onload = function() {
        resolve(
          // The value of the Last-Modified header as a Number
          Date.parse(
            request.getAllResponseHeaders()
            .split("\n")
            .filter(function (h) { return h.match(/^Last\-Modified:/) })[0]
            .split(': ')[1]
          )
        );
      };
      request.send();
    })
  }

  setInterval(function () {
    nodes.forEach(function (node) {
      var nodeUrl = url(node);
      download(node).then(function (lastModified) {
        var prevLastModified = timestamps[nodeUrl];
        timestamps[nodeUrl] = lastModified;
        if (prevLastModified === undefined)
          return
        else if (prevLastModified < lastModified)
          location.href = location.href;
      });
    });
  }, interval);
}());
