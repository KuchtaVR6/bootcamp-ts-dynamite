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
    public dynamiteAmount = 100; // this is wrong counting dynamite is buggy hence this change 
    public score = 0;

    public getRoundsToDynamiteRatio(roundsRemaining: number): number {
        return this.dynamiteAmount / roundsRemaining;
    }
}

enum Reason {
    randomized,
    gettingRidOfRemainingDynamite,
    defendingWithWaterDueToLowRounds,
}

enum Outcome {
    unknown,
    positive,
    neutral,
    negative
}

class FullReason {
    public reason: Reason
    public outcome: Outcome
}

class Bot {
    private opponent = new PlayerStats;
    private me = new PlayerStats;

    private roundsRemaining = 2500;

    private tieCommulation = 1;

    private randomizeTheDecisionAfterRounds = Math.floor(Math.random() * 20) + 10
    private previousReasons: FullReason[] = [];

    private BayesChainingInstance = new BayesChaining;

    private extractType(stringRepresentation: string): PlayTypes {
        switch (stringRepresentation) {
            case 'D': return PlayTypes.dynamite
            case 'R': return PlayTypes.rock
            case 'P': return PlayTypes.paper
            case 'S': return PlayTypes.scissors
            case 'W': return PlayTypes.waterBomb
        }
    }

    private updateRemainingDynamite(gamestate: Gamestate): void {
        if (gamestate.rounds.length == 0) {
            return;
        }
        let lastRound = gamestate.rounds[gamestate.rounds.length - 1]

        if (this.extractType(lastRound[PlayerType.me]) === PlayTypes.dynamite) this.me.dynamiteAmount -= 1;
        if (this.extractType(lastRound[PlayerType.them]) === PlayTypes.dynamite) this.opponent.dynamiteAmount -= 1
    }

    private updateScore(gamestate: Gamestate): void {
        if (gamestate.rounds.length == 0) {
            return;
        }

        let lastRound = gamestate.rounds[gamestate.rounds.length - 1]
        let botPlayed = this.extractType(lastRound[PlayerType.me])
        let opponentPlayed = this.extractType(lastRound[PlayerType.them])

        if (botPlayed === opponentPlayed) {
            this.tieCommulation += 1
        }

        let outcome = Outcome.unknown;

        switch (opponentPlayed) {
            case PlayTypes.dynamite:
                switch (botPlayed) {
                    case PlayTypes.dynamite:
                        outcome = Outcome.neutral; break;
                    case PlayTypes.rock:
                        this.opponent.score += this.tieCommulation; outcome = Outcome.negative
                        break
                    case PlayTypes.paper:
                        this.opponent.score += this.tieCommulation; outcome = Outcome.negative
                        break
                    case PlayTypes.scissors:
                        this.opponent.score += this.tieCommulation; outcome = Outcome.negative
                        break
                    case PlayTypes.waterBomb:
                        this.me.score += this.tieCommulation; outcome = Outcome.positive
                        break
                }
                break;
            case PlayTypes.rock:
                switch (botPlayed) {
                    case PlayTypes.dynamite:
                        this.me.score += this.tieCommulation; outcome = Outcome.positive
                        break
                    case PlayTypes.rock:
                        outcome = Outcome.neutral; break;
                    case PlayTypes.paper:
                        this.me.score += this.tieCommulation; outcome = Outcome.positive
                        break
                    case PlayTypes.scissors:
                        this.opponent.score += this.tieCommulation; outcome = Outcome.negative
                        break
                    case PlayTypes.waterBomb:
                        this.opponent.score += this.tieCommulation; outcome = Outcome.negative
                        break
                }
                break;
            case PlayTypes.paper:
                switch (botPlayed) {
                    case PlayTypes.dynamite:
                        this.me.score += this.tieCommulation; outcome = Outcome.positive
                        break
                    case PlayTypes.rock:
                        this.opponent.score += this.tieCommulation; outcome = Outcome.negative
                        break
                    case PlayTypes.paper:
                        outcome = Outcome.neutral; break;
                    case PlayTypes.scissors:
                        this.me.score += this.tieCommulation; outcome = Outcome.positive
                        break
                    case PlayTypes.waterBomb:
                        this.opponent.score += this.tieCommulation; outcome = Outcome.negative
                        break
                }
                break;
            case PlayTypes.scissors:
                switch (botPlayed) {
                    case PlayTypes.dynamite:
                        this.me.score += this.tieCommulation; outcome = Outcome.positive
                        break
                    case PlayTypes.rock:
                        this.me.score += this.tieCommulation; outcome = Outcome.positive
                        break
                    case PlayTypes.paper:
                        this.opponent.score += this.tieCommulation; outcome = Outcome.negative
                        break
                    case PlayTypes.scissors:
                        outcome = Outcome.neutral; break;
                    case PlayTypes.waterBomb:
                        this.opponent.score += this.tieCommulation; outcome = Outcome.negative
                        break
                }
                break;
            case PlayTypes.waterBomb:
                switch (botPlayed) {
                    case PlayTypes.dynamite:
                        this.opponent.score += this.tieCommulation; outcome = Outcome.negative
                        break
                    case PlayTypes.rock:
                        this.me.score += this.tieCommulation; outcome = Outcome.positive
                        break
                    case PlayTypes.paper:
                        this.me.score += this.tieCommulation; outcome = Outcome.positive
                        break
                    case PlayTypes.scissors:
                        this.me.score += this.tieCommulation; outcome = Outcome.positive
                        break
                    case PlayTypes.waterBomb:
                        outcome = Outcome.neutral; break;
                }
                break;
        }

        let previousReason = this.previousReasons[this.previousReasons.length - 1]

        previousReason.outcome = outcome

        if (botPlayed !== opponentPlayed) {
            this.tieCommulation = 1
        }
    }

