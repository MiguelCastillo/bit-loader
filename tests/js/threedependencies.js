MLoader.define(["tests/js/simple", "tests/js/number", "tests/js/twodependencies"], function(simple, number, twodeps) {
  return {
    "one": simple,
    "two": number,
    "three": twodeps
  };
});
