import chanceFactory from "chance";
import { expect } from "chai";
import sinon from "sinon";
import Bitloader from "../../src/bit-loader";
import Module from "../../src/module";

const chance = chanceFactory();

describe("Fetch Test Suite", function() {
  describe("When loading modules from source", function() {
    var loader, fetchSrouce, fetchStub, resolveStub, transformStub, dependencyStub, precompileStub;

    beforeEach(function() {
      fetchSrouce = "this should not be the content of the module";

      fetchStub = sinon.stub();
      resolveStub = sinon.stub();
      transformStub = sinon.stub();
      dependencyStub = sinon.stub();
      precompileStub = sinon.stub();

      fetchStub.returns({ source: fetchSrouce });

      loader = new Bitloader({
        resolve: resolveStub,
        fetch: fetchStub,
        transform: transformStub,
        dependency: dependencyStub,
        precompile: precompileStub
      });
    });

    describe("and bit-loader has no plugins", function() {
      describe("and fetching one module source of 'hello world'", function() {
        var result = null, inputSource, transformSource;

        beforeEach(function() {
          transformSource = chance.paragraph();
          inputSource = "console.log('hello world')";
          transformStub.withArgs(sinon.match( { source: inputSource } )).returns({ source: transformSource });
        });
  
        describe("with no dependencies", function() {
          beforeEach(function() {
            return loader.fetch({ source: inputSource }).then(mod => result = mod);
          });
  
          it("then resolve is not called", function() {
            sinon.assert.notCalled(resolveStub);
          });
    
          it("then fetch is not called", function() {
            sinon.assert.notCalled(fetchStub);
          });
    
          it("then transform is called", function() {
            sinon.assert.calledOnce(transformStub);
          });
    
          it("then the module source has the expected data", function() {
            expect(result.source).to.equal(transformSource);
          });
    
          it("then the module has one dependencies", function() {
            expect(result.deps).to.have.lengthOf(0);
          });
        });
        
        describe("with one dependencies", function() {
          beforeEach(function() {
            dependencyStub.returns({ deps: ["test that path"]});          
            return loader.fetch({ source: inputSource }).then(mod => result = mod);
          });
  
          it("then resolve is called once", function() {
            sinon.assert.calledOnce(resolveStub);
          });
    
          it("then fetch is not called", function() {
            sinon.assert.notCalled(fetchStub);
          });
    
          it("then transform is called", function() {
            sinon.assert.calledOnce(transformStub);
          });
    
          it("then the module source has the expected data", function() {
            expect(result.source).to.equal(transformSource);
          });
    
          it("then the module has one dependencies", function() {
            expect(result.deps).to.have.lengthOf(1);
          });
        })
      });
  
      describe("and fetching two modules. One with source of 'hello world' and another with source 'second time'", function() {
        var result = null, inputSource1, inputPath1, inputSource2, transformSource1, transformSource2;

        beforeEach(function() {
          inputSource1 = "console.log('hello world')";
          inputSource2 = "console.log('second time')";
          inputPath1 = chance.string();
          transformSource1 = chance.paragraph();
          transformSource2 = chance.paragraph();
          transformStub.withArgs(sinon.match( { source: inputSource1 } )).returns({ source: transformSource1 });
          transformStub.withArgs(sinon.match( { source: inputSource2 } )).returns({ source: transformSource2 });
        });
  
        describe("and the first module with path and neither has dependencies", function() {
          beforeEach(function() {
            return loader.fetch([{ source: inputSource1, path: inputPath1 }, { source: inputSource2 }]).then(mod => result = mod);
          });
  
          it("then resolve is not called", function() {
            sinon.assert.notCalled(resolveStub);
          });
    
          it("then fetch is not called", function() {
            sinon.assert.notCalled(fetchStub);
          });
    
          it("then transform is called", function() {
            sinon.assert.calledTwice(transformStub);
          });
    
          it("then the first module has the expected data", function() {
            expect(result[0].source).to.equal(transformSource1);
          });
    
          it("then the first module has no dependencies", function() {
            expect(result[0].deps).to.have.lengthOf(0);
          });
    
          it("then the second module source has the expected data", function() {
            expect(result[1].source).to.equal(transformSource2);
          });
    
          it("then the second module has no dependencies", function() {
            expect(result[1].deps).to.have.lengthOf(0);
          });
        });
  
        describe("and the first module with a path and one dependency for the second module", function() {
          beforeEach(function() {
            dependencyStub.withArgs(sinon.match({ source: transformSource2 })).returns({ deps: ["test that path"]});
            return loader.fetch([{ source: inputSource1, path: inputPath1 }, { source: inputSource2 }]).then(mod => result = mod);
          });
  
          it("then resolve is called one", function() {
            sinon.assert.calledOnce(resolveStub);
          });
    
          it("then fetch is not called", function() {
            sinon.assert.notCalled(fetchStub);
          });
    
          it("then transform is called", function() {
            sinon.assert.calledTwice(transformStub);
          });
    
          it("then the first module has the expected data", function() {
            expect(result[0].source).to.equal(transformSource1);
          });
    
          it("then the first module has NO dependencies", function() {
            expect(result[0].deps).to.have.lengthOf(0);
          });
    
          it("then the second module source has the expected data", function() {
            expect(result[1].source).to.equal(transformSource2);
          });
  
          it("then the second module has one dependencies", function() {
            expect(result[1].deps).to.have.lengthOf(1);
          });
        });
      });
    });

    describe("and bit-loader has resolve, fetch, transform, and dependency plugins", function() {
      var resolvePluginStub, fetchPluginStub, transformPluginStub, dependencyPluginStub;

      beforeEach(function() {
        resolvePluginStub = sinon.stub();
        fetchPluginStub = sinon.stub();
        transformPluginStub = sinon.stub();
        dependencyPluginStub = sinon.stub();

        loader.plugin({
          resolve: resolvePluginStub,
          fetch: fetchPluginStub,
          transform: transformPluginStub,
          dependency: dependencyPluginStub
        });
      });

      describe("and fetching one module source of 'hello world'", function() {
        var result = null, inputSource, transformSource;

        beforeEach(function() {
          transformSource = chance.paragraph();
          inputSource = "console.log('hello world')";
          transformStub.withArgs(sinon.match( { source: inputSource } )).returns({ source: transformSource });
        });
  
        describe("with no dependencies", function() {
          beforeEach(function() {
            return loader.fetch({ source: inputSource }).then(mod => result = mod);
          });
  
          it("then resolve provider is not called", function() {
            sinon.assert.notCalled(resolveStub);
          });
    
          it("then fetch provider is not called", function() {
            sinon.assert.notCalled(fetchStub);
          });
    
          it("then transform provider is called", function() {
            sinon.assert.calledOnce(transformStub);
          });

          it("then dependency provider is called", function() {
            sinon.assert.calledOnce(dependencyStub);
          });

          it("then resolve plugin is not called", function() {
            sinon.assert.notCalled(resolvePluginStub);
          });
    
          it("then fetch plugin is not called", function() {
            sinon.assert.notCalled(fetchPluginStub);
          });
    
          it("then transform plugin is called", function() {
            sinon.assert.calledOnce(transformStub);
          });

          it("then dependency plugin is called", function() {
            sinon.assert.calledOnce(dependencyPluginStub);
          });

          it("then the module source has the expected data", function() {
            expect(result.source).to.equal(transformSource);
          });
    
          it("then the module has one dependencies", function() {
            expect(result.deps).to.have.lengthOf(0);
          });
        });
      });
    });
  });

  describe("When loading a module with a name and path", function() {
    var loader, fetchStub, resolveStub, transformStub, dependencyStub, precompileStub;

    beforeEach(function() {
      fetchStub = sinon.stub();
      resolveStub = sinon.stub();
      transformStub = sinon.stub();
      dependencyStub = sinon.stub();

      dependencyStub.returns({ deps: ["test that path"]});

      loader = new Bitloader({
        resolve: resolveStub,
        fetch: fetchStub,
        transform: transformStub,
        dependency: dependencyStub
      });
    });

    describe("and the module has name `test` and path `23`", function() {
      beforeEach(function() {
        return loader.fetch([{ name: 'test', path: "23" }]);
      });

      it("then the resolve method is never called", function() {
        sinon.assert.notCalled(resolveStub);
      });
    });
  });

  describe("When loading modules by name", function() {
    var loader, fetchStub, resolveStub, transformStub, dependencyStub, precompileStub;
    var nameLikeData, resolveLikeData, fetchLikeData, transformLikeData, dependencyLikeData, precompileLikeData;
    var nameDep1Data, resolveDep1Data, fetchDep1Data, transformDep1Data, dependencyDep1Data;
    var nameCommonData, resolveCommonData, fetchCommonData, transformCommonData, dependencyCommonData;

    beforeEach(function() {
      nameLikeData = {name: "like"};
      resolveLikeData = {path: "this is the real path to like/like-name", id: "like-id"};
      fetchLikeData = {source: "source content"};
      transformLikeData = {source: "transformed source"};
      dependencyLikeData = {deps: ["dep1", "common-dep"]};
      precompileLikeData = {source: "precompiled source"};


      nameDep1Data = {name: "dep1"};
      resolveDep1Data = {path: "real path to dep1", id: "dep1-id"};
      fetchDep1Data = {source: "dep1 source"};
      transformDep1Data = {source: "changed dep1 source"};
      dependencyDep1Data = {deps: ["common-dep"]};

      nameCommonData = {name: "common-dep"};
      resolveCommonData = {path: "path to common-dep dependency", id: "common-id"};
      fetchCommonData = {source: "source for common-dep"};
      transformCommonData = {source: "transformed source for common-data"};
      dependencyCommonData = {deps: []};

      resolveStub = sinon.stub();
      resolveStub
        .withArgs(sinon.match(nameLikeData))
        .returns(resolveLikeData);
      resolveStub
        .withArgs(sinon.match(nameDep1Data))
        .returns(resolveDep1Data);
      resolveStub
        .withArgs(sinon.match(nameCommonData))
        .returns(resolveCommonData);

      fetchStub = sinon.stub();
      fetchStub
        .withArgs(sinon.match(nameLikeData))
        .returns(fetchLikeData);
      fetchStub
        .withArgs(sinon.match(nameDep1Data))
        .returns(fetchDep1Data);
      fetchStub
        .withArgs(sinon.match(nameCommonData))
        .returns(fetchCommonData);

      transformStub = sinon.stub();
      transformStub
        .withArgs(sinon.match(nameLikeData))
        .returns(transformLikeData);
      transformStub
        .withArgs(sinon.match(nameDep1Data))
        .returns(transformDep1Data);
      transformStub
        .withArgs(sinon.match(nameCommonData))
        .returns(transformCommonData);

      dependencyStub = sinon.stub();
      dependencyStub
        .withArgs(sinon.match(nameLikeData))
        .returns(dependencyLikeData);
      dependencyStub
        .withArgs(sinon.match(nameDep1Data))
        .returns(dependencyDep1Data);
      dependencyStub
        .withArgs(sinon.match(nameCommonData))
        .returns(dependencyCommonData);

      precompileStub = sinon.stub();

      loader = new Bitloader({
        resolve: resolveStub,
        fetch: fetchStub,
        transform: transformStub,
        dependency: dependencyStub,
        precompile: precompileStub
      });
    });


    describe("When fetching a single module", function() {
      var result;

      beforeEach(function() {
        return loader.controllers.fetcher.fetch("like").then(function(r) {
          result = r;
        });
      });

      it("then then result is an object", function() {
        expect(result).to.be.a("object");
      });
    });

    describe("When fetching an array of modules", function() {
      var result;

      beforeEach(function() {
        return loader.controllers.fetcher.fetch(["like"]).then(function(r) {
          result = r;
        });
      });

      it("then then result is an array", function() {
        expect(result).to.be.a("array");
      });
    });

    describe("When fetching a single module called `like`", function() {
      var result;

      beforeEach(function() {
        return loader.controllers.fetcher.fetch("like").then(function(r) {
          result = r;
        });
      });

      it("then then result is an object", function() {
        expect(result).to.be.a("object");
      });

      it("then `resolve` is called with `like` name data", function() {
        sinon.assert.calledWith(resolveStub, sinon.match(nameLikeData));
      });

      it("then `resolve` is called with `dep1` name data", function() {
        sinon.assert.calledWith(resolveStub, sinon.match(nameDep1Data));
      });

      it("then `resolve` is called with `common-dep` name data", function() {
        sinon.assert.calledWith(resolveStub, sinon.match(nameCommonData));
      });

      it("then `fetch` is called with `like` resolve data", function() {
        sinon.assert.calledWith(fetchStub, sinon.match(resolveLikeData));
      });

      it("then `fetch` is called with `dep1` resolve data", function() {
        sinon.assert.calledWith(fetchStub, sinon.match(resolveDep1Data));
      });

      it("then `fetch` is called with `common-dep` resolve data", function() {
        sinon.assert.calledWith(fetchStub, sinon.match(resolveCommonData));
      });

      it("then `transform` is called with `like` fetch data", function() {
        sinon.assert.calledWith(transformStub, sinon.match(fetchLikeData));
      });

      it("then `transform` is called with `dep1` fetch data", function() {
        sinon.assert.calledWith(transformStub, sinon.match(fetchDep1Data));
      });

      it("then `transform` is called with `common-dep` fetch data", function() {
        sinon.assert.calledWith(transformStub, sinon.match(fetchCommonData));
      });

      it("then `dependency` is called with `like` tranfom data", function() {
        sinon.assert.calledWith(dependencyStub, sinon.match(transformLikeData));
      });

      it("then `dependency` is called with `dep1` tranfom data", function() {
        sinon.assert.calledWith(dependencyStub, sinon.match(transformDep1Data));
      });

      it("then `dependency` is called with `common-dep` tranfom data", function() {
        sinon.assert.calledWith(dependencyStub, sinon.match(transformCommonData));
      });

      it("then `precompile` is never called", function() {
        sinon.assert.notCalled(precompileStub);
      });

      it("then the module contains the expected referrer", function() {
        expect(result.referrer).to.eql({});
      });

      it("then the module has two dependencies", function() {
        expect(result.deps).to.have.lengthOf(2)
      });

      it("then one of the dependencies is dep1", function() {
        expect(result.deps[0]).to.deep.include({ name: "dep1" });
      });

      it("then one of the dependencies is common-dep", function() {
        expect(result.deps[1]).to.deep.include({ name: "common-dep" });
      });

      it("then the result will have all the aggregated data", function() {
        expect(result).to.include({
          directory: "this is the real path to like/",
          filename: "like-name",
          id: "like-id",
          name: "like",
          path: "this is the real path to like/like-name",
          state: "loaded",
          source: "transformed source",
          type: "UNKNOWN"
        });
      });

      describe("and reading the loaded `like` module", function() {
        var loadedModule;

        beforeEach(function() {
          loadedModule = loader.getModule("like-id");
        });

        it("the module has two dependencies", function() {
          expect(loadedModule.deps).to.have.lengthOf(2);
        });

        it("then the first dependency is dep1", function() {
          expect(loadedModule.deps[0].id).to.equal("dep1-id");
        });

        it("then the first dependency has the correct referrer", function() {
          expect(loadedModule.deps[0].referrer).to.eql({
            id: "like-id",
            name: "like",
            path: "this is the real path to like/like-name",
            filename: "like-name"
          });
        });

        it("then the second dependency is common-dep", function() {
          expect(loadedModule.deps[1].id).to.equal("common-id");
        });

        it("then the second dependency has the correct referrer", function() {
          expect(loadedModule.deps[1].referrer).to.eql({
            id: "like-id",
            name: "like",
            path: "this is the real path to like/like-name",
            filename: "like-name"
          });
        });

        it("then the source is the precompiled source", function() {
          expect(loadedModule.source).to.equal(transformLikeData.source);
        });
      });

      describe("and reading the loaded `dep1` module", function() {
        var loadedModule;

        beforeEach(function() {
          loadedModule = loader.getModule("dep1-id");
        });

        it("the module has one dependency", function() {
          expect(loadedModule.deps).to.have.lengthOf(1);
        });

        it("then the first dependency is common-dep", function() {
          expect(loadedModule.deps[0].id).to.equal("common-id");
        });

        it("then the dependency has the correct referrer", function() {
          expect(loadedModule.deps[0].referrer).to.eql({
            id: "dep1-id",
            name: "dep1",
            path: "real path to dep1",
            filename: ""
          });
        });

        it("then the source is the transformed source", function() {
          expect(loadedModule.source).to.equal(transformDep1Data.source);
        });
      });

      describe("and reading the loaded `common-dep` module", function() {
        var loadedModule;

        beforeEach(function() {
          loadedModule = loader.getModule("common-id");
        });

        it("the module has no dependencies", function() {
          expect(loadedModule.deps).to.be.empty;
        });

        it("then the common-dep has the correct referrer", function() {
          expect(loadedModule.referrer).to.eql({
            id: "like-id",
            name: "like",
            path: "this is the real path to like/like-name",
            filename: "like-name"
          });
        });

        it("then the source is the transformed source", function() {
          expect(loadedModule.source).to.equal(transformCommonData.source);
        });
      });
    });

    describe("When registering a preresolve plugin to exclude modules", function() {
      var excludeName, result;

      beforeEach(function() {
        excludeName = chance.string();

        return loader
          .plugin({
            preresolve: function(data) {
              if (data.name === excludeName) {
                return {
                  id: data.name,
                  path: null,
                  source: "",
                  state: "loaded"
                };
              }
            }
          })
          .controllers.fetcher
          .fetch(excludeName)
          .then(function(r) {
            result = r;
          });
      });

      it("then resolve provider is not called", function() {
        sinon.assert.notCalled(resolveStub);
      });

      it("then fetch provider is not called", function() {
        sinon.assert.notCalled(fetchStub);
      });

      it("then module meta path is `null`", function() {
        expect(result.path).to.equal(null);
      });

      it("then module meta name is properly set", function() {
        expect(result.name).to.equal(excludeName);
      });

      it("then module meta id is properly set", function() {
        expect(result.id).to.equal(excludeName);
      });

      it("then module meta source is properly set", function() {
        expect(result.source).to.equal("");
      });
    });
  });
});
