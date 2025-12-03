# Avatar Generator Feature

A complete, modular avatar generator built with **DiceBear JS**, **Quasar Framework**, and **Vue 3 Composition API**. Generate beautiful, customizable avatars with real-time preview and extensive configuration options.

## 🎯 Features

- ✨ **30+ Avatar Styles** - Choose from human, abstract, and fun avatar categories
- 🎨 **Full Customization** - Control size, colors, rotation, position, scale, and more
- 📦 **Quick Presets** - Apply pre-configured styles (Cute, Professional, Funny, Robot, Retro, Abstract)
- 💾 **Favorites System** - Save and load your favorite avatar configurations
- 📥 **Multiple Export Formats** - Download as PNG or SVG
- 📋 **Clipboard Support** - Copy SVG code directly
- 💿 **Auto-Save** - Automatically saves your last configuration to localStorage
- 🌙 **Dark Mode Friendly** - Works seamlessly with Quasar's dark mode
- 📱 **Fully Responsive** - Optimized for desktop and mobile devices

## 📂 Project Structure

```
src/
├── composables/
│   └── useAvatarGenerator.ts      # Main avatar generation logic
├── services/
│   ├── avatarStyles.ts            # Avatar styles catalog and presets
│   └── avatarPersistence.ts       # localStorage management
├── components/
│   ├── AvatarPreview.vue          # Live SVG preview component
│   └── AvatarControls.vue         # Configuration controls
└── pages/
    └── AvatarGenerator.vue        # Main feature page
```

## 🚀 Quick Start

### 1. Navigate to Avatar Generator

After starting your Quasar app, click on **"Avatar Generator"** in the navigation drawer or visit `/avatar-generator`.

### 2. Basic Usage

```bash
# Start the development server
pnpm dev
# or
npm run dev
```

Then open your browser and navigate to the Avatar Generator page.

## 📖 API Documentation

### Composable: `useAvatarGenerator`

The main composable that handles avatar generation.

#### Usage Example

```typescript
import { useAvatarGenerator } from '@/composables/useAvatarGenerator';

const {
  options, // Reactive options object
  svg, // Generated SVG string
  dataUri, // Data URI for embedding
  isGenerating, // Loading state
  error, // Error message
  generate, // Manually trigger generation
  setOption, // Set a single option
  setOptions, // Set multiple options
  reset, // Reset to defaults
  randomize, // Randomize seed
  downloadPNG, // Download as PNG
  downloadSVG, // Download as SVG
  copySVG, // Copy SVG to clipboard
  copyDataUri, // Copy data URI to clipboard
} = useAvatarGenerator({
  style: 'avataaars',
  seed: 'John Doe',
  size: 256,
});

// Change a single option
setOption('style', 'bottts');
setOption('seed', 'Robot');

// Change multiple options
setOptions({
  size: 512,
  radius: 50,
  backgroundColor: ['ff5733'],
});
```

#### Options Interface

```typescript
interface AvatarOptions {
  style: string; // Avatar style (e.g., 'avataaars', 'bottts')
  seed: string; // Seed for generation (name, text, ID)
  size: number; // Size in pixels (64-512)
  backgroundColor: string[]; // Array of hex colors (without #)
  radius: number; // Border radius percentage (0-50)
  scale: number; // Scale percentage (50-150)
  rotate: number; // Rotation in degrees (0-360)
  translateX: number; // X position (-50 to 50)
  translateY: number; // Y position (-50 to 50)
  flip: boolean; // Horizontal flip
}
```

### Service: `avatarStyles`

Provides catalog of available avatar styles and presets.

#### Available Exports

```typescript
import {
  avatarStyles, // Array of all styles
  avatarPresets, // Array of preset configurations
  getStyleByKey, // Find style by key
  getStylesByCategory, // Filter by category
  getPresetByKey, // Find preset by key
} from '@/services/avatarStyles';

// Get all human-style avatars
const humanStyles = getStylesByCategory('human');

// Get specific style
const style = getStyleByKey('avataaars');
```

#### Style Categories

- **human** - Realistic or stylized human avatars
- **abstract** - Geometric and abstract designs
- **fun** - Playful and creative avatars

