# fantasyfootbot
Fantasy Football Bots

ESPNTele: Telegram bot for ESPN Fantasy Football
- v1 (Free Agent Pickup Feed) 


## commands:
* /start 
** this starts the bot
* /stop
** this will stop the bot

How to run
--------------

* make an env file with the following (bot.env):
``` 	
ESPN_LEAGUE_ID=<ESPN LEAGUE ID>
ESPN_SWID=<espn_swid cookie after logging in at espn.com>
ESPN_S2=<espn_s2 cookie after logging in at espn.com>
START_DAY=< first day of the season> Example for 2019 Season => 'Th, 05 Sep 2019 00:0:00 EST'
TELEGRAM_TOKEN=<bot token for the telegram channel>
REFRESH_SECONDS=<time in seconds you want the updater to run>
```

## example
```
ESPN_LEAGUE_ID=123456
ESPN_SWID=blakblahswifcookie
ESPN_S2=blahblahreallylongcookie
START_DAY='Th, 05 Sep 2019 00:0:0 EST'
TELEGRAM_TOKEN=hsdjhjsahdkjashjkdhkjash
REFRESH_SECONDS=5
```


* make a directory for the persistent data between runs (optional)
* you will mount this folder under /data in the container if you want

##### with docker

* the run (bot.env is ex env filename)

`docker run --env-file bot.env -d -v ./path/to/data:/data stacktraceyo/espn-tele`
	
https://hub.docker.com/r/stacktraceyo/espn-tele
