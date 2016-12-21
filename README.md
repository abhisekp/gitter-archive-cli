# Gitter Archive

Gitter Chat room message downloader

# Usage

Add a `.gitterarchiverc[.json|.js|.yml]` or `gitterarchive.config.js` file in the directory where you execute the CLI in the following format.  
> The configuration is loaded using [**cosmiconfig**](http://npm.im/cosmiconfig) module.

```json
{
  "rooms": {
    "noArchiveList": [
      // rooms not to archive
    ],
    "archiveNoDeleteList": [
      // rooms to not delete but archive
    ],
    "archiveList": [
      // list of rooms to archive
    ]
  },

  "groups": {
    "enabled": [{
      "groupUri": "",
      "groupId": ""
    }],
    "disabled": []
  }
}
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


# CLI

> TODO

- Add cli processor modules

### Features

**CLI flags**  

- beforeId `-b`
- roomUri or roomId
- 

# Notes

With a limit of `100` messages/request and `100` requests/minute,  
total downloadable messages/minute = `100 x 100` = `10,000` messages per minute

:question: With a skip limit of `5000`, how can the scrapping be improved? 
