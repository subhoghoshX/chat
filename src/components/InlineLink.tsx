interface Props {
  href: string;
  children: React.ReactNode;
}

export default function InlineLink({ href, children }: Props) {
  return (
    <a href={href} target="_blank" className="text-[var(--primary)] underline" rel="noopener noreferrer">
      {children}
    </a>
  );
}
