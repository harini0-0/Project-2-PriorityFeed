const RANK = { Critical: 3, Important: 2, Normal: 1 };

// Returns the highest priority among all matching rules, or 'Normal' if none.
export function prioritize(message, rules) {
  let best = 'Normal';
  for (const rule of rules) {
    if (matches(message, rule) && RANK[rule.priority] > RANK[best]) {
      best = rule.priority;
    }
  }
  return best;
}

function matches(message, rule) {
  const value = (rule.value || '').toLowerCase();
  if (!value) return false;

  switch (rule.type) {
    case 'channel':
      return (message.channelName || '').toLowerCase() === value;
    case 'sender': {
      // Match the typed name (substring) or the raw Slack user ID.
      const id = value.replace(/[<@>]/g, '');
      return (
        (message.senderName || '').toLowerCase().includes(value) ||
        (message.senderId || '').toLowerCase() === id
      );
    }
    case 'keyword':
      return (message.text || '').toLowerCase().includes(value);
    default:
      return false;
  }
}
