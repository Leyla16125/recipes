import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./components/Main";
import ReceiptPage from "./components/ReceiptPage";  // Your component for recipe details

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/receipt" element={<ReceiptPage />} />
        <Route path="/receipt/:id" element={<ReceiptPage />} />
      </Routes>
    </Router>
  );
}

export default App;
