import useAxios from '../hooks/useAxiosAuth';
import React, { useState, useEffect } from 'react';
import './PartyManager.css';
import './Route.css';
import Order from './Order';
import OrderTickets from './OrderTickets';
import Seats from './Seats'; // Import Seats component
import {
  IconButton
} from '@mui/material';
import { red } from '@mui/material/colors';
import AddIcon from '@mui/icons-material/Add';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import DoneIcon from '@mui/icons-material/Done';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import CloseIcon from '@mui/icons-material/Close';
import EditNoteIcon from '@mui/icons-material/EditNote';

const apiUrl = process.env.REACT_APP_API_URL;

const PartyManager = () => {
  const [parties, setParties] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);
  const [newParty, setNewParty] = useState({ notes: '' });
  const [deactivatePartyId, setDeactivatePartyId] = useState(null);
  const [deactivatedPartyId, setDeactivatedPartyId] = useState(null); // for seat deactivation
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [orderSent, setOrderSent] = useState(false);
  const [orderTicketsUpdated, setOrderTicketsUpdated] = useState(false);
  const [newPartyId, setNewPartyId] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [editMode, setEditMode] = useState("cancel");
  
  const axios = useAxios();

  // fetch data
  useEffect(() => {
    fetchParties();
    fetchPartyOrders();
  }, []);

  // order sent
  useEffect(() => {
    if (orderSent) {
      fetchPartyOrders();
      setOrderSent(false);
      setOrderTicketsUpdated(!orderTicketsUpdated); // Trigger re-render of OrderTickets
    }
  }, [orderSent]);

  const fetchParties = async () => {
    try {
      const response = await axios.get(`${apiUrl}/parties`);
      setParties(response.data);
    } catch (error) {
      console.error('Error fetching parties', error);
    }
  };

  const fetchPartyOrders = async () => {
    try {
      const response = await axios.get(`${apiUrl}/orders?fulfilled=all`);
      const orders = response.data.reduce((acc, order) => {
        if (!acc[order.partyid]) {
          acc[order.partyid] = [];
        }
        acc[order.partyid].push(...order.items);
        return acc;
      }, {});
    } catch (error) {
      console.error('Error fetching party orders', error);
    }
  };

  const handleSeatClick = (seatIds, partyId) => {
    setSelectedParty(parties.find(party => party.partyid === partyId));
    setDeactivatePartyId(null);
    setSelectedSeats(seatIds);
  };

  const handleEditParty = (party) => {
    setSelectedParty(party);
    setDeactivatePartyId(null);
  };

  const handleSaveParty = () => {
    if (!selectedParty) return;
    
    axios.put(`${apiUrl}/parties/${selectedParty.partyid}`, selectedParty)
      .catch(error => console.error('Error updating party info', error));

    axios.post(`${apiUrl}/parties/assignSeats/${selectedParty.partyid}`, { seat_ids: selectedSeats })
      .catch(error => console.error('Error assigning seats to party', error));

    setParties(prevParties => prevParties.map(p => p.partyid === selectedParty.partyid ? selectedParty : p));
    // setNewPartyId(selectedParty.partyid);
    setSelectedParty(null);
    setSelectedSeats([]);
    setEditMode("save");
  };

  const handleCancelEdit = () => {
    setSelectedParty(null);
    setSelectedSeats([]);
    setEditMode("cancel");
  }

  const handleCreatePartyWithSelectedSeats = async () => {
    try {
      // create new party
      const newPartyResponse = await axios.post(`${apiUrl}/parties/add`, newParty);
      const newPartyId = newPartyResponse.data.party_id;

      const newPartyData = { partyid: newPartyId, notes: newParty.notes };
      setParties(prevParties => [...prevParties, newPartyData]);

      // Assign seats to the newly created party
      await axios.post(`${apiUrl}/parties/assignSeats/${newPartyId}`, { seat_ids: selectedSeats });
      setNewParty({ notes: '' });
      setSelectedParty(newPartyData);
      setNewPartyId(newPartyId);
    } catch (error) {
      console.error('Error creating party with selected seats', error);
    }
  };

  const handleConfirmDeactivate = (partyId) => {
    setDeactivatePartyId(partyId);
  };

  const handleDeactivateParty = (partyId) => {
    axios.delete(`${apiUrl}/parties/${partyId}`)
      .catch(error => console.error('Error deactivating party', error));

    setParties(prevParties => prevParties.filter(p => p.partyid !== partyId));
    setOrderTicketsUpdated(!orderTicketsUpdated);
    setDeactivatedPartyId(deactivatePartyId);
    setSelectedSeats([]);
    setSelectedParty(null);
    setDeactivatePartyId(null);
  };

  const handleOrderSent = () => {
    setOrderSent(true);
    setOrderTicketsUpdated(!orderTicketsUpdated);
    togglePopup();
  };

  const handleOrderTicketClick = (partyId) => {
    const party = parties.find(p => p.partyid === partyId);
    if (party) {
      handleEditParty(party);
    }
  };

  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
  };

  return (
    <div>
      <div className="party-manager-container">
        <Seats 
          onSeatClick={handleSeatClick} 
          newPartyId={newPartyId}
          controlMode={editMode}
          deactivatePartyId={deactivatedPartyId}
        />
        <div className="actions">
          <IconButton onClick={() => togglePopup()} aria-label="Order">
            <AddIcon sx={{ fontSize: 80 }} />
          </IconButton>
          {selectedSeats.length > 0 && !selectedParty && (
            <div className="create-party-container">
              <IconButton onClick={handleCreatePartyWithSelectedSeats} aria-label="Create Party">
                <GroupAddIcon sx={{ fontSize: 80 }} />
              </IconButton>
            </div>
          )}
          {selectedParty && (
            <div className="party-actions">
              {editMode === "edit" ? (
                <div>
                  <IconButton onClick={handleCancelEdit} aria-label="CancelEdit">
                    <EditNoteIcon sx={{ fontSize: 80, color: red[500] }} />
                  </IconButton>
                  <IconButton onClick={handleSaveParty} aria-label="Save">
                    <DoneIcon sx={{ fontSize: 80 }} />
                  </IconButton>
                </div>
              ) : (
                <div>
                  <IconButton onClick={() => setEditMode("edit")} aria-label="Edit">
                    <EditNoteIcon sx={{ fontSize: 80 }} />
                  </IconButton>
                  {deactivatePartyId === selectedParty.partyid ? (
                    <IconButton className="deactivate-confirm" onClick={() => handleDeactivateParty(selectedParty.partyid)} aria-label="Confirm Deactivate">
                      <DirectionsRunIcon sx={{ fontSize: 80, color: red[500] }} />
                    </IconButton>
                  ) : (
                    <IconButton onClick={() => handleConfirmDeactivate(selectedParty.partyid)} aria-label="Deactivate">
                      <DirectionsRunIcon sx={{ fontSize: 80 }} />
                    </IconButton>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        {isPopupVisible && (
          <div className="popup-container">
            <div className="popup-content">
              <div className="popup-actions">
                <IconButton onClick={togglePopup} aria-label="Close">
                  <CloseIcon />
                </IconButton>
              </div>
              <Order partyId={selectedParty ? selectedParty.partyid : null} onOrderSent={handleOrderSent} />
            </div>
          </div>
        )}
      </div>
      <OrderTickets key={orderTicketsUpdated} onOrderTicketClick={handleOrderTicketClick} />
    </div>
  );
};

export default PartyManager;
