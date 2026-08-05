const PrimaryButton = ({ text, onClick }) => (
  <button
    onClick={onClick}
    className="px-8 py-4 text-base font-bold rounded-full text-black bg-[#1DB954] hover:bg-[#1ed760] md:text-lg shadow-[0_0_30px_-5px_rgba(29,185,84,0.5)] transition-all hover:scale-105"
  >
    {text}
  </button>
);

export default PrimaryButton;