    private giveRandomDecisionWithSpecials(): BotSelection {
        let dice;
        if (this.me.dynamiteAmount > 0) {
            if (this.opponent.dynamiteAmount > 0) {
                dice = Math.floor(Math.random() * 5);
            }
            else {
                dice = Math.floor(Math.random() * 4)
            }
        }
        else {
            if (this.opponent.dynamiteAmount > 0) {
                dice = Math.floor(Math.random() * 4) + 1
            }
            else {
                dice = Math.floor(Math.random() * 3) + 1
            }
        }

        switch (dice) {
            case 0: return "D";
            case 1: return "R";
            case 2: return "P";
            case 3: return "S";
            case 4: return "W";
        }
    }

    private decideWithDynamite(): BotSelection {
        let dynamiteRatioOpponent = this.opponent.getRoundsToDynamiteRatio(this.roundsRemaining)
        let dynamiteRatioMe = this.me.getRoundsToDynamiteRatio(this.roundsRemaining)

        if (dynamiteRatioOpponent > 0.8) {
            if (dynamiteRatioMe > 0.9) {
                this.addReason(Reason.gettingRidOfRemainingDynamite)
                return 'D'
            }
            else {
                this.addReason(Reason.defendingWithWaterDueToLowRounds)
                return 'W'
            }
        }
        else {
            if (dynamiteRatioMe > 0.8) {
                this.addReason(Reason.gettingRidOfRemainingDynamite)
                return 'D'
            }
            else {
                this.addReason(Reason.randomized)
                return this.giveRandomDecisionWithSpecials();
            }
        }
    }

    private decideWithoutDynamite(): BotSelection {
        this.addReason(Reason.randomized)
        return this.giveRandomDecisionWithSpecials();
    }

    private estimateRemainingRounds(gamestate: Gamestate): void {
        let elapsedRounds = gamestate.rounds.length

        let scores = [this.opponent.score, this.me.score].sort()

        let scoreRate = scores[0] / scores[1]

        let remainingToWin = 1000 - scores[1]

        let tiesRate = (elapsedRounds - (scores[0] + scores[1])) / elapsedRounds

        let initialEstimate = remainingToWin + remainingToWin * scoreRate

        initialEstimate = Math.floor(initialEstimate * (1 + tiesRate))

        if (initialEstimate > 2500 - elapsedRounds) {
            this.roundsRemaining = 2500 - elapsedRounds
        } else {
            this.roundsRemaining = initialEstimate;
        }
    }

    private addReason(reason: Reason): void {
        let newReason = new FullReason;
        newReason.reason = reason
        this.previousReasons.push(newReason)
    }

