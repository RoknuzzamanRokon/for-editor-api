export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-2 gap-12 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2">
            <div className="mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-3xl font-bold">sync_alt</span>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                ConvertPro <span className="text-primary">API</span>
              </span>
            </div>
            <p className="mb-6 max-w-xs text-slate-500">
              The world&apos;s most reliable file conversion infrastructure for developers.
            </p>
            <div className="flex gap-4">
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-primary hover:text-white">
                <span className="material-symbols-outlined text-sm">terminal</span>
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-primary hover:text-white">
                <span className="material-symbols-outlined text-sm">code</span>
              </button>
            </div>
          </div>
          <div>
            <h5 className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-900">Product</h5>
            <ul className="space-y-4 text-sm text-slate-500">
              <li>
                <a className="hover:text-primary" href="/#features">
                  Features
                </a>
              </li>
              <li>
                <a className="hover:text-primary" href="/pricing">
                  Pricing
                </a>
              </li>
              <li>
                <a className="hover:text-primary" href="/docs">
                  API Reference
                </a>
              </li>
              <li>
                <a className="hover:text-primary" href="#">
                  Changelog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-900">Resources</h5>
            <ul className="space-y-4 text-sm text-slate-500">
              <li>
                <a className="hover:text-primary" href="/docs">
                  Documentation
                </a>
              </li>
              <li>
                <a className="hover:text-primary" href="#">
                  API Status
                </a>
              </li>
              <li>
                <a className="hover:text-primary" href="#">
                  GitHub
                </a>
              </li>
              <li>
                <a className="hover:text-primary" href="#">
                  Community
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-900">Company</h5>
            <ul className="space-y-4 text-sm text-slate-500">
              <li>
                <a className="hover:text-primary" href="#">
                  About Us
                </a>
              </li>
              <li>
                <a className="hover:text-primary" href="#">
                  Contact
                </a>
              </li>
              <li>
                <a className="hover:text-primary" href="#">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a className="hover:text-primary" href="#">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 text-sm text-slate-400 md:flex-row">
          <p>© {new Date().getFullYear()} ConvertPro API Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="transition-colors hover:text-slate-600" href="#">
              Cookie Policy
            </a>
            <a className="transition-colors hover:text-slate-600" href="#">
              Security
            </a>
            <a className="transition-colors hover:text-slate-600" href="#">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
