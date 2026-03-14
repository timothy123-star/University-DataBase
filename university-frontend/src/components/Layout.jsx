import { NavLink, Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-indigo-800 text-white p-6">
        <h1 className="text-2xl font-bold mb-8">Enhanced Uni DB</h1>
        <nav className="space-y-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `block px-4 py-2 rounded transition ${
                isActive ? "bg-indigo-600" : "hover:bg-indigo-700"
              }`
            }
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
          >
            Analytics
          </NavLink>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet /> {/* This renders the matched child route */}
      </main>
    </div>
  );
};

export default Layout;
