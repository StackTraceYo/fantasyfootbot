export interface Team {
    id: number
    _id: number
    abbreviation: string
    name: string
    logoURL: string
    wavierRank: number
    roster: Player[]
    rosterIds: number[]
    wins: number
    losses: number
    ties: number
    divisionWins: number
    divisionLosses: number
    divisionTies: number
    homeWins: number
    homeLosses: number
    homeTies: number
    awayWins: number
    awayLosses: number
    awayTies: number
    totalPointsScored: number
    regularSeasonPointsFor: number
    regularSeasonPointsAgainst: number
    winningPercentage: number
    playoffSeed: number
    finalStandingsPosition: number
    updated: string

}

export interface TeamIdx {
    _id: number,
    _tId: number
    _pId: number
}

export interface PlayerIdx {
    id: number
    _id: number,
    teamID: number
}

export interface Player {
    id: number
    _id: number
    firstName: string
    lastName: string
    fullName: string
    jerseyNumber: number
    proTeam: string
    proTeamAbbreviation: string
    defaultPosition: string
    eligiblePositions: string[]
    averageDraftPosition: number
    averageAuctionValue: number
    percentChange: number
    percentStarted: number
    percentOwned: number
    acquiredDate: Date
    availabilityStatus: string
    isDroppable: boolean
    isInjured: boolean
    injuryStatus: string
    updated: string
}