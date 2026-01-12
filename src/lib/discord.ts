export async function fetchDiscordStats(token: string) {
  try {
    const startTime = Date.now();
    const response = await fetch('https://discord.com/api/v10/oauth2/applications/@me', {
      headers: {
        Authorization: `Bot ${token}`,
      },
      cache: 'no-store'
    });
    const endTime = Date.now();
    const ping = endTime - startTime;

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.statusText}`);
    }

    const data = await response.json();
    const applicationId = data.id;

    // Fetch exact guild count if possible (more accurate than approximate_guild_count for small bots)
    let exactServerCount = data.approximate_guild_count || 0;
    try {
      const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
        headers: {
          Authorization: `Bot ${token}`,
        },
        cache: 'no-store'
      });
      if (guildsResponse.ok) {
        const guilds = await guildsResponse.json();
        if (Array.isArray(guilds)) {
          exactServerCount = guilds.length;
        }
      }
    } catch (guildsError) {
      console.error('Error fetching exact guild count:', guildsError);
    }

    // Fetch global commands count
    let commandCount = 0;
    try {
      const commandsResponse = await fetch(`https://discord.com/api/v10/applications/${applicationId}/commands`, {
        headers: {
          Authorization: `Bot ${token}`,
        },
        cache: 'no-store'
      });
      if (commandsResponse.ok) {
        const commands = await commandsResponse.json();
        commandCount = Array.isArray(commands) ? commands.length : 0;
      }
    } catch (cmdError) {
      console.error('Error fetching Discord commands:', cmdError);
    }

    return {
      server_count: exactServerCount,
      user_count: data.approximate_user_install_count || 0,
      name: data.name,
      icon: data.icon,
      command_count: commandCount
    };
  } catch (error) {
    console.error('Error fetching Discord stats:', error);
    return null;
  }
}
