import useAxios from '../hooks/useAxios';
import React, { useState, useEffect } from 'react';
import './PartyManager.css';
import './Route.css';
import Order from './Order';
import {
  Paper,
  TextField,
  Button
} from '@mui/material';

const apiUrl = process.env.REACT_APP_API_URL;

const PartyManager = () => {
  const [parties, setParties] = useState([]);
  const [seats, setSeats] = useState([]);
  const [editingParty, setEditingParty] = useState(null);
  const [editingPartySeats, setEditingPartySeats] = useState([]);
  const [newParty, setNewParty] = useState({ partysize: '', notes: '' });
  const [deactivatePartyId, setDeactivatePartyId] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [partyOrders, setPartyOrders] = useState([]);

  const axios = useAxios();

  useEffect(() => {
    fetchParties();
    fetchSeats();
    fetchPartyOrders();
  }, []);

  const fetchParties = async () => {
    try {
      const response = await axios.get(`${apiUrl}/parties`);
      setParties(response.data);
    } catch (error) {
      console.error('Error fetching parties', error);
    }
  };

  const fetchSeats = async () => {
    try {
      const response = await axios.get(`${apiUrl}/seats`);
      const updatedSeats = response.data.map(seat => ({
        ...seat,
        status: seat.partyid ? 'occupied' : 'vacant'
      }));
      setSeats(updatedSeats);
    } catch (error) {
      console.error('Error fetching seats', error);
    }
  };

  const fetchPartyOrders = async () => {
    try {
      const response = await axios.get(`${apiUrl}/orders`);
      console.log(response.data);
      const orders = response.data.reduce((acc, order) => {
        acc[order.partyid] = order.items;
        return acc;
      }, {});
      console.log(orders);
      setPartyOrders(orders);
    } catch (error) {
      console.error('Error fetching party orders', error);
    }
  };

  const handleSeatClick = (seatId) => {
    const seatIndex = seats.findIndex(seat => seat.seatid === seatId);
    if (seatIndex !== -1) {
      const updatedSeats = [...seats];
      const seat = updatedSeats[seatIndex];

      if (editingParty) {
        // In edit mode
        if (seat.partyid === editingParty.partyid) {
          // Deselect seat only if more than one seat is assigned
          if (editingPartySeats.length > 1) {
            seat.partyid = null;
            setEditingPartySeats(editingPartySeats.filter(id => id !== seatId));
            setEditingParty({ ...editingParty, partysize: editingPartySeats.length - 1 }); // Update party size
          }
        } else if (!seat.partyid) {
          // Assign seat to the editing party
          seat.partyid = editingParty.partyid;
          setEditingPartySeats([...editingPartySeats, seatId]);
          setEditingParty({ ...editingParty, partysize: editingPartySeats.length + 1 }); // Update party size
        }
      } else {
        // Not in edit mode
        if (!seat.partyid) {
          seat.partyid = 'selected';
          setSelectedSeats([...selectedSeats, seatId]);
          setNewParty({ ...newParty, partysize: selectedSeats.length + 1 }); // Update party size
        } else if (seat.partyid === 'selected') {
          seat.partyid = null;
          setSelectedSeats(selectedSeats.filter(id => id !== seatId));
          setNewParty({ ...newParty, partysize: selectedSeats.length - 1 }); // Update party size
        } else {
          // Enter edit mode for the party occupying the seat
          const party = parties.find(p => p.partyid === seat.partyid);
          if (party) {
            handleEditParty(party);
          }
        }
      }

      setSeats(updatedSeats);
    }
  };

  const handleEditParty = (party) => {
    setEditingParty(party);
    setDeactivatePartyId(null);

    // Set the initial seats for the editing party
    const initialSeats = seats.filter(seat => seat.partyid === party.partyid).map(seat => seat.seatid);
    setEditingPartySeats(initialSeats);
  };

  const getSeatStatus = (seat) => {
    if (!seat.partyid) {
      return 'vacant';
    } else if (seat.partyid === 'selected') {
      return 'selected';
    } else if (seat.partyid === editingParty?.partyid) {
      return 'selected';
    } else {
      return 'occupied';
    }
  };

  const handleSaveParty = async () => {
    if (!editingParty) return;
    try {
      // Update party info
      await axios.put(`${apiUrl}/parties/${editingParty.partyid}`, editingParty);

      // Assign seats to the party
      await axios.post(`${apiUrl}/parties/assignSeats/${editingParty.partyid}`, { seat_ids: editingPartySeats });

      fetchParties();
      fetchSeats();
      setEditingParty(null);
    } catch (error) {
      console.error('Error saving party', error);
    }
  };

  const handleDeactivateParty = async (partyId) => {
    try {
      await axios.delete(`${apiUrl}/parties/${partyId}`);
      fetchParties();
      fetchSeats();
      fetchPartyOrders();
      setEditingParty(null);
    } catch (error) {
      console.error('Error deactivating party', error);
    }
  };

  const handleCreatePartyWithSelectedSeats = async () => {
    try {
      const newPartyResponse = await axios.post(`${apiUrl}/parties/add`, newParty);
      const newPartyId = newPartyResponse.data.party_id;

      await axios.post(`${apiUrl}/parties/assignSeats/${newPartyId}`, { seat_ids: selectedSeats });

      fetchParties();
      fetchSeats();
      setNewParty({ partysize: '', notes: '' });
      setSelectedSeats([]);
    } catch (error) {
      console.error('Error creating party with selected seats', error);
    }
  };

  const handleConfirmDeactivate = (partyId) => {
    setDeactivatePartyId(partyId);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deactivatePartyId && !event.target.closest('.deactivate-confirm')) {
        setDeactivatePartyId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [deactivatePartyId]);

  const seatSize = 4; // Size of each seat box in pixels
  const floors = [...new Set(seats.map(seat => seat.floor))].sort(); // Get unique floor numbers

  const renderSeats = (floor) => (
    <div className="floor-container" key={floor}>
      {seats.filter(seat => seat.floor === floor).map((seat) => (
        <div
          key={seat.seatid}
          onClick={() => handleSeatClick(seat.seatid)}
          className={`seat ${getSeatStatus(seat)}`}
          style={{
            top: `${seat.posx * seatSize}vh`,
            left: `${seat.posy * seatSize}vw`,
          }}
        >
          <Paper className="seat-paper">
            {`${seat.seatid}`}
          </Paper>
        </div>
      ))}
    </div>
  );

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedPartyId, setSelectedPartyId] = useState(null);

  const togglePopup = (partyId = null) => {
    setSelectedPartyId(partyId);
    setIsPopupVisible(!isPopupVisible);
  };

  const handleOrderSent = () => {
    setIsPopupVisible(false);
  };

  return (
    <div>
      <div className="route-title-container">
        <h1>Party Management</h1>
      </div>
      <div className="seating-container">
        {floors.map(floor => renderSeats(floor))}
      </div>
      {selectedSeats.length > 0 && !editingParty && (
        <div className="create-party-container">
          <div>Party Size: {selectedSeats.length}</div> {/* Display the number of selected seats */}
          <TextField
            label="Notes"
            value={newParty.notes}
            onChange={(e) => setNewParty({ ...newParty, notes: e.target.value })}
          />
          <Button className="create-party-button" onClick={handleCreatePartyWithSelectedSeats}>Create Party</Button>
        </div>
      )}
      {editingParty && (
        <div className="seat-info-box">
          <div>Party Size: {editingPartySeats.length}</div> {/* Display the number of selected seats */}
          <TextField
            label="Notes"
            value={editingParty.notes}
            onChange={(e) => setEditingParty({ ...editingParty, notes: e.target.value })}
          />
          <Button onClick={() => togglePopup(editingParty.partyid)}>Order</Button>
          {deactivatePartyId === editingParty.partyid ? (
            <Button className="deactivate-confirm" onClick={() => handleDeactivateParty(editingParty.partyid)}>Confirm</Button>
          ) : (
            <Button onClick={() => handleConfirmDeactivate(editingParty.partyid)}>Deactivate</Button>
          )}
          <Button onClick={handleSaveParty}>Save</Button>
          <div className="party-orders">
            <h3>Orders</h3>
            {partyOrders[editingParty.partyid] && partyOrders[editingParty.partyid].length > 0 ? (
              <ul>
                {partyOrders[editingParty.partyid].map(order => (
                  <li key={order.ProductID}>{order.ProductName} - {order.Quantity}</li>
                ))}
              </ul>
            ) : (
              <p>No orders found</p>
            )}
          </div>
        </div>
      )}
      {isPopupVisible && (
        <div className="popup-container">
          <div className="popup-content">
            <Order partyId={selectedPartyId} onOrderSent={handleOrderSent} />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={togglePopup}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartyManager;
