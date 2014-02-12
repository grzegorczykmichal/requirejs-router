## RequireJS Router
> A scalable, lazy loading, AMD router.

The RequireJS Router lazy loads your modules as you navigate to each page. You're site could contain 10MB of Javascript and HTML templates and it would only load the 10KB needed for the current page.

The router works with `hashchange` and HTML5 `pushState`. One set of routes will match regular paths `/`, hash paths `#/`, and hashbang paths `#!/`.

## Configuration

Here's an example `main.js` using the RequireJS Router to run the app.
```js
define([], function() {
  'use strict';

  // Configure require.js paths and shims
  require.config({
    paths: {
      'text': 'bower_components/requirejs-text/text',
      'router': 'bower_components/requirejs-router/router'
    }
  });

  // Load the router
  require(['router'], function(router) {
    // Register your routes
    router.registerRoutes({
      // matches an exact path
      home: { path: '/home', moduleId: 'home/homeView' },
      
      // matches using a wildcard
      customer: { path: '/customer/*', moduleId: 'customer/customerView' },
      
      // matches using a path variable
      order: { path: '/orders/:id', moduleId: 'order/orderView' },
      
      // matches a pattern like '/word/number'
      regex: { path: /^\/\w+\/\d+$/i, moduleId: 'regex/regexView' },
      
      // matches everything else
      notFound: { path: '*', moduleId: 'notFound/notFoundView' }
    });

    // When a route loads, render the view and attach it to the document
    router.on('routeload', function(module, routeArguments) {
      var body = document.querySelector('body');
      body.innerHTML = '';
      body.appendChild(new module(routeArguments).outerEl);
    });

    // Set up event handlers and trigger the initial page load
    router.init();
  });
});
```

There is only one instance of the router. Loading the router in multiple AMD modules will always load the same router.

## Router Properties
- `router.routes` - All registered routes
- `router.registerRoutes(routes)` - Register your routes
- `router.init([options])` - Set up event handlers and trigger the initial page load
- `router.on('routeload', routeLoadedCallback)` - Called when the route's AMD module finishes loading
- `router.routeArguments([route, [url]])` - Returns an object with the path variables and query parameter values from the URL
- `router.urlPath(url)` - Returns the hash path if it exists otherwise returns the normal path
- `router.activeRoute` - A reference to the active route `{path: '/home', moduleId: 'home/homeView'}`
- `router.loadCurrentRoute()` - Manually tell the router to load the module for the current route
- `router.testRoute(route, [url])` - Test if the route matches the current URL
- `router.on('statechange', onStateChangeCallback)` - Called when a hashchange or popstate event is fired
- `router.fire(eventName, [arg1, [arg2]])` - Manually fire an event
- `router.off(eventName, eventHandler)` - Remove an event handler

## routes
A route has 3 properties
- `path` (string or regex) - The URL path
- `moduleId` (string) - The AMD module ID
- `active` (boolean) - indicates if it's the active route

A simple route object would look like this `{path: '/home', moduleId: 'home/homeView'}`. When you navigate to `/home` it will load the `home/homeView` module.

### route.path
- The simplest path is an exact match like `/home`.
- You can use wildcards to match a segment of a path. For example `/customer/*/name` will match `/customer/123/name`.
- You can use path variables to match a segment of a path. For example `/customer/:id/name` will match `/customer/123/name`. This will set `routeArguments.id = 123` in the `onRouteLoad(module, routeArguments)`.
- You can use a regular expression to do awesome pattern matching. For example `/^\/\w+\/\d+$/i` will match a pattern like `/word/number`.
- The catch-all path `'*'` will match everything. This is generally used to load a "Not Found" view.

### route.moduleId
This is the AMD module ID. This is the ID you would use in a `require` or `define` statement like `require(['moduleId'], function(module) {})`.

### route.active
Indicates if it's the active route. `true` if it's the active route, `false` or `undefined` otherwise. This is set by the router.

## registerRoutes(routes)
Registers routes. You can call this multiple times to add additional routes.

```js
router.registerRoutes({
  home: { path: '/home', moduleId: 'home/homeView' },
  notFound: { path: '*', moduleId: 'notFound/notFoundView' }
});
```

