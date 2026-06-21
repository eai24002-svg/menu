export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="max-w-lg mx-auto relative">{children}</div>;
}
