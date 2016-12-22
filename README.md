<h1 align="center">Gitter Archive</h1>
<p align="center">Gitter Chat room message downloader</p>

# Usage

Install `gitter-archive` as global.

```sh
$ npm i -g gitter-archive
```

Add a `.gitterarchiverc[.json|.js|.yml|.yaml]` or `gitterarchive.config.js` file in the directory where you execute the CLI in the following format.  
> The configuration is loaded using [**cosmiconfig**](http://npm.im/cosmiconfig) module.

```hjson
{
  "rooms": {
    "noArchiveList": [
      // rooms not to archive
      // e.g.

      "FreeCodeCamp/FreeCodeCamp"
    ],
    "archiveNoDeleteList": [
      // @TODO
      // rooms to not delete but archive
    ],
    "archiveList": [
      // list of rooms to archive
      // e.g.

      "FreeCodeCamp/*"
    ]
  },

  "groups": {
    "enabled": [{
      "uri": "FreeCodeCamp",
      "id": "57542cf4c43b8c6019778297"
    }],
    "disabled": [
      // groups not to be scanned
    ]
  }
}
```

Copy the `example.env` as `.env` and fill in the details.  
Start the archive process.

```sh
$ gitter-archive
```

Use node v7 to run.

```sh
# run build
$ yarn run build

# start gitter archive
$ yarn run start
```

# Development

```sh
$ yarn global nodemon
$ nodemon -q -x yarn run start:dev
```

**OR for build watch**

```sh
$ yarn global nodemon
$ yarn run build:watch
```

----

----
# CLI

> TODO

- Add cli processor modules
- Make Papertrail use optional

## Features

### CLI options

- `--boost` - boost archiving using `skip` parameter
- `-b` - beforeId 
- `--gid` - group id (required)
- `--guri` - group uri (optional)
- `--uri` - room uri (optional)
- `--id` - room id (required)
- `--ignore, -i` - ignore room uri pattern (multiple)

# Notes

With a limit of `100` messages/request and `100` requests/minute,  
total downloadable messages/minute = `100 x 100` = `10,000` messages per minute

:question: With a skip limit of `5000`, how can the scrapping be improved? 

# Known Bugs

- After complete archive of rooms, they're marked `isArchived`  as `true`.  
  Hence, the next time the app is run, it removes the archived rooms from the list.  
  The expected behavior is that it should simply ignore the archived rooms and only consider the non archived rooms.
