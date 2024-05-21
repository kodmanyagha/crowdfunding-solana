import { Route, Routes } from "react-router-dom";
import Footer from "./components/footer";
import Header from "./components/header";
import MainPage from "./pages/main-page";

function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route index element={<MainPage />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
