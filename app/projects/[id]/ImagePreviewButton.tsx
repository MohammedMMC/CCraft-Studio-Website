import { useState } from "react";
import Button from "../../../components/Button";
import Image from "next/image";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    src: string;
};

export default function ImagePreviewButton({ src, ...props }: ButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className="px-1! py-1!"
                colors="bg-gray/90 shadow-gray"
                {...props}
            >
                <Image
                    src={src}
                    alt="Image"
                    width={640}
                    height={360}
                    className="pointer-events-none select-none rounded-xs aspect-video h-auto w-full object-cover"
                    loading="lazy"
                    unoptimized
                />
            </Button>
            
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
                >
                    <Image
                        src={src}
                        alt="Preview"
                        width={640}
                        height={360}
                        className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-xl"
                        loading="lazy"
                        unoptimized
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}