import React from "react";
import ReactDOM from "react-dom/client";
import { TasksPage } from "./pages/tasks";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <TasksPage />
  </React.StrictMode>
);
