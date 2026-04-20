export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground">This page is coming soon.</p>
    </div>
  );
}
