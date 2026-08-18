'use client';

import React from 'react';
import Image from 'next/image';
import { Layout, Menu } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import type { MenuProps } from 'antd';
import { SIDEBAR_MENU } from '@/constants/routes';
import type { MenuItem } from '@/constants/routes';
import { useSidebarStore } from '@/lib/store/sidebar';
import { useAuthStore } from '@/lib/store/auth';
import { hasPermission } from '@/lib/auth/permissions';
import { UserRole } from '@/types/auth';

const { Sider } = Layout;

// ============================================================
// AppSidebar
// Collapsible sidebar with menu items filtered by role
// ============================================================

/**
 * Convert our MenuItem structure to Ant Design's menu item format,
 * dynamically filtered by the active user's role permissions.
 */
function buildMenuItems(items: MenuItem[], role: UserRole): MenuProps['items'] {
  return items
    .filter((item) => {
      if (!item.permission) return true;
      return hasPermission(role, item.permission);
    })
    .map((item) => {
      let filteredChildren: MenuItem[] | undefined = undefined;
      if (item.children) {
        filteredChildren = item.children.filter((child) => {
          if (!child.permission) return true;
          return hasPermission(role, child.permission);
        });
      }

      if (item.children && (!filteredChildren || filteredChildren.length === 0)) {
        return null;
      }

      return {
        key: item.path || item.key,
        icon: item.icon,
        label: item.label,
        children: filteredChildren ? buildMenuItems(filteredChildren, role) : undefined,
      };
    })
    .filter(Boolean) as MenuProps['items'];
}

/**
 * Find the menu key(s) that should be selected/opened for the current path.
 */
function getSelectedKeys(pathname: string): string[] {
  // Direct match
  const directMatch = SIDEBAR_MENU.flatMap((item) => {
    if (item.path === pathname) return [item.path];
    if (item.children) {
      return item.children
        .filter((child) => child.path === pathname)
        .map((child) => child.path || child.key);
    }
    return [];
  });

  if (directMatch.length > 0) return directMatch;

  // Prefix match for dynamic routes (e.g., /products/123)
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0) {
    return [`/${segments[0]}`];
  }

  return ['/dashboard'];
}

/**
 * Find which parent menu keys should be open for the current path.
 */
function getOpenKeys(pathname: string): string[] {
  const openKeys: string[] = [];

  SIDEBAR_MENU.forEach((item) => {
    if (item.children) {
      const hasMatch = item.children.some((child) => {
        if (child.path === pathname) return true;
        // Check prefix match
        const segments = pathname.split('/').filter(Boolean);
        if (segments.length > 0 && child.path === `/${segments[0]}`) return true;
        return false;
      });
      if (hasMatch) {
        openKeys.push(item.path || item.key);
      }
    }
  });

  return openKeys;
}

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed } = useSidebarStore();
  const { role } = useAuthStore();

  const menuItems = buildMenuItems(SIDEBAR_MENU, role);
  const selectedKeys = getSelectedKeys(pathname);
  const defaultOpenKeys = getOpenKeys(pathname);

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    router.push(key);
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={256}
      collapsedWidth={80}
      className="app-sidebar"
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div className="app-sidebar__logo">
        {collapsed ? (
          <span className="app-sidebar__logo-icon">MS</span>
        ) : (
          <div className="app-sidebar__logo-brand">
            <Image
              src="/logo.png"
              alt="My Style"
              width={140}
              height={40}
              style={{
                objectFit: 'contain',
                height: 32,
                width: 'auto',
                filter: 'brightness(0) invert(1)',
              }}
              priority
            />
          </div>
        )}
      </div>

      {/* Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        defaultOpenKeys={defaultOpenKeys}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
}
