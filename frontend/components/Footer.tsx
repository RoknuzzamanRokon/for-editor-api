export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-foreground/70">
        <p>&copy; {new Date().getFullYear()} Converter</p>
      </div>
    </footer>
  )
}
