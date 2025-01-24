import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home1 from './pages/Home1';
import Idiom1 from './pages/Idiom1';
import Idiom2 from './pages/Idiom2';
import Idiom3 from './pages/Idiom3';
import Idiom4 from './pages/Idiom4';
import Idiom5 from './pages/Idiom5';


function App() {
  return (
    <Router>
      <div className="App">
        {/* <Navbar /> */}
        <Routes>
          <Route path="/" element={<Home1 />} />
          <Route path="/idiom1" element={<Idiom1 />} />
          <Route path="/idiom2" element={<Idiom2 />} />
          <Route path="/idiom3" element={<Idiom3 />} />
          <Route path="/idiom4" element={<Idiom4 />} />
          <Route path="/idiom5" element={<Idiom5 />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
