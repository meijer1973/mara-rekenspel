import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, GRAVITY, LEVEL_CONFIG, PLAYER_MAX_HEALTH } from '../data/constants';
import { Player } from '../entities/Player';
import { Goomba } from '../entities/Goomba';
import { Coin } from '../entities/Coin';
import { QuestionBlock } from '../entities/QuestionBlock';
import { FlagPole } from '../entities/FlagPole';
import { AudioManager } from '../systems/AudioManager';
import { SaveManager } from '../systems/SaveManager';
import { MathTrigger } from './MathPopupScene';

// Level map data — 24 levels, each 18 rows × 70 chars
// Legend: G=grass, D=dirt, P=platform, ?=question, C=coin, E=enemy, F=flag, S=sign, .=empty
// 18 rows × 32px = 576px = exactly GAME_HEIGHT → ground at bottom of screen
function makeLevelMaps(): string[][] {
    // Helper: create a level with 7 empty top rows + 11 gameplay rows
    const pad = (rows: string[]): string[] => {
        // Pad each row to exactly 70 chars
        const padded = rows.map(r => r.padEnd(70, '.').substring(0, 70));
        // Add empty rows at top so total = 18
        while (padded.length < 18) padded.unshift('.'.repeat(70));
        return padded;
    };

    return [
        // ===== WORLD 1: REKENBOS =====
        // Level 1-1
        pad([
            '..............C.C.C..........C.C.C...........C.C.C..............F...',
            '.............PPPPPPP........PPPPPPP..........PPPPPPP........PPPPPPP.',
            '......................................................................',
            '........?..........C.C.C..........?..........C.C.C..........C.C.C..',
            '.......PPP........PPPPPPP........PPP........PPPPPPP........PPPPPPP..',
            '......................................................................',
            '..S...........E...............E...............E...............E......',
            'GGGGGGGGGGGGGGGGGGGGGG..GGGGGGGGGGGGGGGG..GGGGGGGGGGGGGGGGGGGGGGGGG',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
        ]),
        // Level 1-2
        pad([
            '..C.C.C.........................................C.C.C..........F....',
            '..PPPPP........?....C.C.C...........C.C.C....?............PPPPPPPP.',
            '............PPP...PPPPPPP..........PPPPPPP..PPP.....................',
            '......................................................................',
            '..?..........C.C.C........?..........C.C.C.........PPPPPP..........',
            '.PPP.......PPPPPPP.......PPP........PPPPPPP......PPPPPPPPPPPP......',
            '....................E...................E..........E.................',
            '.S.......E......GGGGGGGG....GGGGGGGG.....GGGGGGG.GGGGGGGGGGGGGGGG.',
            'GGGGGGGGGGGGG...DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD.',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
        ]),
        // Level 1-3
        pad([
            '..........................................................C.C.C.F..',
            '....C.C.?.C.C........?........C.C.?.C.C..........PPPPPPPPPPPPPPPPP.',
            '...PPPPPPPPPPPP.....PPP......PPPPPPPPPP............................',
            '...................................................?...PPPP........',
            '...?...............C.C.C........E.....PPP..........................',
            '..PPP.........E..PPPPPPP.....GGGG....................................',
            '............GGGGGGG....................................E..PPPPPPPP.',
            '.S...E.........................E............E......GGGGGGG.........',
            'GGGGGGGGGGG...GGGGGGG...GGGGGGGGGG...GGGGGGGGGGGDDDDDDDDDDDDDDDD.',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
        ]),
        // ===== WORLD 2: ZONNESTRAND =====
        // Level 2-1
        pad([
            '....C.C.C.....................................C.C.C............F....',
            '...PPPPPPP........?..C.C.C.?......C.C.?....PPPPPPP.......PPPPPPPP.',
            '..............PPP..PPPPPPP.PPP....PPPPPPP.........................',
            '..?......................................................PPPP......',
            '.PPP.....E.............E...........E....PPPP...............E.......',
            '.......GGGGG......GGGGG......GGGGG........E......GGGGGGGGGGGGGGG..',
            '......................................................................',
            '.S......E.........E..........E.......E.......E.....................',
            'GGGGGGGGGGGG..GGGGGGGG..GGGGGGGGG..GGGGGGGG..GGGGGGGGGGGGGGGGGGG.',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
        ]),
        // Level 2-2
        pad([
            '..C.C.?................................................C.C.C..F....',
            '.PPPPPPP.........?..C.C.C....C.C.?....C.C.C........PPPPPPPPPPPPP..',
            '..............PPP.PPPPPPP...PPPPPPP...PPPPPPP.....................',
            '.............................................?...PPPP...............',
            '..?..........E......E.........E.....PPP............PPPP............',
            '.PPP.....GGGGG...GGGGG....GGGGG...........................E.......',
            '......................................................................',
            '.S....E.......E........E........E........E.......GGGGGGGGGGGGGGG..',
            'GGGGGGGG..GGGGGGG..GGGGGGGG..GGGGGGGG..GGGGGGGGGDDDDDDDDDDDDDDDD.',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
        ]),
        // Level 2-3
        pad([
            '..................C.C.C........C.C.C.......C.C.C.C.C.C......F.....',
            '..?..C.C.......PPPPPPP..?...PPPPPPP..?..PPPPPPPPPPPP..PPPPPPPPP..',
            '.PPP.PPPP...PPP.............PPP.............PPP...................',
            '......................................................................',
            '........?...........E...?..........E.....?..........PPPP...........',
            '.......PPP......GGGGG..PPP.....GGGGG...PPP....E......E............',
            '......................................................................',
            '.S..E........E.........E.........E.........E..GGGGGGGGGGGGGGGGG...',
            'GGGGGGGGG.GGGGGGGG.GGGGGGGGG.GGGGGGGG.GGGGGGGDDDDDDDDDDDDDDDDDD.',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
        ]),
        // ===== WORLD 3: KRISTALGROT =====
        // Level 3-1
        pad([
            '..C.C.C..........................................C.C.C.C.C....F....',
            '.PPPPPP.........?.C.C.C.?..C.C.C.?..C.C.C..PPPPPPPPPPP.PPPPPPPP..',
            '.............PPP.PPPPPPPPP.PPPPPPPPP.PPPPPP......................',
            '...?........................................................PPP....',
            '..PPP....E........E........E........E...PPP.............E.........',
            '.........GGGGG..GGGGG..GGGGG..GGGGG........................GGGGGGG',
            '......................................................................',
            '.S...E.........E.........E.........E.........E..GGGGGGGGGGGGGGGG..',
            'GGGGGGGG..GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGGGGGGDDDDDDDDDDDDDDDD.',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
        ]),
        // Level 3-2
        pad([
            '....?.C.C.?................................C.C.?.C.C........F......',
            '...PPPPPPPPPP......?..C.C.?..C.C.?......PPPPPPPPPPPP..PPPPPPPPP..',
            '.................PPP.PPPPPPP.PPPPPPP............................',
            '............?......................................PPPP.............',
            '..........PPP........E........E......PPP.......E........PPP.......',
            '.?...............GGGGG....GGGGG...........E.........E..GGGGGGGG...',
            '.PPP...............................................................',
            '.S......E......E..........E...........E....GGGGGGGGGGGDDDDDDDDDD..',
            'GGGGGGGGGG.GGGGGGGG.GGGGGGGGG.GGGGGGGGGG.GGGDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
        ]),
        // Level 3-3
        pad([
            '..C.C.C.?..........................................C.C.C.C.C.F.....',
            '.PPPPPPPPP.......?.C.C.?.C.C.?..C.C.?..C.C..PPPPPPPPPPPPPPPPPPPP.',
            '..............PPP.PPPPPPP.PPPPPPP.PPPPPPP........................',
            '..?......................................................PPP.......',
            '.PPP.......E.......E.......E.......E..PPP.........E..........E....',
            '.......GGGGG..GGGGG..GGGGG..GGGGG............GGGGGG....GGGGGGGG..',
            '......................................................................',
            '.S.E.........E.........E.........E.........E.GGGGGGGGGGGDDDDDDDD..',
            'GGGGGGG..GGGGGGGG..GGGGGGGG..GGGGGGGG..GGGGGGGDDDDDDDDDDDDDDDDDD.',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
        ]),
        // ===== WORLD 4: VURIGE VULKAAN =====
        // Level 4-1
        pad([
            '..C.?.C.?.C.?......................................C.C.C.C.C.F....',
            '.PPPPPPPPPPPPPP....?.C.?.C.?.C.?.C.C..C.C..PPPPPPPPPPPPPPPPPPPPPP.',
            '................PPP.PPPPPPPPPPPPPPPPPPPPPP........................',
            '..?........?..............................................PPP......',
            '.PPP.....PPP....E....E....E....E....E.PPP......E........E.........',
            '........GGGGG.GGGGG.GGGGG.GGGGG.GGGGG.......GGGGGGGG..GGGGGGGG..',
            '......................................................................',
            '.S.E.....E......E......E......E......E.....GGGGGGGGGGGDDDDDDDDDDD.',
            'GGGGGGG.GGGGGGG.GGGGGGG.GGGGGGG.GGGGGGG.GGGGGDDDDDDDDDDDDDDDDDD.',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
        ]),
        // Level 4-2 (copy of 4-1 pattern with slight variation)
        pad([
            '..............C.C.C..........C.C.C...........C.C.C..............F...',
            '.............PPPPPPP...?....PPPPPPP..?........PPPPPPP........PPPPPPP',
            '......................................................................',
            '........?..........C.C.C..........?..........C.C.C..........C.C.C..',
            '.......PPP........PPPPPPP........PPP........PPPPPPP........PPPPPPP..',
            '......................................................................',
            '..S...........E...............E...............E...............E......',
            'GGGGGGGGGGGGGGGGGGGGGG..GGGGGGGGGGGGGGGG..GGGGGGGGGGGGGGGGGGGGGGGGG',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
        ]),
        // Level 4-3
        pad([
            '..C.C.C.........................................C.C.C..........F....',
            '..PPPPP........?....C.C.C...........C.C.C....?............PPPPPPPP.',
            '............PPP...PPPPPPP..........PPPPPPP..PPP.....................',
            '......................................................................',
            '..?..........C.C.C........?..........C.C.C.........PPPPPP..........',
            '.PPP.......PPPPPPP.......PPP........PPPPPPP......PPPPPPPPPPPP......',
            '....................E...................E..........E.................',
            '.S.......E......GGGGGGGG....GGGGGGGG.....GGGGGGG.GGGGGGGGGGGGGGGG.',
            'GGGGGGGGGGGGG...DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD.',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
        ]),
        // ===== WORLD 5: IJSPALEIS =====
        // Level 5-1
        pad([
            '....C.C.C.....................................C.C.C............F....',
            '...PPPPPPP........?..C.C.C.?......C.C.?....PPPPPPP.......PPPPPPPP.',
            '..............PPP..PPPPPPP.PPP....PPPPPPP.........................',
            '..?......................................................PPPP......',
            '.PPP.....E.............E...........E....PPPP...............E.......',
            '.......GGGGG......GGGGG......GGGGG........E......GGGGGGGGGGGGGGG..',
            '......................................................................',
            '.S......E.........E..........E.......E.......E.....................',
            'GGGGGGGGGGGG..GGGGGGGG..GGGGGGGGG..GGGGGGGG..GGGGGGGGGGGGGGGGGGG.',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
        ]),
        // Level 5-2
        pad([
            '..C.C.?................................................C.C.C..F....',
            '.PPPPPPP.........?..C.C.C....C.C.?....C.C.C........PPPPPPPPPPPPP..',
            '..............PPP.PPPPPPP...PPPPPPP...PPPPPPP.....................',
            '.............................................?...PPPP...............',
            '..?..........E......E.........E.....PPP............PPPP............',
            '.PPP.....GGGGG...GGGGG....GGGGG...........................E.......',
            '......................................................................',
            '.S....E.......E........E........E........E.......GGGGGGGGGGGGGGG..',
            'GGGGGGGG..GGGGGGG..GGGGGGGG..GGGGGGGG..GGGGGGGGGDDDDDDDDDDDDDDDD.',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
        ]),
        // Level 5-3
        pad([
            '..................C.C.C........C.C.C.......C.C.C.C.C.C......F.....',
            '..?..C.C.......PPPPPPP..?...PPPPPPP..?..PPPPPPPPPPPP..PPPPPPPPP..',
            '.PPP.PPPP...PPP.............PPP.............PPP...................',
            '......................................................................',
            '........?...........E...?..........E.....?..........PPPP...........',
            '.......PPP......GGGGG..PPP.....GGGGG...PPP....E......E............',
            '......................................................................',
            '.S..E........E.........E.........E.........E..GGGGGGGGGGGGGGGGG...',
            'GGGGGGGGG.GGGGGGGG.GGGGGGGGG.GGGGGGGG.GGGGGGGDDDDDDDDDDDDDDDDDD.',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
        ]),
        // ===== WORLD 6: WOESTIJNTEMPEL =====
        // Level 6-1
        pad([
            '..C.C.C..........................................C.C.C.C.C....F....',
            '.PPPPPP.........?.C.C.C.?..C.C.C.?..C.C.C..PPPPPPPPPPP.PPPPPPPP..',
            '.............PPP.PPPPPPPPP.PPPPPPPPP.PPPPPP......................',
            '...?........................................................PPP....',
            '..PPP....E........E........E........E...PPP.............E.........',
            '.........GGGGG..GGGGG..GGGGG..GGGGG........................GGGGGGG',
            '......................................................................',
            '.S...E.........E.........E.........E.........E..GGGGGGGGGGGGGGGG..',
            'GGGGGGGG..GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGGGGGGDDDDDDDDDDDDDDDD.',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
        ]),
        // Level 6-2
        pad([
            '....?.C.C.?................................C.C.?.C.C........F......',
            '...PPPPPPPPPP......?..C.C.?..C.C.?......PPPPPPPPPPPP..PPPPPPPPP..',
            '.................PPP.PPPPPPP.PPPPPPP............................',
            '............?......................................PPPP.............',
            '..........PPP........E........E......PPP.......E........PPP.......',
            '.?...............GGGGG....GGGGG...........E.........E..GGGGGGGG...',
            '.PPP...............................................................',
            '.S......E......E..........E...........E....GGGGGGGGGGGDDDDDDDDDD..',
            'GGGGGGGGGG.GGGGGGGG.GGGGGGGGG.GGGGGGGGGG.GGGDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
        ]),
        // Level 6-3
        pad([
            '..C.C.C.?..........................................C.C.C.C.C.F.....',
            '.PPPPPPPPP.......?.C.C.?.C.C.?..C.C.?..C.C..PPPPPPPPPPPPPPPPPPPP.',
            '..............PPP.PPPPPPP.PPPPPPP.PPPPPPP........................',
            '..?......................................................PPP.......',
            '.PPP.......E.......E.......E.......E..PPP.........E..........E....',
            '.......GGGGG..GGGGG..GGGGG..GGGGG............GGGGGG....GGGGGGGG..',
            '......................................................................',
            '.S.E.........E.........E.........E.........E.GGGGGGGGGGGDDDDDDDD..',
            'GGGGGGG..GGGGGGGG..GGGGGGGG..GGGGGGGG..GGGGGGGDDDDDDDDDDDDDDDDDD.',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
        ]),
        // ===== WORLD 7: WOLKENRIJK =====
        // Level 7-1
        pad([
            '..C.?.C.?.C.?......................................C.C.C.C.C.F....',
            '.PPPPPPPPPPPPPP....?.C.?.C.?.C.?.C.C..C.C..PPPPPPPPPPPPPPPPPPPPPP.',
            '................PPP.PPPPPPPPPPPPPPPPPPPPPP........................',
            '..?........?..............................................PPP......',
            '.PPP.....PPP....E....E....E....E....E.PPP......E........E.........',
            '........GGGGG.GGGGG.GGGGG.GGGGG.GGGGG.......GGGGGGGG..GGGGGGGG..',
            '......................................................................',
            '.S.E.....E......E......E......E......E.....GGGGGGGGGGGDDDDDDDDDDD.',
            'GGGGGGG.GGGGGGG.GGGGGGG.GGGGGGG.GGGGGGG.GGGGGDDDDDDDDDDDDDDDDDD.',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
        ]),
        // Level 7-2
        pad([
            '..............C.C.C..........C.C.C...........C.C.C..............F...',
            '.............PPPPPPP...?....PPPPPPP..?........PPPPPPP........PPPPPPP',
            '......................................................................',
            '........?..........C.C.C..........?..........C.C.C..........C.C.C..',
            '.......PPP........PPPPPPP........PPP........PPPPPPP........PPPPPPP..',
            '......................................................................',
            '..S...........E...............E...............E...............E......',
            'GGGGGGGGGGGGGGGGGGGGGG..GGGGGGGGGGGGGGGG..GGGGGGGGGGGGGGGGGGGGGGGGG',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
        ]),
        // Level 7-3
        pad([
            '..C.C.C.........................................C.C.C..........F....',
            '..PPPPP........?....C.C.C...........C.C.C....?............PPPPPPPP.',
            '............PPP...PPPPPPP..........PPPPPPP..PPP.....................',
            '......................................................................',
            '..?..........C.C.C........?..........C.C.C.........PPPPPP..........',
            '.PPP.......PPPPPPP.......PPP........PPPPPPP......PPPPPPPPPPPP......',
            '....................E...................E..........E.................',
            '.S.......E......GGGGGGGG....GGGGGGGG.....GGGGGGG.GGGGGGGGGGGGGGGG.',
            'GGGGGGGGGGGGG...DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD.',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
        ]),
        // ===== WORLD 8: DONKER KASTEEL =====
        // Level 8-1
        pad([
            '....C.C.C.....................................C.C.C............F....',
            '...PPPPPPP........?..C.C.C.?......C.C.?....PPPPPPP.......PPPPPPPP.',
            '..............PPP..PPPPPPP.PPP....PPPPPPP.........................',
            '..?......................................................PPPP......',
            '.PPP.....E.............E...........E....PPPP...............E.......',
            '.......GGGGG......GGGGG......GGGGG........E......GGGGGGGGGGGGGGG..',
            '......................................................................',
            '.S......E.........E..........E.......E.......E.....................',
            'GGGGGGGGGGGG..GGGGGGGG..GGGGGGGGG..GGGGGGGG..GGGGGGGGGGGGGGGGGGG.',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
        ]),
        // Level 8-2
        pad([
            '..C.C.?................................................C.C.C..F....',
            '.PPPPPPP.........?..C.C.C....C.C.?....C.C.C........PPPPPPPPPPPPP..',
            '..............PPP.PPPPPPP...PPPPPPP...PPPPPPP.....................',
            '.............................................?...PPPP...............',
            '..?..........E......E.........E.....PPP............PPPP............',
            '.PPP.....GGGGG...GGGGG....GGGGG...........................E.......',
            '......................................................................',
            '.S....E.......E........E........E........E.......GGGGGGGGGGGGGGG..',
            'GGGGGGGG..GGGGGGG..GGGGGGGG..GGGGGGGG..GGGGGGGGGDDDDDDDDDDDDDDDD.',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
        ]),
        // Level 8-3 (Final Boss)
        pad([
            '..C.?.C.?.C.?.C.?..................................C.C.C.C.C.F....',
            '.PPPPPPPPPPPPPPPPP..?.C.?.C.?.C.?.C.C..C.C.PPPPPPPPPPPPPPPPPPPPPP.',
            '................PPP.PPPPPPPPPPPPPPPPPPPPPP........................',
            '..?........?........?.......................................PPP....',
            '.PPP.....PPP......PPP..E...E...E...E...E.PPP...E........E.........',
            '........GGGGG.GGGGG.GGGGG.GGGGG.GGGGG.GGGGG.GGGGGGGG..GGGGGGGG..',
            '......................................................................',
            '.S.E...E.....E.....E.....E.....E.....E.....GGGGGGGGGGGDDDDDDDDDDD.',
            'GGGGGGG.GGGGG.GGGGG.GGGGG.GGGGG.GGGGG.GGGGGGGDDDDDDDDDDDDDDDDDD.',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
            'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
        ]),
    ];
}

