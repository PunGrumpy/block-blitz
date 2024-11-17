export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex h-14 items-center justify-between py-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Block Blitz. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
