// src/components/ui/Header.jsx
export default function Header({ title, showBack, onBack }) {
  return (
    <div className="glass-header sticky top-0 md:top-20 z-40 px-4 md:px-8 py-4 md:py-6 flex items-center border-b border-gray-100 mb-6">
      {showBack && (
        <button
          onClick={onBack}
          className="mr-4 text-[#EA1D2C] p-2 bg-red-50 rounded-full hover:bg-red-100 transition-colors"
        >
          <i className="ph-bold ph-arrow-left text-xl" />
        </button>
      )}
      <h1 className="font-extrabold text-2xl text-[#1F2937] flex-1">{title}</h1>
    </div>
  );
}