## init([options])
Adds `hashchange` and `popstate` event listeners to the window. These are consolidated into a `statechange` event that is used by the router. `init()` then sets up a default `statechange` event handler to call `loadCurrentRoute()`. Finally it fires a `statechange` to load the current route. You can set these options to prevent some of the default behavior.

```js
init({
  // If this is false init() won't add a statechange event handler to call loadCurrentRoute()
  loadCurrentRouteOnStateChange: false,

  // If this is false init() won't fire a statechange event to load the current route
  fireInitialStateChange: false
});
```

## on('routeload', routeLoadedCallback)
Called when the route's AMD module finishes loading. Use this to render the view and attach it to the document. The module and route arguments will be passed as arguments. A simple `routeload` function like this will do everything you need.

```js
router.on('routeload', function(module, routeArguments) {
  var body = document.querySelector('body');
  body.innerHTML = '';
  body.appendChild(new module(routeArguments).outerEl);
});
```

## routeArguments([route, [url]])

You can call `routeArguments()` without any parameters to get the route arguments for the current route.

Route arguments contain path variables and query parameters. For example:
```js
// This route and URL
var route = { path: '/customer/:id' };
var url = 'http://domain.com/customer/123?orderBy=descending&filter=true';

var routeArguments = router.routeArguments(route, url);
```

Will result in these `routeArguments`
```js
{
  id: 123,
  orderBy: 'descending',
  filter: true
}
```

The route arguments are parsed into their boolean, numeric, or decoded string formats.

## urlPath(url)
Routes are first compared against the hash path (a hash starting in `#/` or `#!/`) and fall back to the regular path if no hash path exists. This allows one set of routes to work with both hashchange and HTML5 pushState. When a hashchange, popstate, or page load occures the router will find the first matching route and load that module.

For example, these URLs all have this path `/example/path`.
- `http://domain.com/example/path?queryParam=true`
- `http://domain.com/#/example/path?queryParam=true`
- `http://domain.com/#!/example/path?queryParam=true`
- `http://domain.com/other/path?queryParam2=false#/example/path?queryParam=true`

The 4th URL example ignores the normal path and query parameters since it has a hash path.

## activeRoute
A reference to the active route. Example: `{path: '/home', moduleId: 'home/homeView'}`

## loadCurrentRoute()
Tells the router to load the module for the current route. This is called by the default `on('statechange', onStateChangeHandler)` any time a hashchange or popstate event is fired.

## testRoute(route, [url])
Compares the route against the current URL. Returns `true` if it matches, `false` otherwise.

## on('statechange', onStateChangeHandler)
Called when a hashchange or popstate event is fired. `init()` sets up a default `statechange` event handler that calls `loadCurrentRoute()`. You can pass an option to `init()` to override this if you need to write your own `statechange` handler to do custom logic before `loadCurrentRoute()` is called.

## fire(eventName, [arg1, [arg2]])
Manually fire an event. The router fires `statechange` and `routeload` events. `statechange` is called when the browser fires a `hashchange` or `popstate`. `routeload` is called when the router finishes loading a module for a route. Use `routeload` to render your view.

## off(eventName, eventHandler)
Remove an event handler. If you want remove an event handler you need to keep a reference to it so you can tell router.off() with the original event handler.

## How to use
There is only one instance of the router. Using RequireJS to load the router in multiple modules will always load the same router.

There are two ways MV* frameworks handle routing and rendering. You can have `main.js` render your layout (header, footer, etc.) then use the router to load the content view and insert it into the layout. This is the top-down approach.

Alternatively you can have `main.js` directly load the content view and have the content view inject the layout. This is the IoC approach. This is the simplest and most dynamic approach.

