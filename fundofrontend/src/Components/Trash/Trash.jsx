import React from "react";
import { Card, CardBody, CardTitle, CardText, Button } from "reactstrap";
import { useState, useEffect } from "react";
import RestoreFromTrashOutlinedIcon from '@mui/icons-material/RestoreFromTrashOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import { Link , useLocation} from 'react-router-dom';
import RestoreIcon from './../Images/RestoreNote_Icon.png';
import trash_icon from './../Images/trash_icon.png';
import NoteService from "../Notes/NotesService";
import TrashImg from './../Images/trashImg.png';
import Header from "../Header & Sidebar/Header";
import Sidebar from "../Header & Sidebar/Sidebar";
import './../Css/Trash.css';
import './../Css/ColorCard.css';
const Trash = (props) => {
  const [notes, setNotes] = useState([]);
    const [trashedNotes, setTrashedNotes] = useState([]);
    const token = localStorage.getItem('token');
    const [selectedColor, setSelectedColor] = useState({});
    const [selectedNoteId, setSelectedNoteId] = useState(null);
    const [noteImages, setNoteImages] = useState({}); 
    useEffect(() => {
      // Load selectedColor from local storage
      const storedColors = localStorage.getItem('noteColors');
      if (storedColors) {
        setSelectedColor(JSON.parse(storedColors));
      }
    }, []);

    
  useEffect(() => {
    // Retrieve image URLs from local storage
    const localStorageImages = JSON.parse(localStorage.getItem('noteImages')) || {};
    setNoteImages(localStorageImages);
  }, []);

  const handleImageUpload = (event, id) => {
    try {
      const file = event.target.files[0];
      const reader = new FileReader();
  
      reader.onload = () => {
        const imageUrl = reader.result;
        setNoteImages(prevImages => ({
          ...prevImages,
          [id]: imageUrl
        }));
        const localStorageImages = JSON.parse(localStorage.getItem('noteImages')) || {};
        localStorageImages[id] = imageUrl;
        localStorage.setItem('noteImages', JSON.stringify(localStorageImages));
      };
  
      if (file) {
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error handling image upload:', error);
    }
  };

  const handleDeleteImage = (id) => {
    const updatedNoteImages = { ...noteImages };
    delete updatedNoteImages[id];
    setNoteImages(updatedNoteImages);
  };
  
    const handleColorChange = (id, color) => {
      setSelectedColor(prevSelectedColor => ({
        ...prevSelectedColor,
        [id]: color
      }));
      localStorage.setItem('noteColors', JSON.stringify({
        ...selectedColor,
        [id]: color
      }));
      if (props.note) {
        props.updateColor(color, id);
      }
    };
  
    const handleColorIconClick = (noteId) => {
      setSelectedNoteId(noteId === selectedNoteId ? null : noteId);
    };
  
    useEffect(() => {
        fetchTrashedNotes();
    }, []);

    const fetchTrashedNotes = async () => {
        try {
            const data = await NoteService.fetchTrashedNotes(token);
            setTrashedNotes(data);
        } catch (error) {
            console.error('Error fetching trashed notes:', error);
        }
    };

    const handleUntrash = async (id) => {
        try {
            await NoteService.setNoteToUnTrash(id, token);
            setTrashedNotes(prevNotes => prevNotes.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error untrashing note:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await NoteService.deleteNote(id, token);
            setTrashedNotes(prevNotes => prevNotes.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    return (
      <div className="App">
       <Header />
      <div className="main">
      <Sidebar />
      <div className="trashed-notes">
            {trashedNotes.map((note) => (
              <div key={note.id} >
                 <div style={{ position: 'relative' }}>
  {noteImages[note.id] && (
    <div style={{ position: 'relative', width: '85%', height: '140px', overflow: 'hidden' , marginLeft:40 }}>
      <img src={noteImages[note.id]} alt="Uploaded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <Button
        className="delete-button"
        style={{ border:'none', position: 'absolute', bottom: '5px', right: '5px' }}
        outline
        size="sm"
        onClick={() => handleDeleteImage(note.id)}
        title="Permanently Delete"
      >
        <DeleteOutlinedIcon fontSize="small" />
      </Button>
    </div>
  )}
</div>
                <Card className="trashcard"  style={{ backgroundColor: selectedColor[note.id] || 'white' }}>
                <CardBody className="trash-card-body"  style={{ backgroundColor: selectedColor[note.id] || 'white' }}>
                    <CardTitle className="card-title">{note.title}</CardTitle>
                    <CardText className="trash-card-text">{note.description}</CardText>
                    <div className="trashed-button" style={{marginLeft:20}}>
                      <Button className="untrash-button"outline size="sm" onClick={() => handleUntrash(note.id)} title="Untrash">
                      <RestoreFromTrashOutlinedIcon fontSize="small" />
                      </Button>
                      <Button className="delete-button" outline size="sm" onClick={() => handleDelete(note.id)}  title="Permanently Delete">
                      <DeleteForeverOutlinedIcon fontSize="small" />
                      </Button>
                      <Button size="sm" title="Background Options" onClick={() => handleColorIconClick(note.id)}>
                      <PaletteOutlinedIcon fontSize="small" />
                    </Button>
                    </div>
                  </CardBody>
                </Card>
                <div className="color-options" style={{ display: selectedNoteId === note.id ? 'block' : 'none',marginLeft:50,marginTop:0 }}>
  <Card className="ColorCard">
    <CardBody className="ColorCardContainer"  style={{width:220,gap:5}}>
      <div className="color-option" style={{ backgroundColor: 'white' }} onClick={() => handleColorChange(note.id, 'white')}></div>
      <div className="color-option" style={{ backgroundColor: '#EFB495' }} onClick={() => handleColorChange(note.id, '#EFB495')}></div>
      <div className="color-option" style={{ backgroundColor: '#E2BEBE' }} onClick={() => handleColorChange(note.id, '#E2BEBE')}></div>
      <div className="color-option" style={{ backgroundColor: '#B5C0D0' }} onClick={() => handleColorChange(note.id, '#B5C0D0')}></div>
      <div className="color-option" style={{ backgroundColor: '#EADFB4' }} onClick={() => handleColorChange(note.id, '#EADFB4')}></div>
      <div className="color-option" style={{ backgroundColor: '#92C7CF' }} onClick={() => handleColorChange(note.id, '#92C7CF')}></div>
      <div className="color-option" style={{ backgroundColor: '#EC7700' }} onClick={() => handleColorChange(note.id, '#EC7700')}></div>
      <div className="color-option" style={{ backgroundColor: '#9CAFAA' }} onClick={() => handleColorChange(note.id, '#9CAFAA')}></div>
      <div className="color-option" style={{ backgroundColor: '#D37676' }} onClick={() => handleColorChange(note.id, '#D37676')}></div>
      <div className="color-option" style={{ backgroundColor: '#A5DD9B' }} onClick={() => handleColorChange(note.id, '#A5DD9B')}></div>
      <div className="color-option" style={{ backgroundColor: '#F5DD61' }} onClick={() => handleColorChange(note.id, '#F5DD61')}></div>
      <div className="color-option" style={{ backgroundColor: '#FC819E' }} onClick={() => handleColorChange(note.id, '#FC819E')}></div>
      <div className="color-option" style={{ backgroundColor: '#7469B6' }} onClick={() => handleColorChange(note.id, '#7469B6')}></div>
      <div className="color-option" style={{ backgroundColor: '#FFE6E6' }} onClick={() => handleColorChange(note.id, '#FFE6E6')}></div>
  
    </CardBody>
  </Card>
</div>

              </div>
            ))}
          </div>
          </div>
          </div>
);
  };

export default Trash;