const LEVEL_MAPS = makeLevelMaps();

export class GameScene extends Phaser.Scene {
    private player!: Player;
    private enemies: Goomba[] = [];
    private coins: Coin[] = [];
    private questionBlocks: QuestionBlock[] = [];
    private flagPole!: FlagPole;
    private platforms!: Phaser.Physics.Arcade.StaticGroup;

    private currentLevel = 0;
    private score = 0;
    private coinCount = 0;
    private isPaused = false;
    private levelComplete = false;

    constructor() {
        super({ key: 'GameScene' });
    }

    init(data: { level?: number }): void {
        this.currentLevel = data.level ?? 0;
        this.score = 0;
        this.coinCount = 0;
        this.isPaused = false;
        this.levelComplete = false;
    }

    create(): void {
        const levelConfig = LEVEL_CONFIG[this.currentLevel] || LEVEL_CONFIG[0];
        const map = LEVEL_MAPS[this.currentLevel] || LEVEL_MAPS[0];

        // World bounds based on longest row in map
        const mapWidth = Math.max(...map.map(row => row.length)) * TILE_SIZE;
        const mapHeight = map.length * TILE_SIZE;
        this.physics.world.setBounds(0, 0, mapWidth, mapHeight + 200);
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

        // Themed backgrounds per world
        this.createBackground(levelConfig.world);

        // Create static platform group
        this.platforms = this.physics.add.staticGroup();
        this.enemies = [];
        this.coins = [];
        this.questionBlocks = [];

        // Parse level map
        let playerSpawnX = 80;
        let playerSpawnY = 200;

        for (let row = 0; row < map.length; row++) {
            for (let col = 0; col < map[row].length; col++) {
                const x = col * TILE_SIZE + TILE_SIZE / 2;
                const y = row * TILE_SIZE + TILE_SIZE / 2;
                const ch = map[row][col];

                switch (ch) {
                    case 'G': {
                        const tile = this.platforms.create(x, y, 'tile_grass') as Phaser.Physics.Arcade.Sprite;
                        tile.setImmovable(true);
                        tile.refreshBody();
                        break;
                    }
                    case 'D': {
                        const tile = this.platforms.create(x, y, 'tile_dirt') as Phaser.Physics.Arcade.Sprite;
                        tile.setImmovable(true);
                        tile.refreshBody();
                        break;
                    }
                    case 'P': {
                        const tile = this.platforms.create(x, y, 'tile_platform') as Phaser.Physics.Arcade.Sprite;
                        tile.setImmovable(true);
                        tile.refreshBody();
                        break;
                    }
                    case '?': {
                        const block = new QuestionBlock(this, x, y);
                        this.questionBlocks.push(block);
                        break;
                    }
                    case 'C': {
                        const coin = new Coin(this, x, y);
                        this.coins.push(coin);
                        break;
                    }
                    case 'E': {
                        const enemy = new Goomba(this, x, y, 60 + Math.random() * 40);
                        this.enemies.push(enemy);
                        break;
                    }
                    case 'F': {
                        this.flagPole = new FlagPole(this, x, y);
                        break;
                    }
                    case 'S': {
                        playerSpawnX = x;
                        playerSpawnY = y - TILE_SIZE;
                        this.add.image(x, y, 'wooden_sign').setScale(1.5);
                        break;
                    }
                }
            }
        }

        // Create player
        this.player = new Player(this, playerSpawnX, playerSpawnY);

        // Collisions
        this.physics.add.collider(this.player, this.platforms);
        this.enemies.forEach(enemy => {
            this.physics.add.collider(enemy, this.platforms);
        });

        // Player-enemy overlap
        this.physics.add.overlap(this.player, this.enemies as any, this.handleEnemyCollision, undefined, this);

        // Player-coin overlap
        this.physics.add.overlap(this.player, this.coins as any, this.handleCoinCollect, undefined, this);

        // Player-question block collision
        this.physics.add.collider(this.player, this.questionBlocks as any, this.handleQuestionBlock, undefined, this);

        // Player-flag overlap
        if (this.flagPole) {
            this.physics.add.overlap(this.player, this.flagPole, this.handleFlagReach, undefined, this);
        }

        // Camera follow player
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setDeadzone(100, 50);

        // Launch HUD (safely stop old one first)
        if (this.scene.isActive('HUDScene')) if (this.scene.isActive('HUDScene')) this.scene.stop('HUDScene');
        this.scene.launch('HUDScene');
        this.events.emit('updateHealth', PLAYER_MAX_HEALTH);
        this.events.emit('updateCoins', 0);
        this.events.emit('updateScore', 0);
        this.events.emit('setLevelName', `Wereld ${levelConfig.world}-${levelConfig.level}: ${levelConfig.name}`);

        // Player events
        this.events.on('playerHurt', () => {
            this.events.emit('updateHealth', this.player.health);
        });

        this.events.on('playerDied', () => {
            this.handleGameOver();
        });

        // Dust particles on jump
        this.events.on('playerJump', (x: number, y: number) => {
            this.createDustEffect(x, y);
        });

        // Fade in
        // No fade-in
    }

