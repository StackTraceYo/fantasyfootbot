import {Client} from 'espn-fantasy-football-api/node-dev';
import {Team} from "./model/Team";

export interface FantasyClientConfig {
    leagueId: number,
    s2: string,
    swid: string,
    season: number
}

export class FantasyClient {

    private _espnClient: any;
    private _season: number;

    public constructor(config: FantasyClientConfig) {
        this._espnClient = new Client({leagueId: config.leagueId});
        this._espnClient.setCookies({espnS2: config.s2, SWID: config.swid});
        this._season = config.season;
    }

    async getTeams() {
        const teams : Team[] = await this._espnClient.getTeamsAtWeek({
            seasonId: this._season,
            scoringPeriodId: 1
        });
        await teams.forEach(t => {
            console.log(t.name)
        })
    }

}