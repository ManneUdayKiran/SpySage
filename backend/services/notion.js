const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

async function addChangeToNotion(change) {
  try {
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [
            {
              text: { content: change.summary || 'Change Detected' },
            },
          ],
        },
        Competitor: {
          rich_text: [
            {
              text: { content: change.competitor?.name || '' },
            },
          ],
        },
        Details: {
          rich_text: [
            {
              text: { content: change.details || '' },
            },
          ],
        },
        URL: {
          url: change.url || '',
        },
        Detected: {
          date: {
            start: change.detectedAt ? new Date(change.detectedAt).toISOString() : new Date().toISOString(),
          },
        },
      },
    });
    console.log('Added change to Notion');
  } catch (err) {
    console.error('Notion API error:', err.message);
  }
}

module.exports = { addChangeToNotion }; 