    update(time: number, delta: number): void {
        if (this.isPaused || this.levelComplete) return;

        this.player.update(time, delta);

        this.enemies.forEach(enemy => {
            if (!enemy.dead) enemy.update(time, delta);
        });

        this.coins.forEach(coin => {
            coin.update(time, delta);
        });
    }

    private createBackground(world: number): void {
        const W = GAME_WIDTH;
        const H = GAME_HEIGHT;

        switch (world) {
            case 1: this.drawForestBackground(W, H); break;
            case 2: this.drawBeachBackground(W, H); break;
            case 3: this.drawCaveBackground(W, H); break;
            case 4: this.drawVolcanoBackground(W, H); break;
            case 5: this.drawIceBackground(W, H); break;
            case 6: this.drawDesertBackground(W, H); break;
            case 7: this.drawSkyBackground(W, H); break;
            case 8: this.drawCastleBackground(W, H); break;
            default: this.drawForestBackground(W, H); break;
        }
    }

    // --- WERELD 1: BOS ---
    private drawForestBackground(W: number, H: number): void {
        this.add.rectangle(W / 2, H / 2, W + 200, H + 200, 0x87CEEB)
            .setScrollFactor(0).setDepth(-11);

        const bg = this.add.graphics().setScrollFactor(0).setDepth(-10);

        // Clouds
        bg.fillStyle(0xFFFFFF, 0.85);
        bg.fillRoundedRect(80, 40, 120, 40, 20);
        bg.fillRoundedRect(100, 25, 70, 30, 15);
        bg.fillRoundedRect(450, 50, 140, 40, 18);
        bg.fillRoundedRect(470, 35, 70, 30, 14);
        bg.fillRoundedRect(280, 20, 80, 25, 12);
        bg.fillRoundedRect(750, 45, 110, 35, 16);
        bg.fillRoundedRect(920, 30, 80, 28, 12);

        // Green hills/mountains
        bg.fillStyle(0x6ABF6A);
        bg.fillTriangle(-50, H, 200, 220, 450, H);
        bg.fillStyle(0x7ACC7A);
        bg.fillTriangle(300, H, 530, 190, 760, H);
        bg.fillStyle(0x5DAF5D);
        bg.fillTriangle(600, H, 830, 230, 1100, H);

        // Trees behind
        bg.fillStyle(0x2E7D32, 0.35);
        for (let i = 0; i < 22; i++) {
            const x = i * 50;
            const h = 50 + Math.sin(i * 2.3) * 20;
            // Trunk
            bg.fillStyle(0x5D4037, 0.2);
            bg.fillRect(x + 10, H - h * 0.3, 6, h * 0.3);
            // Foliage
            bg.fillStyle(0x388E3C, 0.3);
            bg.fillTriangle(x, H - h * 0.2, x + 25, H - h, x + 50, H - h * 0.2);
        }
    }

