import React, { useEffect, useState } from 'react';
import { Typography, Timeline, Button, message, Tag, Modal } from 'antd';
import { getChanges } from '../api';
import '../App.css'

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

function exportToCSV(changes) {
  const headers = ['Competitor', 'Summary', 'Type', 'Detected At', 'Impact', 'Tags', 'URL'];
  const rows = changes.map(c => [
    c.competitor?.name || '',
    c.summary || '',
    c.type || '',
    c.detectedAt ? new Date(c.detectedAt).toLocaleString() : '',
    c.impact || '',
    (c.tags || []).join(','),
    c.url || '',
  ]);
  const csvContent = [headers, ...rows].map(r => r.map(x => '"' + (x || '').replace(/"/g, '""') + '"').join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'changes_timeline.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function getScreenshotUrl(screenshotPath) {
  if (!screenshotPath) return '';
  const filename = screenshotPath.split(/[\\/]/).pop();
  return `https://spysage-backend.onrender.com/screenshots/${filename}`;
}

const categoryColors = {
  UI: 'blue',
  pricing: 'volcano',
  feature: 'green',
  performance: 'purple',
  other: 'default',
};

function TimelinePage() {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isMobile } = useResponsive();
  const [imageModal, setImageModal] = useState({ open: false, src: '', label: '' });

  useEffect(() => {
    getChanges().then((res) => {
      setChanges(res.sort((a, b) => new Date(b.detectedAt) - new Date(a.detectedAt)));
      setLoading(false);
    }).catch(() => {
      message.error('Failed to load changes');
      setLoading(false);
    });
  }, []);

  return (
    <div className="fade-in" style={{ color: 'white', padding: 24 }}>
      <Typography.Title level={2} style={{ marginBottom: 24,color:'white',textAlign:'center' }}>Change Timeline</Typography.Title>
      <Button 
        type="primary" 
        style={{ 
          marginBottom: 24,
          width: isMobile ? '100%' : 'auto'
        }} 
        onClick={() => exportToCSV(changes)}
        size={isMobile ? 'large' : 'middle'}
      >
        Export as CSV
      </Button>
      <Timeline
      style={{color:'white'}}
        mode={isMobile ? "left" : "left"}
        pending={loading ? 'Loading...' : false}
        items={changes.map(change => ({
          key: change._id,
          label: change.detectedAt ? new Date(change.detectedAt).toLocaleString() : '',
          children: (
            <div style={{ 
              padding: isMobile ? '8px 0' : '16px 0',
              fontSize: isMobile ? 14 : 16,
              color:'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Typography.Text strong style={{ fontSize: isMobile ? 16 : 18,color:'white' }}>
                  {change.competitor?.name || 'Unknown Competitor'}
                </Typography.Text>
                {change.category && (
                  <Tag  color={categoryColors[change.category] || 'default'} style={{ fontSize: 12,backgroundColor: categoryColors[change.category] || '#ccc', color: 'white' }}>
                    {change.category.charAt(0).toUpperCase() + change.category.slice(1)}
                  </Tag>
                )}
              </div>
              <Typography.Text style={{ 
                display: 'block',
                marginTop: isMobile ? 4 : 8,
                marginBottom: isMobile ? 4 : 8,
                color:'white'
              }}>
                {change.summary}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ 
                display: 'block',
                marginBottom: isMobile ? 4 : 8,
                color:'white'
              }}>
                {change.type}
              </Typography.Text>
              {change.url && (
                <a 
                  href={change.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'block',
                    marginTop: isMobile ? 4 : 8
                  }}
                >
                  View Source
                </a>
              )}
              {(change.beforeScreenshot || change.afterScreenshot) && (
                <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {change.beforeScreenshot && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 12, marginBottom: 4 }}>Before</div>
                      <img
                        src={getScreenshotUrl(change.beforeScreenshot)}
                        alt="Before"
                        style={{ maxWidth: 180, maxHeight: 120, border: '1px solid #eee', borderRadius: 4, cursor: 'pointer' }}
                        onClick={() => setImageModal({ open: true, src: getScreenshotUrl(change.beforeScreenshot), label: 'Before' })}
                      />
                    </div>
                  )}
                  {change.afterScreenshot && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 12, marginBottom: 4 }}>After</div>
                      <img
                        src={getScreenshotUrl(change.afterScreenshot)}
                        alt="After"
                        style={{ maxWidth: 180, maxHeight: 120, border: '1px solid #eee', borderRadius: 4, cursor: 'pointer' }}
                        onClick={() => setImageModal({ open: true, src: getScreenshotUrl(change.afterScreenshot), label: 'After' })}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ),
        }))}
      />
      <Modal
        open={imageModal.open}
        footer={null}
        onCancel={() => setImageModal({ open: false, src: '', label: '' })}
        width={800}
        centered
      >
        <Typography.Title level={5} style={{ textAlign: 'center',color:'white' }}>{imageModal.label} Screenshot</Typography.Title>
        <img src={imageModal.src} alt={imageModal.label} style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }} />
      </Modal>
    </div>
  );
}

export default TimelinePage; 