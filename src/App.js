import logo from './logo.svg';
import './App.css';
import Home from './Pages/Home'
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import RegistrationSuccess from './Pages/RegistrationSuccess';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element = {<Home/>}
          />
          <Route
            path = "/registration_success"
            element = {<RegistrationSuccess/>}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