    // --- WERELD 2: GROT ---
    private drawCaveBackground(W: number, H: number): void {
        // Dark cave background
        this.add.rectangle(W / 2, H / 2, W + 200, H + 200, 0x2A2A3A)
            .setScrollFactor(0).setDepth(-11);

        const bg = this.add.graphics().setScrollFactor(0).setDepth(-10);

        // Rock wall texture (subtle darker spots)
        bg.fillStyle(0x222233, 0.5);
        for (let i = 0; i < 30; i++) {
            const rx = (i * 137) % W;
            const ry = (i * 89) % H;
            bg.fillRoundedRect(rx, ry, 30 + (i % 5) * 15, 20 + (i % 4) * 10, 8);
        }

        // Stalactites hanging from top
        for (let i = 0; i < 15; i++) {
            const x = i * 72 + 20;
            const h = 40 + Math.sin(i * 1.7) * 30;
            // Dark stalactite
            bg.fillStyle(0x4A4A5A);
            bg.fillTriangle(x - 10, 0, x, h, x + 10, 0);
            // Highlight edge
            bg.fillStyle(0x5A5A6A);
            bg.fillTriangle(x - 4, 0, x + 2, h * 0.7, x + 4, 0);
        }

        // Glowing crystals (cyan, magenta, green)
        const crystalColors = [0x00E5FF, 0xE040FB, 0x69F0AE, 0xFFD740];
        for (let i = 0; i < 12; i++) {
            const cx = (i * 97 + 50) % W;
            const cy = H * 0.3 + Math.sin(i * 2.1) * (H * 0.25);
            const color = crystalColors[i % crystalColors.length];
            const size = 4 + (i % 3) * 3;
            // Crystal glow
            bg.fillStyle(color, 0.15);
            bg.fillCircle(cx, cy, size * 3);
            // Crystal body
            bg.fillStyle(color, 0.6);
            bg.fillTriangle(cx - size, cy + size, cx, cy - size * 2, cx + size, cy + size);
        }

        // Stalagmites from bottom
        for (let i = 0; i < 10; i++) {
            const x = i * 110 + 30;
            const h = 30 + Math.sin(i * 2.5) * 20;
            bg.fillStyle(0x4A4A5A);
            bg.fillTriangle(x - 12, H, x, H - h, x + 12, H);
            bg.fillStyle(0x555565);
            bg.fillTriangle(x - 5, H, x + 3, H - h * 0.8, x + 5, H);
        }

        // Dripping water highlights
        bg.fillStyle(0x4FC3F7, 0.3);
        for (let i = 0; i < 8; i++) {
            const x = (i * 131 + 80) % W;
            bg.fillCircle(x, 3 + (i % 4) * 2, 2);
            bg.fillRect(x - 1, 0, 2, 3 + (i % 4) * 2);
        }
    }

