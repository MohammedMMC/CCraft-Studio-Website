export default function Button({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <button className={`cursor-pointer text-white text-lg bg-primary/85 py-3 px-5 border-l-white/35 border-t-white/35 border-b-white/25 border-r-white/25 border-4 text-shadow-primary text-shadow-[0_2px_red] shadow-primary shadow-[0_4px_0_0] transition-all duration-150 ease-in-out active:shadow-[0_0px_0_0] active:translate-y-1 ${className || ''}`}>
          {children}
        </button>
    );
}
