import React, { useEffect, useState } from 'react';
import { Typography, Table, Tag, Input, Select, Space, Button, Modal } from 'antd';
import { getChanges } from '../api';

function Changes() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState([]);
  const [diffModal, setDiffModal] = useState({ open: false, diff: '', summary: '' });

  useEffect(() => {
    getChanges().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  // Collect all unique tags for filter options
  const allTags = Array.from(new Set(data.flatMap(item => item.tags || [])));

  const filteredData = data.filter(item => {
    const term = search.toLowerCase();
    const matchesSearch =
      (item.summary && item.summary.toLowerCase().includes(term)) ||
      (item.competitor && item.competitor.name && item.competitor.name.toLowerCase().includes(term));
    const matchesTags = tagFilter.length === 0 || (item.tags && tagFilter.every(tag => item.tags.includes(tag)));
    return matchesSearch && matchesTags;
  });

  const columns = [
    { title: 'Competitor', dataIndex: ['competitor', 'name'], key: 'competitor', render: (name) => name || '-' },
    { title: 'Summary', dataIndex: 'summary', key: 'summary' },
    { title: 'Type', dataIndex: 'type', key: 'type', render: (type) => type ? <Tag color="blue">{type}</Tag> : '-' },
    { title: 'URL', dataIndex: 'url', key: 'url',
      render: (url) => url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            maxWidth: 140,
            minWidth: 100,
            wordBreak: 'break-all',
            whiteSpace: 'pre-wrap',
            verticalAlign: 'top',
          }}
        >
          {url}
        </a>
      ) : '-' ,
      width: 160,
    },
    { title: 'Detected At', dataIndex: 'detectedAt', key: 'detectedAt', render: (date) => date ? new Date(date).toLocaleString() : '-' },
    { title: 'Impact', dataIndex: 'impact', key: 'impact' },
    { title: 'Tags', dataIndex: 'tags', key: 'tags', render: (tags) => tags && tags.length ? tags.map(tag => <Tag key={tag}>{tag}</Tag>) : '-' },
    { title: 'Actions', key: 'actions', render: (_, record) => (
      <Button size="small" onClick={() => setDiffModal({ open: true, diff: record.diff && record.diff.text ? record.diff.text : 'No diff available.', summary: record.summary })}>
        View Diff
      </Button>
    ) },
  ];

  return (
    <div className="fade-in glass-card" style={{ color: 'white', padding: 24 }}>
      <Typography.Title level={2} style={{ marginBottom: 24 }}>Changes</Typography.Title>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search by summary or competitor"
          allowClear
          style={{ width: 300 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Select
          mode="multiple"
          allowClear
          placeholder="Filter by tag"
          style={{ minWidth: 200 }}
          value={tagFilter}
          onChange={setTagFilter}
          options={allTags.map(tag => ({ value: tag, label: tag }))}
        />
      </Space>
      <Table columns={columns} dataSource={filteredData.slice().reverse()} rowKey="_id" loading={loading} pagination={false} />
      <Modal
        title={`Change Diff`}
        open={diffModal.open}
        onCancel={() => setDiffModal({ open: false, diff: '', summary: '' })}
        footer={null}
      >
        <Typography.Paragraph strong>Summary:</Typography.Paragraph>
        <Typography.Paragraph>{diffModal.summary}</Typography.Paragraph>
        <Typography.Paragraph strong>Diff:</Typography.Paragraph>
        <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, maxHeight: 400, overflow: 'auto' }}>
          {diffModal.diff.split('\n').map((line, idx) => {
            let color = undefined;
            if (line.startsWith('+')) color = 'green';
            if (line.startsWith('-')) color = 'red';
            return (
              <span key={idx} style={{ color }}>
                {line}
                {'\n'}
              </span>
            );
          })}
        </pre>
      </Modal>
    </div>
  );
}

export default Changes; 