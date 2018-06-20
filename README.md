# GitHub Issue PR Linker
An add-on that provides one-click links between issues and PRs; an improvement
on [the GitHub Issue Hoister][hoister].

## Development
Install the typescript compiler (through `npm`) and run with:
```sh
tsc
```

The options menu uses a separate compile target so if you're modifying `options.ts`:
```sh
tsc -p src/options
```

In Firefox, you can load [a temporary add-on][temp addon] for testing.
Add the `-w` argument for continuous compilation.

Development with Visual Studio Code is recommended, given its awareness of Typescript types.

### Tests
Build and run the tests:
```sh
tsc -p spec && jasmine
```

## Publishing
`out/bundle.xpi` will be created after:
```sh
./publish.sh
```

## License
Typescript type definitions (`typings/`) are available [via
DefinitelyTyped][typed] under the MIT license. The license file is included in that directory.

The license included with this repository is based on the X11 license, which is similar to the MIT license.

[hoister]: https://github.com/mcomella/github-issue-hoister
[typed]: https://github.com/DefinitelyTyped/DefinitelyTyped
[temp addon]: https://developer.mozilla.org/en-US/docs/Tools/about:debugging#Enabling_add-on_debugging
