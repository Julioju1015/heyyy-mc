const ms = require('ms')
const fetch = require('node-fetch')
const Discord = require('discord.js')
const client = new Discord.Client()

const config = require('./config.json')
const updateChannel = async () => {

    const res = await fetch(`https://mcapi.us/server/status?ip=${config.ipAddress}${config.port ? `&port=${config.port}` : ''}`)
    if (!res) {
        const statusChannelName = `【🛡】Status: Offline`
        client.channels.cache.get(config.statusChannel).setName(statusChannelName)
        return false
    }
    const body = await res.json()

    const players = body.players.now

    const status = (body.online ? "Online" : "Offline")


    const playersChannelName = `【👥】Players: ${players}`
    const statusChannelName = `【🛡】Status: ${status}`

    client.channels.cache.get(config.playersChannel).setName(playersChannelName)
    client.channels.cache.get(config.statusChannel).setName(statusChannelName)

    return true
}

client.on('ready', () => {
    console.log(`heyyy ${client.user.tag}.`)
    setInterval(() => {
        updateChannel()
    }, ms(config.updateInterval))
})

client.on('message', async (message) => {

    if(message.content === `${config.prefix}force-update`){
        if (!message.member.hasPermission('MANAGE_MESSAGES')) {
            return message.channel.send('Seuls les modérateurs de se serveur peuvent exécuter cette commande!')
        }
        const sentMessage = await message.channel.send("Mise à jour des channels, veuillez patienter ...")
        await updateChannel()
        sentMessage.edit("Channels updated !")
    }

    if(message.content === `${config.prefix}stats`){
        const sentMessage = await message.channel.send("Récupération des statistiques, veuillez patienter ...")

        const res = await fetch(`https://mcapi.us/server/status?ip=${config.ipAddress}${config.port ? `&port=${config.port}` : ''}`)
        if (!res) return message.channel.send(`....`)

        const body = await res.json()


        const embed = new Discord.MessageEmbed()
            .setAuthor(config.ipAddress)
            .setThumbnail("attachment://icon.png")
            .addField("Version", body.server.name)
            .addField("Connected", `${body.players.now} players`)
            .addField("Maximum", `${body.players.max} players`)
            .addField("Status", (body.online ? "Online" : "Offline"))
            .setColor("#EE82EE")
            .setFooter("Crée avec <3 par Julioju")
        
        sentMessage.edit(`:chart_with_upwards_trend: Voici les statistiques pour **${config.ipAddress}**:`, { embed })
    }

})

client.login(config.token)
