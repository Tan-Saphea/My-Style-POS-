'use client';

import React from 'react';
import { formatCurrency } from '@/utils/format';

// ============================================================
// CurrencyText
// Formatted currency display component
// ============================================================

interface CurrencyTextProps {
  amount: number;
  currency?: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function CurrencyText({
  amount,
  currency = 'USD',
  style,
  className,
}: CurrencyTextProps) {
  return (
    <span className={className} style={style}>
      {formatCurrency(amount, currency)}
    </span>
  );
}
