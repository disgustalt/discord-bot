import 'dotenv/config';
import { Client, GatewayIntentBits, Events, Collection } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { Init } from './src/utils/logger.js';

Init();

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
        console.success(`Registered ${cmd.name} :D`);
      } catch (e) {
        console.error(`Failed to register ${cmddataf} :c`, e);
      }
    }
  }
}

client.once(Events.ClientReady, async () => {
  console.info('Logged in as', client.user.tag, ':D');

  try {
    const cmd = Array.from(client.cmds.map(cmd => {
      return {
        name: cmd.name,
        description: cmd.description,
        options: cmd.options || [],
        dm_permission: cmd.dm_permission || false,
        contexts: cmd.contexts || [0],
        integration_types: cmd.integration_types || [0],
        default_member_permissions: cmd.default_meber_permissions || null    
      };
    }));

    const rcmds = await client.application.commands.set(cmds);
    console.success('Registered', rcmds.size, 'commands >:D');
  } catch (e) {
    console.error('Error registering commands :c', e);
  }
});

client.on(Events.InteractionCreate, async (i) => {
  if (!i.isChatInputCommand()) return;

  try {
    const cmdp = path.join(__dirname, 'commands', i.commandName, 'handle.js');
    if (!fs.existsSync(cmdp)) return await i.reply({ flags: 64, content: 'Command not found :/' });

    const handle = import(cmdp);

    await handle(i, client);
  } catch (e) {
    console.error('Error handling', i.commandName, ':c', e);
    await i.reply({ flags: 64, content: 'Uh oh, I ran into an error :\(' });
  }
});

client.login(process.env.TOKENN);
