import LoginPage from "@app/modules/auth/pages/LoginPage";
import RegisterPage from "@app/modules/auth/pages/RegisterPage";
import { ITLoader } from "axzy_ui_system";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { PrivateRoutes } from "./core/routes/PrivateRoutes";
import { setAuth } from "./core/store/auth/auth.slice";
import HomePage from "./modules/home/pages/HomePage";
<<<<<<< HEAD
import TrainingModePage from "./modules/traningMode/pages/TraningModePage";
import DaySchedulePage from "./modules/daySchedules/pages/DaySchedulePage";
import ChildrenPage from "./modules/children/pages/ChildrenPage";
import AppointmentsPage from "./modules/appointments/pages/AppointmentsPage";
import CalendarPage from "./modules/calendar/pages/CalendarPage";
import PaymentsPage from "./modules/payments/pages/PaymentsPage";
import EvaluationFormPage from "./modules/evaluations/pages/EvaluationFormPage";
=======

import LocationsPage from "./modules/locations/pages/LocationsPage";
import EntriesPage from "./modules/entries/pages/EntriesPage";
import EntryDetailPage from "./modules/entries/pages/EntryDetailPage";
import MovementsPage from "./modules/movements/pages/MovementsPage";
import ExitsPage from "./modules/exits/pages/ExitsPage";
import UsersPage from "./modules/users/pages/UsersPage";
import KeyAssignmentsPage from "./modules/key-assignments/pages/KeyAssignmentsPage";
>>>>>>> 7be629eac723ca8881b6a5ca4ccca86f0d5f1ae7


function App() {
  const token = useSelector((state: any) => state.auth.token);
  const dispatch = useDispatch();

  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    window.addEventListener("beforeunload", () => {});
    window.addEventListener("unload", handleTabClosing);
    return () => {
      window.removeEventListener("beforeunload", () => {});
      window.removeEventListener("unload", handleTabClosing);
    };
  });

  const handleTabClosing = () => {
    localStorage.setItem("token", token);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken && storedToken !== "null") {
      dispatch(setAuth(storedToken));
    }
    setIsAppReady(true);
  }, [dispatch]);

  if (!isAppReady) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <ITLoader size="lg" />
      </div>
    );
  }

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<PrivateRoutes />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/training-modes" element={<TrainingModePage />} />
        <Route path="/day-schedule" element={<DaySchedulePage />} />
        <Route path="/children" element={<ChildrenPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/evaluations/new" element={<EvaluationFormPage />} />

      </Route>
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
  );
}

export default App;
