import discord
from discord.ext import commands, tasks
import re
import os
import aiohttp
import datetime
import json

# ⚠️ Récupère les configurations depuis les variables d'environnement injectées par le panel
TOKEN = os.getenv("DISCORD_TOKEN", "TON_TOKEN_ICI")
BOT_ID = os.getenv("BOT_ID", "TON_BOT_ID_ICI")
API_URL = os.getenv("API_URL", "http://127.0.0.1:3000/api/bots")

AUTHORIZED_GUILDS = [1406433889647329330, 1399238834960732182]

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix='!', intents=intents)

antilink_enabled = True
start_time = datetime.datetime.now(datetime.timezone.utc)

@tasks.loop(seconds=30)
async def update_stats():
    await bot.wait_until_ready()
    try:
        async with aiohttp.ClientSession() as session:
            status_str = str(bot.status).upper()
            if status_str == "DND":
                status_display = "DND"
            elif status_str == "IDLE":
                status_display = "IDLE"
            else:
                status_display = "ONLINE"

            latency = bot.latency * 1000 if bot.latency is not None and bot.latency != float('inf') else 0
            cmd_count = len(bot.commands)
            guild_count = len(bot.guilds)
            mbr_count = sum(g.member_count for g in bot.guilds) if bot.guilds else 0

            data = {
                "server_count": guild_count,
                "user_count": mbr_count,
                "ping": round(latency),
                "command_count": cmd_count,
                "discord_status": status_display,
                "status": "ONLINE",
                "start_time": start_time.isoformat(),
                "pid": os.getpid()
            }
            
            async with session.patch(f"{API_URL}/{BOT_ID}", json=data) as resp:
                if resp.status != 200:
                    pass # Silent failure for background updates
    except Exception:
        pass # Silent failure

@bot.event
async def on_ready():
    print(f'Bot connecté en tant que {bot.user}')
    activity = discord.Activity(type=discord.ActivityType.playing, name="soon arch-bots..")
    await bot.change_presence(status=discord.Status.dnd, activity=activity)
    if not update_stats.is_running():
        update_stats.start()

@bot.event
async def on_message(message):
    global antilink_enabled

    if message.author == bot.user:
        return

    if message.guild and message.guild.id not in AUTHORIZED_GUILDS:
        return

    link_pattern = re.compile(r'(http://|https://|discord\.gg|\.com)')

    if antilink_enabled and link_pattern.search(message.content):
        if not message.author.guild_permissions.administrator:
            try:
                await message.delete()
                embed = discord.Embed(
                    title="Lien supprimé",
                    description="Seuls les administrateurs peuvent envoyer des liens dans ce serveur.",
                    color=discord.Color.from_rgb(0, 0, 0)
                )
                embed.set_footer(
                    text="By Toty",
                    icon_url="https://cdn.discordapp.com/attachments/1406433890725531751/1407090388724088974/Capture_decran_2025-08-17_031833.png"
                )
                await message.channel.send(embed=embed)
            except Exception:
                pass
            return

    await bot.process_commands(message)

@bot.command(name='antilink')
@commands.has_permissions(administrator=True)
async def antilink(ctx, action: str):
    global antilink_enabled
    if ctx.guild.id not in AUTHORIZED_GUILDS:
        await ctx.send("Ce serveur n'est pas autorisé à utiliser cette commande.")
        return

    if action == 'on':
        antilink_enabled = True
        embed = discord.Embed(
            title="Antilink Activé",
            description="La protection contre les liens est maintenant activée.",
            color=discord.Color.green()
        )
    elif action == 'off':
        antilink_enabled = False
        embed = discord.Embed(
            title="Antilink Désactivé",
            description="La protection contre les liens est maintenant désactivée.",
            color=discord.Color.red()
        )
    else:
        await ctx.send("Commande inconnue. Utilisez `!antilink on` ou `!antilink off`.")
        return

    embed.set_footer(
        text="By Toty",
        icon_url="https://cdn.discordapp.com/attachments/1406433890725531751/1407090388724088974/Capture_decran_2025-08-17_031833.png"
    )
    await ctx.send(embed=embed)

@bot.command(name='ping')
async def ping(ctx):
    if ctx.guild.id not in AUTHORIZED_GUILDS:
        await ctx.send("Ce serveur n'est pas autorisé à utiliser cette commande.")
        return

    latency = bot.latency * 1000
    embed = discord.Embed(
        title="Ping du Bot",
        description=f"Le ping du bot est {latency:.2f} ms",
        color=discord.Color.from_rgb(128, 128, 128)
    )
    embed.set_footer(
        text="By Toty",
        icon_url="https://cdn.discordapp.com/attachments/1406433890725531751/1407090388724088974/Capture_decran_2025-08-17_031833.png"
    )
    await ctx.send(embed=embed)

bot.run(TOKEN)
