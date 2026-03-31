'use client';

const defaultFilters = ['All', 'Quiet', 'Cafes', 'Libraries', 'Outdoor', '24hr', 'WiFi', 'Outlets'];

export function SpotFilters({
  selected,
  onSelect,
  filters = defaultFilters,
}: {
  selected: string;
  onSelect: (filter: string) => void;
  filters?: string[];
}) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-1">
      {filters.map((filter) => {
        const isActive = selected === filter;
        return (
          <button
            key={filter}
            type="button"
            onClick={() => onSelect(filter)}
            className={`spotly-chip whitespace-nowrap ${
              isActive
                ? 'bg-[#2563EB] text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
