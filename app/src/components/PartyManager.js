import useAxios from '../hooks/useAxios';
import React, { useState, useEffect, useRef } from 'react';
import './PartyManager.css';
import './Route.css'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  const editingPartyRef = useRef(editingParty);
  const deactivatePartyRef = useRef(deactivatePartyId);

  const axios = useAxios();

  useEffect(() => {
    fetchParties();
    fetchSeats();

    const handleClickOutside = (event) => {
      if (deactivatePartyRef.current && !event.target.closest('.deactivate-row')) {
        setDeactivatePartyId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [deactivatePartyId]);

  useEffect(() => {
    editingPartyRef.current = editingParty;
  }, [editingParty]);

  useEffect(() => {
    deactivatePartyRef.current = deactivatePartyId;
  }, [deactivatePartyId]);

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
        status: seat.partyid ? seat.partyid : 'vacant'
      }));
      setSeats(updatedSeats);
    } catch (error) {
      console.error('Error fetching seats', error);
    }
  };  

  const handleEditParty = (party) => {
    setEditingParty(party);
    setDeactivatePartyId(null);

    // Set the initial seats for the editing party
    const initialSeats = seats.filter(seat => seat.partyid === party.partyid).map(seat => seat.seatid);
    setEditingPartySeats(initialSeats);
  };

  const handleSaveParty = async () => {
    if (!editingParty) return;
    try {
      // Update party info
      await axios.put(`${apiUrl}/parties/${editingParty.partyid}`, editingParty);

      // Assign seats to the party
      await axios.post(`${apiUrl}/parties/assignSeats/${editingParty.partyid}`, { seat_ids: editingPartySeats });

      fetchParties();
      setEditingParty(null);
    } catch (error) {
      console.error('Error saving party', error);
    }
  };

  const handleDeactivateParty = async (partyId) => {
    try {
      await axios.delete(`${apiUrl}/parties/${partyId}`);
      fetchParties();
    } catch (error) {
      console.error('Error deactivating party', error);
    }
  };

  const handleCreateParty = async () => {
    try {
      await axios.post(`${apiUrl}/parties/add`, newParty);
      fetchParties();
      setNewParty({ partysize: '', notes: '' });
    } catch (error) {
      console.error('Error creating party', error);
    }
  };

  const handleSeatClick = (seatId) => {
    const seatIndex = seats.findIndex(seat => seat.seatid === seatId);
    if (seatIndex !== -1) {
      const updatedSeats = [...seats];
      const seat = updatedSeats[seatIndex];
  
      if (seat.status === 'vacant' || seat.partyid === editingParty?.partyid) {
        if (seat.status === 'vacant') {
          seat.status = editingParty.partyid;
          seat.partyid = editingParty.partyid;
          setEditingPartySeats([...editingPartySeats, seatId]);
        } else if (seat.status === editingParty.partyid) {
          seat.status = 'vacant';
          seat.partyid = null;
          setEditingPartySeats(editingPartySeats.filter(id => id !== seatId));
        }
  
        setSeats(updatedSeats);
      }
    }
  };
  
  const handleConfirmDeactivate = (partyId) => {
    setDeactivatePartyId(partyId);
  };

  const seatSize = 50; // Size of each seat box in pixels

  return (
    <div>
      <div className="route-title-container">
        <h1>Party Management</h1>
      </div>
      <div style={{ position: 'relative', width: seatSize * 11, height: seatSize * 12 }}>
        {seats.map((seat) => (
          <div
            key={seat.seatid}
            onClick={() => handleSeatClick(seat.seatid)}
            style={{
              position: 'absolute',
              top: seat.posx * seatSize,
              left: seat.posy * seatSize,
              cursor: 'pointer',
              width: seatSize,
              height: seatSize,
            }}
          >
            <Paper
              style={{
                padding: '5px',
                backgroundColor: seat.status === 'vacant' ? 'green' : (seat.status === editingParty?.partyid ? 'blue' : 'red'),
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {`${seat.seatid}`}
            </Paper>
          </div>
        ))}
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Party Size</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Add Items</TableCell>
              <TableCell>Total Price</TableCell>
              <TableCell>Seat Assignment</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <TextField
                  value={newParty.partysize}
                  onChange={(e) => setNewParty({ ...newParty, partysize: e.target.value })}
                  placeholder="Party Size"
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={newParty.notes}
                  onChange={(e) => setNewParty({ ...newParty, notes: e.target.value })}
                  placeholder="Notes"
                />
              </TableCell>
              <TableCell />
              <TableCell />
              <TableCell />
              <TableCell>
                <Button onClick={handleCreateParty}>Add</Button>
              </TableCell>
            </TableRow>
            {parties.map((party) => (
              <TableRow
                key={party.partyid}
                className={`editable-row ${editingParty?.partyid === party.partyid ? 'editing-row' : ''} ${deactivatePartyId === party.partyid ? 'deactivate-row' : ''}`}
              >
                <TableCell onClick={() => handleEditParty(party)}>
                  {editingParty?.partyid === party.partyid ? (
                    <TextField
                      value={editingParty.partysize}
                      onChange={(e) => setEditingParty({ ...editingParty, partysize: e.target.value })}
                    />
                  ) : (
                    party.partysize
                  )}
                </TableCell>
                <TableCell onClick={() => handleEditParty(party)}>
                  <TextField
                    value={editingParty?.partyid === party.partyid ? editingParty.notes : party.notes}
                    onChange={(e) => setEditingParty({ ...editingParty, notes: e.target.value })}
                    disabled={editingParty?.partyid !== party.partyid}
                  />
                </TableCell>
                <TableCell onClick={() => handleEditParty(party)}>
                  <Button onClick={() => console.log('Add Items')}>Add Items</Button>
                </TableCell>
                <TableCell onClick={() => handleEditParty(party)}>{party.totalprice}</TableCell>
                <TableCell onClick={() => handleEditParty(party)}>{party.seatassignment}</TableCell>
                <TableCell>
                  {editingParty?.partyid === party.partyid ? (
                    <Button onClick={handleSaveParty}>Save</Button>
                  ) : deactivatePartyId === party.partyid ? (
                    <Button onClick={() => handleDeactivateParty(party.partyid)}>Confirm</Button>
                  ) : (
                    <Button onClick={() => handleConfirmDeactivate(party.partyid)}>Deactivate</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default PartyManager;
