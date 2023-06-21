import { Gamestate, BotSelection } from '../models/gamestate';

class Bot {

    
    makeMove(gamestate: Gamestate): BotSelection {
        return 'P';
    }
}

export = new Bot();
