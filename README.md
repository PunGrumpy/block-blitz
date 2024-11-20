# 🎮 Block Blitz

A modern take on classic block-falling puzzle games, built with Next.js and TypeScript.

![Block Blitz](/public/preview.png)

## Features ✨

- 🎯 Classic block-falling gameplay with modern mechanics
- 🎨 5 unique block types with distinctive colors
- ⚡️ Special power-ups and combo system
- 🏆 Global leaderboard
- 🛡️ Admin leaderboard management
- 🎵 Dynamic sound effects
- 📱 Responsive design with touch controls
- 🌙 Dark/Light mode support

> [!NOTE]
> Switch to light mode is coming soon!

## 🚀 Getting Started

### Prerequisites

- 📦 Node.js 20+
- 🔧 npm/yarn/pnpm

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

### Desktop

- `⬅️` Arrow Left / `A`: Move left
- `➡️` Arrow Right / `D`: Move right
- `⬆️` Arrow Up / `W`: Rotate piece
- `⬇️` Arrow Down / `S`: Soft drop
- `Space`: Hard drop
- `P`: Pause game
- `ESC`: Return to menu

### Mobile/Tablet

- 👆 Tap side buttons to move
- 🔄 Tap rotate button to turn piece
- ⬇️ Swipe down for soft drop
- 👇 Double tap for hard drop

## 🛠️ Development

### Tech Stack

- ⚛️ Next.js 15 (App Router)
- 📘 TypeScript
- 🎨 Tailwind CSS
- 🎭 Framer Motion
- 🔊 Web Audio API
- 💾 Upstash Redis (Leaderboard)

### Project Structure

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

### Building for Production

```bash
# Create production build
pnpm build

# Start production server
pnpm start
```

## 📝 References

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Upstash Redis](https://docs.upstash.com/)
- [Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/api/motion/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [pnpm](https://pnpm.io/docs)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
