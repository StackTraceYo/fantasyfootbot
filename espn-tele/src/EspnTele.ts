import {FantasyClient} from "./espn/FantasyClient";
import {ESPNDataStore} from "./storage/datastore";
import * as Nedb from "nedb";
import {Player} from "./espn/model/Team";
import checkRosterOperator, {UpdatedTeam} from "./operators/check-roster-operator";
import TeleClient from "./tele/TeleClient";
import {filter, flatMap, map} from "rxjs/operators";
import {interval} from "rxjs";

export interface EspnTeleConfig {
    leagueId: number,
    s2: string,
    swid: string,
    season: number,
    start: Date,
    filePath: string,
    teleToken: string,
    refresh?: number
}

const config = {
    leagueId: 1250436,
    swid: '45b9a8b3-dba9-445c-ad6c-5d38b976b378',
    s2: 'AEBHQCJvfz7%2B8Aph55BnyIZkW5AxLpM4Rf7SdbQ1qWfiW%2FYb2HGhiSMUlhvPq8QWI4zGp5XIXpayHd1bipk8svZLLDki9jG%2BZZVolUQyquZVk2W9DNKEmzmucRsvgDrqegGiJOq611VwxykLO92PdN4hKFq3%2FfiO35TnICFC27oW1JA%2FIOvr8y3UpN2NpLXEDxBdTlPRRi3Pazn34dFTL3CBac%2B2wzodCtH%2FFn8iRxSTFcuQ3HFOvUmPbK8MADrRQNLR9wlw3N0rk8NMXsL%2BCpDm',
    season: new Date().getFullYear(),
    start: new Date("Th, 05 Sep 2019 00:0:0 EST"),
    filePath: '/home/ahmad/projects/fantasyfootbot/espn-tele/data',
    teleToken: '989934673:AAEIM3GdWXayCB3YCiKMnePP1z50MvGRMZI',
};


export default class EspnTeleBot {

    private readonly _client: FantasyClient;
    private readonly _dataStore: ESPNDataStore;
    // @ts-ignore
    private _stateStore: Nedb<Player>;
    private _tele: TeleClient;
    private _config: EspnTeleConfig;

    constructor(config: EspnTeleConfig) {
        this._config = config;
        this._client = new FantasyClient(config);
        this._dataStore = new ESPNDataStore(config);
        // this._stateStore = new Nedb<Player>({autoload: true, filename: `${config.filePath}/app.db`});
        this._tele = new TeleClient(config);
        this._dataStore.countTeams()
            .then(async count => {
                if (count <= 0) {
                    const all = await this._client.getAll();
                    await this._dataStore.init(all.players, all.teams);
                }
            });
    }

    client() {
        return this._client;
    }

    store() {
        return this._dataStore;
    }

    push(update: UpdatedTeam) {
        this._tele.send(update.name + "has made changed");
    }

    launch() {
        interval(this._config.refresh | 2000)
            .pipe(
                map(_s => this._tele.started()),
                filter(started => started),
                flatMap(checkRosterOperator(this))
            )
            .subscribe((s: UpdatedTeam) => {
                t.push(s);
                t.client().getTeams().then(teams => t.store().refreshTeams(teams))
            });
    }


}
const t = new EspnTeleBot(config);
t.launch();