    // --- WERELD 3: NACHT/KASTEEL ---
    private drawCastleBackground(W: number, H: number): void {
        // Dark night sky
        this.add.rectangle(W / 2, H / 2, W + 200, H + 200, 0x0D0D2B)
            .setScrollFactor(0).setDepth(-11);

        const bg = this.add.graphics().setScrollFactor(0).setDepth(-10);

        // Stars
        for (let i = 0; i < 60; i++) {
            const sx = (i * 173 + 30) % W;
            const sy = (i * 67 + 10) % (H * 0.6);
            const size = 1 + (i % 3);
            const alpha = 0.4 + (i % 5) * 0.12;
            bg.fillStyle(0xFFFFFF, alpha);
            bg.fillCircle(sx, sy, size);
        }

        // Moon
        bg.fillStyle(0xFFF9C4, 0.9);
        bg.fillCircle(800, 80, 40);
        bg.fillStyle(0xFFF59D);
        bg.fillCircle(800, 80, 35);
        // Moon craters
        bg.fillStyle(0xF0E68C, 0.5);
        bg.fillCircle(790, 72, 6);
        bg.fillCircle(810, 85, 4);
        bg.fillCircle(795, 90, 3);

        // Castle silhouette in background
        bg.fillStyle(0x1A1A40);
        // Main wall
        bg.fillRect(100, H * 0.4, 300, H * 0.6);
        // Left tower
        bg.fillRect(80, H * 0.2, 60, H * 0.8);
        bg.fillTriangle(75, H * 0.2, 110, H * 0.05, 145, H * 0.2);
        // Right tower
        bg.fillRect(360, H * 0.25, 60, H * 0.75);
        bg.fillTriangle(355, H * 0.25, 390, H * 0.08, 425, H * 0.25);
        // Center tower (tallest)
        bg.fillRect(210, H * 0.15, 80, H * 0.85);
        bg.fillTriangle(205, H * 0.15, 250, 0, 295, H * 0.15);

        // Castle windows (glowing)
        bg.fillStyle(0xFFAB40, 0.7);
        bg.fillRect(125, H * 0.45, 12, 16);
        bg.fillRect(165, H * 0.45, 12, 16);
        bg.fillRect(235, H * 0.22, 14, 18);
        bg.fillRect(255, H * 0.22, 14, 18);
        bg.fillRect(375, H * 0.35, 12, 16);

        // Distant castle #2
        bg.fillStyle(0x151535);
        bg.fillRect(650, H * 0.5, 200, H * 0.5);
        bg.fillRect(630, H * 0.35, 50, H * 0.65);
        bg.fillTriangle(625, H * 0.35, 655, H * 0.2, 685, H * 0.35);
        bg.fillRect(810, H * 0.38, 50, H * 0.62);
        bg.fillTriangle(805, H * 0.38, 835, H * 0.22, 865, H * 0.38);
        // Windows
        bg.fillStyle(0xFFAB40, 0.5);
        bg.fillRect(690, H * 0.55, 10, 14);
        bg.fillRect(730, H * 0.55, 10, 14);

        // Flags on towers
        bg.fillStyle(0x7B1FA2, 0.8);
        bg.fillTriangle(110, H * 0.05, 140, H * 0.08, 110, H * 0.11);
        bg.fillTriangle(250, 0, 280, H * 0.03, 250, H * 0.06);

        // Fog at bottom
        bg.fillStyle(0x2A2A50, 0.4);
        bg.fillRoundedRect(-10, H * 0.8, W + 20, H * 0.25, 30);
        bg.fillStyle(0x2A2A50, 0.2);
        bg.fillRoundedRect(-10, H * 0.7, W + 20, H * 0.15, 20);
    }

