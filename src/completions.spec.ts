import * as fs from "fs";
import * as ts from "typescript";

it("completions", () => {
  const srcname = "mysrc.ts";
  let srcVersion = 0;
  let srcContent = "";

  setSrcContent(`
export {}
let obj = {
    xyz: 10,
    lmn: 13
};

obj.lm`);

  const host = createLanguageServiceHost();
  const service = ts.createLanguageService(host, ts.createDocumentRegistry());
  const info = service.getCompletionsAtPosition(srcname, srcContent.length, {});
  expect(info).toEqual({
    isGlobalCompletion: false,
    isMemberCompletion: true,
    isNewIdentifierLocation: false,
    entries: [
      {
        // Why is 'xyz' suggested here?
        name: "xyz",
        kind: "property",
        kindModifiers: "",
        sortText: "0",
        source: undefined,
        hasAction: undefined,
        isRecommended: undefined,
        insertText: undefined,
        replacementSpan: undefined
      },
      {
        name: "lmn",
        kind: "property",
        kindModifiers: "",
        sortText: "0",
        source: undefined,
        hasAction: undefined,
        isRecommended: undefined,
        insertText: undefined,
        replacementSpan: undefined
      }
    ]
  });

  function setSrcContent(content: string) {
    srcVersion++;
    srcContent = content;
  }

  function createLanguageServiceHost(): ts.LanguageServiceHost {
    const files = [srcname];
    return {
      getScriptFileNames,
      getScriptVersion,
      getScriptSnapshot,
      getCurrentDirectory,
      getCompilationSettings,
      getDefaultLibFileName,
      fileExists,
      readFile,
      readDirectory
    };

    function getProjectVersion() {
      return String(srcVersion);
    }
    function getScriptFileNames() {
      return files;
    }
    function getScriptVersion(path: string) {
      if (path === srcname) {
        return String(srcVersion);
      }
      return "0";
    }
    function getScriptSnapshot(fileName: string): ts.IScriptSnapshot {
      if (fileName === srcname) {
        return ts.ScriptSnapshot.fromString(srcContent);
      }
      return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
    }
    function getCurrentDirectory() {
      return process.cwd();
    }
    function getCompilationSettings(): ts.CompilerOptions {
      // typeRoots here is no-op:
      // We may need to implement resolveTypeReferenceDirectives?
      return {
        target: ts.ScriptTarget.ES2017,
        declaration: true
      };
    }
    function getDefaultLibFileName(options: ts.CompilerOptions): string {
      return ts.getDefaultLibFilePath(options);
    }
    function fileExists(path: string) {
      let exist = ts.sys.fileExists(path);
      return exist;
    }
    function readFile(path: string, encoding?: string): string {
      throw new Error("readFile is not implemented");
    }
    function readDirectory(
      path: string,
      extensions?: ReadonlyArray<string>,
      exclude?: ReadonlyArray<string>,
      include?: ReadonlyArray<string>,
      depth?: number
    ): string[] {
      console.log("readDirectory:", path);
      return ts.sys.readDirectory(path, extensions, exclude, include, depth);
    }
  }
});
