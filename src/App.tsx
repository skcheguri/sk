import { BrowserRouter, useLocation } from "react-router-dom";
import { AppRoutes } from "./router";
import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import Navbar from "./components/feature/Navbar";
import Footer from "./components/feature/Footer";
import AuthProvider from "./components/feature/AuthProvider";
import SubscriptionProvider from "./components/feature/SubscriptionProvider";
import { ToastProvider } from "./hooks/useToast";
import ToastContainer from "./components/feature/ToastContainer";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <SubscriptionProvider>
          <ToastProvider>
            <BrowserRouter basename={__BASE_PATH__}>
              <ScrollToTop />
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <AppRoutes />
                </main>
                <Footer />
                <ToastContainer />
              </div>
            </BrowserRouter>
          </ToastProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}

useEffect(() => {
  console.log("ENV:", import.meta.env);
}, []);

export default App;
