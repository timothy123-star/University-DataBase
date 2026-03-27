import React, { useState, useEffect } from "react";
import API from "../services/api";
import { formatDate } from "../utils/dateFormatter";

const SchemaExplorer = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch table list
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
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load table data");
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if a column contains date data
  const isDateColumn = (columnName, value) => {
    // Check by column name
    const dateColumns = ["EnrollmentDate", "StartDate", "EndDate", "HireDate"];
    if (dateColumns.includes(columnName)) return true;
    // Fallback: if value looks like a date string (ISO format) and not null
    if (value && typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}/))
      return true;
    return false;
  };

  // Helper to format a cell value
  const formatCellValue = (key, value) => {
    if (value === null) return "NULL";
    if (isDateColumn(key, value)) {
      return formatDate(value);
    }
    return String(value);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar with table list */}
      <div className="w-64 bg-gray-100 border-r p-4 overflow-y-auto">
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
      {/* Right side: Table data */}
      <div className="flex-1 p-4 overflow-auto">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {selectedTable && !loading && !error && (
          <div>
            <h2 className="text-2xl font-bold mb-4">{selectedTable}</h2>
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
          </div>
        )}
      </div>{" "}
    </div>
  );
};

export default SchemaExplorer;