    public makeMove(gamestate: Gamestate): BotSelection {

        this.updateRemainingDynamite(gamestate)
        this.updateScore(gamestate)
        this.estimateRemainingRounds(gamestate)

        let bestPredition : PredictionOutput = {
            choice: 'R',
            probability: 0,
            relativeScore: 0,
            sequenceLength: 0,
        };

        if (this.randomizeTheDecisionAfterRounds > 0) {
            this.randomizeTheDecisionAfterRounds -= 1
        }
        else {
            this.addReason(Reason.randomized)
            this.randomizeTheDecisionAfterRounds = Math.floor(Math.random() * 20) + 10
            return this.giveRandomDecisionWithSpecials();
        }

        for (let i = 2; i < 10; i++) {
            let currentBestPrediciton = this.BayesChainingInstance.predict(gamestate, i).sort((a, b) => {
                if (a.probability > b.probability) {
                    return -1
                }
                else if (a.probability == b.probability) {
                    return 0
                }
                else {
                    return 1
                }
            })[0]

            if (bestPredition.relativeScore < currentBestPrediciton.relativeScore) {
                bestPredition = currentBestPrediciton
            }
        }

        if (bestPredition.relativeScore > 0.6) {
            switch (bestPredition.choice) {
                case 'R': return 'P'
                case 'P': return 'S'
                case 'S': return 'R'
                case 'D': return 'W'
                case 'W': return 'S'
            }
        }

        if (this.me.dynamiteAmount > 0)
            return this.decideWithDynamite();
        else
            return this.decideWithoutDynamite();
    }
}

type PredictionOutput = {
    probability: number
    choice: BotSelection
    sequenceLength: number
    relativeScore : number
}

class BayesChaining {
    private countSequences(gamestate: Gamestate, sequence: BotSelection[]) {
        let currentIndex = 0;
        let overallCount = 0;
        for (let startRoundIndex = 0; startRoundIndex < gamestate.rounds.length - sequence.length; startRoundIndex++) {
            currentIndex = 0
            let gameStateIndex = startRoundIndex
            let round = gamestate.rounds[gameStateIndex]
            while (gameStateIndex < gamestate.rounds.length && round.p2 === sequence[currentIndex]) {
                currentIndex += 1
                gameStateIndex += 1
                round = gamestate.rounds[gameStateIndex]
                if (currentIndex === sequence.length) {
                    overallCount += 1
                    break
                }
            }
        }

        return overallCount
    }

    private probabilyOf(gamestate: Gamestate, sequence: BotSelection[]) {
        if (gamestate.rounds.length <= 0) return 0;
        return this.countSequences(gamestate, sequence) / gamestate.rounds.length
    }

    private conditionalProbabilty(gamestate: Gamestate, sequence: BotSelection[], given: BotSelection[]) {
        let numberOfGiven = this.countSequences(gamestate, given)
        if (numberOfGiven <= 0) return 0
        return this.countSequences(gamestate, sequence) / numberOfGiven
    }

    private conditionalProbabiltyGiven(gamestate: Gamestate, UnionSequence: BotSelection[], given: number) {
        if (given <= 0) return 0
        let unionProb = this.probabilyOf(gamestate, UnionSequence)
        return unionProb / given
    }

    private probabiltyOfLongUnion(gamestate: Gamestate, UnionSequence: BotSelection[]) {
        let currentSequence = [UnionSequence[0]]

        let divisorProb = this.probabilyOf(gamestate, currentSequence)

        let overall = divisorProb

        for (let index = 1; index < UnionSequence.length; index++) {
            if (overall === 0) return 0
            currentSequence.push(UnionSequence[index])
            divisorProb = this.conditionalProbabiltyGiven(gamestate, currentSequence, overall)
            overall *= divisorProb
        }

        return divisorProb
    }

    public predict(gamestate: Gamestate, sequenceLength = 5): PredictionOutput[] {

        if (gamestate.rounds.length - 1 - sequenceLength < 0)
            return [
                { probability: 0, choice: 'D', sequenceLength: 0, relativeScore: 0 },
                { probability: 0, choice: 'R', sequenceLength: 0, relativeScore: 0  },
                { probability: 0, choice: 'P', sequenceLength: 0, relativeScore: 0  },
                { probability: 0, choice: 'S', sequenceLength: 0, relativeScore: 0  },
                { probability: 0, choice: 'W', sequenceLength: 0, relativeScore: 0  },
            ]
        let lastVector: BotSelection[] = []
        for (let index = gamestate.rounds.length - sequenceLength; index < (gamestate.rounds.length); index++) {
            lastVector.push(gamestate.rounds[index].p2)
        }
        let vectorsToPredict: BotSelection[][] = [
            [...lastVector, 'D'],
            [...lastVector, 'R'],
            [...lastVector, 'P'],
            [...lastVector, 'S'],
            [...lastVector, 'W'],
        ]

        let probabilities: PredictionOutput[] = []

        vectorsToPredict.map((vector) => {
            let calculatedProb = this.probabiltyOfLongUnion(gamestate, vector)
            probabilities.push({
                probability: calculatedProb,
                choice: vector[vector.length - 1],
                relativeScore: calculatedProb + sequenceLength*0.1,
                sequenceLength: sequenceLength
            })
        })

        return probabilities
    }
}

export = new Bot();
