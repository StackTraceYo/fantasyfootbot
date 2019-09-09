import {EspnTeleConfig} from "../EspnTele";

import Telegraf, {ContextMessageUpdate} from 'telegraf';

export default class TeleClient {

    private readonly _bot: Telegraf<ContextMessageUpdate>;
    private chatId: number = null;

    constructor(config: EspnTeleConfig) {
        this._bot = new Telegraf(config.teleToken);
        this._bot.command('start', (ctx) => {
            this.chatId = ctx.chat.id;
            ctx.reply('Starting');
        });
        this._bot.command('stop', (ctx) => {
            this.chatId = null;
            ctx.reply('Stopping');
        });
        this._bot.launch();
    }

    send(message: any) {
        if (this.chatId != null) {
            this._bot.telegram.sendMessage(this.chatId, message);
        }
    }

    id() {
        return this.chatId
    }

    started() {
        return this.chatId !== null;
    }

}