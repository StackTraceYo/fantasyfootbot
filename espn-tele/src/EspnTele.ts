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
        const name = update.name;
        let msg = "-----------------------------\n" + `${name} has made changes:\n\n`;
        if(update.newPlayers.length > 0){
            msg += `New Players Added:\n `;
            msg += update.newPlayers.map(p => {
                return `${p.fullName} - Postion: ${p.defaultPosition} - Team: ${p.proTeam}`
            }).join('\n');
        }
        msg += "\n-----------------------------\n\t";
        if(update.removedPlayers.length > 0){
            msg += `Players Dropped:\n `;
            msg += update.removedPlayers.map(p => {
                return `${p.fullName} - Postion: ${p.defaultPosition} - Team: ${p.proTeam}`
            }).join('\n')
        }
        this._tele.send(msg);
    }

    launch() {
        interval(this._config.refresh)
            .pipe(
                map(_s => this._tele.started()),
                filter(started => started),
                flatMap(checkRosterOperator(this))
            )
            .subscribe((s: UpdatedTeam) => {
                this.push(s);
                this.client().getTeams().then(teams => this.store().refreshTeams(teams))
            });
    }
}