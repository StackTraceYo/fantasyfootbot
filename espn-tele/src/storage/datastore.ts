/* tslint:disable:typedef */
import {Player, Team, TeamIdx} from "../espn/model/Team";
import * as Nedb from "nedb";
import * as winston from "winston";
import {EspnTeleConfig} from "../EspnTele";


const _logger = winston.createLogger({
    level: 'debug',
    defaultMeta: {service: 'ESPNDataStore'},
    transports: new winston.transports.Console()
});

export class ESPNDataStore {

    private readonly _dataPath: string;
    private _playerStore: Nedb;
    private _teamStore: Nedb;
    private _teamIdx: Nedb;

    public constructor(config: EspnTeleConfig) {
        this._dataPath = config.filePath;
        this._playerStore = new Nedb<Player>({
            autoload: true,
            filename: this._dataPath + "/player.db",
            timestampData: true
        });
        this._teamStore = new Nedb<Team>({
            autoload: true,
            filename: this._dataPath + "/team.db",
            timestampData: true
        });
        this._teamIdx = new Nedb<TeamIdx>({
            autoload: true,
            filename: this._dataPath + "/teamidx.db",
        });
        this._playerStore.persistence.compactDatafile();
        this._teamStore.persistence.compactDatafile();
        this._teamIdx.persistence.compactDatafile();
    }

    public async init(players: Player[], teams: Team[]) {
        await this.insertTeams(teams);
        await this.insertPlayers(players);
        await this.buildTeamIdx(teams);
    }

    private async buildTeamIdx(teams: Team[]) {
        let tIdx: TeamIdx[] = [];

        teams.forEach((team: Team) => {
                const idx: TeamIdx[] = team.rosterIds.map(p => {
                    return {
                        _id: p,
                        _tId: team.id,
                        _pId: p
                    }
                });
                tIdx = tIdx.concat(idx);
            }
        );
        await this.insertTeamsIdx(tIdx);
        await this._teamIdx.ensureIndex({fieldName: '_pId'});
    }

    async refreshTeams(teams: Team[]) {
        await this.removeTeams();
        await this._teamStore.persistence.compactDatafile();
        const reAdded = await this.insertTeams(teams);
        _logger.info("Refreshed Teams");
        return reAdded;
    }


    insertTeams(teams: Team[]): Promise<Team[]> {
        return new Promise((resolve, reject) => {
            this._teamStore.insert(teams, (err, docs) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(docs);
                }
            });
        });
    }

    updateTeams(teams: Team[]): Promise<Team[]> {
        return new Promise((resolve, reject) => {
            this._teamStore.update(teams.map(t => {_id : t._id}), teams, {}, (err, _docs) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(teams);
                }
            });
        });
    }

    getTeams(): Promise<Team[]> {
        return new Promise((resolve, reject) => {
            this._teamStore.find({})
                .exec((err, documents) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(documents);
                    }
                });
        });
    }

    insertTeamsIdx(teams: TeamIdx[]): Promise<TeamIdx[]> {
        return new Promise((resolve, reject) => {
            this._teamIdx.update({}, teams, {
                upsert: true,
                returnUpdatedDocs: true,
                multi: true
            }, (err: Error, _numberOfUpdated: number) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(teams);
                }
            });
        });
    }

    removeTeams() {
        return new Promise((resolve, reject) => {
            this._teamStore.remove({}, {multi: true},
                (err, n1) => {
                    if (err) {
                        _logger.error(err);
                        reject(err);
                    } else {
                        _logger.debug(`Removed ${n1}`)
                        resolve(n1);
                    }
                });
        });
    }

    insertPlayers(freeAgents: Player[]) {
        this._playerStore.insert(freeAgents, (err, docs) => {
            if (err) {
                _logger.error("Error Adding", err);
            } else {
                _logger.info(`Added ${docs.length} new players`);
            }
        });
    }

    findPlayersById(ids: any[]): Promise<Player[]> {
        return new Promise((resolve, reject) => {
            if (ids.length <= 0) {
                resolve([]);
            }
            this._playerStore.find({_id: {$in: ids}})
                .exec((err, documents) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(documents);
                    }
                });
        });
    }

    countPlayers(): Promise<number> {
        return new Promise((resolve, reject) => {
            this._playerStore.count({}, (err, n) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(n)
                }
            });
        });
    }

    countTeams(): Promise<number> {
        return new Promise((resolve, reject) => {
            this._playerStore.count({}, (err, n) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(n)
                }
            });
        });
    }

}