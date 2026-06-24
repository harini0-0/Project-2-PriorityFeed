import { WebClient } from '@slack/web-api';

const client = new WebClient(process.env.SLACK_TOKEN);

// Channels the authenticated user is a member of.
export async function listChannels() {
  const res = await client.users.conversations({
    types: 'public_channel,private_channel',
    exclude_archived: true,
    limit: 200,
  });
  return res.channels.map((c) => ({ id: c.id, name: c.name }));
}

// Builds a Slack userId -> display name lookup.
async function buildUserMap() {
  const res = await client.users.list({ limit: 200 });
  const map = {};
  for (const u of res.members) {
    map[u.id] = u.profile?.real_name || u.name || u.id;
  }
  return map;
}

// Fetch recent messages from each channel, with sender names resolved.
export async function fetchRecentMessages(perChannel = 30) {
  const channels = await listChannels();
  const users = await buildUserMap();
  const messages = [];

  for (const channel of channels) {
    let history;
    try {
      history = await client.conversations.history({
        channel: channel.id,
        limit: perChannel,
      });
    } catch {
      continue; // skip channels we can't read
    }

    for (const m of history.messages) {
      if (m.subtype || !m.text) continue; // skip joins/bots/system messages
      messages.push({
        channelId: channel.id,
        channelName: channel.name,
        senderName: users[m.user] || m.user || 'Unknown',
        text: m.text,
        ts: m.ts,
        tsDate: new Date(Number(m.ts) * 1000),
      });
    }
  }
  return messages;
}
