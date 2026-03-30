import React from "react";

const tutorials = [
  {
    id: 1,
    title: "Introduction to Databases & DBMS",
    description: "What is a database? Why DBMS? Overview of relational model.",
    embedUrl: "https://www.youtube.com/embed/n9rlemk6ODM", // Replace with your video URL
  },
  {
    id: 2,
    title: "Designing the University Database Schema",
    description:
      "ER diagram, tables, keys, and relationships in our enhanced model.",
    embedUrl: "https://www.youtube.com/embed/3mzf5VQxvhA?si=OG5ggKjI7lReZ7li",
  },
  {
    id: 3,
    title: "SQL Basics – SELECT, INSERT, UPDATE, DELETE",
    description: "Fundamental SQL operations with examples from our database.",
    embedUrl: "https://www.youtube.com/embed/VIDEO_ID_3",
  },
  {
    id: 4,
    title: "Advanced SQL – JOINs, Subqueries, Views",
    description:
      "How we integrated data from multiple tables to solve the data silos problem.",
    embedUrl: "https://www.youtube.com/embed/VIDEO_ID_4",
  },
  {
    id: 5,
    title: "Performance Optimization – Indexes & EXPLAIN",
    description: "Demonstrating how indexes improve query speed.",
    embedUrl: "https://www.youtube.com/embed/VIDEO_ID_5",
  },
  {
    id: 6,
    title: "Data Quality – Triggers & Automatic GPA Calculation",
    description: "Our trigger that keeps GPA accurate in real time.",
    embedUrl: "https://www.youtube.com/embed/VIDEO_ID_6",
  },
];

const Tutorials = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Video Tutorials</h1>
      <p className="text-gray-600 mb-8">
        Watch these recordings to understand the concepts behind our enhanced
        university database system.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tutorials.map((tut) => (
          <div
            key={tut.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="aspect-video">
              <iframe
                src={tut.embedUrl}
                title={tut.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {tut.title}
              </h2>
              <p className="text-gray-600 mt-2">{tut.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tutorials;

