import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 w-64 bg-indigo-800 text-white p-6
          transform transition-transform duration-300 z-30
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0
        `}
      >
        <h1 className="text-2xl font-bold mb-8">Enhanced Uni DB</h1>
        <nav className="space-y-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `block px-4 py-2 rounded transition ${
                isActive ? "bg-indigo-600" : "hover:bg-indigo-700"
              }`
            }
            onClick={() => setSidebarOpen(false)}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/students"
            className={({ isActive }) =>
              `block px-4 py-2 rounded transition ${
                isActive ? "bg-indigo-600" : "hover:bg-indigo-700"
              }`
            }
            onClick={() => setSidebarOpen(false)}
          >
            Students
          </NavLink>
          <NavLink
            to="/register"
            className={({ isActive }) =>
              `block px-4 py-2 rounded transition ${
                isActive ? "bg-indigo-600" : "hover:bg-indigo-700"
              }`
            }
            onClick={() => setSidebarOpen(false)}
          >
            Register
          </NavLink>
          <NavLink
            to="/enroll-enhanced"
            className={({ isActive }) =>
              `block px-4 py-2 rounded transition ${
                isActive ? "bg-indigo-600" : "hover:bg-indigo-700"
              }`
            }
            onClick={() => setSidebarOpen(false)}
          >
            Smart Enrollment
          </NavLink>
          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `block px-4 py-2 rounded transition ${
                isActive ? "bg-indigo-600" : "hover:bg-indigo-700"
              }`
            }
            onClick={() => setSidebarOpen(false)}
          >
            Analytics
          </NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {/* Mobile header with hamburger */}
        <div className="flex items-center mb-4 md:hidden">
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-600 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h2 className="text-xl font-semibold ml-2">UniDB</h2>
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
