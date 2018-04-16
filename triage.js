const DEFAULTS = require('./settings.json'),
      i18n = require('i18n');

/**
 * Create a triage report
 *
 * @param {Object} payload - The Slack slash command payload
 * @param {Object[]} message - The Slack message history
 * @param {Object} options - (optional) settings overrides
 * @returns {Object} The Slack triage report message
 */
function create(payload, messages, options) {
  let settings = Object.assign({}, DEFAULTS, options);

  let map = getRequest.bind(null, settings);
  let sort = (a, b) => a.priority - b.priority;
  let filter = m => m.emoji && !m.bot;

  let requests = messages.map(map).filter(filter).sort(sort);
  let message = buildMessage(payload, requests, settings);

  return message;
}


/**
 * Get triage request details from a Slack message
 *
 * @param {Object} settings - The triage report settings
 * @param {Object} message - A Slack message
 * @returns {Object} A triage object
 */
function getRequest(settings, message) {
  // the emoji that was matched
  let test = new RegExp(settings.pending.emojis.join('|'));
  let match = message.text.match(test);
  let emoji = match ? match[0] : null;

  // flags based on reactions
  let reactions = (message.reactions || []).map(r => r.name);
  let addressed = settings.addressed.emojis.some(e => reactions.includes(e.replace(/:/g, '')));
  let review = settings.review.emojis.some(e => reactions.includes(e.replace(/:/g, ''))) && !addressed;
  let pending = emoji && !review && !addressed;

  let id = message.ts.replace('.', '');                       // deep link id
  let bot = message.subtype === 'bot_message';                // bot posts
  let priority = settings.pending.emojis.indexOf(emoji);      // display order

  return { bot, priority, emoji, review, addressed, pending, id, message };
}


/**
 * Build a Slack triage response
 *
 * @param {Object} settings - The triage report settings
 * @param {Object} payload - The Slack slash command payload
 * @param {Object[]} requests - The triage request details
 * @returns {Object} The Slack triage report message
 */
function buildMessage(payload, requests, settings) {
  let {channel_id, channel_name} = payload;
  let message = { unfurl_links: settings.unfurl_links };
  let publish_test = new RegExp(settings.publish_text, 'i');

  // build display text
  let map = buildSection.bind(null, settings, requests, payload);
  message.text = settings.display.map(map).join('\n\n\n');

  // attach instructions if not publish else make public
  let pending_emojis = settings.pending.emojis.join(', ');
  let review_emojis = settings.review.emojis.join(', ');
  let addressed_emojis = settings.addressed.emojis.join(', ');
  let help_text = [
    "I look at the last 1000 messages posted in this channel.",
    "I'll only review messages that have one of these reacji - {{pending_emojis}}.",
    "If a message has one of these reacji - {{review_emojis}} -  it's in progress.",
    "If it has one of these reacji - {{addressed_emojis}} - it's done. Otherwise it's still pending."
  ]
  let attachment = [
    {
      color: "#fff",
      text: "\n"
    },
    {
      mrkdwn_in: ["text", "pretext"],
      pretext: i18n.__("Here's how the *Triage Bot* works:"),
      text: i18n.__(help_text.join("\n"), { pending_emojis: pending_emojis, review_emojis: review_emojis, addressed_emojis: addressed_emojis})
    },
    {
      mrkdwn_in: ["pretext"],
      pretext: i18n.__("To publish this to the channel type `/triage publish`.")
    }
  ];
  if (publish_test.test(payload.text)) message.response_type = 'in_channel';
  else message.attachments = attachment;

  return message;
}


/**
 * Build a triage section's text
 *
 * @param {String} name - The section name
 * @param {Object} settings - The triage report settings
 * @param {Object[]} requests - The triage request details
 * @param {Object} payload - The Slack slash command payload
 * @returns {String} The section text
 */
function buildSection(settings, requests, payload, name) {
  let {channel_id, channel_name, team_domain} = payload;
  let baseUrl = `https://${team_domain}.slack.com/archives/${channel_name}/p`;

  let filtered = requests.filter(r => r[name]);                     // filtered list of requests
  let title = i18n.__(settings[name].title, {count: filtered.length, channel: '<#'+channel_id+'|'+channel_name+'>' }); // section title
  title = title.replace(/&lt;/g, `<`); // Lightweight encoding of HTML Entities
  title = title.replace(/&gt;/g, `>`); // Lightweight encoding of HTML Entities
  let items = filtered.map(r => `${r.emoji} ${baseUrl + r.id}`);  // section line item
  let text = [title].concat(items).join('\n');                      // combined text
  return text;
}


module.exports = create;
