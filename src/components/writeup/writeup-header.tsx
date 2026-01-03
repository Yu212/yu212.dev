type WriteupHeaderProps = {
  title?: string;
  subtitle?: string;
};

export default function WriteupHeader({ title = "Writeups", subtitle }: WriteupHeaderProps) {
  return (
    <div className="w-full h-40 bg-[#95caee] flex items-center justify-center">
      <div className="text-center space-y-1">
        <h1 className="text-3xl md:text-4xl text-white font-bold">{title}</h1>
        {subtitle && <p className="text-sm md:text-base text-white/90">{subtitle}</p>}
      </div>
    </div>
  );
}
