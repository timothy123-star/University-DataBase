// import React from "react";
// import { Link, Outlet } from "react-router-dom"; // if using react-router

// const Layout = () => {
//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       <aside className="w-64 bg-indigo-800 text-white p-6">
//         <h1 className="text-2xl font-bold mb-8">UniDB</h1>
//         <nav className="space-y-2">
//           <Link
//             to="/"
//             className="block px-4 py-2 rounded hover:bg-indigo-700 transition"
//           >
//             Dashboard
//           </Link>
//           <Link
//             to="/students"
//             className="block px-4 py-2 rounded hover:bg-indigo-700 transition"
//           >
//             Students
//           </Link>
//           <Link
//             to="/courses"
//             className="block px-4 py-2 rounded hover:bg-indigo-700 transition"
//           >
//             Courses
//           </Link>
//           <Link
//             to="/enroll"
//             className="block px-4 py-2 rounded hover:bg-indigo-700 transition"
//           >
//             Enrollment
//           </Link>
//         </nav>
//       </aside>

//       {/* Main content */}
//       <main className="flex-1 overflow-y-auto p-8">
//         <Outlet /> {/* This is where your page components render */}
//       </main>
//     </div>
//   );
// };

// export default Layout;

import { Link, Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-indigo-800 text-white p-6">
        <h1 className="text-2xl font-bold mb-8">UniDB</h1>
        <nav className="space-y-2">
          <Link
            to="/"
            className="block px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Dashboard
          </Link>
          <Link
            to="/students"
            className="block px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Students
          </Link>
          <Link
            to="/enroll"
            className="block px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Enrollment
          </Link>
          <Link
            to="/analytics"
            className="block px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            View Analytics
          </Link>{" "}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
