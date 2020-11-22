require("dotenv").config()
const Discord = require("discord.js")
const client = new Discord.Client()
module.exports = {client}

const config = require("./config.js")
const db = require("quick.db")

client.once("ready", () => {
  console.log(
    `${client.user.username} is online in ${client.guilds.cache.size} guilds`
  )
  client.user.setPresence({
    activity: { name: 'and destroying Shadow in pinball', type: "PLAYING"},
    status: "idle",
  })
  client.guilds.cache.forEach((x) =>
    console.log(`  -${x.name} - ${x.id} (${x.members.cache.size} members)`)
  )
})

client.on("messageUpdate", (oldmsg, newmsg) => {
  newmsg.thisisedit = true
  if (oldmsg.content != newmsg.content) client.emit("message", newmsg)
})

client.on("message", async (message) => {
  if (message.author.bot) return
  if (message.content.indexOf(config.prefix) !== 0) return
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g)
  const command = args.shift().toLowerCase()

  if (command === "ping") {
    let m = await message.channel.send("Pinging...")
    let botLatency = Math.abs(m.createdTimestamp - message.createdTimestamp),
      ping = client.ws.ping,
      memory = (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(2)

    let embed = new Discord.MessageEmbed()
      .setTitle(`Pong!`)
      .setThumbnail(
        message.guild.logoURL({ format: "png", dynamic: true, size: 1024 })
      )
      .addField("Bot Latency", `${botLatency}ms`, true)
      .addField("Ping", `${Math.round(ping)}ms`, true)
      .setTimestamp()

    m.delete()
    await message.channel.send(embed)
  }

  if(command === "update"){
    let chan = client.guilds.cache.get(config.guild).channels.cache.get(config.channel), mid = db.get("message")
    let msg = await chan.messages.fetch(mid)
    let m = `**Managers**\n${message.guild.members.cache.find(x => x.roles.cache.has(config.roles.manager))}\n`
    m += `**Bot Developers**\n${message.guild.members.cache.find(x => x.roles.cache.has(config.roles.botdev))}\n`
    m += `**Mega Moderators**\n${message.guild.members.cache.find(x => x.roles.cache.has(config.roles.megamod))}\n`
    if(m.length > 1000) {m1 = m; m = ""}
    m += `**Moderators**\n${message.guild.members.cache.find(x => x.roles.cache.has(config.roles.mod))}\n`
    m += `**Mini Moderators**\n${message.guild.members.cache.find(x => x.roles.cache.has(config.roles.minimid))}\n`
    m += `**Helpers**\n${message.guild.members.cache.find(x => x.roles.cache.has(config.roles.helper))}\n`
    if(m.length > 1000) {m2 = m; m = ""}
    m += `\n**Game Narrators**\n${message.guild.members.cache.find(x => x.roles.cache.has(config.roles.narr))}\n`
    m += `**Mini Narrators**\n${message.guild.members.cache.find(x => x.roles.cache.has(config.roles.mininarr))}\n`
    m += `\n\n**AFK Staff/Content**\nThis includes less active staff members.\n${message.guild.members.cache.find(x => x.roles.cache.has(config.roles.afk))}\n`
    if(!msg) {
      msg = await chan.send("Generating staff list...")
      db.set("message", msg.id)
    }
    msg.edit(m)
  }

  if (command == "eval" && message.author.id == config.ownerID) {
    try {
      const code = args.join(" ")
      let evaled = eval(code)

      if (typeof evaled !== "string") evaled = require("util").inspect(evaled)

      if (message.content.endsWith(";1+1;")) message.delete()

      if (!message.content.endsWith(";1+1;"))
        message.channel.send(clean(evaled), { code: "js" })
    } catch (err) {
      message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``)
    }
  }
})

const clean = function (text) {
  if (typeof text === "string")
    return text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203))
  else return text
}

client.login(process.env.TOKEN)
