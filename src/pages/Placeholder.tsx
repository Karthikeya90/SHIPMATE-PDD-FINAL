export function Placeholder({ title }: {title: string;}) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
      <h2 className="text-2xl font-display font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground max-w-md">
        This page is currently under construction. Check back soon!
      </p>
    </div>);

}