import React, { useState } from "react";

const PerformanceDemo = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ withIndex: null, noIndex: null });

  const runDemo = async (mode, label) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1/demo"}/performance-demo?mode=${mode}`,
      );
      const data = await res.json();
      setResults((prev) => ({ ...prev, [label]: data }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runBoth = async () => {
    await runDemo("no_index", "noIndex");
    await runDemo("with_index", "withIndex");
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Query Performance Demo</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">The Problem</h2>
        <p className="mb-4">
          Without proper indexing, database queries must scan every row in a
          table – a <strong>full table scan</strong>. This becomes extremely
          slow as data grows. In university databases, operations like searching
          for students by last name can take seconds.
        </p>
        <p className="mb-4">
          As noted in our research, poor query performance is a major limitation
          of traditional systems, especially during high‑load periods like
          registration.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">Our Solution: Indexing</h2>
        <p className="mb-4">
          Adding an index on frequently searched columns (like{" "}
          <code>LastName</code>) allows the database to locate rows quickly
          using a B‑Tree structure – similar to an index in a book.
        </p>

        <div className="bg-white border rounded-lg shadow p-4 mb-6">
          <h3 className="text-lg font-medium mb-2">Live Demonstration</h3>
          <p className="text-gray-600 mb-4">
            The button below will run the same query twice: once{" "}
            <strong>without</strong> using the index (simulated with{" "}
            <code>IGNORE INDEX</code>), and once <strong>with</strong> the
            index. Watch the execution time and the <code>EXPLAIN</code> plan.
          </p>
          <button
            onClick={runBoth}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Running..." : "Run Performance Test"}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Without Index */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">Without Index</h3>
            {results.noIndex ? (
              <>
                <p>
                  <strong>Time:</strong> {results.noIndex.duration} ms
                </p>
                <p>
                  <strong>Rows returned:</strong> {results.noIndex.rowCount}
                </p>
                <details>
                  <summary className="cursor-pointer text-indigo-600">
                    EXPLAIN Output
                  </summary>
                  <pre className="bg-gray-800 text-white p-2 mt-2 text-xs overflow-auto">
                    {JSON.stringify(results.noIndex.explain, null, 2)}
                  </pre>
                </details>
              </>
            ) : (
              <p className="text-gray-500">Not yet run.</p>
            )}
          </div>

          {/* With Index */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">With Index</h3>
            {results.withIndex ? (
              <>
                <p>
                  <strong>Time:</strong> {results.withIndex.duration} ms
                </p>
                <p>
                  <strong>Rows returned:</strong> {results.withIndex.rowCount}
                </p>
                <details>
                  <summary className="cursor-pointer text-indigo-600">
                    EXPLAIN Output
                  </summary>
                  <pre className="bg-gray-800 text-white p-2 mt-2 text-xs overflow-auto">
                    {JSON.stringify(results.withIndex.explain, null, 2)}
                  </pre>
                </details>
              </>
            ) : (
              <p className="text-gray-500">Not yet run.</p>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold text-blue-800">
            What the EXPLAIN tells us
          </h3>
          <ul className="list-disc ml-6 text-sm text-blue-800">
            <li>
              <strong>Without index:</strong> <code>type = ALL</code> – full
              table scan, scanning many rows.
            </li>
            <li>
              <strong>With index:</strong> <code>type = ref</code> – index
              lookup, scanning only a few rows.
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3">Why This Matters</h2>
        <p>
          In a real university system with thousands of students, indexing can
          reduce query times from seconds to milliseconds. This directly
          addresses the performance limitations found in our literature review
          (Maabreh, 2019) and ensures the system can handle peak loads like
          registration periods.
        </p>
      </section>
    </div>
  );
};

export default PerformanceDemo;
