import { Gamestate, BotSelection } from '../models/gamestate';

enum PlayerType {
    me = "p1",
    them = "p2"
}

enum PlayTypes {
    dynamite = 'D',
    rock = 'R',
    paper = 'P', 
    scissors = 'S',
    waterBomb = 'W'
}

class PlayerStats {
    public dynamiteAmount = 100;
    public score = 0;
}

class Bot {
    private opponent = new PlayerStats;
    private me = new PlayerStats;

    private roundsRemaining = 2500;

    private tieCommulation = 1;

    private extractType(stringRepresentation : string) : PlayTypes {
        switch (stringRepresentation) {
            case 'D': return PlayTypes.dynamite
            case 'R': return PlayTypes.rock
            case 'P': return PlayTypes.paper
            case 'S': return PlayTypes.scissors
            case 'W': return PlayTypes.waterBomb
        }
    }

    private updateRemainingDynamite(gamestate: Gamestate) : void {
        if(gamestate.rounds.length == 0) {
            return;
        }
        let lastRound = gamestate.rounds[gamestate.rounds.length - 1]
        if (this.extractType(lastRound[PlayerType.me]) === PlayTypes.dynamite) this.me.dynamiteAmount -= 1
        if (this.extractType(lastRound[PlayerType.them]) === PlayTypes.dynamite) this.opponent.dynamiteAmount -= 1
    }

    private updateScore(gamestate: Gamestate) : void {
        if(gamestate.rounds.length == 0) {
            return;
        }

        let lastRound = gamestate.rounds[gamestate.rounds.length - 1]
        let botPlayed = this.extractType(lastRound[PlayerType.me])
        let opponentPlayed = this.extractType(lastRound[PlayerType.them])

        if(botPlayed === opponentPlayed) {
            this.tieCommulation += 1
        }

        switch (opponentPlayed) {
            case PlayTypes.dynamite:
                switch (botPlayed) {
                    case PlayTypes.dynamite:
                        break
                    case PlayTypes.rock:
                        this.opponent.score += this.tieCommulation
                        break
                    case PlayTypes.paper:
                        this.opponent.score += this.tieCommulation
                        break
                    case PlayTypes.scissors:
                        this.opponent.score += this.tieCommulation
                        break
                    case PlayTypes.waterBomb:
                        this.me.score += this.tieCommulation
                        break
                }
                break;
            case PlayTypes.rock:
                switch (botPlayed) {
                    case PlayTypes.dynamite:
                        this.me.score += this.tieCommulation
                        break
                    case PlayTypes.rock:
                        break
                    case PlayTypes.paper:
                        this.me.score += this.tieCommulation
                        break
                    case PlayTypes.scissors:
                        this.opponent.score += this.tieCommulation
                        break
                    case PlayTypes.waterBomb:
                        this.opponent.score += this.tieCommulation
                        break
                }
                break;
            case PlayTypes.paper:
                switch (botPlayed) {
                    case PlayTypes.dynamite:
                        this.me.score += this.tieCommulation
                        break
                    case PlayTypes.rock:
                        this.opponent.score += this.tieCommulation
                        break
                    case PlayTypes.paper:
                        break
                    case PlayTypes.scissors:
                        this.me.score += this.tieCommulation
                        break
                    case PlayTypes.waterBomb:
                        this.opponent.score += this.tieCommulation
                        break
                }
                break;
            case PlayTypes.scissors:
                switch (botPlayed) {
                    case PlayTypes.dynamite:
                        this.me.score += this.tieCommulation
                        break
                    case PlayTypes.rock:
                        this.me.score += this.tieCommulation
                        break
                    case PlayTypes.paper:
                        this.opponent.score += this.tieCommulation
                        break
                    case PlayTypes.scissors:
                        break
                    case PlayTypes.waterBomb:
                        this.opponent.score += this.tieCommulation
                        break
                }
                break;
            case PlayTypes.waterBomb:
                switch (botPlayed) {
                    case PlayTypes.dynamite:
                        this.opponent.score += this.tieCommulation
                        break
                    case PlayTypes.rock:
                        this.me.score += this.tieCommulation
                        break
                    case PlayTypes.paper:
                        this.me.score += this.tieCommulation
                        break
                    case PlayTypes.scissors:
                        this.me.score += this.tieCommulation
                        break
                    case PlayTypes.waterBomb:
                        break
                }
                break;
        }

        if(botPlayed !== opponentPlayed) {
            this.tieCommulation = 1
        }
    }

    private giveRandomDecision() : BotSelection {
        let dice = Math.floor(Math.random()*3);

        switch (dice) {
            case 0: return "R";
            case 1: return "P";
            case 2: return "S";
        }
    }

    private decideWithDynamite() : BotSelection {
        if (this.estimateRemainingRounds())
    }

    private decideWithoutDynamite() : BotSelection {
        return null
    }

    private estimateRemainingRounds(gamestate: Gamestate) : number {
        let elapsedRounds = gamestate.rounds.length

        let scores = [this.opponent.score, this.me.score].sort()

        let scoreRate = scores[0]/scores[1]
        
        let remainingToWin = 1000 - scores[1]

        let tiesRate = (elapsedRounds - (scores[0] + scores[1])) / elapsedRounds

        let initialEstimate = remainingToWin + remainingToWin * scoreRate

        initialEstimate = Math.floor(initialEstimate * (1 + tiesRate))

        if(initialEstimate > 2500 - elapsedRounds) {
            return 2500 - elapsedRounds
        }
        return initialEstimate
    }

    public makeMove(gamestate: Gamestate): BotSelection {

        this.updateRemainingDynamite(gamestate)
        this.updateScore(gamestate)

        if(this.me.dynamiteAmount > 0) 
            return this.decideWithDynamite();
        else 
            return this.decideWithoutDynamite();
    }
}

export = new Bot();
