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
    case 'sender':
      return (message.senderName || '').toLowerCase().includes(value);
    case 'keyword':
      return (message.text || '').toLowerCase().includes(value);
    default:
      return false;
  }
}
