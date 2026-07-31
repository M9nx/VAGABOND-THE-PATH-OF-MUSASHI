import type { ImageMetadata } from 'astro';

import beastPortrait from '~/assets/images/beast/portrait.png';
import beastBattlefield from '~/assets/images/beast/battlefield.png';
import musashiPortrait from '~/assets/images/other-path/portrait.jpg';
import fearAfterBattle from '~/assets/images/fear/after-battle.png';
import awarenessForest from '~/assets/images/awareness/forest.png';
import awarenessPraying from '~/assets/images/awareness/praying.jpg';
import awarenessOcean from '~/assets/images/awareness/ocean.jpg';
import otherPathPortrait from '~/assets/images/other-path/portrait.jpg';
import strengthMountain from '~/assets/images/strength/mountain.jpg';
import endingClouds from '~/assets/images/ending/clouds.jpg';

export interface ChapterImage {
  src: ImageMetadata;
  alt: string;
  number: string;
  title: string;
  description?: string;
  variant: 'wide' | 'fullscreen' | 'small' | 'large' | 'portrait' | 'landscape' | 'square';
  overlay?: 'yellow' | 'red' | 'dark' | 'gradient';
  objectPosition?: string;
}

export interface ChapterMetaItem {
  label: string;
  value: string;
}

export interface ChapterQuote {
  text: string;
  wide?: boolean;
}

export interface ChapterComparison {
  label: string;
  title: string;
  text: string;
  image?: ChapterImage;
}

export interface ChapterBeliefComparison {
  label: string;
  items: { term: string; value: string }[];
}

export interface Chapter {
  id: string;
  number: string;
  navigationLabel: string;
  eyebrow: string;
  title: string;
  meta: ChapterMetaItem[];
  narrativeVariant?: 'offset' | 'columns';
  narrative: string[];
  featuredImage?: ChapterImage;
  gallery?: {
    variant: 'split' | 'asymmetric';
    images: ChapterImage[];
  };
  quote?: ChapterQuote;
  comparison?: ChapterComparison[];
  beliefComparison?: ChapterBeliefComparison[];
  endingStatement?: string;
  returnLink?: boolean;
}