    // --- WERELD 2: ZONNESTRAND ---
    private drawBeachBackground(W: number, H: number): void {
        // Bright warm sky
        this.add.rectangle(W / 2, H / 2, W + 200, H + 200, 0x4FC3F7)
            .setScrollFactor(0).setDepth(-11);

        const bg = this.add.graphics().setScrollFactor(0).setDepth(-10);

        // Sun
        bg.fillStyle(0xFFEB3B, 0.9);
        bg.fillCircle(W - 120, 80, 50);
        bg.fillStyle(0xFFF176, 0.4);
        bg.fillCircle(W - 120, 80, 70);

        // Clouds
        bg.fillStyle(0xFFFFFF, 0.8);
        bg.fillRoundedRect(100, 50, 100, 35, 16);
        bg.fillRoundedRect(120, 38, 60, 25, 12);
        bg.fillRoundedRect(500, 65, 120, 40, 18);

        // Ocean
        bg.fillStyle(0x1E88E5, 0.5);
        bg.fillRect(0, H * 0.6, W, H * 0.15);
        bg.fillStyle(0x42A5F5, 0.3);
        bg.fillRect(0, H * 0.65, W, H * 0.08);
        // Waves
        for (let i = 0; i < 20; i++) {
            bg.fillStyle(0xFFFFFF, 0.2);
            bg.fillRoundedRect(i * 55, H * 0.62, 30, 4, 2);
        }

        // Palm trees
        for (let i = 0; i < 4; i++) {
            const px = 80 + i * 260;
            // Trunk
            bg.fillStyle(0x8D6E63);
            bg.fillRect(px - 4, H * 0.45, 8, H * 0.25);
            // Leaves
            bg.fillStyle(0x2E7D32, 0.6);
            bg.fillTriangle(px - 40, H * 0.45, px, H * 0.3, px + 5, H * 0.47);
            bg.fillTriangle(px - 5, H * 0.47, px, H * 0.3, px + 40, H * 0.45);
            bg.fillStyle(0x388E3C, 0.5);
            bg.fillTriangle(px - 30, H * 0.43, px, H * 0.32, px + 30, H * 0.43);
        }
    }

    // --- WERELD 4: VURIGE VULKAAN ---
    private drawVolcanoBackground(W: number, H: number): void {
        // Red/orange sky
        this.add.rectangle(W / 2, H / 2, W + 200, H + 200, 0x4A1010)
            .setScrollFactor(0).setDepth(-11);

        const bg = this.add.graphics().setScrollFactor(0).setDepth(-10);

        // Orange glow at horizon
        bg.fillStyle(0xFF6D00, 0.3);
        bg.fillRect(0, H * 0.4, W, H * 0.3);
        bg.fillStyle(0xFF8F00, 0.2);
        bg.fillRect(0, H * 0.5, W, H * 0.15);

        // Smoke clouds
        bg.fillStyle(0x424242, 0.4);
        bg.fillRoundedRect(60, 20, 150, 60, 30);
        bg.fillRoundedRect(300, 10, 120, 50, 25);
        bg.fillRoundedRect(600, 30, 180, 55, 28);
        bg.fillRoundedRect(850, 15, 130, 45, 22);

        // Volcanoes
        bg.fillStyle(0x3E2723);
        bg.fillTriangle(-30, H, 180, H * 0.25, 390, H);
        bg.fillStyle(0x4E342E);
        bg.fillTriangle(400, H, 620, H * 0.2, 840, H);
        // Lava at top
        bg.fillStyle(0xFF6D00, 0.7);
        bg.fillCircle(180, H * 0.27, 15);
        bg.fillCircle(620, H * 0.22, 18);

        // Lava stream at bottom
        bg.fillStyle(0xFF3D00, 0.3);
        bg.fillRect(0, H * 0.85, W, H * 0.15);
        // Lava bubbles
        bg.fillStyle(0xFFAB00, 0.4);
        for (let i = 0; i < 10; i++) {
            bg.fillCircle((i * 107 + 40) % W, H * 0.88 + (i % 3) * 8, 3 + (i % 4));
        }

        // Embers
        bg.fillStyle(0xFF6D00, 0.5);
        for (let i = 0; i < 25; i++) {
            bg.fillCircle((i * 43 + 20) % W, (i * 23 + 30) % (H * 0.7), 1 + (i % 2));
        }
    }

