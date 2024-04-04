import React from "react";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Button } from "reactstrap";
import LabelIcon from '@mui/icons-material/Label';
import LabelService from "./LabelService";
import './../Css/EditLabel.css';
import './../Css/NoteDashboard.css'

const EditLable  = ({ onUpdate }) => {
  const [labels, setLabels] = useState([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [editingLabelId, setEditingLabelId] = useState(null);
  const token = localStorage.getItem("token");

  const fetchLabels = async () => {
    try {
      const response = await LabelService.getAllLabels(token);
      setLabels(response);
    } catch (error) {
      console.error("Error fetching labels:", error);
    }
  };

  const handleNewLabel = async () => {
    try {
      await LabelService.createLabel(newLabelName, token);
      setNewLabelName(""); 
      fetchLabels();
    } catch (error) {
      console.error("Error creating label:", error);
    }
  };

  const handleDeleteLabel = async (labelId) => {
    try {
      await LabelService.deleteLabelById(labelId, token);
      fetchLabels();
    } catch (error) {
      console.error("Error deleting label:", error);
    }
  };

  const handleEditLabel = async (labelId, updatedName) => {
    try {
      await LabelService.editLabelById(labelId, updatedName, token);
      fetchLabels(); // Refresh labels after update
    } catch (error) {
      console.error("Error editing label:", error);
    } finally {
      setEditingLabelId(null); // Clear editing state
    }
  };

  useEffect(() => {
    fetchLabels(); // Fetch labels when the component mounts
  }, []);

  const handleClickOutside = (event) => {
    if (!event.target.closest(".label-container")) {
      onUpdate();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onUpdate]);

    return (
      <div className="label-popup-container">
      <h1 className="heading">Edit Labels</h1>
    <div className="label-container">
      <div className="label-input-container">
        <input
          type="text"
          placeholder="Create new label"
          value={newLabelName}
          onChange={(e) => setNewLabelName(e.target.value)}
        />
        <Button onClick={handleNewLabel} title="Create Label">
        <FontAwesomeIcon  style={{height:14}} icon={faCheck} size="lg" />
        </Button>
      </div>
      <div className="labels-list">
        {labels.map((label) => (
          <div key={label.labelId} className="label-item">
              <div className="label-actions">
              <Button style={{ position: "fixed", left: "5px",color:"grey"}}><LabelIcon size="small"/></Button>
            {editingLabelId === label.labelId ? (
              <input
                type="text"
                className="edit-input"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                onBlur={() => handleEditLabel(label.labelId, newLabelName)}
                autoFocus
              />
            ) : (
              <>
                <span  onClick={() => setEditingLabelId(label.labelId)} className="label-name">{label.labelName}</span>
              </>
            )}
              <Button style={{ position: "fixed", right: "10px" }} onClick={() => handleDeleteLabel(label.labelId)}><FontAwesomeIcon icon={faTrash} size="small"/></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
};

export default EditLable;