#### Available Presets

| Preset         | Style             | Description               |
| -------------- | ----------------- | ------------------------- |
| `random-cute`  | big-smile         | Cute and friendly avatars |
| `professional` | avataaars-neutral | Clean, professional look  |
| `funny`        | fun-emoji         | Fun and playful           |
| `robot`        | bottts            | Futuristic robots         |
| `retro`        | pixel-art         | Nostalgic pixel art       |
| `abstract`     | shapes            | Modern abstract design    |

### Service: `avatarPersistence`

Manages localStorage operations for saving/loading configurations.

#### Functions

```typescript
import {
  saveConfig, // Save current config
  loadConfig, // Load saved config
  clearConfig, // Clear saved config
  addToFavorites, // Add to favorites
  getFavorites, // Get all favorites
  removeFromFavorites, // Remove favorite
  clearFavorites, // Clear all favorites
  addToRecent, // Add to recent history
  getRecent, // Get recent history
  clearRecent, // Clear recent
  exportData, // Export all data as JSON
  importData, // Import data from JSON
  getStorageInfo, // Get storage usage info
} from '@/services/avatarPersistence';

// Save current configuration
saveConfig(options);

// Load on app start
const saved = loadConfig();
if (saved) {
  // Apply saved configuration
}

// Add to favorites with a name
addToFavorites('My Avatar', options, svgString);

// Get all favorites
const favorites = getFavorites();
```

## 🎨 Available Avatar Styles

### Human Styles

- Avataaars, Avataaars Neutral
- Adventurer, Adventurer Neutral
- Lorelei, Lorelei Neutral
- Micah, Miniavs
- Notionists, Notionists Neutral
- Open Peeps, Personas

### Fun Styles

- Big Ears, Big Ears Neutral
- Big Smile
- Bottts, Bottts Neutral
- Croodles, Croodles Neutral
- Fun Emoji
- Pixel Art, Pixel Art Neutral
- Thumbs

### Abstract Styles

- Glass
- Icons
- Identicon
- Initials
- Rings
- Shapes

## 🔧 Component Usage

### AvatarPreview Component

Display a live preview of the generated avatar.

```vue
<template>
  <avatar-preview
    :svg="svg"
    :is-generating="isGenerating"
    :error="error"
    :size="256"
    background-color="#f5f5f5"
    :border-radius="10"
    :show-actions="true"
    @regenerate="handleRegenerate"
    @randomize="handleRandomize"
    @copy-s-v-g="handleCopy"
  />
</template>
```

#### Props

| Prop              | Type             | Default     | Description            |
| ----------------- | ---------------- | ----------- | ---------------------- |
| `svg`             | `string`         | `''`        | SVG content to display |
| `isGenerating`    | `boolean`        | `false`     | Show loading state     |
| `error`           | `string \| null` | `null`      | Error message          |
| `size`            | `number`         | `256`       | Preview size in pixels |
| `backgroundColor` | `string`         | `'#f5f5f5'` | Background color       |
| `showActions`     | `boolean`        | `true`      | Show action buttons    |
| `borderRadius`    | `number`         | `0`         | Border radius          |

#### Events

- `regenerate` - Triggered when regenerate button clicked
- `randomize` - Triggered when random button clicked
- `copySVG` - Triggered when copy button clicked

### AvatarControls Component

Comprehensive controls for avatar customization.

```vue
<template>
  <avatar-controls
    :model-value="currentOptions"
    :has-avatar="!!svg"
    @update:style="handleStyleUpdate"
    @update:seed="handleSeedUpdate"
    @update:size="handleSizeUpdate"
    @update:background-color="handleBgUpdate"
    @randomize="handleRandomize"
    @download-p-n-g="handleDownloadPNG"
    @download-s-v-g="handleDownloadSVG"
    @save-to-favorites="handleSave"
    @reset="handleReset"
  />
</template>
```

#### Props

| Prop         | Type      | Required | Description                 |
| ------------ | --------- | -------- | --------------------------- |
| `modelValue` | `object`  | Yes      | Current avatar options      |
| `hasAvatar`  | `boolean` | No       | Whether avatar is generated |

#### Events

