bit-loader
==========

[![Build Status](https://travis-ci.org/MiguelCastillo/bit-loader.svg?branch=master)](https://travis-ci.org/MiguelCastillo/bit-loader)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/MiguelCastillo/bit-loader?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> Dependency loading and managment micro framework

## Overview

bit loader is a micro framework that provides hooks for loading files, which get put through a processing pipeline that ultimately creates Modules.

The processing pipeline is a key feature.  In the processing pipeline you get a _transformation_ workflow, which is a very powerful tool for processing _your_ files.  It is in the transformation stage where you get a chance to define how _your_ files are processed.  For example, you might be using coffeescript that needs to be transformed to JavaScript.  You can add a coffeescript transform - we'll show a sample coffeescript transform below.  Or you may want to automatically add `'use strict;'` in your code before it runs...  Well you can _very_ easily create a transform that does just that!

The transformation workflow is designed for simplicity and extensibility. So what does a transform that compiles coffeescript look like?  Probably like this:

#### coffeescript transform
``` javascript
function compileCoffeescript(moduleMeta) {
  moduleMode.source = coffeescript.compile(moduleMeta.source);
}

module.exports = compileCoffeescript
```

#### 'use strict'; transform
``` javascript
function addStrict(moduleMeta) {
  moduleMode.source = "'use strict;'\n" + moduleMode.source;
}

module.exports = addStrict
```


That's really simple!

The transformation workflow is [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) based, so you can return promises from your transform if you need to run an async operation that the transformation workflow needs to wait for.  The execution of the transformation workflow can also be stopped by any transform that *returns false*.  This is really useful for writing transforms that handle an operation and don't need the rest of the transformation workflow to execute.  You can get more fancy and write a tranform for [6to5](https://6to5.org/) like [this one](https://github.com/MiguelCastillo/bit-transforms-sandbox/blob/master/transforms/6to5.js). The 6to5 transform is actually a browserified module, so please use the *amazing* [browserify](http://browserify.org/) to generate build artifacts which can be consumed by bit loader.

We have talked all about the transformation workflow, and rightfully so because that's an incredibly important part of bit loader.  But there are other features that are really important as well.

bit loader has a two stage compilation system.  The first stage loads the source files, puts them through the transformation workflow, and then loads all the dependencies. The dependencies will 'recursively' go through stage one until no more dependencies are left to process.  The primary purpose for this stage is to get all necessary source ready for the second stage, which is the linking process.  This is where the final Module instance is created.

This two stage process is very important because it allows us to create Modules synchronously, even though the loading process is asynchronous, which gives the oportunity to enable support for `CJS`,`AMD`, and `ES6 modules` simultaneously.


## Key parts and hooks

### Fetch

In order to create something useful, bit loader provides a hook for a `fetch` interface, which defines how source files are read from storage.  This abstraction exists to keep the process of creating Modules separate from the process of *fetching* files from disk, HTTP(s), or whatever else you may fancy.

The fetch interface returns a *module meta* object.  Which is a simple object with a couple of properties and or methods used by bit loader in order to create Modules. The most basic form of module meta is an object with a single property `code`, which is used by bit loader to create an instance of a Module. Alternatively, module meta could have a `compile` method, to which bit loader delegates the process of creating the Module instance. The result from calling `compile` is the instance of Module.

Below is a simple example for creating an instance of bit loader, passing in a fetch interface that returns a module meta with `code`.  More details on module meta below (TODO).

#### Fetch example returning a module meta with a property `code`

``` javascript
function fetchFactory(loader) {
  return {
    fetch: function(name) {
      // Notice that fetch returns a simple object with a `code` property.
      // This object returned is what we call a module meta object.
      return {code: name + " is fetched"};
    }
  }
}

var loader = new Loader({}, {fetch: fetchFactory});
var reuslt = loader.fetch("like")

// result is {code: 'like is fetched'}
console.log(result);
```

#### Fetch example returning a module meta with a method `compile`

``` javascript
// When fetchFactory is called, the instance of loader is passed in.
function fetchFactory(/*loader*/) {
  function compile() {
    // `this` is an augmented meta module object that has access to manager,
    // which is the instance of loader.
    return new this.manager.Module({code: this.name + " is fetched"});
  }

  return {
    fetch: function(name) {
      // Notice that fetch returns a simple object with a `compile` method.
      // This object returned is what we call a module meta object.
      return {compile: compile};
    }
  }
}

var loader = new Loader({}, {fetch: fetchFactory});
var reuslt = loader.fetch("like")

// result is {code: 'like is fetched'}
console.log(result);
```

But that's just the first building block in the puzzle.  As we will see later, when you call `load` or `import` is when you are start to see more relevant capabilities of module loading.

[bit imports](https://github.com/MiguelCastillo/bit-imports) implements the `fetch` interface, which is a good reference implementation to see a fully functional module loader implementaion leveraging bit loader capabilities.


### Load (TODO)

### Import (TODO)

### Module (TODO)

### Module Meta (TODO)

## Architecture (TODO)

#### Load diagram

![Load diagram](https://raw.githubusercontent.com/MiguelCastillo/bit-loader/master/img/Loader-Load.png)
