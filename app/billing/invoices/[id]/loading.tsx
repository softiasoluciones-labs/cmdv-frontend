export default function Loading() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <div className="h-32 w-full bg-muted rounded animate-pulse" />
      <div className="h-64 w-full bg-muted rounded animate-pulse" />
    </div>
  );
}
