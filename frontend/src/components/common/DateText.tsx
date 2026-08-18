'use client';

import React from 'react';
import { Tooltip } from 'antd';
import { formatDate, formatDateTime } from '@/utils/format';

// ============================================================
// DateText
// Formatted date display with full datetime tooltip
// ============================================================

interface DateTextProps {
  date: string | Date;
  showTime?: boolean;
  showTooltip?: boolean;
}

export default function DateText({
  date,
  showTime = false,
  showTooltip = true,
}: DateTextProps) {
  const display = showTime ? formatDateTime(date) : formatDate(date);
  const tooltip = formatDateTime(date);

  if (showTooltip && !showTime) {
    return <Tooltip title={tooltip}>{display}</Tooltip>;
  }

  return <span>{display}</span>;
}
