type ModalProps = {
  open?: boolean;
  title: string;
  description?: string;
};

export default function Modal({
  open = false,
  title,
  description,
}: ModalProps) {
  return (
    <div
      aria-hidden={!open}
      className={
        open
          ? "fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          : "hidden"
      }
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm text-neutral-600">{description}</p>
        ) : null}
      </div>
    </div>
  );
}