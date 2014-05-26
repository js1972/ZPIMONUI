pimon
=====

pimon is a Web app for monitoring SAP NetWeaver PI-AEX.

*** This is a work in progress ***

(See the ZPIMON repo for the java backend to this app.)


The current state of SAP PI-AEX monitoring tools is pretty poor. They use (what I believe to be a) clunky old-fashioned web-dynpro proprietory technology.
Drawbacks:
 - The monitor is slow
 - Hard to read - you need to squint and its pretty ugly
 - Columns are not customisable; you cannot properly adjust their widths
 - Its near-on impossible to view whats going on with an iFlow as you just see the fill time-sequenced list of messages running through the system
 
What does this pimon tool provide:
 - Very fast (due to cached messages)
 - Easy on the eye with a nice boostrap look and feel; large fonts and plenty of spacing
 - Columns auto adjust so there is no need for column config
 - Provides a beautiful way to view PI messages - grouped by iFlow you easily see whats going on and the number of rows in the message table is significantly reduced
 - Very fast...
 - Very fast...


Sample pics
-----------

iFlow overview: ![image](https://f.cloud.github.com/assets/1317161/2434208/07695842-adad-11e3-89f9-ff695cd8e948.png)

Messages contained in the selected iFlow: ![image](https://f.cloud.github.com/assets/1317161/2434225/7a3b3502-adad-11e3-8447-3e654f572abd.png)

Message payload: ![image](https://f.cloud.github.com/assets/1317161/2434236/ba2992e4-adad-11e3-9748-6f8877f5abd5.png)

Message status log: ![image](https://f.cloud.github.com/assets/1317161/2434248/f962c250-adad-11e3-98ba-564400b31e37.png)

Some basic processing statistics: ![image](https://f.cloud.github.com/assets/1317161/2434266/4e15a5e2-adae-11e3-8ad7-395f82be9720.png)


Grunt can be used to build a production version of the app into the /dist folder.


## How does it work ##

1. You require a NetWeaver PI-AEX system (7.31) as the Process Integration system to monitor
2. We cache the PI messages in a Java Dictionary for fast access. See the ZPIMON repo for details
3. The monitor app (index.html) is built using Bootstrap 3 and jQuery. It reads the cached messages and displays them grouped by iFlow
4. You can drill-down into the iFlow with a click to see the messages it contains. A further drill-down brings up the payload and message log
5. Related iFlows are grouped together - such as the response iFlow's when using modules for async/sync bridging.

## Contributing ##

1. Clone this repo to your local machine
2. Make changes as necessary
3. Run ```grunt``` to build a dist version of the app (in  /dist)
4. You need to embed this app into the backend java project. To do so: clone the ZPIMON repo; create a grunt-pimon-config.json file (see below) which points to the location of your ZPIMON repo; then run ```grunt javacopy``` to copy the /dist app into the java project of PIMON.
5. Build the PIMON repo in NWDS and deploy to your PI server.

If you encounter issues with the javacopy command ensure a 'grunt-pimon-config.json' file (not tracked by git) exists in the same folder as the Gruntfile.js file and has the following JSON structure:
```{"nwds":{"workspace":{"rootpath": "c:/MyScratchFolder/BPMworkspace.jdi"}}}``` change the rootpath value to align with your own NWDS JDI workspace location (the one with the .jdi).
