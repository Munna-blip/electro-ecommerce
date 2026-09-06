import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import {
  FaLaptop, FaMobileAlt, FaHeadphones, FaCamera, FaKeyboard,
  FaMouse, FaTv, FaMicrochip, FaWifi, FaMemory,
} from "react-icons/fa";

const bgIcons = [
  { Icon: FaLaptop, top: "6%", left: "4%", size: 60, delay: "0s" },
  { Icon: FaMobileAlt, top: "55%", left: "2%", size: 42, delay: "1.5s" },
  { Icon: FaHeadphones, top: "20%", left: "94%", size: 54, delay: "0.8s" },
  { Icon: FaCamera, top: "75%", left: "96%", size: 48, delay: "2.2s" },
  { Icon: FaKeyboard, top: "38%", left: "97%", size: 46, delay: "1.1s" },
  { Icon: FaMouse, top: "90%", left: "8%", size: 36, delay: "0.5s" },
  { Icon: FaTv, top: "10%", left: "50%", size: 50, delay: "2.6s" },
  { Icon: FaMicrochip, top: "65%", left: "50%", size: 44, delay: "1.8s" },
  { Icon: FaWifi, top: "45%", left: "6%", size: 34, delay: "0.3s" },
  { Icon: FaMemory, top: "85%", left: "60%", size: 38, delay: "1.3s" },
];

export default function MainLayout() {
  return (
    <div className="site-bg d-flex flex-column min-vh-100">
      <div className="site-bg-mesh" />
      {bgIcons.map(({ Icon, top, left, size, delay }, i) => (
        <Icon
          key={i}
          className="site-bg-icon"
          style={{ top, left, fontSize: size, animationDelay: delay }}
        />
      ))}

      <div className="site-content-layer d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}