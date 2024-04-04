
import React,{useState} from "react";
import note_icon from './../Images/note_icon.png';
import reminder_icon from './../Images/reminder_icon.png';
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import archive_icon from './../Images/archive_icon.png';
import trash_icon from './../Images/trash_icon.png';
import './../Css/NoteDashboard.css';
import { Link, useLocation } from "react-router-dom"
import Modal from 'react-modal'
import EditLable from './../Edit Lable/EditLable';

const Sidebar = () => {
    const location = useLocation();
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const openModal = () => {
      setModalIsOpen(true);
      document.body.classList.add("blur-background"); // Apply blur background
    };
  
    const closeModal = () => {
      setModalIsOpen(false);
      document.body.classList.remove("blur-background"); // Remove blur background
    };

    return (
<div className="sidebar">
  <div className="sidebar-options">
    <div className={location.pathname === '/NoteDashboard' ? 'active' : ''}>
      <Link to="/NoteDashboard">
        <img src={note_icon} alt="Note Icon" className="option-icon" />
        Notes
      </Link>
    </div>
    <div className={location.pathname === '/Reminder' ? 'active' : ''}>
      <Link to="/Reminder">
        <img src={reminder_icon} alt="Reminder Icon" className="option-icon" />
        Reminder
      </Link>
    </div>
    <div className={location.pathname === '/EditLable' ? 'active' : ''}>
      <Link onClick={openModal}>
       <EditOutlinedIcon  alt="Edit Icon" className="option-icon" style={{ marginLeft:18}}/>
        Edit Label
      </Link>
    </div>
    <div className={location.pathname === '/Archive' ? 'active' : ''}>
      <Link to="/Archive">
        <img src={archive_icon} alt="Archive Icon" className="option-icon" />
        Archive
      </Link>
    </div>
    <div className={location.pathname === '/Trash' ? 'active' : ''}>
      <Link to="/Trash">
        <img src={trash_icon} alt="Trash Icon" className="option-icon" />
        Trash
      </Link>
    </div>
 <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Edit Label Modal"
        className="label-modal"
        overlayClassName="label-modal-overlay"
        shouldCloseOnOverlayClick={true}
      >
        <EditLable onUpdate={closeModal} />
      </Modal>
  </div>
  </div>
)
};
export default Sidebar;