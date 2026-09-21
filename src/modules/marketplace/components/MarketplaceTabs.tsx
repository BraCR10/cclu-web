'use client';

import { useState } from 'react';
import { ListingList } from './ListingList';
import { PromotionList } from './PromotionList';

const TABS = [
  { view: 'products', label: 'Productos y servicios' },
  { view: 'promotions', label: 'Promociones' },
] as const;

type MarketplaceView = (typeof TABS)[number]['view'];

// Two catalogs under one roof, as the ERS frames the Marketplace. Discounts
// are deliberately absent: that catalog belongs to signed-in affiliates.
export function MarketplaceTabs() {
  const [view, setView] = useState<MarketplaceView>('products');

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" aria-label="Secciones del marketplace" className="flex gap-2">
        {TABS.map((tab) => {
          const selected = tab.view === view;

          return (
            <button
              key={tab.view}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setView(tab.view)}
              className={`rounded-pill px-4 py-2 text-sm font-medium transition-colors ${
                selected
                  ? 'bg-brand text-on-brand'
                  : 'border border-border text-content-muted hover:border-content-muted'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {view === 'products' ? <ListingList /> : <PromotionList />}
    </div>
  );
}
