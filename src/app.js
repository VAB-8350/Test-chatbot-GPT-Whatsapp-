const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')
require('dotenv').config()

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

const GPT = require('./chat/gpt')

const createGPT = async ({provider, database}) => {
    return new GPT(database, provider)
}

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterProvider = createProvider(BaileysProvider)

    createGPT({
        provider: adapterProvider,
        database: adapterDB
    })

    QRPortalWeb()
}

main()
