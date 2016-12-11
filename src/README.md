# TODO

1. Get all rooms of gitter and store in a JSON/HJSON file - `fcc-rooms.json`
	- room name
	- room id
	- room uri
	- user count
	- is archive?
	- is deprecate?
	- is complete? (modify this after completion)
2. Read `fcc-rooms.json` file and grab each room
3. For each room, create a directory and store messages in the following format
	- `<room-name>-<before-id>-<save-timestamp>` e.g. `HelpBackend-<message-before-id>-1481412180635`