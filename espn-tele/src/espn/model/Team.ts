export interface Team {

    id: number
    abbreviation: string
    name: string
    logoURL: string
    wavierRank: number
    roster: Player[]
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


}

export interface Player {
    id: number
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

}