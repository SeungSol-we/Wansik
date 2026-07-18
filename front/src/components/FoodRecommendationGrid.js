import { useState } from 'react';
import { FoodIcon } from '../assets/illustrations/FoodIcon';

// Tap a food to see why it's recommended — replaces a plain static row.
export function FoodRecommendationGrid({ items, dark = false }) {
  const [selectedLabel, setSelectedLabel] = useState(null);
  const selected = items.find((f) => f.label === selectedLabel);

  return (
    <div>
      <div className="food-grid">
        {items.map((f) => {
          const isSelected = f.label === selectedLabel;
          return (
            <button
              key={f.label}
              type="button"
              className="food-cell tap-target"
              onClick={() => setSelectedLabel(isSelected ? null : f.label)}
              style={{ cursor: 'pointer', font: 'inherit', color: 'inherit' }}
            >
              <div
                className="food-icon-badge"
                style={
                  isSelected
                    ? { borderColor: 'var(--purple-primary)', borderWidth: 2, boxShadow: '0 0 0 3px rgba(136,121,196,0.18)' }
                    : undefined
                }
              >
                <FoodIcon type={f.type} size={30} />
              </div>
              {f.label}
            </button>
          );
        })}
      </div>
      {selected ? (
        <p
          style={{
            marginTop: 10,
            fontSize: 12.5,
            lineHeight: 1.5,
            textAlign: 'center',
            color: dark ? 'var(--cream-text-dim)' : 'var(--ink-soft)',
          }}
        >
          <strong style={{ color: dark ? 'var(--white)' : 'var(--ink)' }}>{selected.label}</strong> — {selected.reason}
        </p>
      ) : (
        <p style={{ marginTop: 10, fontSize: 11.5, textAlign: 'center', color: dark ? 'var(--cream-text-dim)' : 'var(--ink-soft)', opacity: 0.8 }}>
          음식을 눌러보면 추천 이유를 볼 수 있어요
        </p>
      )}
    </div>
  );
}