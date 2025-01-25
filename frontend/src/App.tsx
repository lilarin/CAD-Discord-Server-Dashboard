import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Header } from "@/layout/Header";
import { Sidebar } from "@/layout/Sidebar";
import Categories from "@/pages/Categories.tsx";
import Groups from "@/pages/Groups";
import Users from "@/pages/Users";
import Events from "@/pages/Events";
import Archivation from "@/pages/Archivation";
import Logs from "@/pages/Logs";
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <BrowserRouter>
      <Toaster />
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 bg-[#36393F]">
            <Routes>
              <Route path="/" element={<Navigate to="/disciplines" replace />} />
              <Route path="/disciplines" element={<Categories />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/users" element={<Users />} />
              <Route path="/events" element={<Events />} />
              <Route path="/archivation" element={<Archivation />} />
              <Route path="/logs" element={<Logs />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;