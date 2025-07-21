const { WebClient } = require('@slack/web-api');

const slackToken = process.env.SLACK_BOT_TOKEN;
const channelId = process.env.SLACK_CHANNEL_ID;
const slackClient = new WebClient(slackToken);

async function sendChangeToSlack(change) {
  try {
    const message = `*Competitor:* ${change.competitor?.name || ''}\n*Summary:* ${change.summary}\n*Details:* ${change.details}\n*URL:* ${change.url}\n*Detected:* ${change.detectedAt ? new Date(change.detectedAt).toLocaleString() : ''}`;
    await slackClient.chat.postMessage({
      channel: channelId,
      text: message,
      mrkdwn: true,
    });
    console.log('Sent change to Slack');
  } catch (err) {
    console.error('Slack API error:', err.message);
  }
}

module.exports = { sendChangeToSlack }; 