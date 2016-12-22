# Usage

```sh
# gitter-archive <group-name> [<archive-dir>]

# (both windows and unix path supported)
# (both relative and absolute path supported)

$ gitter-archive FreeCodeCamp archives
$ gitter-archive FreeCodeCamp misc-stuffs\archives
$ gitter-archive FreeCodeCamp .\archives
$ gitter-archive FreeCodeCamp ..\archives
$ gitter-archive FreeCodeCamp misc-stuffs/archives
$ gitter-archive FreeCodeCamp ./archives
$ gitter-archive FreeCodeCamp ../archives
$ gitter-archive FreeCodeCamp D:\archives
$ gitter-archive FreeCodeCamp /home/user/archives
```

# TODO

- add colors module
- use app-root-path module
- use cli module
- if room name not given, then exit
- if archive directory not given, then default to "<current path>/archives" and confirm
- even if archive directory is given, confirm the full directory path i.e. `archives/<group-name>/` directory

# Strategy

- [ ] Get configuration from `current` path.
- [ ] Get stored settings from `current` path.
- [ ] Convert the rooms in configuration in format of stored settings. 
