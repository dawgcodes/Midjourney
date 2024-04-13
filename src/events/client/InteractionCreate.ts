import { CommandInteraction } from 'discord.js';
import { Event, Bot, EventsTypes } from '../../structures/index.js';

export default class InteractionCreate extends Event {
    constructor(client: Bot, file: string) {
        super(client, file, {
            name: EventsTypes.InteractionCreate,
        });
    }
    public async run(interaction: CommandInteraction): Promise<void> {
        if (interaction.isCommand()) {
            const command = this.client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.run(this.client, interaction);
            } catch (error) {
                if (error.message === "Prediction failed: NSFW content detected. Try running it again, or try a different prompt.") {
                    await interaction![interaction.replied ? 'editReply' : 'reply']({ content: 'NSFW content detected. You can\' generate NSFW images!', ephemeral: true });

                    return;
                }

                this.client.logger.error(error);

                await interaction![interaction.replied ? 'editReply' : 'reply']({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    }
}