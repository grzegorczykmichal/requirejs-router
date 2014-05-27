define(function(require) {
  'use strict';
  var app       = require('app'),
      template  = require('text!./sidebar2Template.html'),
      Layout    = require('layouts/sidebarLayout/layout');

  app.controller('Sidebar2Controller', ['$scope', function ($scope) { }]);

  return {
    layout: Layout.template,
    template: template
  };
});