    // --- WERELD 5: IJSPALEIS ---
    private drawIceBackground(W: number, H: number): void {
        // Cold blue sky
        this.add.rectangle(W / 2, H / 2, W + 200, H + 200, 0xB3E5FC)
            .setScrollFactor(0).setDepth(-11);

        const bg = this.add.graphics().setScrollFactor(0).setDepth(-10);

        // Aurora borealis
        bg.fillStyle(0x00E676, 0.08);
        bg.fillRoundedRect(100, 20, 300, 60, 30);
        bg.fillStyle(0x7C4DFF, 0.06);
        bg.fillRoundedRect(350, 10, 250, 50, 25);
        bg.fillStyle(0x00BCD4, 0.07);
        bg.fillRoundedRect(550, 25, 280, 45, 22);

        // Snow-capped mountains
        bg.fillStyle(0xCFD8DC);
        bg.fillTriangle(-20, H, 200, H * 0.25, 420, H);
        bg.fillStyle(0xB0BEC5);
        bg.fillTriangle(350, H, 560, H * 0.2, 770, H);
        bg.fillStyle(0xCFD8DC);
        bg.fillTriangle(650, H, 850, H * 0.3, 1050, H);
        // Snow caps
        bg.fillStyle(0xFFFFFF, 0.9);
        bg.fillTriangle(170, H * 0.3, 200, H * 0.25, 230, H * 0.3);
        bg.fillTriangle(530, H * 0.25, 560, H * 0.2, 590, H * 0.25);

        // Snowflakes
        bg.fillStyle(0xFFFFFF, 0.6);
        for (let i = 0; i < 40; i++) {
            const sx = (i * 127 + 15) % W;
            const sy = (i * 73 + 5) % H;
            bg.fillCircle(sx, sy, 1.5 + (i % 3));
        }

        // Icicles from top
        for (let i = 0; i < 12; i++) {
            const x = i * 90 + 30;
            const h = 20 + (i % 4) * 12;
            bg.fillStyle(0xE1F5FE, 0.7);
            bg.fillTriangle(x - 5, 0, x, h, x + 5, 0);
        }
    }

    // --- WERELD 6: WOESTIJNTEMPEL ---
    private drawDesertBackground(W: number, H: number): void {
        // Warm yellow sky
        this.add.rectangle(W / 2, H / 2, W + 200, H + 200, 0xFFCC80)
            .setScrollFactor(0).setDepth(-11);

        const bg = this.add.graphics().setScrollFactor(0).setDepth(-10);

        // Hot sun
        bg.fillStyle(0xFFEB3B, 0.8);
        bg.fillCircle(200, 70, 45);
        bg.fillStyle(0xFFF176, 0.3);
        bg.fillCircle(200, 70, 65);

        // Sand dunes
        bg.fillStyle(0xFFE0B2, 0.6);
        bg.fillTriangle(-50, H, 250, H * 0.55, 550, H);
        bg.fillStyle(0xFFCC80, 0.5);
        bg.fillTriangle(400, H, 650, H * 0.5, 900, H);
        bg.fillStyle(0xFFE0B2, 0.4);
        bg.fillTriangle(700, H, 900, H * 0.6, 1100, H);

        // Pyramids
        bg.fillStyle(0xD4A04A);
        bg.fillTriangle(600, H * 0.65, 700, H * 0.3, 800, H * 0.65);
        bg.fillStyle(0xC49040);
        bg.fillTriangle(750, H * 0.65, 830, H * 0.35, 910, H * 0.65);

        // Cactuses
        for (let i = 0; i < 5; i++) {
            const cx = 80 + i * 220;
            bg.fillStyle(0x2E7D32, 0.5);
            bg.fillRoundedRect(cx - 4, H * 0.6, 8, H * 0.15, 3);
            bg.fillRoundedRect(cx - 12, H * 0.63, 8, H * 0.06, 3);
            bg.fillRoundedRect(cx + 4, H * 0.65, 8, H * 0.05, 3);
        }

        // Heat haze
        bg.fillStyle(0xFFFFFF, 0.05);
        bg.fillRect(0, H * 0.7, W, H * 0.05);
    }

    // --- WERELD 7: WOLKENRIJK ---
    private drawSkyBackground(W: number, H: number): void {
        // Deep blue/purple sky
        this.add.rectangle(W / 2, H / 2, W + 200, H + 200, 0x3F51B5)
            .setScrollFactor(0).setDepth(-11);

        const bg = this.add.graphics().setScrollFactor(0).setDepth(-10);

        // Rainbow
        const rainbowColors = [0xF44336, 0xFF9800, 0xFFEB3B, 0x4CAF50, 0x2196F3, 0x673AB7];
        for (let i = 0; i < rainbowColors.length; i++) {
            bg.lineStyle(4, rainbowColors[i], 0.3);
            bg.beginPath();
            bg.arc(W / 2, H * 0.8, 250 + i * 8, Math.PI, 0, false);
            bg.strokePath();
        }

        // Big fluffy clouds
        bg.fillStyle(0xFFFFFF, 0.85);
        bg.fillRoundedRect(50, H * 0.5, 180, 60, 30);
        bg.fillRoundedRect(80, H * 0.45, 120, 45, 22);
        bg.fillRoundedRect(400, H * 0.55, 200, 55, 28);
        bg.fillRoundedRect(440, H * 0.48, 130, 40, 20);
        bg.fillRoundedRect(750, H * 0.52, 170, 50, 25);
        bg.fillRoundedRect(780, H * 0.46, 110, 38, 18);

        // Small cloud puffs
        bg.fillStyle(0xFFFFFF, 0.6);
        bg.fillRoundedRect(300, H * 0.3, 80, 30, 15);
        bg.fillRoundedRect(600, H * 0.25, 100, 35, 16);
        bg.fillRoundedRect(900, H * 0.35, 70, 25, 12);

        // Stars (visible in purple sky)
        bg.fillStyle(0xFFFFFF, 0.5);
        for (let i = 0; i < 30; i++) {
            bg.fillCircle((i * 37 + 10) % W, (i * 19 + 5) % (H * 0.4), 1 + (i % 2));
        }

        // Sparkle/magic particles
        bg.fillStyle(0xFFD700, 0.4);
        for (let i = 0; i < 15; i++) {
            bg.fillCircle((i * 71 + 50) % W, (i * 41 + 20) % H, 2);
        }
    }

