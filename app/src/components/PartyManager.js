import useAxios from '../hooks/useAxios';
import React, { useState, useEffect } from 'react';
import './PartyManager.css';
import './Route.css';
import Order from './Order';
import OrderTickets from './OrderTickets'; // Import OrderTickets
import {
  Paper,
  TextField,
  Button,
  IconButton // Import IconButton
} from '@mui/material';
import { red } from '@mui/material/colors';
import AddIcon from '@mui/icons-material/Add'; // Import AddIcon
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; // Import ShoppingCartIcon
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'; // Import DirectionsRunIcon
import DoneIcon from '@mui/icons-material/Done'; // Import DoneIcon
import GroupAddIcon from '@mui/icons-material/GroupAdd'; // Import GroupAddIcon

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
  const [orderSent, setOrderSent] = useState(false);
  const [orderTicketsUpdated, setOrderTicketsUpdated] = useState(false);

  const axios = useAxios();

  useEffect(() => {
    fetchParties();
    fetchSeats();
    fetchPartyOrders();
  }, []);

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
      const response = await axios.get(`${apiUrl}/orders?fulfilled=all`);
      const orders = response.data.reduce((acc, order) => {
        if (!acc[order.partyid]) {
          acc[order.partyid] = [];
        }
        acc[order.partyid].push(...order.items);
        return acc;
      }, {});
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
        } else {
          // Switch to edit mode for the party occupying the seat
          const party = parties.find(p => p.partyid === seat.partyid);
          if (party) {
            handleEditParty(party);
          }
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
    } else if (partyOrders[seat.partyid]?.every(order => order.Delivered)) {
      return 'delivered';
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

      // Automatically enter edit mode for the new party
      const newPartyData = { partyid: newPartyId, partysize: selectedSeats.length, notes: newParty.notes };
      setEditingParty(newPartyData);
      setEditingPartySeats(selectedSeats);
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

  const floors = [...new Set(seats.map(seat => seat.floor))].sort(); // Get unique floor numbers

  const renderSeats = (floor) => {
    const rows = 10;
    const cols = 5;
    const grid = Array.from({ length: rows }, () => Array(cols).fill(null));

    seats.filter(seat => seat.floor === floor).forEach(seat => {
      if (seat.posx < rows && seat.posy < cols) {
        grid[seat.posx][seat.posy] = seat;
      } else {
        console.warn(`Seat position out of bounds: seatid=${seat.seatid}, posx=${seat.posx}, posy=${seat.posy}`);
      }
    });

    return (
      <div className="floor-container" key={floor}>
        {grid.map((row, rowIndex) => (
          <div className="seat-row" key={rowIndex}>
            {row.map((seat, colIndex) => (
              <div
                key={colIndex}
                className={`seat ${seat ? getSeatStatus(seat) : ''}`}
                onClick={() => seat && handleSeatClick(seat.seatid)}
              >
                {seat && (
                  <Paper className="seat-paper" elevation={3} style={{color: 'white'}}>
                    {`${seat.seatid}`}
                  </Paper>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedPartyId, setSelectedPartyId] = useState(null);

  const togglePopup = (partyId = null) => {
    setSelectedPartyId(partyId);
    setIsPopupVisible(!isPopupVisible);
  };

  const handleOrderSent = () => {
    setIsPopupVisible(false);
    setOrderSent(true);
    setOrderTicketsUpdated(!orderTicketsUpdated); // Trigger re-render of OrderTickets
  };

  const handleOrderTicketClick = (partyId) => {
    const party = parties.find(p => p.partyid === partyId);
    if (party) {
      handleEditParty(party);
    }
  };

  return (
    <div>
      <div className="party-manager-container">
        <div className="party-detail">
          {editingParty && (
            <div>
              <div>Party Size: {editingPartySeats.length}</div> {/* Display the number of selected seats */}
              <TextField
                className="notes-field" // Add this line
                label="Notes"
                value={editingParty.notes}
                onChange={(e) => setEditingParty({ ...editingParty, notes: e.target.value })}
              />
              <h3>Orders</h3>
              {partyOrders[editingParty.partyid] && partyOrders[editingParty.partyid].length > 0 ? (
                <ul>
                  {partyOrders[editingParty.partyid].map(order => (
                    <li key={`${order.OrderItemID}-${order.ProductID}`}>{order.ProductName} - {order.Quantity}</li>
                  ))}
                </ul>
              ) : (
                <p>No orders found</p>
              )}
            </div>
          )}
        </div>
        <div className="seating-container">
          {floors.map(floor => renderSeats(floor))}
        </div>
        <div className="actions">
          <IconButton onClick={() => togglePopup()} aria-label="Take-out Order">
            <AddIcon sx={{ fontSize: 80 }} />
          </IconButton>
          {selectedSeats.length > 0 && !editingParty && (
            <div className="create-party-container">
              <IconButton onClick={handleCreatePartyWithSelectedSeats} aria-label="Create Party">
                <GroupAddIcon sx={{ fontSize: 80 }} />
              </IconButton>
            </div>
          )}
          {editingParty && (
            <div className="party-actions">
              <IconButton onClick={() => togglePopup(editingParty.partyid)} aria-label="Order">
                <ShoppingCartIcon sx={{ fontSize: 80 }} />
              </IconButton>
              {deactivatePartyId === editingParty.partyid ? (
                <IconButton className="deactivate-confirm" onClick={() => handleDeactivateParty(editingParty.partyid)} aria-label="Confirm Deactivate">
                  <DirectionsRunIcon sx={{ fontSize: 80, color: red[500] }} />
                </IconButton>
              ) : (
                <IconButton onClick={() => handleConfirmDeactivate(editingParty.partyid)} aria-label="Deactivate">
                  <DirectionsRunIcon sx={{ fontSize: 80 }} />
                </IconButton>
              )}
              <IconButton onClick={handleSaveParty} aria-label="Save">
                <DoneIcon sx={{ fontSize: 80 }} />
              </IconButton>
            </div>
          )}
        </div>
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
      <OrderTickets key={orderTicketsUpdated} onOrderTicketClick={handleOrderTicketClick} /> {/* Pass handler to OrderTickets */}
    </div>
  );
};

export default PartyManager;