### IoC approach
Example framework: [nex-js](http://erikringsmuth.github.io/nex-js/)

Here's an example ineraction:

1. The user clicks a link in the header `<li><a href="#/order">Orders</a></li>`
2. A `statechange` event is fired and the router loads the `'order/orderView'` module
3. The router calls your `on('routeload', function(module, routeArguments) {})` event handler with `OrderView` being passed in as the module
4. Your `routeload` event handler renders the `OrderView` which injects and renders it's `layoutView` and attaches it to the document

You're done. The layout is re-rendered with the "Orders" link marked as active and the content section populated with a new `OrderView`.

Look at the `main.js` configuration at the top of this document for an example setup.

### Top-down approach
Example framework: [Backbone.js](http://backbonejs.org/)

Here's an example ineraction:

1. The user clicks a link in the header `<li><a href="#/order">Orders</a></li>`
2. A `statechange` event is fired
3. Set up your custom `on('statechange', eventHandler)` to call `layoutView.render()` which draws your header, footer, and an empty main-content section
4. The last step in `layoutView.render()` calls `router.loadCurrentRoute()` which uses RequireJS to load the `'order/orderView'` module
5. When the module finishes loading the `on('routeload', function(module, routeArguments) {})` event handler is called with `OrderView` being passed in as the module
6. Your `routeload` event handler creates a new instance of `OrderView`, renders it, and attaches it to the layoutView's main-content section

You're done. The layoutView is re-rendered with the header links updated and the main-content section populated with a new `OrderView`.

Here's an example router and layout view setup with the top-down approach.
```js
var LayoutView = Backbone.View.extend({
  // Draw the header, footer, and an empty main-content section
  render: function() {
    this.$el.html(this.template({model: this.model}));

    // Then load the route when the layout is done being rendered
    router.loadCurrentRoute();
    return this;
  }
});

// Create one instance of your layout for your entire site
var layoutView = new LayoutView();

// Register your routes
router.registerRoutes({
  home: {path: '/', moduleId: 'home/homeView'},
  order: {path: '/order', moduleId: 'order/orderView'},
  notFound: {path: '*', moduleId: 'notFound/notFoundView'}
});

// Render the layout before loading the current route's module
router.on('statechange', function() {
  layoutView.render.call(layoutView);
});

// Called when the route's module finishes loading
router.on('routeload', function(module, routeArguments) {
  // Attach the child view to the layoutView's main-content section
  layoutView.$('#content').replaceWith(new module(routeArguments).render().el);
});

// Set up event handlers and fire the initial 'statechange' event
router.init({
  // Don't add the default 'statechange' event handler to call loadCurrentRoute() since
  // we're manually calling it from layoutView.render()
  loadCurrentRouteOnStateChange: false
});
```

The top-down approach is more involved than the IoC approach and ties you to one layout view for your site. This works in most cases but the IoC approach almost completely decouples the view rendering from the routing.

## Demo Site
The RequireJS Router was written alongside [nex-js](http://erikringsmuth.github.io/nex-js/). The site's source is available in the [gh-pages branch of nex-js](https://github.com/erikringsmuth/nex-js/tree/gh-pages). The router is configured in [/js/main.js](https://github.com/erikringsmuth/nex-js/blob/gh-pages/js/main.js). Both nex-js and the RequireJS Router are licensed under MIT.

## Navigation
The RequireJS router does not re-implement the existing navigation capabilities of browsers. There are three ways to trigger a page load. `hashchange`, `popstate`, or a page load.

If you are using `hashchange` you don't need to do anything. Clicking a link `<a href="#/new/page">New Page</a>` will fire a `hashchange` event and tell the router to load the new route. You don't need to do anything with this event in your Javascript.

If you are using HTML5 `pushState` you need one extra step. The `pushState()` method was not meant to change the page, it was only meant to push state into history. This is an "undo" feature for single page applications. To use `pushState()` to navigate to another route you need to call it like this.

```js
history.pushState(stateObj, title, url); // push a new URL into the history stack
history.go(0); // go to the current state in the history stack, this fires a popstate event
```

You can also do a normal page load which will call `router.loadCurrentRoute()` in `main.js`.

## Install
[Download](https://github.com/erikringsmuth/requirejs-router/archive/master.zip) or run `bower install requirejs-router` in node.

## Build [![Build Status](https://travis-ci.org/erikringsmuth/requirejs-router.png?branch=master)](https://travis-ci.org/erikringsmuth/requirejs-router)
- In node.js
- Run `npm install` to install dependencies
- Run `gulp` to lint and minify your code. This will also watch for changes.

## Running Tests
Open `/tests/AmdSpecRunner.html` and make sure all tests pass. The tests are written using Jasmine.
