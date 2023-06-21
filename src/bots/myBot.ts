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
        let dynamiteCount = 100;
        let lastRound = gamestate.rounds[gamestate.rounds.length - 1]
        if (this.extractType(lastRound[PlayerType.me]) === PlayTypes.dynamite) this.me.dynamiteAmount -= 1
        if (this.extractType(lastRound[PlayerType.them]) === PlayTypes.dynamite) this.opponent.dynamiteAmount -= 1
    }

    private updateScore(gamestate: Gamestate) : void {
        let lastRound = gamestate.rounds[gamestate.rounds.length - 1]
        let botPlayed = this.extractType(lastRound[PlayerType.me])
        let opponentPlayed = this.extractType(lastRound[PlayerType.them])

        switch (opponentPlayed) {
            case PlayTypes.dynamite:
                switch (botPlayed) {
                    case PlayTypes.dynamite:
                        break
                    case PlayTypes.rock:
                        this.opponent.score += 1
                        break
                    case PlayTypes.paper:
                        this.opponent.score += 1
                        break
                    case PlayTypes.scissors:
                        this.opponent.score += 1
                        break
                    case PlayTypes.waterBomb:
                        this.me.score += 1
                        break
                }
                break;
            case PlayTypes.rock:
                switch (botPlayed) {
                    case PlayTypes.dynamite:
                        this.me.score += 1
                        break
                    case PlayTypes.rock:
                        break
                    case PlayTypes.paper:
                        this.me.score += 1
                        break
                    case PlayTypes.scissors:
                        this.opponent.score += 1
                        break
                    case PlayTypes.waterBomb:
                        this.opponent.score += 1
                        break
                }
                break;
            case PlayTypes.paper:
                switch (botPlayed) {
                    case PlayTypes.dynamite:
                        this.me.score += 1
                        break
                    case PlayTypes.rock:
                        this.opponent.score += 1
                        break
                    case PlayTypes.paper:
                        break
                    case PlayTypes.scissors:
                        this.me.score += 1
                        break
                    case PlayTypes.waterBomb:
                        this.opponent.score += 1
                        break
                }
                break;
            case PlayTypes.scissors:
                switch (botPlayed) {
                    case PlayTypes.dynamite:
                    case PlayTypes.rock:
                    case PlayTypes.paper:
                    case PlayTypes.scissors:
                    case PlayTypes.waterBomb:
                }
                break;
            case PlayTypes.waterBomb:
                switch (botPlayed) {
                    case PlayTypes.dynamite:
                    case PlayTypes.rock:
                    case PlayTypes.paper:
                    case PlayTypes.scissors:
                    case PlayTypes.waterBomb:
                }
                break;
        }
    }

    private giveRandomDecision(gamestate : Gamestate) : BotSelection {
        let dice = Math.floor(Math.random()*3);

        switch (dice) {
            case 0: return "R";
            case 1: return "P";
            case 2: return "S";
        }
    }

    private decideWithOpponentDynamite() : BotSelection {
        
    }

    private decideWithoutOpponentDynamite() : BotSelection {
        if () {

        }
    }

    private calculateScore(gamestate: Gamestate) : number[] {
        let myScore = 0;
        let theirScore = 0;
        gamestate.rounds.map((round) => {})
    }

    private estimateRemainingRounds(gamestate: Gamestate) : number {
        let elapsedRounds = gamestate.rounds.length
    }

    public makeMove(gamestate: Gamestate): BotSelection {

        this.updateRemainingDynamite(gamestate)
        this.updateScore(gamestate)

        if(this.opponentDynamite > 0) 
            return this.decideWithOpponentDynamite();
        else 
            return this.decideWithoutOpponentDynamite();
    }
}

export = new Bot();
