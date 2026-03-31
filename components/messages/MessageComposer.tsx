'use client';

type MessageComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
};

export function MessageComposer({
  value,
  onChange,
  onSend,
  disabled,
  placeholder = 'Type a message...',
}: MessageComposerProps) {
  return (
    <div className="mt-3 flex gap-2 rounded-3xl bg-[#F3F4F6] p-2 shadow-md dark:bg-slate-800">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm outline-none dark:bg-slate-900 dark:text-white"
        placeholder={placeholder}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={onSend}
        disabled={disabled}
        className="spotly-button-primary rounded-2xl px-5 py-3 disabled:opacity-50"
      >
        Send
      </button>
    </div>
  );
}
