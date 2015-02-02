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

bit loader has a two stage compilation system.  The first stage loads the source files from storage, puts them through the transformation workflow, and then loads all the dependencies. The dependencies will 'recursively' go through this first stage until no more dependencies are left to be processed. No *source* is executed ([eval](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval)) in this stage; it is strictly raw source processing. The primary purpose for this first stage is to get all necessary source ready for the second stage, which is the compilation (linking) stage where the source is converted to *code*. It is in the compilation stage where the Module instances are created. The actual execution (evaluation) of the code to create a Module is *not* done by bit loader, it is left to the implementor of the `fetch` interface. Ssee below in the section for *Fetch generates Module Meta* for a bit more detail on this.

This two stage process is very important because it allows us to create Modules synchronously, even though the loading process is asynchronous, which gives the oportunity to enable support for `CJS`,`AMD`, and `ES6 modules` simultaneously.


## Key parts and hooks

### Fetch

In order to create something useful, bit loader provides a hook for the `fetch` interface, which defines how source files are read from storage. This abstraction exists to keep the process of creating Modules separate from the process of *fetching* files from disk, HTTP(s), or any other transport you may fancy. Bit loader itself does not implement the `fetch` interface as it is intended to be overriden by module loader implementations. Any consumer code using bit loader needs to define a `fetch` provider, which is quite simple and we will see a couple of examples below.

#### Fetch generates Module Meta objects

> The point of `fetch` is to enable bit loader to get module meta objects that can be compiled to Module instances.

The fetch interface creates *module meta* objects that are returned to the caller (bit loader).  Bit loader will coerce the call to fetch to a promise so that synchronous and asynchronous operations behave the same.  This simply means that if you are implementing a `fetch` provider, feel free to return promises or module meta objects directly.

> When bit loader is handed back a module meta object, it will augment it with *useful* properties that will help during the process of converting the module meta object to an instance of Module.

Below are two examples for creating an instance of bit loader that defines a fetch interface.

#### Fetch example returning a 'processed' module meta; a modue meta object with a property `code`

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

#### Fetch example returning an 'unprocessed' module meta; a module meta object with a method `compile` and a `source` string property

We want to return a module meta with a `compile` and `source` property when we want bit loader to put this module meta through the transformation workflow.

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
      // When a `compile` method is provided, a `source` property of type
      // string must also be proivded.
      // This object returned is what we call a module meta object.
      return {compile: compile, source: ""};
    }
  }
}

var loader = new Loader({}, {fetch: fetchFactory});
var reuslt = loader.fetch("like")

// result is {code: 'like is fetched'}
console.log(result);
```

#### Fetch a bit of visual

<img src="https://raw.githubusercontent.com/MiguelCastillo/bit-loader/master/img/Module-Meta-Transform.png" alt="Loader diagram" height="300px"></img>

#### Fetch is just the beginning

Fetch is just the first building block in the puzzle.  As we will see later, when you call `load` or `import` is when you start to see more relevant capabilities of bit loader.

[bit imports](https://github.com/MiguelCastillo/bit-imports) implements the `fetch` interface, which is a good reference implementation to see a fully functional module loader implementaion leveraging bit loader capabilities.


### Load (TODO)

Interface that fetches source, puts the module meta through the transformation workflow, and then returns a Module instance.

### Import (TODO)

Helper method that loads Module(s) using the `load` interface.

### Module (TODO)

Module instances are the final poduct of the loader workflow.

### Module Meta

Module meta objects are plain ole JavaScript object that serve as an intermediate representation of a Module.  A module meta has a couple of properties and or methods used by bit loader in order to create, or delegate the process of creating Modules.

#### Processed Module Meta
The most basic form of module meta is called 'processed' module meta, which is an object with a property `code` that is used by bit loader itself to create an instance of a Module. `code` is what a Module represents; it is analogous to the result of calling `require` in `AMD` and `CJS`.

#### Unprocessed Module Meta
Alternatively, we have 'unprocessed' module meta objects with a `source` string property and a `compile` method.  When bit loader detects these two properties, the process of creating Module instances is delegated to the `compile` interface. In other words, bit loader will call `compile` which returns an instance of Module.

One important distinction between the two is that bit loader will push 'unprocessed' module meta objects through the transformation workflow; 'processed' meta object skip that step entirely. The reason for this is that `source` is the raw text that will eventually be converted to `code`; `code` is the what `source` becomes by calling [eval](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval), or  equivalent code execution mechanism.  We want to put `source` through the transformation workflow to do fancy things like converting it from coffeescript to JavaScript, before it is `eval`ed to `code`.  Then `code` is what a Module instance actually represents.

## Architecture (TODO)

#### Loader diagram
<img src="https://raw.githubusercontent.com/MiguelCastillo/bit-loader/master/img/Loader.png" alt="Loader diagram" height="600px"></img>

#### Fetch diagram
<img src="https://raw.githubusercontent.com/MiguelCastillo/bit-loader/master/img/Loader-Fetch.png" alt="Fetch diagram" height="600px"></img>

#### Pipeline diagram
<img src="https://raw.githubusercontent.com/MiguelCastillo/bit-loader/master/img/Loader-Pipeline.png" alt="Pipeline diagram" height="600px"></img>
