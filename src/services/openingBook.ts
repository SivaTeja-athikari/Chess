import { ChessOpening } from '../types/chess';

export const OPENINGS_DATABASE: ChessOpening[] = [
  {
    id: 'sicilian-defense-najdorf',
    name: 'Sicilian Defense: Najdorf Variation',
    eco: 'B90',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'],
    description: 'One of the most complex, dynamic, and combative openings in chess, championed by Bobby Fischer and Garry Kasparov.',
    keyIdeas: [
      'Controls b5 square preventing White knight incursions',
      'Prepares e5 or e6 central counter-attacks',
      'Provides Black rich counter-chances on the c-file',
      'Leads to sharp asymmetrical battles'
    ],
    difficulty: 'Advanced',
  },
  {
    id: 'ruy-lopez',
    name: 'Ruy Lopez (Spanish Opening)',
    eco: 'C60',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'],
    description: 'The classical foundation of chess strategy. White develops smoothly and attacks the knight defending the e5 pawn.',
    keyIdeas: [
      'Puts immediate pressure on Black e5 defender',
      'Facilitates rapid kingside castling for White',
      'Sets up a long-term strategic bind with c3 and d4',
      'Tests Black tactical and positional understanding'
    ],
    difficulty: 'Intermediate',
  },
  {
    id: 'queens-gambit-declined',
    name: "Queen's Gambit Declined",
    eco: 'D30',
    moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6'],
    description: 'The epitome of solidity. Black secures the central d5 bastion and develops methodically.',
    keyIdeas: [
      'Firmly holds the center with pawn chain d5-e6',
      'Solid defensive structure favored in World Championships',
      'White fights for central breakthrough with e4',
      'Black aims for freeing breaks with c5 or e5'
    ],
    difficulty: 'Beginner',
  },
  {
    id: 'italian-game',
    name: 'Italian Game (Giuoco Piano)',
    eco: 'C50',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'],
    description: 'One of the oldest recorded openings, focusing on rapid development and targeting the vulnerable f7 square.',
    keyIdeas: [
      'Targets f7, the weakest square in Black camp',
      'Enables active piece play and harmonious development',
      'Can transition into aggressive Evans Gambit or solid Giuoco Pianissimo',
      'Great for mastering tactical combinations'
    ],
    difficulty: 'Beginner',
  },
  {
    id: 'kings-indian-defense',
    name: "King's Indian Defense",
    eco: 'E60',
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6'],
    description: 'Hypermodern counter-attacking weapon. Black yields the center initially to launch a furious kingside assault.',
    keyIdeas: [
      'Fianchetto bishop on g7 exerts immense pressure down the diagonal',
      'Black allows White a broad pawn center to counter-attack with e5 or c5',
      'Frequent locked centers leading to opposite-wing pawn storms',
      'High-stakes tactical fireworks'
    ],
    difficulty: 'Advanced',
  },
  {
    id: 'french-defense',
    name: 'French Defense',
    eco: 'C00',
    moves: ['e4', 'e6', 'd4', 'd5'],
    description: 'Solid and resilient counter-system based on an asymmetrical central pawn chain.',
    keyIdeas: [
      'Challenges White center immediately with d5',
      'Forms a rock-solid pawn chain on the light squares',
      'Strategic battle revolves around undermining d4 with c5 and f6',
      'Key challenge is activating the c8 light-squared bishop'
    ],
    difficulty: 'Intermediate',
  },
  {
    id: 'caro-kann-defense',
    name: 'Caro-Kann Defense',
    eco: 'B10',
    moves: ['e4', 'c6', 'd4', 'd5'],
    description: 'Renowned for its granite-like defensive solidity and pristine endgame pawn structures.',
    keyIdeas: [
      'Prepares d5 without blocking the light-squared bishop',
      'Extremely solid and resistant to king attacks',
      'Superior pawn structure in most endgames',
      'Favorite weapon of Anatoly Karpov'
    ],
    difficulty: 'Beginner',
  },
  {
    id: 'london-system',
    name: 'London System',
    eco: 'D02',
    moves: ['d4', 'd5', 'Bf4', 'Nf6', 'e3', 'c5', 'c3'],
    description: 'Universal, highly resilient system for White emphasizing harmonious piece coordination and tactical safety.',
    keyIdeas: [
      'Develops the dark-squared bishop outside the pawn chain before playing e3',
      'Forms an indestructible pyramid on c3-d4-e3',
      'Extremely reliable setup against virtually any Black response',
      'Strong outpost on e5 for White knight'
    ],
    difficulty: 'Beginner',
  },
];
