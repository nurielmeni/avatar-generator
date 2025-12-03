/**
 * Avatar Styles Service
 * Exports supported DiceBear styles with labels and descriptions
 */

export interface AvatarStyle {
  key: string;
  label: string;
  description: string;
  category: 'human' | 'abstract' | 'fun';
}

export const avatarStyles: AvatarStyle[] = [
  {
    key: 'avataaars',
    label: 'Avataaars',
    description: 'Sketch-style avatars designed by Pablo Stanley',
    category: 'human',
  },
  {
    key: 'avataaars-neutral',
    label: 'Avataaars Neutral',
    description: 'Neutral variant of Avataaars',
    category: 'human',
  },
  {
    key: 'adventurer',
    label: 'Adventurer',
    description: 'Playful and adventurous avatars',
    category: 'human',
  },
  {
    key: 'adventurer-neutral',
    label: 'Adventurer Neutral',
    description: 'Neutral variant of Adventurer',
    category: 'human',
  },
  {
    key: 'big-ears',
    label: 'Big Ears',
    description: 'Cute characters with big ears',
    category: 'fun',
  },
  {
    key: 'big-ears-neutral',
    label: 'Big Ears Neutral',
    description: 'Neutral variant of Big Ears',
    category: 'fun',
  },
  {
    key: 'big-smile',
    label: 'Big Smile',
    description: 'Happy avatars with big smiles',
    category: 'fun',
  },
  {
    key: 'bottts',
    label: 'Bottts',
    description: 'Robot avatars',
    category: 'fun',
  },
  {
    key: 'bottts-neutral',
    label: 'Bottts Neutral',
    description: 'Neutral robot avatars',
    category: 'fun',
  },
  {
    key: 'croodles',
    label: 'Croodles',
    description: 'Doodle-style avatars',
    category: 'fun',
  },
  {
    key: 'croodles-neutral',
    label: 'Croodles Neutral',
    description: 'Neutral doodle avatars',
    category: 'fun',
  },
  {
    key: 'fun-emoji',
    label: 'Fun Emoji',
    description: 'Emoji-style avatars',
    category: 'fun',
  },
  {
    key: 'glass',
    label: 'Glass',
    description: 'Abstract glass-style avatars',
    category: 'abstract',
  },
  {
    key: 'icons',
    label: 'Icons',
    description: 'Simple icon avatars',
    category: 'abstract',
  },
  {
    key: 'identicon',
    label: 'Identicon',
    description: 'Geometric identicons',
    category: 'abstract',
  },
  {
    key: 'initials',
    label: 'Initials',
    description: 'Text-based initials',
    category: 'abstract',
  },
  {
    key: 'lorelei',
    label: 'Lorelei',
    description: 'Stylized human avatars',
    category: 'human',
  },
  {
    key: 'lorelei-neutral',
    label: 'Lorelei Neutral',
    description: 'Neutral variant of Lorelei',
    category: 'human',
  },
  {
    key: 'micah',
    label: 'Micah',
    description: 'Minimalist human avatars',
    category: 'human',
  },
  {
    key: 'miniavs',
    label: 'Miniavs',
    description: 'Mini avatar style',
    category: 'human',
  },
  {
    key: 'notionists',
    label: 'Notionists',
    description: 'Notion-style avatars',
    category: 'human',
  },
  {
    key: 'notionists-neutral',
    label: 'Notionists Neutral',
    description: 'Neutral Notion-style avatars',
    category: 'human',
  },
  {
    key: 'open-peeps',
    label: 'Open Peeps',
    description: 'Hand-drawn library of people',
    category: 'human',
  },
  {
    key: 'personas',
    label: 'Personas',
    description: 'Playful personas',
    category: 'human',
  },
  {
    key: 'pixel-art',
    label: 'Pixel Art',
    description: 'Retro pixel art style',
    category: 'fun',
  },
  {
    key: 'pixel-art-neutral',
    label: 'Pixel Art Neutral',
    description: 'Neutral pixel art',
    category: 'fun',
  },
  {
    key: 'rings',
    label: 'Rings',
    description: 'Abstract ring patterns',
    category: 'abstract',
  },
  {
    key: 'shapes',
    label: 'Shapes',
    description: 'Geometric shapes',
    category: 'abstract',
  },
  {
    key: 'thumbs',
    label: 'Thumbs',
    description: 'Thumbs up/down style',
    category: 'fun',
  },
];

export const getStyleByKey = (key: string): AvatarStyle | undefined => {
  return avatarStyles.find((style) => style.key === key);
};

export const getStylesByCategory = (category: AvatarStyle['category']): AvatarStyle[] => {
  return avatarStyles.filter((style) => style.category === category);
};

export const avatarPresets = [
  {
    key: 'random-cute',
    label: 'Random Cute',
    description: 'Cute and friendly avatar',
    config: {
      style: 'big-smile',
      backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
      radius: 50,
    },
  },
  {
    key: 'professional',
    label: 'Professional',
    description: 'Clean and professional look',
    config: {
      style: 'avataaars-neutral',
      backgroundColor: ['ffffff', 'f0f0f0', 'e8e8e8'],
      radius: 10,
    },
  },
  {
    key: 'funny',
    label: 'Funny',
    description: 'Fun and playful avatar',
    config: {
      style: 'fun-emoji',
      backgroundColor: ['ffeca8', 'a8e6cf', 'ffd3b6', 'dcedc1'],
      radius: 30,
    },
  },
  {
    key: 'robot',
    label: 'Robot',
    description: 'Futuristic robot avatar',
    config: {
      style: 'bottts',
      backgroundColor: ['333333', '1a1a1a', '4a4a4a'],
      radius: 0,
    },
  },
  {
    key: 'retro',
    label: 'Retro',
    description: 'Nostalgic pixel art',
    config: {
      style: 'pixel-art',
      backgroundColor: ['000000', '2d2d2d'],
      radius: 0,
    },
  },
  {
    key: 'abstract',
    label: 'Abstract',
    description: 'Modern abstract design',
    config: {
      style: 'shapes',
      backgroundColor: ['gradient'],
      radius: 0,
    },
  },
];

export interface AvatarPreset {
  key: string;
  label: string;
  description: string;
  config: {
    style: string;
    backgroundColor: string[];
    radius: number;
  };
}

export const getPresetByKey = (key: string): AvatarPreset | undefined => {
  return avatarPresets.find((preset) => preset.key === key);
};
