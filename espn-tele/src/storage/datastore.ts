import {Player, Team, TeamIdx} from "../espn/model/Team";
import * as Nedb from "nedb";
import * as winston from "winston";

interface DataStoreConfig {
    filePath: string,
}

const _logger = winston.createLogger({
    level: 'debug',
    defaultMeta: {service: 'ESPNDataStore'},
    transports: new winston.transports.Console()
});

export class ESPNDataStore {

    private _dataPath: string;
    private _playerStore: Nedb;
    private _teamStore: Nedb;
    private _teamIdx: Nedb;

    public constructor(config: DataStoreConfig) {
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
        await this.insert(players);
        await this.buildTeamIdx(teams);
    }

    private async buildTeamIdx(teams: Team[]) {
        let tIdx: TeamIdx[] = [];

        teams.forEach(team => {
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
        await this._teamIdx.ensureIndex({fieldName : '_pId'});
    }

    // @ts-ignore
    private storeFreeAgents(freeAgents: Player[]): Promise<Player[]> {
        return this.countPlayers()
            .then(n => {
                if (n > 0) {
                    // start diff
                    _logger.info(`Current FA Size: ${n}.. Starting Diff`);
                    const apiFA = freeAgents.map(fa => fa._id);
                    return this.findInIds(apiFA)
                        .then(found => {
                            const foundPlayers = {};
                            found.forEach(f => foundPlayers[f._id] = true);
                            const newPlayers = freeAgents.filter(newFA => foundPlayers[newFA._id] === undefined);
                            _logger.info(`Found ${newPlayers.length} new players`);

                            // no new and we found the same amount in db
                            const noUpdates = newPlayers.length === 0 && found.length === n;
                            // no new and we found less than the db
                            const removed = newPlayers.length === 0 && found.length > n;
                            // added
                            const added = newPlayers.length > 0;
                            const delta = {
                                noUpdates,
                                removed,
                                added
                            };
                            _logger.debug("Delta: ", delta);
                            if (removed) {
                                const apiIds = {};
                                // all ids from api
                                apiFA.forEach(f => apiIds[f] = true);
                                // the ones removed are the ones we have in the DB that are not in the api ids
                                const removed = Object.keys(foundPlayers).filter(f => apiIds[f]).map(id => parseInt(id));
                                _logger.info(removed);
                                // remove them
                                this._playerStore.remove({_id: {$in: removed}}, {multi: true},
                                    (err, n1) => {
                                        if (err) {
                                            _logger.error(err);
                                        } else {
                                            _logger.debug(`Removed ${n1}`)
                                        }
                                    })
                            }
                            if (added) {
                                this.insert(newPlayers);
                            }
                            return newPlayers;
                        });
                } else {
                    this.insert(freeAgents);
                    return new Promise(((resolve, _reject) => {
                        resolve([])
                    }))
                }
            });

    }

    async refreshTeams(teams: Team[]) {
        await this.removeTeams();
        const reAdded = this.insertTeams(teams);
        _logger.info("Refreshed Teams");
        return reAdded;
    }


    insertTeams(teams: Team[]): Promise<Team[]> {
        return new Promise((resolve, reject) => {
            this._teamStore.update({}, teams, {
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

    insert(freeAgents: Player[]) {
        this._playerStore.insert(freeAgents, (err, docs) => {
            if (err) {
                _logger.error("Error Adding", err);
            } else {
                _logger.info(`Added ${docs.length} new players`);
            }
        });
    }

    findInIds(freeAgents: any[]): Promise<Player[]> {
        return new Promise((resolve, reject) => {

            this._playerStore.find({_id: {$in: freeAgents}})
                .exec((err, documents) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(documents);
                    }
                });
        });
    }

    countPlayers() {
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