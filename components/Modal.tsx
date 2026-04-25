type ModalProps = {
  open?: boolean;
  close?: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export default function Modal({
  open = false,
  close = () => { },
  title,
  description,
  children,
}: ModalProps) {
  return (
    <div
      aria-hidden={!open}
      onClick={close}
      className={
        open
          ? "fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          : "hidden"
      }
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl cardcb bg-gray! flex flex-col gap-4 p-4"
      >
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {description && (
          <p className="text-sm text-white/90">{description}</p>
        )}

        {children}
      </div>
    </div>
  );
}