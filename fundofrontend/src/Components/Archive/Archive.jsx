import React from "react";
import { Card, CardBody, CardTitle, CardText, Button } from "reactstrap";
import { useState, useEffect } from "react";
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import Sidebar from "../Header & Sidebar/Sidebar";
import Header from "../Header & Sidebar/Header";
import NoteService from "../Notes/NotesService";
import './../Css/Archive.css';
import './../Css/ColorCard.css';

const Archive = (props) => {
  const [notes, setNotes] = useState([]);
  const [archivedNotes, setArchivedNotes] = useState([]);
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

  const handleDelete = (id) => {
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
    fetchArchivedNotes();
  }, []);

  const fetchArchivedNotes = async () => {
    try {
      const data = await NoteService.fetchArchivedNotes(token);
      setArchivedNotes(data);
    } catch (error) {
      console.error('Error fetching archived notes:', error);
    }
  };

  const updateNote = async (id, updatedNote) => {
    try {
      await NoteService.updateNote(id, updatedNote, token);
      setArchivedNotes(notes.map(note => (note.id === id ? updatedNote : note)));
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleUnarchive = async (id) => {
    try {
      await NoteService.setNoteToUnArchive(id, token);
      setArchivedNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    } catch (error) {
      console.error('Error unarchiving note:', error);
    }
  };

  const handleTrash = async (id) => {
    try {
      await NoteService.setNoteToTrash(id, token);
      setArchivedNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error trashing note:', error);
    }
  };

  return (
    <div className="App">
      <Header />
      <div className="main">
      <Sidebar />
        <div className="trashed-notes">
          {archivedNotes.map((note) => (
            <div key={note.id} style={{ backgroundImage: `url(${note.backgroundImage})` }}>
              <div style={{ position: 'relative' }}>
  {noteImages[note.id] && (
    <div style={{ position: 'relative', width: '85%', height: '140px', overflow: 'hidden' , marginLeft:40}}>
      <img src={noteImages[note.id]} alt="Uploaded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <Button
        className="delete-buttonImg"
        style={{ border:'none', position: 'absolute', bottom: '5px', right: '5px' }}
        outline
        size="sm"
        onClick={() => handleDelete(note.id)}
        title="Permanently Delete"
      >
        <DeleteOutlinedIcon fontSize="small" />
      </Button>
    </div>
  )}
</div>
              <Card className="archivecard" style={{ backgroundColor: selectedColor[note.id] || 'white' }}>
                <CardBody className="archive-card-body" style={{ backgroundColor: selectedColor[note.id] || 'white' }}>
                  <CardTitle contentEditable className="card-title" onBlur={(e) => updateNote(note.id, { ...note, title: e.target.innerText })}>{note.title}</CardTitle>
                  <CardText contentEditable className="archive-card-text" onBlur={(e) => updateNote(note.id, { ...note, description: e.target.innerText })}>{note.description}</CardText>
                  <div className="archive-button" style={{marginLeft:1}}>
                    <Button outline size="sm" onClick={() => handleTrash(note.id)} title="Trash">
                    <DeleteOutlinedIcon fontSize="small" />
                    </Button>
                    <Button outline size="sm" onClick={() => handleUnarchive(note.id)} title="Unarchive">
                    <UnarchiveOutlinedIcon fontSize="small" />
                    </Button>
                    <Button>
                    <label htmlFor={`image-upload-${note.id}`} className="image-upload-button">
              <ImageOutlinedIcon fontSize="small" />
              <input id={`image-upload-${note.id}`} type="file" onChange={(e) => handleImageUpload(e, note.id)} style={{ display: 'none' }} />
            </label></Button>
                    <Button size="sm" title="Background Options" onClick={() => handleColorIconClick(note.id)}>
                    <PaletteOutlinedIcon fontSize="small" />
                    </Button>
                  </div>
                </CardBody>
              </Card>

              <div className="color-options" style={{ display: selectedNoteId === note.id ? 'block' : 'none',marginLeft:50 }}>
  <Card className="ColorCard" >
    <CardBody className="ColorCardContainer" style={{width:220,gap:5}}>
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

export default Archive;
