# Neon Trivia Battle Royale - Survival Mode

A competitive quiz game with real-time leaderboard powered by Supabase.

## Features

- 🎮 **Survival Mode**: Answer questions correctly to survive with 3 lives
- 🏆 **Real-time Leaderboard**: Powered by Supabase database
- 🔥 **Streak System**: Build streaks for bonus points
- ⚡ **Time Bonus**: Answer faster for more points
- 💥 **Visual Effects**: Particle explosions and neon aesthetics
- 🔊 **Sound Effects**: Immersive audio feedback

## Prerequisites

- Node.js (v14 or higher)
- npm
- Supabase account

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd quiz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   - Edit `.env` and add your Supabase credentials:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your-supabase-anon-key-here
   PORT=3000
   ```

4. **Set up Supabase database**
   - Follow the instructions in `SUPABASE_SETUP.md`
   - Create the `scores` table with the provided SQL
   - Configure RLS policies

## Running the Application

1. **Start the server**
   ```bash
   npm start
   ```

2. **Open in browser**
   Navigate to: http://localhost:3000

## Project Structure

```
quiz/
├── css/
│   └── style.css          # Styling and animations
├── js/
│   ├── config.js          # Game configuration and questions
│   ├── game.js            # Main game logic
│   ├── ui.js              # UI updates and controls
│   ├── audio.js           # Sound effects
│   ├── particles.js       # Visual effects
│   ├── leaderboard.js     # Leaderboard management
│   └── supabase.js       # Supabase integration
├── .env                  # Environment variables (NOT in git)
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
├── package.json         # Dependencies
├── server.js           # Express server
├── index.html          # Main HTML file
└── SUPABASE_SETUP.md   # Database setup guide
```

## Security

- ✅ `.env` file is in `.gitignore` and won't be committed
- ✅ Supabase credentials loaded server-side via `/api/config`
- ✅ Row Level Security (RLS) policies in Supabase
- ✅ CORS configuration for domain protection

## Game Rules

1. Enter your name and start the game
2. Answer questions before time runs out (15 seconds)
3. Correct answers earn points + time bonus + streak bonus
4. Wrong answers or timeout cost 1 life
5. Game ends when all 3 lives are lost
6. Score is saved to Supabase leaderboard

## Scoring

- **Base Points**: 100 per correct answer
- **Time Bonus**: 10 points per second remaining
- **Streak Bonus**: 50 points × current streak
- **Multiplier**: Increases with streaks

## Troubleshooting

### Server won't start
- Check if port 3000 is already in use
- Verify `.env` file exists in project root

### Scores not saving
- Check browser console for errors
- Verify Supabase table exists (see SUPABASE_SETUP.md)
- Ensure RLS policies are configured correctly

### CORS errors
- Add your domain to Supabase CORS settings
- For local dev: `http://localhost:3000`

## Development

The game uses vanilla JavaScript with ES6 modules. No build process required.

## License

ISC

## Credits

Built with ❤️ using Supabase, Express, and vanilla JavaScript.
