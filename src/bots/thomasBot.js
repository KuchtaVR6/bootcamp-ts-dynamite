"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var PlayerType;
(function (PlayerType) {
    PlayerType["me"] = "p1";
    PlayerType["them"] = "p2";
})(PlayerType || (PlayerType = {}));
var PlayTypes;
(function (PlayTypes) {
    PlayTypes["dynamite"] = "D";
    PlayTypes["rock"] = "R";
    PlayTypes["paper"] = "P";
    PlayTypes["scissors"] = "S";
    PlayTypes["waterBomb"] = "W";
})(PlayTypes || (PlayTypes = {}));
var PlayerStats = /** @class */ (function () {
    function PlayerStats() {
        this.dynamiteAmount = 100; // this is wrong counting dynamite is buggy hence this change 
        this.score = 0;
    }
    PlayerStats.prototype.getRoundsToDynamiteRatio = function (roundsRemaining) {
        return this.dynamiteAmount / roundsRemaining;
    };
    return PlayerStats;
}());
var Reason;
(function (Reason) {
    Reason[Reason["randomized"] = 0] = "randomized";
    Reason[Reason["gettingRidOfRemainingDynamite"] = 1] = "gettingRidOfRemainingDynamite";
    Reason[Reason["defendingWithWaterDueToLowRounds"] = 2] = "defendingWithWaterDueToLowRounds";
})(Reason || (Reason = {}));
var Outcome;
(function (Outcome) {
    Outcome[Outcome["unknown"] = 0] = "unknown";
    Outcome[Outcome["positive"] = 1] = "positive";
    Outcome[Outcome["neutral"] = 2] = "neutral";
    Outcome[Outcome["negative"] = 3] = "negative";
})(Outcome || (Outcome = {}));
var FullReason = /** @class */ (function () {
    function FullReason() {
    }
    return FullReason;
}());
var Bot = /** @class */ (function () {
    function Bot() {
        this.opponent = new PlayerStats;
        this.me = new PlayerStats;
        this.roundsRemaining = 2500;
        this.tieCommulation = 1;
        this.randomizeTheDecisionAfterRounds = Math.floor(Math.random() * 20) + 10;
        this.previousReasons = [];
        this.bayesChainingInstance = new BayesChaining;
        this.dynamiteProbBoostLastsFor = 3;
        this.currentdynamiteProbBoost = 0;
    }
    Bot.prototype.extractType = function (stringRepresentation) {
        switch (stringRepresentation) {
            case 'D': return PlayTypes.dynamite;
            case 'R': return PlayTypes.rock;
            case 'P': return PlayTypes.paper;
            case 'S': return PlayTypes.scissors;
            case 'W': return PlayTypes.waterBomb;
        }
    };
    Bot.prototype.updateRemainingDynamite = function (gamestate) {
        if (gamestate.rounds.length == 0) {
            return;
        }
        var lastRound = gamestate.rounds[gamestate.rounds.length - 1];
        if (this.extractType(lastRound[PlayerType.me]) === PlayTypes.dynamite)
            this.me.dynamiteAmount -= 1;
        if (this.extractType(lastRound[PlayerType.them]) === PlayTypes.dynamite)
            this.opponent.dynamiteAmount -= 1;
    };
    Bot.prototype.updateScore = function (gamestate) {
        if (gamestate.rounds.length == 0) {
            return;
        }
        var lastRound = gamestate.rounds[gamestate.rounds.length - 1];
        var botPlayed = this.extractType(lastRound[PlayerType.me]);
        var opponentPlayed = this.extractType(lastRound[PlayerType.them]);
        if (botPlayed === opponentPlayed) {
            this.tieCommulation += 1;
        }
        var outcome = Outcome.unknown;
        switch (opponentPlayed) {
            case PlayTypes.dynamite:
                switch (botPlayed) {
                    case PlayTypes.dynamite:
                        outcome = Outcome.neutral;
                        break;
                    case PlayTypes.rock:
                        this.opponent.score += this.tieCommulation;
                        outcome = Outcome.negative;
                        break;
                    case PlayTypes.paper:
                        this.opponent.score += this.tieCommulation;
                        outcome = Outcome.negative;
                        break;
                    case PlayTypes.scissors:
                        this.opponent.score += this.tieCommulation;
                        outcome = Outcome.negative;
                        break;
                    case PlayTypes.waterBomb:
                        this.me.score += this.tieCommulation;
                        outcome = Outcome.positive;
                        break;
                }
                break;
            case PlayTypes.rock:
                switch (botPlayed) {
                    case PlayTypes.dynamite:
                        this.me.score += this.tieCommulation;
                        outcome = Outcome.positive;
                        break;
                    case PlayTypes.rock:
                        outcome = Outcome.neutral;
                        break;
                    case PlayTypes.paper:
                        this.me.score += this.tieCommulation;
                        outcome = Outcome.positive;
                        break;
                    case PlayTypes.scissors:
                        this.opponent.score += this.tieCommulation;
                        outcome = Outcome.negative;
                        break;
                    case PlayTypes.waterBomb:
                        this.opponent.score += this.tieCommulation;
                        outcome = Outcome.negative;
                        break;
                }
                break;
            case PlayTypes.paper:
                switch (botPlayed) {
                    case PlayTypes.dynamite:
                        this.me.score += this.tieCommulation;
                        outcome = Outcome.positive;
                        break;
                    case PlayTypes.rock:
                        this.opponent.score += this.tieCommulation;
                        outcome = Outcome.negative;
                        break;
                    case PlayTypes.paper:
                        outcome = Outcome.neutral;
                        break;
                    case PlayTypes.scissors:
                        this.me.score += this.tieCommulation;
                        outcome = Outcome.positive;
                        break;
                    case PlayTypes.waterBomb:
                        this.opponent.score += this.tieCommulation;
                        outcome = Outcome.negative;
                        break;
                }
                break;
            case PlayTypes.scissors:
                switch (botPlayed) {
                    case PlayTypes.dynamite:
                        this.me.score += this.tieCommulation;
                        outcome = Outcome.positive;
                        break;
                    case PlayTypes.rock:
                        this.me.score += this.tieCommulation;
                        outcome = Outcome.positive;
                        break;
                    case PlayTypes.paper:
                        this.opponent.score += this.tieCommulation;
                        outcome = Outcome.negative;
                        break;
                    case PlayTypes.scissors:
                        outcome = Outcome.neutral;
                        break;
                    case PlayTypes.waterBomb:
                        this.opponent.score += this.tieCommulation;
                        outcome = Outcome.negative;
                        break;
                }
                break;
            case PlayTypes.waterBomb:
                switch (botPlayed) {
                    case PlayTypes.dynamite:
                        this.opponent.score += this.tieCommulation;
                        outcome = Outcome.negative;
                        break;
                    case PlayTypes.rock:
                        this.me.score += this.tieCommulation;
                        outcome = Outcome.positive;
                        break;
                    case PlayTypes.paper:
                        this.me.score += this.tieCommulation;
                        outcome = Outcome.positive;
                        break;
                    case PlayTypes.scissors:
                        this.me.score += this.tieCommulation;
                        outcome = Outcome.positive;
                        break;
                    case PlayTypes.waterBomb:
                        outcome = Outcome.neutral;
                        break;
                }
                break;
        }
        var previousReason = this.previousReasons[this.previousReasons.length - 1];
        previousReason.outcome = outcome;
        if (botPlayed !== opponentPlayed) {
            this.tieCommulation = 1;
        }
    };
    Bot.prototype.giveRandomDecisionWithSpecials = function () {
        var dice;
        var usedProb = 1 / 16;
        if (this.currentdynamiteProbBoost > 0) {
            usedProb = 1 / 2;
        }
        else {
            if (Math.random() * 10 > 9) {
                this.currentdynamiteProbBoost = this.dynamiteProbBoostLastsFor;
            }
        }
        if (this.me.dynamiteAmount > 0) {
            if (this.opponent.dynamiteAmount > 0) {
                dice = Math.floor(Math.random() * (4 + 1 / 16 + usedProb) + 1 / 16);
            }
            else {
                dice = Math.floor(Math.random() * (4 - 1 / 16) + 1 / 16);
            }
        }
        else {
            if (this.opponent.dynamiteAmount > 0) {
                dice = Math.floor(Math.random() * (3 + usedProb)) + 1;
            }
            else {
                dice = Math.floor(Math.random() * 3) + 1;
            }
        }
        switch (dice) {
            case 0: {
                this.currentdynamiteProbBoost -= 1;
                return "D";
            }
            case 1: return "R";
            case 2: return "P";
            case 3: return "S";
            case 4: return "W";
        }
    };
    Bot.prototype.decideWithDynamite = function () {
        var dynamiteRatioOpponent = this.opponent.getRoundsToDynamiteRatio(this.roundsRemaining);
        var dynamiteRatioMe = this.me.getRoundsToDynamiteRatio(this.roundsRemaining);
        if (dynamiteRatioOpponent > 0.8) {
            if (dynamiteRatioMe > 0.9) {
                this.addReason(Reason.gettingRidOfRemainingDynamite);
                return 'D';
            }
            else {
                this.addReason(Reason.defendingWithWaterDueToLowRounds);
                return 'W';
            }
        }
        else {
            if (dynamiteRatioMe > 0.8) {
                this.addReason(Reason.gettingRidOfRemainingDynamite);
                return 'D';
            }
            else {
                this.addReason(Reason.randomized);
                return this.giveRandomDecisionWithSpecials();
            }
        }
    };
    Bot.prototype.decideWithoutDynamite = function () {
        this.addReason(Reason.randomized);
        return this.giveRandomDecisionWithSpecials();
    };
    Bot.prototype.estimateRemainingRounds = function (gamestate) {
        var elapsedRounds = gamestate.rounds.length;
        var scores = [this.opponent.score, this.me.score].sort();
        var scoreRate = scores[0] / scores[1];
        var remainingToWin = 1000 - scores[1];
        var tiesRate = (elapsedRounds - (scores[0] + scores[1])) / elapsedRounds;
        var initialEstimate = remainingToWin + remainingToWin * scoreRate;
        initialEstimate = Math.floor(initialEstimate * (1 + tiesRate));
        if (initialEstimate > 2500 - elapsedRounds) {
            this.roundsRemaining = 2500 - elapsedRounds;
        }
        else {
            this.roundsRemaining = initialEstimate;
        }
    };
    Bot.prototype.addReason = function (reason) {
        var newReason = new FullReason;
        newReason.reason = reason;
        this.previousReasons.push(newReason);
    };
    Bot.prototype.makeMove = function (gamestate) {
        this.updateRemainingDynamite(gamestate);
        this.updateScore(gamestate);
        this.estimateRemainingRounds(gamestate);
        if (this.randomizeTheDecisionAfterRounds > 0) {
            this.randomizeTheDecisionAfterRounds -= 1;
        }
        else {
            this.addReason(Reason.randomized);
            this.randomizeTheDecisionAfterRounds = Math.floor(Math.random() * 3) + 1;
            return this.giveRandomDecisionWithSpecials();
        }
        if (gamestate.rounds.length > 200) {
            var bestPredition = {
                choice: 'R',
                probability: 0,
                relativeScore: 0,
                sequenceLength: 0
            };
            for (var i = 2; i < 10; i++) {
                var currentBestPrediciton = this.bayesChainingInstance.predict(gamestate, i).sort(function (a, b) {
                    if (a.probability > b.probability) {
                        return -1;
                    }
                    else if (a.probability == b.probability) {
                        return 0;
                    }
                    else {
                        return 1;
                    }
                })[0];
                if (bestPredition.relativeScore < currentBestPrediciton.relativeScore) {
                    bestPredition = currentBestPrediciton;
                }
            }
            if (bestPredition.relativeScore > 0.8) {
                switch (bestPredition.choice) {
                    case 'R': return 'P';
                    case 'P': return 'S';
                    case 'S': return 'R';
                    case 'W': return 'S';
                }
            }
        }
        if (this.me.dynamiteAmount > 0)
            return this.decideWithDynamite();
        else
            return this.decideWithoutDynamite();
    };
    return Bot;
}());
var BayesChaining = /** @class */ (function () {
    function BayesChaining() {
    }
    BayesChaining.prototype.countSequences = function (gamestate, sequence) {
        var currentIndex = 0;
        var overallCount = 0;
        for (var startRoundIndex = 0; startRoundIndex < gamestate.rounds.length - sequence.length; startRoundIndex++) {
            currentIndex = 0;
            var gameStateIndex = startRoundIndex;
            var round = gamestate.rounds[gameStateIndex];
            while (gameStateIndex < gamestate.rounds.length && round.p2 === sequence[currentIndex]) {
                currentIndex += 1;
                gameStateIndex += 1;
                round = gamestate.rounds[gameStateIndex];
                if (currentIndex === sequence.length) {
                    overallCount += 1;
                    break;
                }
            }
        }
        return overallCount;
    };
    BayesChaining.prototype.probabilyOf = function (gamestate, sequence) {
        if (gamestate.rounds.length <= 0)
            return 0;
        return this.countSequences(gamestate, sequence) / gamestate.rounds.length;
    };
    BayesChaining.prototype.conditionalProbabiltyGiven = function (gamestate, UnionSequence, given) {
        if (given <= 0)
            return 0;
        var unionProb = this.probabilyOf(gamestate, UnionSequence);
        return unionProb / given;
    };
    BayesChaining.prototype.probabiltyOfLongUnion = function (gamestate, UnionSequence) {
        var currentSequence = [UnionSequence[0]];
        var divisorProb = this.probabilyOf(gamestate, currentSequence);
        var overall = divisorProb;
        for (var index = 1; index < UnionSequence.length; index++) {
            if (overall === 0)
                return 0;
            currentSequence.push(UnionSequence[index]);
            divisorProb = this.conditionalProbabiltyGiven(gamestate, currentSequence, overall);
            overall *= divisorProb;
        }
        return divisorProb;
    };
    BayesChaining.prototype.predict = function (gamestate, sequenceLength) {
        var _this = this;
        if (sequenceLength === void 0) { sequenceLength = 5; }
        if (gamestate.rounds.length - 1 - sequenceLength < 0)
            return [
                { probability: 0, choice: 'D', sequenceLength: 0, relativeScore: 0 },
                { probability: 0, choice: 'R', sequenceLength: 0, relativeScore: 0 },
                { probability: 0, choice: 'P', sequenceLength: 0, relativeScore: 0 },
                { probability: 0, choice: 'S', sequenceLength: 0, relativeScore: 0 },
                { probability: 0, choice: 'W', sequenceLength: 0, relativeScore: 0 },
            ];
        var lastVector = [];
        for (var index = gamestate.rounds.length - sequenceLength; index < (gamestate.rounds.length); index++) {
            lastVector.push(gamestate.rounds[index].p2);
        }
        var vectorsToPredict = [
            __spreadArray(__spreadArray([], lastVector, true), ['D'], false),
            __spreadArray(__spreadArray([], lastVector, true), ['R'], false),
            __spreadArray(__spreadArray([], lastVector, true), ['P'], false),
            __spreadArray(__spreadArray([], lastVector, true), ['S'], false),
            __spreadArray(__spreadArray([], lastVector, true), ['W'], false),
        ];
        var probabilities = [];
        vectorsToPredict.map(function (vector) {
            var calculatedProb = _this.probabiltyOfLongUnion(gamestate, vector);
            probabilities.push({
                probability: calculatedProb,
                choice: vector[vector.length - 1],
                relativeScore: calculatedProb + sequenceLength * 0.1,
                sequenceLength: sequenceLength
            });
        });
        return probabilities;
    };
    return BayesChaining;
}());
module.exports = new Bot();
