import * as dotenv from 'dotenv';
import EspnTeleBot, {EspnTeleConfig} from "./EspnTele";


function error(msg: string) {
    return new Error(`Error In Environment Parsing: ${msg}`)
}

function validateNum(num: number, n: string) {
    const valid = num !== undefined && num !== null && !isNaN(num);
    if (valid) {
        return num
    } else {
        throw error(`Number Is Not Valid ${num} for field ${n}`)
    }
}


function validateDate(d: string, n: string) {
    const date = new Date(d);
    const valid = validateNum(date.getTime(), n);
    if (valid) {
        return date;
    } else {
        throw error(`Date Is Not Valid ${d} for field ${n}`)
    }
}

function validate(s: string, n: string) {
    const valid = s !== null && s !== undefined && s !== "";
    if (valid) {
        return s;
    } else {
        throw error(`String Is Not Valid ${s} for field ${n}`)
    }
}

function loadEnv() {
    dotenv.config();
    const config: EspnTeleConfig = {
        filePath: process.env.STORAGE_PATH || '/data',
        leagueId: validateNum(parseInt(process.env.ESPN_LEAGUE_ID), 'ESPN_LEAGUE_ID'),
        refresh: validateNum(parseInt(process.env.REFRESH_SECONDS), 'REFRESH_SECONDS') * 1000,
        s2: validate(process.env.ESPN_S2, 'ESPN_S2'),
        swid: validate(process.env.ESPN_SWID, 'ESPN_SWID'),
        start: validateDate(process.env.START_DAY, 'START_DAY'),
        season: validateDate(process.env.START_DAY, 'Season.  START_DAY -> Used for Season Year').getFullYear(),
        teleToken: validate(process.env.TELEGRAM_TOKEN, 'TELEGRAM_TOKEN'),
    };

    return config;
}


export function run() {
    const config = loadEnv();
    const t = new EspnTeleBot(config);
    t.launch();
}

run();