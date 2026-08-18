'use client';

import React, { useState } from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export default function SizeGuideModal({ isOpen, onClose, category = 'Men' }: SizeGuideModalProps) {
  const [unit, setUnit] = useState<'in' | 'cm'>('in');
  const [selectedGender, setSelectedGender] = useState<'men' | 'women' | 'kids'>(
    category.toLowerCase().includes('women')
      ? 'women'
      : category.toLowerCase().includes('child') || category.toLowerCase().includes('kid')
      ? 'kids'
      : 'men'
  );

  if (!isOpen) return null;

  const sizeData = {
    men: [
      { size: 'S', chest: unit === 'in' ? '36 - 38' : '91 - 96', waist: unit === 'in' ? '29 - 31' : '74 - 79', hip: unit === 'in' ? '35 - 37' : '89 - 94' },
      { size: 'M', chest: unit === 'in' ? '38 - 40' : '96 - 101', waist: unit === 'in' ? '32 - 34' : '81 - 86', hip: unit === 'in' ? '38 - 40' : '96 - 101' },
      { size: 'L', chest: unit === 'in' ? '41 - 43' : '104 - 109', waist: unit === 'in' ? '35 - 37' : '89 - 94', hip: unit === 'in' ? '41 - 43' : '104 - 109' },
      { size: 'XL', chest: unit === 'in' ? '44 - 46' : '112 - 117', waist: unit === 'in' ? '38 - 40' : '96 - 101', hip: unit === 'in' ? '44 - 46' : '112 - 117' },
      { size: 'XXL', chest: unit === 'in' ? '47 - 49' : '119 - 124', waist: unit === 'in' ? '41 - 43' : '104 - 109', hip: unit === 'in' ? '47 - 49' : '119 - 124' },
    ],
    women: [
      { size: 'XS', chest: unit === 'in' ? '31 - 32' : '78 - 82', waist: unit === 'in' ? '24 - 25' : '61 - 64', hip: unit === 'in' ? '34 - 35' : '86 - 89' },
      { size: 'S', chest: unit === 'in' ? '33 - 35' : '84 - 89', waist: unit === 'in' ? '26 - 27' : '66 - 69', hip: unit === 'in' ? '36 - 37' : '91 - 94' },
      { size: 'M', chest: unit === 'in' ? '36 - 37' : '91 - 94', waist: unit === 'in' ? '28 - 29' : '71 - 74', hip: unit === 'in' ? '38 - 39' : '96 - 99' },
      { size: 'L', chest: unit === 'in' ? '38 - 40' : '96 - 102', waist: unit === 'in' ? '30 - 32' : '76 - 81', hip: unit === 'in' ? '40 - 42' : '102 - 107' },
      { size: 'XL', chest: unit === 'in' ? '41 - 43' : '104 - 109', waist: unit === 'in' ? '33 - 35' : '84 - 89', hip: unit === 'in' ? '43 - 45' : '109 - 114' },
    ],
    kids: [
      { size: '4Y', chest: unit === 'in' ? '22 - 23' : '56 - 58', waist: unit === 'in' ? '21 - 22' : '53 - 56', hip: unit === 'in' ? '23 - 24' : '58 - 61' },
      { size: '6Y', chest: unit === 'in' ? '24 - 25' : '61 - 63', waist: unit === 'in' ? '22 - 23' : '56 - 58', hip: unit === 'in' ? '25 - 26' : '63 - 66' },
      { size: '8Y', chest: unit === 'in' ? '26 - 27' : '66 - 69', waist: unit === 'in' ? '23 - 24' : '58 - 61', hip: unit === 'in' ? '27 - 28' : '68 - 71' },
      { size: '10Y', chest: unit === 'in' ? '28 - 29' : '71 - 74', waist: unit === 'in' ? '24 - 25' : '61 - 64', hip: unit === 'in' ? '29 - 30' : '74 - 76' },
      { size: '12Y', chest: unit === 'in' ? '30 - 31' : '76 - 79', waist: unit === 'in' ? '25 - 26' : '64 - 66', hip: unit === 'in' ? '31 - 32' : '79 - 81' },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-zinc-800" />
            <h3 className="text-sm font-bold text-zinc-900">Size Guide</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gender Tabs & Unit Switcher */}
        <div className="flex items-center justify-between px-5 py-3 bg-zinc-50 border-b border-zinc-200 text-xs">
          <div className="flex gap-1">
            {(['men', 'women', 'kids'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGender(g)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition ${
                  selectedGender === g
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white text-zinc-600 border border-zinc-300 hover:bg-zinc-100'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="flex border border-zinc-300 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => setUnit('in')}
              className={`px-2.5 py-1 font-semibold ${
                unit === 'in' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              IN
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-2.5 py-1 font-semibold ${
                unit === 'cm' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              CM
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="p-5 overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 font-semibold">
                <th className="pb-2">Size</th>
                <th className="pb-2">Chest ({unit})</th>
                <th className="pb-2">Waist ({unit})</th>
                <th className="pb-2">Hip ({unit})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium text-zinc-800">
              {sizeData[selectedGender].map((row) => (
                <tr key={row.size} className="hover:bg-zinc-50">
                  <td className="py-2.5 font-bold text-zinc-900">{row.size}</td>
                  <td className="py-2.5">{row.chest}</td>
                  <td className="py-2.5">{row.waist}</td>
                  <td className="py-2.5">{row.hip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
