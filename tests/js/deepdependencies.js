MLoader.define(["tests/js/simple", "tests/js/number", "tests/js/twodependencies", "tests/js/deepdeps"], function(simple, number, twodeps, deepdeps) {
  return {
    "one": simple,
    "two": number,
    "three": twodeps,
    "four": deepdeps
  };
});