- `update:style` - Style changed
- `update:seed` - Seed changed
- `update:size` - Size changed
- `update:backgroundColor` - Background color changed
- `update:radius` - Radius changed
- `update:scale` - Scale changed
- `update:rotate` - Rotation changed
- `update:translateX` - X position changed
- `update:translateY` - Y position changed
- `update:flip` - Flip state changed
- `randomize` - Random seed requested
- `downloadPNG` - PNG download requested
- `downloadSVG` - SVG download requested
- `saveToFavorites` - Save to favorites requested
- `reset` - Reset to defaults requested

## 💡 Usage Examples

### Example 1: Simple Avatar Display

```vue
<script setup lang="ts">
import { useAvatarGenerator } from '@/composables/useAvatarGenerator';

const { svg, setOption } = useAvatarGenerator({
  style: 'avataaars',
  seed: 'User123',
  size: 128,
});
</script>

<template>
  <div v-html="svg"></div>
</template>
```

### Example 2: User Profile Avatar

```vue
<script setup lang="ts">
import { useAvatarGenerator } from '@/composables/useAvatarGenerator';
import { computed } from 'vue';

const props = defineProps<{ username: string }>();

const { svg } = useAvatarGenerator({
  style: 'avataaars',
  seed: computed(() => props.username),
  size: 96,
  radius: 50,
});
</script>

<template>
  <div class="profile-avatar" v-html="svg"></div>
</template>
```

### Example 3: Random Avatar Generator

```vue
<script setup lang="ts">
import { useAvatarGenerator } from '@/composables/useAvatarGenerator';

const { svg, randomize } = useAvatarGenerator({
  style: 'bottts',
  size: 256,
});

const generateNew = () => {
  randomize();
};
</script>

<template>
  <div>
    <div v-html="svg"></div>
    <q-btn @click="generateNew" label="Generate New" />
  </div>
</template>
```

### Example 4: Batch Avatar Generation

```typescript
import { useAvatarGenerator } from '@/composables/useAvatarGenerator';

const users = ['Alice', 'Bob', 'Charlie'];
const avatars = [];

for (const user of users) {
  const { svg } = useAvatarGenerator({
    style: 'avataaars',
    seed: user,
    size: 64,
  });
  avatars.push({
    name: user,
    avatar: svg.value,
  });
}
```

## 🔌 Integration Tips

### 1. Use with User Profiles

Generate avatars based on user IDs or usernames:

```typescript
const { svg } = useAvatarGenerator({
  seed: userId,
  style: userPreferences.avatarStyle || 'avataaars',
});
```

### 2. Comment Avatars

Display unique avatars for anonymous users:

```typescript
const { svg } = useAvatarGenerator({
  seed: commentId,
  style: 'pixel-art',
  size: 48,
});
```

### 3. Placeholder Images

Use as placeholder while loading user photos:

```vue
<img :src="userPhoto || avatarDataUri" :alt="username" />
```

## 🎯 Performance Tips

1. **Memoize avatars**: Cache generated SVGs for frequently used seeds
2. **Smaller sizes**: Use smaller sizes (64-128px) for lists
3. **Lazy generation**: Only generate when component is visible
4. **Batch operations**: Generate multiple avatars in a single batch

## 📦 Dependencies

- `@dicebear/core` - Core DiceBear library
- `@dicebear/collection` - Complete collection of avatar styles
- Vue 3 - Reactive framework
- Quasar Framework - UI components

## 🐛 Troubleshooting

### Avatar not generating?

- Check that the style name is valid (see available styles)
- Ensure seed is not empty
- Check browser console for errors

### PNG download not working?

- Ensure browser supports Canvas API
- Check that popup blockers aren't interfering
- Try using SVG download instead

### Favorites not persisting?

- Check localStorage is enabled in browser
- Verify storage quota hasn't been exceeded
- Try clearing old data with `clearRecent()`

## 📄 License

This feature is part of the Avatar Generator project using DiceBear (MIT License).

## 🙏 Credits

- **DiceBear** - Avatar generation library
- **Quasar Framework** - UI components
- **Vue 3** - Reactive framework

---

**Built with ❤️ using Clean Architecture principles**