    private handleEnemyCollision = (_player: any, _enemy: any): void => {
        const player = _player as Player;
        const enemy = _enemy as Goomba;

        if (enemy.dead || player.getInvincible()) return;

        const playerBody = player.body as Phaser.Physics.Arcade.Body;
        const enemyBody = enemy.body as Phaser.Physics.Arcade.Body;

        // Check if player is stomping (coming from above)
        if (playerBody.velocity.y > 0 && playerBody.bottom - 10 < enemyBody.top + 10) {
            // Stomp!
            enemy.stomp();
            player.setVelocityY(-250); // Bounce
            AudioManager.play('stomp');
            this.score += 100;
            this.events.emit('updateScore', this.score);
            this.createStompEffect(enemy.x, enemy.y);
        } else {
            // Enemy hit player - trigger math popup
            this.triggerMathPopup('enemy_hit', () => {
                // Correct answer: keep heart, enemy dies
                enemy.defeat();
                this.score += 50;
                this.events.emit('updateScore', this.score);
            }, () => {
                // Wrong answer: lose heart
                player.takeDamage();
                this.events.emit('updateHealth', player.health);
            });
        }
    };

    private handleCoinCollect = (_player: any, _coin: any): void => {
        const coin = _coin as Coin;
        coin.collect();
        this.coinCount++;
        this.score += 10;
        AudioManager.play('coin');
        this.events.emit('updateCoins', this.coinCount);
        this.events.emit('updateScore', this.score);

        // Coin particles
        const particles = this.add.particles(coin.x, coin.y, 'particle_coin', {
            speed: { min: 50, max: 150 },
            scale: { start: 1, end: 0 },
            lifespan: 400,
            quantity: 5,
            emitting: false,
        });
        particles.explode(5);
        this.time.delayedCall(500, () => particles.destroy());
    };

    private handleQuestionBlock = (_player: any, _block: any): void => {
        const block = _block as QuestionBlock;

        // Trigger on any collision (walking into or jumping against)
        if (block.bump()) {
            this.triggerMathPopup('question_block', () => {
                // Correct: spawn coin reward
                block.markUsed();
                this.spawnRewardCoin(block.x, block.y - TILE_SIZE);
                this.score += 25;
                this.events.emit('updateScore', this.score);
            }, () => {
                // Wrong: mark block as used (no reward, prevents re-triggering loop)
                block.markUsed();
            });
        }
    };

    private handleFlagReach = (): void => {
        if (this.levelComplete) return;
        this.levelComplete = true;

        this.flagPole.reach();
        this.player.setCanMove(false);
        AudioManager.play('levelComplete');

        // Go directly to next level after short celebration
        this.time.delayedCall(800, () => {
            this.advanceLevel();
        });
    };

    private triggerMathPopup(trigger: MathTrigger, onCorrect: () => void, onWrong: () => void): void {
        if (this.isPaused) return;
        this.isPaused = true;
        this.player.setCanMove(false);

        const levelConfig = LEVEL_CONFIG[this.currentLevel] || LEVEL_CONFIG[0];

        this.scene.pause('GameScene');
        this.scene.launch('MathPopupScene', {
            trigger,
            difficulty: levelConfig.mathDifficulty,
            categories: levelConfig.categories,
            onCorrect: () => {
                this.isPaused = false;
                this.player.setCanMove(true);
                onCorrect();
                SaveManager.save({
                    mathCorrect: SaveManager.load().mathCorrect + 1,
                    mathTotal: SaveManager.load().mathTotal + 1,
                });
            },
            onWrong: () => {
                this.isPaused = false;
                this.player.setCanMove(true);
                onWrong();
                SaveManager.save({
                    mathTotal: SaveManager.load().mathTotal + 1,
                });
            },
        });
    }

    private handleGameOver(): void {
        this.player.setCanMove(false);
        AudioManager.play('gameOver');

        this.time.delayedCall(1000, () => {
            this.triggerMathPopup('game_over', () => {
                // Correct: retry level
                SaveManager.updateHighScore(this.score);
                if (this.scene.isActive('HUDScene')) this.scene.stop('HUDScene');
                this.scene.restart({ level: this.currentLevel });
            }, () => {
                // Wrong: back to title
                SaveManager.updateHighScore(this.score);
                if (this.scene.isActive('HUDScene')) this.scene.stop('HUDScene');
                this.scene.start('TitleScene');
            });
        });
    }

    private advanceLevel(): void {
        SaveManager.updateHighScore(this.score);
        const nextLevel = this.currentLevel + 1;
        SaveManager.save({
            currentLevel: Math.min(nextLevel, LEVEL_CONFIG.length - 1),
            totalCoins: SaveManager.load().totalCoins + this.coinCount,
        });

        if (nextLevel >= LEVEL_CONFIG.length) {
            // Game complete!
            if (this.scene.isActive('HUDScene')) this.scene.stop('HUDScene');
            this.scene.start('GameCompleteScene', { score: this.score, coins: this.coinCount });
        } else {
            // Go directly to next level — use restart since we're already in GameScene
            if (this.scene.isActive('HUDScene')) this.scene.stop('HUDScene');
            this.scene.restart({ level: nextLevel });
        }
    }

    private spawnRewardCoin(x: number, y: number): void {
        const coin = new Coin(this, x, y);
        this.coins.push(coin);
        this.physics.add.overlap(this.player, coin, this.handleCoinCollect, undefined, this);

        // Pop-up animation
        this.tweens.add({
            targets: coin,
            y: y - 40,
            duration: 300,
            ease: 'Back.easeOut',
        });

        // Sparkle effect
        const particles = this.add.particles(x, y, 'particle_sparkle', {
            speed: { min: 30, max: 80 },
            scale: { start: 1, end: 0 },
            lifespan: 500,
            quantity: 6,
            emitting: false,
        });
        particles.explode(6);
        this.time.delayedCall(600, () => particles.destroy());
    }

    private createDustEffect(x: number, y: number): void {
        const particles = this.add.particles(x, y, 'particle_dust', {
            speed: { min: 20, max: 60 },
            scale: { start: 0.8, end: 0 },
            lifespan: 300,
            quantity: 4,
            angle: { min: -120, max: -60 },
            emitting: false,
        });
        particles.explode(4);
        this.time.delayedCall(400, () => particles.destroy());
    }

    private createStompEffect(x: number, y: number): void {
        const particles = this.add.particles(x, y, 'particle_star', {
            speed: { min: 50, max: 150 },
            scale: { start: 1, end: 0 },
            lifespan: 500,
            quantity: 8,
            emitting: false,
        });
        particles.explode(8);
        this.time.delayedCall(600, () => particles.destroy());
    }
}
