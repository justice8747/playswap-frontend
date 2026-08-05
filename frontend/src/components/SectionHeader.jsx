const SectionHeader = ({ title, subtitle, description }) => (
  <div className="text-center mb-16 px-4">
    <h2 className="text-base font-semibold text-[#1DB954] tracking-wide uppercase">{title}</h2>
    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
      {subtitle}
    </p>
    {description && (
      <p className="mt-4 max-w-2xl text-xl text-gray-400 lg:mx-auto">{description}</p>
    )}
  </div>
);
export default SectionHeader;
