export type ButtonProps = {
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={`flex items-center justify-center rounded-lg bg-mirage-700 p-2 px-4 shadow-sm transition-colors hover:bg-mirage-600 active:bg-mirage-800 ${
        className ?? ""
      }`}
    >
      {children}
    </button>
  );
}
