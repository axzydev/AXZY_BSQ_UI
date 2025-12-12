import { AppState } from "@app/core/store/store";
import { useEffect, useState } from "react";
import { FaChild, FaClock, FaDumbbell, FaListAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { HomeCardItem } from "../components/HomeCardItem";

const HomePage = () => {
  const navigate = useNavigate();
  const user = useSelector((state: AppState) => state.auth);

  const [homeCardItem, setHomeCardItem] = useState<any[]>([]);

  useEffect(() => {
    if (!user || !user.token) {
      navigate("/login");
      return;
    }

    const cards = [
      {
        title: "Hijos",
        description: "Administra los hijos registrados del usuario",
        icon: <FaChild className="text-white" />,
        action: () => navigate("/children"),
      },
      {
        title: "Citas",
        description: "Consulta y gestiona tus citas activas",
        icon: <FaListAlt className="text-white" />,
        action: () => navigate("/appointments"),
      },
    ];

    if (user.role === "ADMIN") {
        cards.push(
            {
              title: "Horarios",
              description: "Consulta los horarios por día, semana o disponibilidad",
              icon: <FaClock className="text-white" />,
              action: () => navigate("/day-schedule"),
            },
            {
              title: "Modos de Entrenamiento",
              description: "Administra los diferentes modos de entrenamiento",
              icon: <FaDumbbell className="text-white" />,
              action: () => navigate("/training-modes"),
            },
        );
    }
    
    setHomeCardItem(cards);
  }, [user]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 max-w-5xl mx-auto relative z-10">
      {homeCardItem.map((item, index) => (
        <HomeCardItem key={index} item={item} index={index} />
      ))}
    </div>
  );
};

export default HomePage;