export const chapters: Chapter[] = [
  {
    id: 'chapter-one',
    number: '01',
    navigationLabel: 'The Beast',
    eyebrow: 'The Beast',
    title: 'A life ruled by instinct',
    meta: [
      { label: 'Identity', value: 'Shinmen Takezō' },
      { label: 'Driving force', value: 'Rage' },
      { label: 'Belief', value: 'Strength is survival' },
      { label: 'Chapter', value: '01' },
    ],
    narrativeVariant: 'offset',
    narrative: [
      'Before Musashi existed, there was Takezō—a young man who treated the world as an enemy. He believed that hesitation meant death and kindness created weakness.',
      'His violence was not only ambition. It was protection against fear, rejection, and the feeling that his life had no value.',
    ],
    featuredImage: {
      src: beastPortrait,
      alt: 'A close black-and-white portrait of Miyamoto Musashi',
      number: '01',
      title: 'The man before the name',
      description: 'Takezō survives by instinct and treats the world as something he must defeat.',
      variant: 'wide',
      overlay: 'yellow',
    },
    gallery: {
      variant: 'split',
      images: [
        {
          src: musashiPortrait,
          alt: 'Close manga panel showing Musashi\'s face',
          number: '02',
          title: 'Identity in conflict',
          variant: 'small',
          overlay: 'yellow',
        },
        {
          src: beastBattlefield,
          alt: 'Musashi kneeling in a battlefield',
          number: '03',
          title: 'Survival leaves a cost',
          variant: 'large',
          overlay: 'yellow',
        },
      ],
    },
  },
  {
    id: 'chapter-two',
    number: '02',
    navigationLabel: 'Fear',
    eyebrow: 'Fear',
    title: 'The moment confidence collapsed',
    meta: [
      { label: 'Opponent', value: 'Inshun' },
      { label: 'Lesson', value: 'Fear' },
      { label: 'Result', value: 'Transformation begins' },
      { label: 'Chapter', value: '02' },
    ],
    narrativeVariant: 'columns',
    narrative: [
      'Musashi entered battle believing aggression could overcome anything. When he faced an opponent beyond his understanding, instinct was no longer enough.',
      'For the first time, he experienced fear without being able to hide it beneath anger.',
    ],
    featuredImage: {
      src: fearAfterBattle,
      alt: 'Musashi kneeling after battle',
      number: '04',
      title: 'After the battle',
      description: 'A confrontation with mortality, weakness, and the limits of instinct.',
      variant: 'fullscreen',
      overlay: 'yellow',
    },
    quote: {
      text: 'Fear was not the enemy. Refusing to understand it was.',
    },
  },
  {
    id: 'chapter-three',
    number: '03',
    navigationLabel: 'Awareness',
    eyebrow: 'The silence between battles',
    title: 'The sword became a way of seeing',
    meta: [
      { label: 'State', value: 'Observation' },
      { label: 'Environment', value: 'Nature' },
      { label: 'Change', value: 'Reaction becomes awareness' },
      { label: 'Chapter', value: '03' },
    ],
    narrativeVariant: 'offset',
    narrative: [
      'Musashi gradually stopped seeing the world only as a battlefield. He began studying distance, rhythm, water, trees, wind, animals, and the movement of people.',
      'Strength was no longer limited to attacking first. It became the ability to observe clearly before acting.',
    ],
    featuredImage: {
      src: awarenessForest,
      alt: 'Musashi standing in a dark forest stream',
      number: '05',
      title: 'Stillness reveals movement',
      variant: 'wide',
      overlay: 'yellow',
    },
    gallery: {
      variant: 'asymmetric',
      images: [
        {
          src: awarenessPraying,
          alt: 'Musashi praying in silence',
          number: '06',
          title: 'Silence',
          variant: 'portrait',
          overlay: 'yellow',
        },
        {
          src: awarenessOcean,
          alt: 'Musashi observing a stormy ocean',
          number: '07',
          title: 'Rhythm without control',
          variant: 'landscape',
          overlay: 'yellow',
        },
      ],
    },
    quote: {
      text: 'To understand the sword, he first had to understand the world around it.',
      wide: true,
    },
  },
  {
    id: 'chapter-four',
    number: '04',
    navigationLabel: 'The Other Path',
    eyebrow: 'The other path',
    title: 'Two swordsmen seeking different truths',
    meta: [
      { label: 'Character', value: 'Sasaki Kojirō' },
      { label: 'Nature', value: 'Freedom' },
      { label: 'Relationship', value: 'Rival and reflection' },
      { label: 'Chapter', value: '04' },
    ],
    narrative: [],
    comparison: [
      {
        label: 'Musashi',
        title: 'The sword as a burden',
        text: 'Musashi carried the sword as proof of his worth. Every encounter became a test he believed he had to survive.',
        image: {
          src: otherPathPortrait,
          alt: 'A portrait of Miyamoto Musashi',
          number: '08',
          title: 'Weight',
          variant: 'square',
          overlay: 'yellow',
        },
      },
      {
        label: 'Kojirō',
        title: 'The sword as expression',
        text: 'Kojirō represents a freer path—one built around instinct, expression, and joy rather than the need to prove superiority.',
      },
    ],
    quote: {
      text: 'They followed different roads toward the same horizon.',
    },
  },
  {
    id: 'chapter-five',
    number: '05',
    navigationLabel: 'True Strength',
    eyebrow: 'Invincible under the sun',
    title: 'What remains after victory?',
    meta: [
      { label: 'Old meaning', value: 'Defeating others' },
      { label: 'New meaning', value: 'Understanding life' },
      { label: 'Conflict', value: 'Ego against awareness' },
      { label: 'Chapter', value: '05' },
    ],
    narrativeVariant: 'columns',
    narrative: [
      'Musashi pursued the title of the strongest because he believed it would give his life meaning. But each victory created another opponent, another fear, and another reason to continue fighting.',
      'He slowly began to understand that invincibility was an illusion created by the ego.',
    ],
    featuredImage: {
      src: strengthMountain,
      alt: 'Musashi standing before a distant mountain',
      number: '09',
      title: 'The horizon remains',
      variant: 'fullscreen',
      overlay: 'yellow',
    },
    beliefComparison: [
      {
        label: 'Then',
        items: [
          { term: 'Strength', value: 'Domination' },
          { term: 'Fear', value: 'Something to hide' },
          { term: 'Other people', value: 'Obstacles' },
          { term: 'Victory', value: 'The source of value' },
        ],
      },
      {
        label: 'Now',
        items: [
          { term: 'Strength', value: 'Awareness' },
          { term: 'Fear', value: 'Something to understand' },
          { term: 'Other people', value: 'Part of the path' },
          { term: 'Life', value: 'Already valuable' },
        ],
      },
    ],
    quote: {
      text: 'The desire to become invincible was another form of captivity.',
      wide: true,
    },
  },
  {
    id: 'chapter-six',
    number: '06',
    navigationLabel: 'Endless Path',
    eyebrow: 'The endless path',
    title: 'The strongest is never finished',
    meta: [
      { label: 'Destination', value: 'Unknown' },
      { label: 'Final opponent', value: 'The self' },
      { label: 'State', value: 'Unfinished' },
      { label: 'Chapter', value: '06' },
    ],
    narrativeVariant: 'offset',
    narrative: [
      'Musashi’s journey is not powerful because he defeats skilled warriors. It is powerful because every battle removes another illusion about himself.',
      'The path that began with violence slowly became a search for harmony, responsibility, connection, and peace.',
    ],
    featuredImage: {
      src: endingClouds,
      alt: 'Musashi standing before large clouds and birds',
      number: '10',
      title: 'No final horizon',
      variant: 'fullscreen',
      overlay: 'yellow',
    },
    endingStatement: 'The path of the sword became the path toward understanding life.',
    returnLink: true,
  },
];
