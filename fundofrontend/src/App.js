import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container } from 'reactstrap';
import { ToastContainer } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import LoginPage from './Components/Login&SignUp/LoginPage';
import SignUpPage from './Components/Login&SignUp/SignupPage';
import NoteDashboard from './Components/Notes/NoteDashboard';
import Archive from './Components/Archive/Archive';
import Trash from './Components/Trash/Trash';
import EditLable from './Components/Edit Lable/EditLable';
import Reminder from './Components/Reminder/Reminder';
import Sidebar from './Components/Header & Sidebar/Sidebar';
import Header from './Components/Header & Sidebar/Header';


function App() {
  return (
    <div className='App'>
      <Router>
        <ToastContainer />
        <Container>

          <AppRouter />
        </Container>
      </Router>
    </div>
  );
}

const AppRouter = () => {
  const location = useLocation();

  return (
    <>
      {location.pathname === '/' && <LoginPage />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/Signup-page" element={<SignUpPage />} />
        <Route path="/NoteDashboard" element={<NoteDashboard/>} />
        <Route path="/Trash" element={<Trash/>} />
        <Route path="/Archive" element={<Archive/>} />
        <Route path="/EditLable" element={<EditLable/>} />
        <Route path="/Reminder" element={<Reminder/>} />
        <Route path="/Sidebar" element={<Sidebar/>} />
        <Route path="/Header" element={<Header/>} />
    
      </Routes>
    </>
  );
};

export default App;
