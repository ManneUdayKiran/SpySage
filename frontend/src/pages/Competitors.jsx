import React, { useEffect, useState } from 'react';
import { Typography, Button, Space, Table, Tag, Modal, Form, Input, Card } from 'antd';
import { PlusOutlined, EditOutlined, GlobalOutlined, LinkOutlined, DeleteOutlined } from '@ant-design/icons';
import { getCompetitors, createCompetitor, updateCompetitor, deleteCompetitor } from '../api';
import { message } from 'antd';

// Custom hook for responsive design
function useResponsive() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { isMobile };
}

function Competitors() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState('');
  const { isMobile } = useResponsive();

  const fetchData = () => {
    setLoading(true);
    getCompetitors().then((res) => {
      setData(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditing(record);
    form.setFieldsValue({ ...record, tags: record.tags?.join(', ') });
    setModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, tags: values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
      if (editing) {
        await updateCompetitor(editing._id, payload);
      } else {
        await createCompetitor(payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      // Validation error
    }
  };

  const handleDelete = async (record) => {
    if (window.confirm(`Are you sure you want to delete ${record.name}?`)) {
      try {
        await deleteCompetitor(record._id);
        message.success('Competitor deleted');
        fetchData();
      } catch (err) {
        message.error('Failed to delete competitor');
      }
    }
  };

  const filteredData = data.filter(item => {
    const term = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(term)))
    );
  });

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Website', dataIndex: 'website', key: 'website',
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
      ) : '-',
      width: 160,
    },
    { title: 'Changelog URL', dataIndex: 'changelogUrl', key: 'changelogUrl',
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
      ) : '-',
      width: 160,
    },
    { title: 'Tags', dataIndex: 'tags', key: 'tags', render: (tags) => tags && tags.length ? tags.map(tag => <Tag key={tag}>{tag}</Tag>) : '-' },
    { title: 'Actions', key: 'actions', render: (_, record) => (
      <span>
        <Button icon={<EditOutlined />} size="small" onClick={() => openEditModal(record)} style={{ marginRight: 8 }}>
          Edit
        </Button>
        {/* <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record)}>
          Delete
        </Button> */}
      </span>
    ) },
  ];

  const mobileColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Actions', key: 'actions', render: (_, record) => (
      <Button icon={<EditOutlined />} size="small" onClick={() => openEditModal(record)}>
        Edit
      </Button>
    ) },
  ];

  const renderMobileCard = (item) => (
    <Card 
      key={item._id} 
      style={{ marginBottom: 16 }}
      actions={[
        <Button icon={<EditOutlined />} size="small" onClick={() => openEditModal(item)}>
          Edit
        </Button>
      ]}
    >
      <Card.Meta
        title={item.name}
        description={
          <div>
            <div style={{ marginBottom: 8 }}>
              <GlobalOutlined style={{ marginRight: 8 }} />
              <a href={item.website} target="_blank" rel="noopener noreferrer">
                {item.website}
              </a>
            </div>
            {item.changelogUrl && (
              <div style={{ marginBottom: 8 }}>
                <LinkOutlined style={{ marginRight: 8 }} />
                <a href={item.changelogUrl} target="_blank" rel="noopener noreferrer">
                  Changelog
                </a>
              </div>
            )}
            {item.tags && item.tags.length > 0 && (
              <div>
                {item.tags.map(tag => (
                  <Tag key={tag} style={{ marginBottom: 4 }}>{tag}</Tag>
                ))}
              </div>
            )}
          </div>
        }
      />
    </Card>
  );

  return (
    <div className="fade-in glass-card" style={{ color: 'white', padding: 24 }}>
      <Space 
        direction={isMobile ? 'vertical' : 'horizontal'} 
        style={{ 
          width: '100%', 
          justifyContent: 'space-between', 
          marginBottom: 24,
          alignItems: isMobile ? 'stretch' : 'center'
        }}
      >
        <Typography.Title level={2} style={{ margin: 0 }}>Competitors</Typography.Title>
        <Button 
          icon={<PlusOutlined />} 
          type="primary" 
          onClick={openAddModal}
          size={isMobile ? 'large' : 'middle'}
          block={isMobile}
        >
          Add Competitor
        </Button>
      </Space>
      
      <Input.Search
        placeholder="Search by name or tag"
        allowClear
        style={{ 
          width: isMobile ? '100%' : 300, 
          marginBottom: 16 
        }}
        value={search}
        onChange={e => setSearch(e.target.value)}
        size={isMobile ? 'large' : 'middle'}
      />

      {isMobile ? (
        <div>
          {filteredData.map(renderMobileCard)}
        </div>
      ) : (
        <Table 
          columns={columns} 
          dataSource={filteredData} 
          rowKey="_id" 
          loading={loading} 
          pagination={false}
          scroll={{ x: 800 }}
        />
      )}

      <Modal
        title={editing ? 'Edit Competitor' : 'Add Competitor'}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        okText={editing ? 'Update' : 'Add'}
        width={isMobile ? '90%' : 520}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input size={isMobile ? 'large' : 'middle'} />
          </Form.Item>
          <Form.Item
            name="website"
            label="Website"
            rules={[{ required: true, message: 'Please enter a website' }]}
          >
            <Input size={isMobile ? 'large' : 'middle'} />
          </Form.Item>
          <Form.Item
            name="changelogUrl"
            label="Changelog URL"
          >
            <Input size={isMobile ? 'large' : 'middle'} />
          </Form.Item>
          <Form.Item
            name="tags"
            label="Tags (comma separated)"
          >
            <Input size={isMobile ? 'large' : 'middle'} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Competitors; 