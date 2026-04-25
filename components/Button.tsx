import Link from "next/link";


type BaseProps = {
    children: React.ReactNode;
    className?: string;
    colors?: string;
};

type ButtonAsButton = BaseProps &
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
        href?: undefined;
    };

type ButtonAsLink = BaseProps & {
    href: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export default function Button({
    children,
    className,
    colors,
    ...props
}: ButtonAsButton | ButtonAsLink) {

    const classes = `
                cursor-pointer py-3 px-5 text-white text-lg border-4
                text-shadow-[0_2px] shadow-[0_4px_0_0]
                ${colors || 'bg-primary/85 text-shadow-primary shadow-primary'}
                border-l-white/35 border-t-white/35
                border-b-white/25 border-r-white/25
                transition-all duration-150 ease-in-out
                active:shadow-[0_0px_0_0] active:translate-y-1
                flex flex-row gap-3 items-center
                disabled:grayscale-25 disabled:opacity-70 disabled:cursor-not-allowed
                ${className || ''}
            `;

    if ("href" in props && props.href) return (
        <Link className={classes} {...(props as ButtonAsLink)}>
            {children}
        </Link>
    );

    return (
        <button className={classes} {...(props as ButtonAsButton)}>
            {children}
        </button>
    );
}