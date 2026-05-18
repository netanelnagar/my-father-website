'use client';

import { AdminTabKey } from '@/types';

type Props = {
  activeTab: AdminTabKey;
  onChange: (tab: AdminTabKey) => void;
};

const tabs: { key: AdminTabKey; label: string }[] = [
  { key: 'reviews', label: 'ביקורות' },
  { key: 'upload-review', label: 'העלאת ביקורת' },
  { key: 'gallery', label: 'גלריית תמונות' },
  { key: 'pending-gallery', label: 'תמונות ממתינות' },
];

export function TabsNav({ activeTab, onChange }: Props) {
  return (
    <div className="mt-10 border-b border-[#dbe2e6] mx-auto w-full max-w-[960px]">
      <div className="flex gap-6 px-4 sm:px-6 overflow-x-auto">
        {tabs.map((t) => {
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              className={`flex flex-col items-center justify-center pb-[13px] pt-4 border-b-[3px] ${
                active ? 'border-b-[#111618] text-[#111618]' : 'border-b-transparent text-[#617c89]'
              } text-sm font-bold leading-normal tracking-[0.015em]`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}