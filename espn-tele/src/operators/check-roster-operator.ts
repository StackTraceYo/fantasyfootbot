import {from, merge, Observable} from "rxjs";

import {filter, flatMap, groupBy, map, mergeMap, toArray} from 'rxjs/operators';
import EspnTele from "../EspnTele";
import {Player, Team} from "../espn/model/Team";


interface MergeTeam {
    id: number
    name: string,
    roster: number[],
    current: boolean
}

interface DiffedTeam {
    id: number
    name: string,
    removedPlayers: number[],
    newPlayers: number[]
}


export interface UpdatedTeam {
    id: number
    name: string,
    removedPlayers: Player[],
    newPlayers: Player[]
}


export default function checkRosterOperator(t: EspnTele) {


    function diffMerge(teams: MergeTeam[]): DiffedTeam {
        const updates = teams[0].current ? teams[0] : teams[1];
        const current = teams[0].current ? teams[1] : teams[0];
        return {
            ...updates,
            newPlayers: updates.roster.filter(r => !current.roster.includes(r)),
            removedPlayers: current.roster.filter(r => !updates.roster.includes(r))
        };
    }

    function filterDiffedTeam(forTeam: DiffedTeam): boolean {
        return forTeam.removedPlayers.length > 0 || forTeam.newPlayers.length > 0;
    }

    async function fetchPlayers(forTeam: DiffedTeam): Promise<UpdatedTeam> {
        const newPlayers = await t.store().findPlayersById(forTeam.newPlayers);
        const removedPlayers = await t.store().findPlayersById(forTeam.removedPlayers);
        return {
            ...forTeam,
            newPlayers,
            removedPlayers
        }

    }

    function waitForFetch(forTeam: DiffedTeam): Observable<UpdatedTeam> {
        return from(fetchPlayers(forTeam));
    }

    function mapTeam(t: Team, c: boolean): MergeTeam {
        return {
            id: t._id,
            name: t.name,
            roster: t.rosterIds,
            current: c
        }
    }

    function fetchUpdates() {
        const updated: Observable<MergeTeam> = from(t.client().getTeams())
            .pipe(
                flatMap((value: Team[]) => value),
                map(t => mapTeam(t, true))
            );

        const current: Observable<MergeTeam> = from(t.store().getTeams())
            .pipe(
                flatMap((value: Team[]) => value),
                map(t => mapTeam(t, false))
            );

        return merge(updated, current).pipe(
            groupBy((value: MergeTeam) => value.id),
            mergeMap(value => value.pipe(toArray())),
            map(diffMerge),
            filter(filterDiffedTeam),
            flatMap(waitForFetch)
        );
    }

    return fetchUpdates

}

