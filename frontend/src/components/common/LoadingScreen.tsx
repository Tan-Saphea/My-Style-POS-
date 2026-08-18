'use client';

import React from 'react';
import { Spin } from 'antd';

// ============================================================
// LoadingScreen
// Full-page loading indicator
// ============================================================

interface LoadingScreenProps {
  tip?: string;
}

export default function LoadingScreen({ tip = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="loading-screen">
      <Spin size="large" description={tip}>
        <div style={{ padding: 50 }} />
      </Spin>
    </div>
  );
}
