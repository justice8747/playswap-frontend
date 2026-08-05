const PlaySwapLogo = ({ className = 'h-9 w-auto' }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="swapGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1DB954" />
        <stop offset="100%" stopColor="#FF0000" />
      </linearGradient>
    </defs>
    {/* The main play triangle body with the gradient */}
    <path d="M8 6L34 20L8 34V6Z" fill="url(#swapGradient)" className="drop-shadow-lg" />
    {/* The subtle 'S' curve cut-out suggesting "Swap" */}
    <path
      d="M14 15C18 15 17 25 21 25"
      stroke="#0D0D0D"
      strokeWidth="3"
      strokeLinecap="round"
      className="opacity-80"
    />
  </svg>
);

const Footer = () => (
  <footer className="bg-black py-12 border-t border-gray-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
      <div className="flex items-center mb-4 md:mb-0 gap-3">
        {/* NEW LOGO APPLIED HERE */}
        <PlaySwapLogo className="h-8 w-auto grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" />
        <span className="font-bold text-lg text-white">PlaySwap</span>
      </div>
      <div className="flex space-x-8 text-sm text-gray-500">
        <a href="#" className="hover:text-white">
          Privacy
        </a>
        <a href="#" className="hover:text-white">
          Terms
        </a>
        <a href="#" className="hover:text-white">
          Contact
        </a>
      </div>
      <div className="mt-4 md:mt-0 text-gray-600 text-sm">
        © 2025 PlaySwap. Not affiliated with Spotify or Google.
      </div>
    </div>
  </footer>
);
export default Footer;
