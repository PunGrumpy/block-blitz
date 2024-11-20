# 🎮 Block Blitz

A modern take on classic block-falling puzzle games, built with Next.js and TypeScript.

> [!WARNING]
> This project was developed as part of the Computer Games Programming course exit examination.

![Block Blitz Game Preview](/public/preview.png)

## Game Mechanics 🎯

### Board & Blocks

- Game board: 10x20 grid
- Features 5 unique block types:
  - Line Block (I) - Long piece for clearing multiple rows
  - Square Block (O) - 2x2 block that doesn't rotate
  - T Block (T) - T-shaped piece for versatile placements
  - L Block (L) - L-shaped piece
  - Reverse L Block (J) - Mirrored L-shaped piece

### Core Rules

- Blocks can be cleared by:
  - Completing full rows (line clear like Tetris)
- Blocks automatically fall to fill empty spaces
- Win condition: Score 3,000 points within 180 seconds (Time-Based Mode)
- Alternative mode: Limited blocks with target score (Object-Available-Based Mode)

## Features ✨

- 🎯 Classic block-falling gameplay with modern mechanics
- 🎨 Color-coded blocks with distinctive visuals
- ⚡️ Special power-ups and combo system
- 🏆 Global leaderboard with score verification
- 🎵 Dynamic sound effects and visual feedback
- 📱 Responsive design with touch controls
- 🌙 Dark/Light mode support

> [!NOTE]
> Switch to light mode is coming soon!

> [!TIP]
> Admin can use secret password to access admin dashboard to delete data in leaderboard.

## 🚀 Getting Started

### Prerequisites

- 📦 Node.js 20+
- 🔧 npm/yarn/pnpm
- 🌐 Modern web browser
- 🖥️ Minimum screen resolution: 800x600

### Installation

```bash
# Clone the repository
git clone https://github.com/PunGrumpy/block-blitz.git

# Navigate to project directory
cd block-blitz

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

> [!NOTE]
> Let's find environment variables with youself.

## 🎮 Game Controls

### Desktop (Keyboard)

- `⬅️` Arrow Left / `A`: Move left
- `➡️` Arrow Right / `D`: Move right
- `⬆️` Arrow Up / `W`: Rotate piece clockwise
- `⬇️` Arrow Down / `S`: Soft drop
- `Space`: Hard drop
- `P`: Pause game
- `ESC`: Return to menu

### Mobile/Tablet (Touch)

- 👆 Tap left/right buttons to move
- 🔄 Tap rotate button to turn piece
- ⬇️ Swipe down for soft drop
- 👇 Double tap for hard drop

## 🛠️ Technology Stack

### Core Technologies

- ⚛️ Next.js 15 (App Router)
- 📘 TypeScript
- 🎨 Tailwind CSS
- 🎭 Framer Motion
- 🔊 Web Audio API
- 💾 Upstash Redis (Leaderboard)

### UI Components

- 🔧 Radix UI primitives
- 📱 Responsive design system

## Project Structure

```
.
├── actions/      # Server-side actions (Leaderboard)
├── app/          # Next.js app router files
├── components/   # React components
├── hooks/        # Custom React hooks
├── lib/          # Utility functions
├── types/        # TypeScript types
└── constants/    # Game constants
```

## 🏗️ Development

### Building for Production

```bash
# Create production build
pnpm build

# Start production server
pnpm start
```

### Performance Optimizations

- RequestAnimationFrame for smooth game loop
- Canvas optimization for block rendering
- Efficient collision detection
- Web Workers for physics calculations
- Code splitting and dynamic imports

## 📝 References & Attributions

### Code References

- Game loop implementation inspired by the [Canvas API Best Practices Guide](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_animations)
- Collision detection algorithm adapted from [MDN Web Docs examples](https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection)
- Sound system utilizing [Web Audio API documentation examples](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

### External Libraries

- [NextJS 15](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://motion.dev/)
- [Radix UI](https://radix-ui.com/)
- [Upstash Redis](https://upstash.com/)

### Assets

- Font: Geist from [Google Fonts](https://fonts.google.com/specimen/Geist)
- Sound effects: Custom generated using [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- Color scheme: Custom designed for accessibility

## 👥 Development Team

- Developer: Noppakorn Kaewsalabnil
- Course: Exit Exam on Computer Games Programming
- Institution: King Mongkut's Institute of Technology Ladkrabang
- Academic Year: 1/2567

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
