import {FantasyClient} from "./espn/FantasyClient";

export default class EspnTele {

    client = new FantasyClient({leagueId: 123, swid: '123', s2: '123', season: 2019});

}

const t = new EspnTele();

t.client.getTeams();