import {Client} from 'espn-fantasy-football-api/node-dev';
import {Player, Team} from "./model/Team";
import * as winston from "winston";
import {EspnTeleConfig} from "../EspnTele";

const _logger = winston.createLogger({
    level: 'debug',
    defaultMeta: {service: 'FantasyClient'},
    transports: new winston.transports.Console()
});


export class FantasyClient {

    private _espnClient: any;
    private _config: EspnTeleConfig;


    public constructor(config: EspnTeleConfig) {
        this._espnClient = new Client({leagueId: config.leagueId});
        this._espnClient.setCookies({espnS2: config.s2, SWID: config.swid});
        this._config = config;
    }

    async getAll() {
        const teams = await this.getTeams();
        let players: Player[] = await this.getFA();
        teams.forEach((team: Team) => {
            players = players.concat(team.roster);
        });

        return {
            teams: teams,
            players: players
        }
    }

    async getTeams(): Promise<Team[]> {
        _logger.info(`Getting Teams for week ${this.week()} ...`);
        const teams: Team[] = await this._espnClient.getTeamsAtWeek({
            seasonId: this._config.season,
            scoringPeriodId: this.week()
        });
        return teams.map((teamData: Team) => {
            teamData._id = teamData.id;
            teamData.rosterIds = teamData.roster.map(p => p.id);
            teamData.updated = new Date().toISOString();
            return teamData;
        })
    }

    async getFA(): Promise<Player[]> {
        _logger.info("Getting FA...");
        const data: any[] = await this._espnClient.getFreeAgents({
            seasonId: this._config.season,
            scoringPeriodId: this.week(),
            matchupPeriodId: this.week()
        });

        return data.map((player: any) => {
            const playerData = player.player;
            playerData._id = player.player.id;
            playerData.updated = new Date().toISOString();
            return playerData;
        });
    }


    private week() {
        const today = new Date();
        const startDay = this._config.start;
        // @ts-ignore
        const weeksSince = Math.round((today - startDay) / (7 * 24 * 60 * 60 * 1000));
        return weeksSince + 1;
    }

}