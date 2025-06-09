# Sodacore Demo Project

The aim of this project is to demonstrate the capabilities of the Sodacore framework, and in an attempt to provide an example of the core features of the framework, including plugins.

> Please note, this project is absolutely nonsensical and is purely for demonstration purposes.

## Getting Started

To get started, follow the steps below.

### Pre-requisites

Some pre-requisites are required are expected:
- You have installed [Bun](https://bun.sh/).
- You have created a [Discord Bot](https://discord.com/developers/applications).
- You have a Discord **bot token**, **client ID**, and **guild ID**.

> The guild ID is technically optional, but when it comes to registering slash commands with Discord, registering them globally can take **up to** an hour to propagate, so it is recommended to register your commands to a specific guild as it's almost instantaneous.

### Installation

To get started;

1. Clone the repository to a location of your choice.
```bash
git clone git@github.com:sodacore/demo.git ~/sodacore-demo
```

2. Navigate to the project directory.
```bash
cd ~/sodacore-demo
```

3. Install the dependencies,
```bash
bun install
```

4. Setup your environment variables.
```bash
cp env.template .env
```
> _Then insert your variables into the `.env` file._

5. Start the project.
```bash
bun dev
```

### Building

To build the project, you can run:
```bash
bun run build
```

And then you can run the project with:
```bash
bun start
```

### Learn More

Read our [documentation](https://sodacore.dev/docs) to learn more about the framework and how to create your own projects using it.
