"use server";

export const getDiscordBotDetailsAction = async (
  DISCORD_APPLICATION_ID: string,
  DISCORD_API_TOKEN: string
): Promise<{ name: string; username: string } | null> => {
  // Validate inputs basic check
  if (!DISCORD_APPLICATION_ID || !DISCORD_API_TOKEN) {
    console.error("Missing Discord Application ID or API Token for Server Action.");
    return null;
  }

  try {
    const response = await fetch(`https://discord.com/api/v10/applications/${DISCORD_APPLICATION_ID}`, {
      headers: {
        'Accept': 'application/json', // Be more specific with Accept header
        'Authorization': `Bot ${DISCORD_API_TOKEN}`
      },
      // Using 'no-store' to prevent caching potentially sensitive/dynamic data
      cache: 'no-store'
    });

    // Check if the response status indicates success
    if (!response.ok) {
      // Log detailed error information
      const errorBody = await response.text(); // Read response body for more context
      console.error(`Error fetching Discord bot details: Status ${response.status}, Body: ${errorBody}`);
      return null;
    }

    const data = await response.json();
    console.log("Discord API Response (Server Action):", data); // Keep for debugging server-side logs

    // Ensure expected data structure
    if (data && typeof data.name === 'string') {
      return {
        name: data.name,
        // Determine username based on public status, default to name if public
        username: data.bot_public ? data.name : "Private Bot",
      };
    } else {
      console.error("Unexpected data structure received from Discord API:", data);
      return null; // Return null if data structure is not as expected
    }

  } catch (error) {
    console.error("Exception caught while fetching Discord bot details:", error);
    return null; // Return null on any exception during fetch/processing
  }
}; 