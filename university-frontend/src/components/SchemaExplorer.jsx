import React, { useState, useEffect } from "react";
import API from "../services/api";
import { formatDate } from "../utils/dateFormatter";

const SchemaExplorer = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    API.get("/db/tables")
      .then((res) => setTables(res.data))
      .catch((err) => setError("Failed to load tables"));
  }, []);

  const handleTableClick = async (tableName) => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`/db/table/${tableName}`);
      setTableData(res.data);
      setSelectedTable(tableName);
      // Close sidebar on mobile after selection (optional)
      if (window.innerWidth < 768) setSidebarOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load table data");
    } finally {
      setLoading(false);
    }
  };

  const isDateColumn = (columnName, value) => {
    const dateColumns = ["EnrollmentDate", "StartDate", "EndDate", "HireDate"];
    if (dateColumns.includes(columnName)) return true;
    if (value && typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}/))
      return true;
    return false;
  };

  const formatCellValue = (key, value) => {
    if (value === null) return "NULL";
    if (isDateColumn(key, value)) {
      return formatDate(value);
    }
    return String(value);
  };

  return (
    <div className="relative flex h-full">
      {/* Sidebar (hidden by default on mobile, toggled) */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-gray-100 border-r transform transition-transform duration-300
          md:relative md:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-4">
          <h2 className="text-lg font-bold mb-3">Tables</h2>
          <ul>
            {tables.map((table) => (
              <li key={table}>
                <button
                  onClick={() => handleTableClick(table)}
                  className={`block w-full text-left px-2 py-1 rounded hover:bg-gray-200 ${
                    selectedTable === table
                      ? "bg-indigo-100 text-indigo-800 font-medium"
                      : ""
                  }`}
                >
                  {table}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Overlay when sidebar is open on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 bg-gray-100 rounded-md md:hidden focus:outline-none"
            aria-label="Toggle sidebar"
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
          {selectedTable && (
            <h2 className="text-xl font-bold">{selectedTable}</h2>
          )}
          <div className="w-8 md:hidden" /> {/* spacer for alignment */}
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {selectedTable && !loading && !error && (
          <>
            {tableData.length === 0 ? (
              <p>No data in this table.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      {Object.keys(tableData[0]).map((key) => (
                        <th key={key} className="border px-2 py-1 text-left">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        {Object.entries(row).map(([key, val]) => (
                          <td key={key} className="border px-2 py-1">
                            {formatCellValue(key, val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SchemaExplorer;
