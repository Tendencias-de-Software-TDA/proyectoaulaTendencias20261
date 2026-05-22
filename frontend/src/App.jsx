import { useState, useEffect } from "react";
import { getUserProfile, logoutUser } from "./api/api";
import Sidebar from "./components/layout/SideBar";
import LoginPage from "./components/auth/LoginPage";
import ProjectsPage from "./components/projects/ProjectsPage";
import KanbanBoard from "./components/tasks/KanbanBoard";
import ProfilePage from "./components/users/ProfilePage";
import "./styles/global.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("projects");
  const [activeProject, setActiveProject] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    getUserProfile()
      .then((me) => setUser(me))
      .catch(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    const refresh = localStorage.getItem("refresh_token");

    if (refresh) {
      logoutUser(refresh).catch(() => {});
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    setUser(null);
    setPage("projects");
    setActiveProject(null);
  };

  const handleNavigation = (nextPage) => {
    setPage(nextPage);

    if (nextPage !== "kanban") {
      setActiveProject(null);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <span className="spinner" />
      </div>
    );
  }

  if (!user) return <LoginPage onLogin={setUser} />;

  return (
    <div className="app-shell">
      <Sidebar
        user={user}
        activePage={page}
        onNav={handleNavigation}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {page === "projects" && (
          <ProjectsPage
            user={user}
            onSelectProject={(project) => {
              setActiveProject(project);
              setPage("kanban");
            }}
          />
        )}

        {page === "profile" && <ProfilePage user={user} />}

        {page === "kanban" && activeProject && (
          <KanbanBoard
            project={activeProject}
            user={user}
            onBack={() => {
              setActiveProject(null);
              setPage("projects");
            }}
          />
        )}
      </main>
    </div>
  );
}