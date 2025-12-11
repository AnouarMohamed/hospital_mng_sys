import { Link, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-slate-800">MediFlow</h1>
          <p className="text-sm text-slate-500 mt-1">Medical Flow System</p>
        </div>

        <nav className="space-y-1" aria-label="Primary">
          <Link
            to="/"
            className="flex items-center gap-3 p-3 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200">
              📋
            </div>
            <span className="font-medium">Reception</span>
          </Link>

          <Link
            to="/doctor"
            className="flex items-center gap-3 p-3 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-emerald-200 group-hover:text-emerald-600">
              🩺
            </div>
            <span className="font-medium">Doctor View</span>
          </Link>

          <Link
            to="/kiosk"
            className="flex items-center gap-3 p-3 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-emerald-200 group-hover:text-emerald-600">
              📺
            </div>
            <span className="font-medium">Kiosk Display</span>
          </Link>
          
          <Link
            to="/patients"
            className="flex items-center gap-3 p-3 rounded-lg text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-emerald-200 group-hover:text-emerald-600">
              🏥
            </div>
            <span className="font-medium">Patient History</span>
          </Link>
        </nav>

        {/* Footer / Status */}
        <div className="mt-auto">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-medium text-slate-700">System Online</span>
            </div>
            <div className="text-xs text-slate-500">v1.0.0 • All systems normal</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-50">
        <div className="max-w-7xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}