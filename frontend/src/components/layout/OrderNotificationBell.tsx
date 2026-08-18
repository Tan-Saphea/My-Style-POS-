'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Empty, Popover, Space, Tag, Typography } from 'antd';
import {
  BellOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  PhoneOutlined,
  RightOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { salesService } from '@/services/resources.service';
import type { Sale } from '@/types/models';
import { formatDateTime } from '@/utils/format';
import { queryKeys } from '@/lib/query/client';

const { Text } = Typography;

export default function OrderNotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [readOrderIds, setReadOrderIds] = useState<Set<string>>(new Set());
  const prevOrderCountRef = useRef<number>(0);

  // Load read order IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mystyle_read_orders');
      if (stored) {
        setReadOrderIds(new Set(JSON.parse(stored)));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Poll for sales every 10 seconds sharing React Query cache
  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: queryKeys.sales.all,
    queryFn: () => salesService.list(),
    refetchInterval: 10000,
    staleTime: 5000,
  });

  // Filter only Online Orders (invoice starts with INV-ONLINE)
  const onlineOrders = useMemo(() => {
    return sales
      .filter((s) => s.invoiceNumber.startsWith('INV-ONLINE'))
      .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
  }, [sales]);

  // Audio / notification chime when a new online order is received
  useEffect(() => {
    if (prevOrderCountRef.current > 0 && onlineOrders.length > prevOrderCountRef.current) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } catch {
        // Audio playback error or blocked by browser policy
      }
    }
    prevOrderCountRef.current = onlineOrders.length;
  }, [onlineOrders.length]);

  // Calculate unread count
  const unreadOrders = useMemo(() => {
    return onlineOrders.filter((s) => !readOrderIds.has(s._id));
  }, [onlineOrders, readOrderIds]);

  const unreadCount = unreadOrders.length;

  const markAllAsRead = () => {
    const allIds = new Set(onlineOrders.map((s) => s._id));
    setReadOrderIds(allIds);
    try {
      localStorage.setItem('mystyle_read_orders', JSON.stringify(Array.from(allIds)));
    } catch {
      // Ignore storage errors
    }
  };

  const handleOrderClick = (order: Sale) => {
    const updated = new Set(readOrderIds);
    updated.add(order._id);
    setReadOrderIds(updated);
    try {
      localStorage.setItem('mystyle_read_orders', JSON.stringify(Array.from(updated)));
    } catch {
      // Ignore
    }
    setOpen(false);
    router.push(`/sales?search=${encodeURIComponent(order.invoiceNumber)}`);
  };

  const renderPaymentBadge = (method?: string, status?: string) => {
    if (method === 'aba_khqr') {
      return (
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '1px 6px',
            borderRadius: 4,
            backgroundColor: '#f0fdf4',
            color: '#15803d',
            border: '1px solid #bbf7d0',
          }}
        >
          ABA KHQR · PAID
        </span>
      );
    }
    if (method === 'cod') {
      return (
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '1px 6px',
            borderRadius: 4,
            backgroundColor: '#fff7ed',
            color: '#ea580c',
            border: '1px solid #fed7aa',
          }}
        >
          COD · UNPAID
        </span>
      );
    }
    return (
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          padding: '1px 6px',
          borderRadius: 4,
          backgroundColor: '#f4f4f5',
          color: '#3f3f46',
        }}
      >
        {status?.toUpperCase() || 'PAID'}
      </span>
    );
  };

  const popoverContent = (
    <div style={{ width: 380, maxWidth: '92vw' }}>
      {/* Popover Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 12,
          borderBottom: '1px solid #f0f0f0',
          marginBottom: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GlobalOutlined style={{ color: '#15803d', fontSize: 13 }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#09090b', lineHeight: 1.2 }}>
              Online Store Orders
            </div>
            <div style={{ fontSize: 10, color: '#71717a' }}>Live web storefront orders</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {unreadCount > 0 && (
            <span
              style={{
                backgroundColor: '#ea580c',
                color: '#ffffff',
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 10,
              }}
            >
              {unreadCount} new
            </span>
          )}
          {unreadCount > 0 && (
            <Button
              type="link"
              size="small"
              onClick={markAllAsRead}
              style={{ fontSize: 11, padding: 0, color: '#15803d', fontWeight: 600 }}
            >
              Mark read
            </Button>
          )}
        </div>
      </div>

      {/* Orders List */}
      {onlineOrders.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No online orders received yet"
          style={{ margin: '24px 0' }}
        />
      ) : (
        <div style={{ maxHeight: 390, overflowY: 'auto', paddingRight: 4 }}>
          {onlineOrders.slice(0, 8).map((order) => {
            const isUnread = !readOrderIds.has(order._id);
            const customerName = order.customer?.name || 'Online Customer';
            const customerPhone = order.customer?.phone;
            const itemCount = order.items.reduce((sum, it) => sum + it.quantity, 0);

            return (
              <div
                key={order._id}
                onClick={() => handleOrderClick(order)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  marginBottom: 8,
                  cursor: 'pointer',
                  backgroundColor: isUnread ? '#f0fdf4' : '#fafafa',
                  border: isUnread ? '1px solid #bbf7d0' : '1px solid #f0f0f0',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#15803d';
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isUnread ? '#bbf7d0' : '#f0f0f0';
                  e.currentTarget.style.backgroundColor = isUnread ? '#f0fdf4' : '#fafafa';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {isUnread && (
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: '#15803d',
                          display: 'inline-block',
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#09090b' }}>
                      {customerName}
                    </span>
                  </div>
                  <span style={{ color: '#15803d', fontWeight: 800, fontSize: 13 }}>
                    ${order.grandTotal.toFixed(2)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#52525b' }}>
                  <span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#09090b' }}>
                      {order.invoiceNumber}
                    </span>{' '}
                    • {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </span>
                  {renderPaymentBadge(order.paymentMethod, order.paymentStatus)}
                </div>

                {customerPhone && (
                  <div style={{ fontSize: 11, color: '#71717a', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>
                      <PhoneOutlined style={{ marginRight: 4 }} />
                      {customerPhone}
                    </span>
                    <span>{formatDateTime(order.saleDate)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Popover Footer */}
      <div style={{ paddingTop: 8, borderTop: '1px solid #f0f0f0', textAlign: 'center', marginTop: 8 }}>
        <Button
          type="link"
          block
          onClick={() => {
            setOpen(false);
            router.push('/sales');
          }}
          style={{ color: '#09090b', fontWeight: 600, fontSize: 12, padding: '4px 0' }}
        >
          View All Orders in Sales Center <RightOutlined style={{ fontSize: 9 }} />
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      content={popoverContent}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      arrow={{ pointAtCenter: true }}
    >
      <Badge
        count={unreadCount}
        overflowCount={99}
        offset={[-4, 4]}
        styles={{ root: { cursor: 'pointer' } }}
      >
        <Button
          type="text"
          shape="circle"
          icon={<BellOutlined style={{ fontSize: 18, color: unreadCount > 0 ? '#15803d' : '#262626' }} />}
          style={{
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: unreadCount > 0 ? '#f0fdf4' : '#fafafa',
            border: unreadCount > 0 ? '1px solid #bbf7d0' : '1px solid #f0f0f0',
            transition: 'all 0.2s',
          }}
          title={unreadCount > 0 ? `${unreadCount} New Online Orders` : 'Notifications'}
        />
      </Badge>
    </Popover>
  );
}
