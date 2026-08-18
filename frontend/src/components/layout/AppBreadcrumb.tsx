'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { BREADCRUMB_MAP } from '@/constants/routes';

// ============================================================
// AppBreadcrumb
// Auto-generates breadcrumbs from the current route path
// ============================================================

export default function AppBreadcrumb() {
  const pathname = usePathname();

  const buildBreadcrumbItems = () => {
    const items: { title: React.ReactNode; key: string }[] = [
      {
        key: 'home',
        title: (
          <Link href="/dashboard">
            <HomeOutlined />
          </Link>
        ),
      },
    ];

    if (pathname === '/dashboard') {
      items.push({
        key: 'dashboard',
        title: 'Dashboard',
      });
      return items;
    }

    const segments = pathname.split('/').filter(Boolean);
    let currentPath = '';

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = BREADCRUMB_MAP[currentPath];
      const isLast = index === segments.length - 1;

      if (label) {
        items.push({
          key: currentPath,
          title: isLast ? label : <Link href={currentPath}>{label}</Link>,
        });
      } else {
        // Dynamic segment (ID) — skip or show as detail
        if (!isLast) return;
        // Check if parent path has a label
        const parentPath = '/' + segments.slice(0, index).join('/');
        const parentLabel = BREADCRUMB_MAP[parentPath];
        if (parentLabel) {
          items.push({
            key: currentPath,
            title: 'Detail',
          });
        }
      }
    });

    return items;
  };

  return (
    <Breadcrumb
      items={buildBreadcrumbItems()}
      style={{ marginBottom: 16 }}
    />
  );
}
