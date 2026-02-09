import { Client, GatewayIntentBits, Events, Collection } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

client.cmds = new Collection();

const cmdpath = path.join(__dirname, 'src', 'commands');
if (fs.existsSync(cmdpath)) {
  const cmdf = fs.readdirSync(cmdpath).filter(f => {
    const fpath = path.join(cmdpath, f);;
    return fs.statSync(fpath).isDirectory();
  });

  for (const f of cmdf) {
   const cmddataf = path.join(cmdpath, f, `${f}.js`);
   if (fs.existsSync(cmddataf)) {
      try {
        const cmd = import(cmddataf);
        client.commands.set(cmd.name, cmd);
        console.log(`Registered ${cmd.name}`);
      } catch (e) {
        console.error(`Failed to load ${cmddataf}:`, e);
      }
    }
  }
}

client.once(Events.ClientReady, async () => {
});
