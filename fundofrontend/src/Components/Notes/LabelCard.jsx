import React, { useState, useEffect } from "react";
import { Card, Dropdown } from 'reactstrap';
import LabelService from "../Edit Lable/LabelService";
import NoteService from "./NotesService";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './../Css/NoteDashboard.css';
import './../Css/LabelCard.css';

const LabelCard = ({ onUpdate, noteId, fetchNotes}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [labels, setLabels] = useState([]);
  const [newLabelName, setNewLabelName] = useState("");
  const token = localStorage.getItem("token");
  const [editingLabelId, setEditingLabelId] = useState(null);

  useEffect(() => {
    fetchLabels(); // Fetch labels when the component mounts
  }, []);

  const fetchLabels = async () => {
    try {
      const response = await LabelService.getAllLabels(token);
      setLabels(response);
    } catch (error) {
      console.error("Error fetching labels:", error);
      toast.error("Something went wrong, not able to fetch labels", { position: 'top-center' });
    }
  };

  const handleNewLabel = async () => {
    try {
      if (newLabelName.trim() !== "") {
        await LabelService.createLabel(newLabelName, token);
        setNewLabelName(""); // Reset input after creating label
        fetchLabels(); // Refresh labels after creating label
      }
    } catch (error) {
      console.error("Error creating label:", error);
    }
  };

  const handleClickOutside = (event) => {
    if (!event.target.closest(".label-container")) {
      if (typeof onUpdate === 'function') {
        onUpdate(); // Call onUpdate function in parent component to set label for the note
      }
      if (newLabelName.trim() !== "") {
        handleNewLabel(); // Create new label if input is not empty
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onUpdate, newLabelName]);

  const handleAddLabel = async (labelName) => {
    try {
      await NoteService.addNotesToLabel(noteId, labelName,token);
      // Update labels after adding a note to a label
      fetchLabels();
      fetchNotes();
    } catch (error) {
      console.error("Error adding label:", error);
    }
  };
  
  return (
    <div className="Label">
      <Card className="labelCard">
        <Dropdown isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)}>
          <div className="label-container">
            <p style={{margin:0, padding:0}}>Label note</p>
            <div className="labelcard-input-container">          
              <input
                type="text"
                placeholder="Enter label name"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
              />
            </div>
            <div className="labels-list">
              {labels.map((label) => (
                <div key={label.labelId} className="labelcard-item">
                  <div className="label-actions">
                    <input
                      type="checkbox"
                      className="select-label-checkbox"
                      onClick={() => handleAddLabel(label.labelName)}
                    />
                    {editingLabelId === label.labelId ? (
                      <input
                        type="text"
                        className="edit-input"
                        value={newLabelName}
                        onChange={(e) => setNewLabelName(e.target.value)}
                      />
                    ) : (
                      <>
                        <span className="label-name">
                          {label.labelName}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Dropdown>
      </Card>
    </div>
  );
};

export default LabelCard;
