pimon
=====

pimon is a Web app for monitoring SAP NetWeaver PI-AEX.

*** This is a work in progress ***

(See the ZPIMONSC repo for the dist version of this web app and the java backend as well.)


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

Message payload:
![Sample prettyConfirm dialog](https://bitbucket.org/jasonscott/pimon-web-app-source-files/raw/9ce1f7a580661c2a6bd5f0fb890f9b09e861a1eb/readme_pics/payload.PNG)

Message status log:
![Sample prettyConfirm dialog](https://bitbucket.org/jasonscott/pimon-web-app-source-files/raw/9ce1f7a580661c2a6bd5f0fb890f9b09e861a1eb/readme_pics/status_log.PNG)

Cancel a message in error status:
![Sample prettyConfirm dialog](https://bitbucket.org/jasonscott/pimon-web-app-source-files/raw/9ce1f7a580661c2a6bd5f0fb890f9b09e861a1eb/readme_pics/cancel.PNG)

Some basic processing statistics:
![Sample prettyConfirm dialog](https://bitbucket.org/jasonscott/pimon-web-app-source-files/raw/9ce1f7a580661c2a6bd5f0fb890f9b09e861a1eb/readme_pics/stats.PNG)


Grunt can now be used to build a production version of the app into the /dist folder.


How does it work?

1) You require a NetWeaver PI-AEX system (7.31) as the Process Integration system to monitor
2) We cache the PI messages in a Java Dictionary for fast access.
3) The monitor app (index.html) is built using Bootstrap 3 and jQuery. It reads the cached messages and displays them grouped by iFlow.
   You can drill-down into the iFlow with a click to see the messages it contains. A further drill-down brings up the payload and message log.
   Related iFlows are grouped together - such as the response iFlow's when using modules for async/sync bridging.
   
