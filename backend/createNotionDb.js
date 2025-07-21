require('dotenv').config();
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });

(async () => {
  const response = await notion.databases.create({
    parent: {
      type: 'page_id',
      page_id: process.env.NOTION_PARENT_PAGE_ID, // Set this in your .env
    },
    title: [
      {
        type: 'text',
        text: {
          content: 'SpySage Changes',
        },
      },
    ],
    properties: {
      Name: { title: {} },
      Summary: { rich_text: {} },
      Competitor: { rich_text: {} },
      Details: { rich_text: {} },
      URL: { url: {} },
      Detected: { date: {} },
      Type: { rich_text: {} },
      Impact: { rich_text: {} },
      Tags: { multi_select: {} },
    },
  });
  console.log('New Notion database created:', response.id);
})(); 