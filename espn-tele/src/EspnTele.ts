import {FantasyClient} from "./espn/FantasyClient";
import {ESPNDataStore} from "./storage/datastore";
import * as Nedb from "nedb";
import {Player} from "./espn/model/Team";


export default class EspnTele {


    _client = new FantasyClient({
            leagueId: 1250436,
            swid: '45b9a8b3-dba9-445c-ad6c-5d38b976b378',
            s2: 'AEBHQCJvfz7%2B8Aph55BnyIZkW5AxLpM4Rf7SdbQ1qWfiW%2FYb2HGhiSMUlhvPq8QWI4zGp5XIXpayHd1bipk8svZLLDki9jG%2BZZVolUQyquZVk2W9DNKEmzmucRsvgDrqegGiJOq611VwxykLO92PdN4hKFq3%2FfiO35TnICFC27oW1JA%2FIOvr8y3UpN2NpLXEDxBdTlPRRi3Pazn34dFTL3CBac%2B2wzodCtH%2FFn8iRxSTFcuQ3HFOvUmPbK8MADrRQNLR9wlw3N0rk8NMXsL%2BCpDm',
            season: new Date().getFullYear(),
            start: new Date("Th, 05 Sep 2019 00:0:0 EST")
        }
    );
    _dataStore = new ESPNDataStore({filePath: '/Users/ahmad/projects/fantasyfootbot/espn-tele/data'});
    _stateStore = new Nedb<Player>({
        autoload: true,
        filename: "/Users/ahmad/projects/fantasyfootbot/espn-tele/data/app.db",
    });
}
const t = new EspnTele();
t._client.getAll()
    .then(res => {
        t._dataStore.init(res.players, res.teams)
    });
