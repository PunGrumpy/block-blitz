# Block Blitz 🎮

A modern take on classic block-falling puzzle games, built with Next.js and TypeScript.

![Block Blitz](/public/preview.png)

## Features ✨

- 🎯 Classic block-falling gameplay with modern mechanics
- 🎨 5 unique block types with distinctive colors
- ⚡️ Special power-ups and combo system
- 🏆 Global leaderboard
- 🎵 Dynamic sound effects
- 📱 Responsive design with touch controls
- 🌙 Dark/Light mode support

> [!NOTE]
> Switch to light mode is coming soon!

## Getting Started 🚀

### Prerequisites

- Node.js 20+ 📦
- npm/yarn/pnpm 🔧

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

## Game Controls 🎮

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

## Development 🛠️

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

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
