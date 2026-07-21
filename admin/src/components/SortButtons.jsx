// admin/src/components/SortButtons.jsx
// Up/down reorder buttons — no drag-and-drop library needed at this scale.

import { ChevronUp, ChevronDown } from 'lucide-react';

export default function SortButtons({ onUp, onDown, upDisabled, downDisabled }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <button type="button" className="icon-btn" onClick={onUp} disabled={upDisabled} aria-label="Move up">
        <ChevronUp size={15} />
      </button>
      <button type="button" className="icon-btn" onClick={onDown} disabled={downDisabled} aria-label="Move down">
        <ChevronDown size={15} />
      </button>
    </div>
  );
}
