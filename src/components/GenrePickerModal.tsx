import { useState } from "react";
import { X, Sparkles, Check } from "lucide-react";

export const AVAILABLE_GENRES = [
  { id: "Fiction", label: "Fiction & Novels", icon: "📖" },
  { id: "Literature", label: "Classic Literature", icon: "🏛️" },
  { id: "Science", label: "Science & Nature", icon: "🔬" },
  { id: "Computers", label: "Tech & Computers", icon: "💻" },
  { id: "History", label: "History & Civilizations", icon: "📜" },
  { id: "Philosophy", label: "Philosophy & Thought", icon: "🧠" },
  { id: "Mythology", label: "Mythology & Folklore", icon: "⚡" },
  { id: "Poetry", label: "Poetry & Verse", icon: "🪶" },
  { id: "Film", label: "Cinema & Arts", icon: "🎬" },
  { id: "Geography", label: "Travel & Geography", icon: "🌍" },
];

interface GenrePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGenres: string[];
  onSave: (genres: string[]) => Promise<void>;
}

export default function GenrePickerModal({
  isOpen,
  onClose,
  selectedGenres,
  onSave,
}: GenrePickerModalProps) {
  const [selected, setSelected] = useState<string[]>(selectedGenres);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const toggleGenre = (genreId: string) => {
    if (selected.includes(genreId)) {
      setSelected(selected.filter((g) => g !== genreId));
    } else {
      setSelected([...selected, genreId]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(selected);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-indigo-400 mb-2">
          <Sparkles className="w-5 h-5" />
          <span className="text-xs uppercase tracking-wider font-semibold">Personalize Experience</span>
        </div>

        <h2 className="text-2xl font-bold mb-2">Choose Your Favorite Genres</h2>
        <p className="text-sm text-slate-400 mb-6">
          We will tailor your Daily Reads, Quizzes, and book recommendations to match your interests.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 mb-6 max-h-72 overflow-y-auto pr-1">
          {AVAILABLE_GENRES.map((g) => {
            const isSelected = selected.includes(g.id);
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => toggleGenre(g.id)}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
                  isSelected
                    ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{g.icon}</span>
                  <span className="text-sm font-medium">{g.label}</span>
                </div>
                {isSelected && (
                  <span className="bg-indigo-600 text-white rounded-full p-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || selected.length === 0}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            {saving ? "Saving..." : `Save Preferences (${selected.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
