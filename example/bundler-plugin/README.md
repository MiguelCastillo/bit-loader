## Bundler example with babeljs transform and browser pack

This example shows a way to configure bit loader to process your JavaScript assets with [babeljs](https://babeljs.io/). And because it is babel, you get free support for [reactjs](https://facebook.github.io/react/docs/getting-started.html) JSX.  It also shows how to integrate a transform to generate module information that can be consumed by [browser-pack](https://github.com/substack/browser-pack).

In this particular example we are configuring `resolve` and `fetch` as plugins rather than as core hooks (default handlers).
