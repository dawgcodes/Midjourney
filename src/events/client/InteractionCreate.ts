import type { CommandInteraction } from "discord.js";
import { type Bot, Context, Event } from "../../structures/index.js";

export default class InteractionCreate extends Event {
    constructor(client: Bot, file: string) {
        super(client, file, {
            name: "interactionCreate",
        });
    }

    public async run(interaction: any): Promise<void> {
        try {
            if (interaction.isCommand()) {
                const commandName = interaction.commandName;
                await this.client.db.get(interaction.guildId);
                const locale = await this.client.db.getLanguage(interaction.guildId);
                const command = this.client.commands.get(commandName);
                if (!command) return;

                const ctx = new Context(interaction, interaction.options.data);
                ctx.setArgs(interaction.options.data);
                ctx.guildLocale = locale;
                await command.run(this.client, ctx, ctx.args);
            }
        } catch (error) {
            this.client.logger.error(error);

            if (this.isNSFWError(error)) {
                await this.handleNSFWError(interaction);
            } else {
                await this.replyWithError(interaction, "There was an error while executing this command!");
            }
        }
    }

    private isNSFWError(error: any): boolean {
        return (
            error instanceof Error &&
            error.message === "Prediction failed: NSFW content detected. Try running it again, or try a different prompt."
        );
    }

    private async handleNSFWError(interaction: CommandInteraction): Promise<void> {
        await interaction[interaction.replied ? "editReply" : "reply"]({
            content: "NSFW content detected. You can't generate NSFW images!",
            ephemeral: true,
        });
    }

    private async replyWithError(interaction: CommandInteraction, message: string): Promise<void> {
        await interaction[interaction.replied ? "editReply" : "reply"]({
            content: message,
            ephemeral: true,
        });
    }
}
