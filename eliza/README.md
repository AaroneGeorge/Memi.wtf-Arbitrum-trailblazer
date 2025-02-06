# myelizav0.1.8 🤖

<div align="center">
  <img src="./docs/static/img/wind.gif" alt="Eliza Banner" width="100%" />
</div>

<div align="center">

📖 [Documentation](https://elizaos.github.io/eliza/) | 🎯 [Examples](https://github.com/thejoven/awesome-eliza)

</div>

# Get Started

## Quickstart Guide

### Prerequisites
Before getting started with **Eliza**, ensure you have the following tools and dependencies installed:

- **Node.js 23+** (using `nvm` is recommended)
- **pnpm 9+**
- **Git** for version control
- A code editor (recommended: **VS Code**, **Cursor**, or **VSCodium**)
- **CUDA Toolkit** (optional, for GPU acceleration)

---

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/elizaOS/eliza.git
   ```

2. **Enter the directory**

   ```bash
   cd eliza
   ```

5. **Install dependencies**

   ```bash
   pnpm install
   ```
   > **Note**: Use the `--no-frozen-lockfile` flag only during initial setup, version bumps, or when adding new packages.

6. **Build the local libraries**

   ```bash
   pnpm build
   ```

---

### Configure Environment

1. **Copy the example environment file**

   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and add your values. Do NOT commit this file to version control.**

   Suggested environment variables:
   ```
   DISCORD_APPLICATION_ID=  # Discord integration
   DISCORD_API_TOKEN=       # Bot token
   HEURIST_API_KEY=         # Heurist API key for LLM and image generation
   OPENAI_API_KEY=          # OpenAI API key
   GROK_API_KEY=            # Grok API key
   ELEVENLABS_XI_API_KEY=   # Elevenlabs voice API key
   LIVEPEER_GATEWAY_URL=    # Livepeer gateway URL
   ```

---

### Choose Your Model
Eliza supports multiple AI models. You can set your desired model in the character JSON file:

- **Heurist**: `modelProvider: "heurist"`
- **LLM**: Configure `SMALL_HEURIST_MODEL`, `MEDIUM_HEURIST_MODEL`, `LARGE_HEURIST_MODEL`
- **Image Generation**: Configure `HEURIST_IMAGE_MODEL` (default: FLUX.1-dev)
- **Llama**: `modelProvider: "llama"`, set `XAI_MODEL` to your chosen model
- **Grok**: `modelProvider: "grok"`
- **OpenAI**: `modelProvider: "openai"`

> For **local inference**, ensure a GPU is available for `llama_local` or configure `OLLAMA_SERVER_URL` for `ollama`.

---

### Create Your First Agent

1. **Create a Character File**
   - Check the `characters/` directory for examples.
   - Copy an existing file and customize it:
     ```bash
     cp characters/sbf.character.json characters/deep-thought.character.json
     ```

2. **Start the Agent**
   - Run a character:
     ```bash
     pnpm start --character="characters/deep-thought.character.json"
     ```
   - Load multiple characters:
     ```bash
     pnpm start --characters="characters/deep-thought.character.json, characters/sbf.character.json"
     ```

3. **Interact with the Agent**
   - Open the client:
     ```bash
     pnpm start:client
     ```
   - Access the chat interface at [http://localhost:5173](http://localhost:5173).

---

### Platform Integration

#### Discord Bot
1. Create an application in the [Discord Developer Portal](https://discord.com/developers/applications).
2. Add your bot token and app ID to `.env`:
   ```
   DISCORD_API_TOKEN=
   DISCORD_APPLICATION_ID=
   ```

#### Twitter Integration
1. Add to `.env`:
   ```
   TWITTER_USERNAME=
   TWITTER_PASSWORD=
   TWITTER_EMAIL=
   ```
2. Enable the "Automated" label for your account in the [Twitter Developer Portal](https://developer.twitter.com).

#### Telegram Bot
1. Create a bot in [BotFather](https://core.telegram.org/bots).
2. Add your bot token to `.env`:
   ```
   TELEGRAM_BOT_TOKEN=
   ```

---

### Optional: GPU Acceleration

If you have an NVIDIA GPU:
1. Install CUDA support:
   ```bash
   npx --no node-llama-cpp source download --gpu cuda
   ```
2. Ensure **CUDA Toolkit**, **cuDNN**, and **cuBLAS** are installed.

---

### Basic Usage Examples

#### Chat with Your Agent
```bash
pnpm start
```

#### Run Multiple Agents
```bash
pnpm start --characters="characters/trump.character.json,characters/tate.character.json"
```

---

### Common Issues & Solutions

1. **Node.js Version**
   - Ensure Node.js 23.3.0 is installed:
     ```bash
     node -v
     ```

2. **Sharp Installation Errors**
   - Install Sharp:
     ```bash
     pnpm install --include=optional sharp
     ```

3. **Rebuilding Better-SQLite3**
   - Try rebuilding:
     ```bash
     pnpm rebuild better-sqlite3
     ```

4. **Exit Status 1 Errors**
   - Add required dependencies:
     ```bash
     pnpm add -w -D ts-node typescript @types/node
     pnpm clean
     pnpm install -r
     pnpm build
     ```

---

# Happy building! 🚀
