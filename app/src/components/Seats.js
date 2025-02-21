import useAxios from '../hooks/useAxiosAuth';
import React, { useState, useEffect } from 'react';
import './Seats.css';
import { Paper } from '@mui/material';

const apiUrl = process.env.REACT_APP_API_URL;

const Seats = ({ onSeatClick, newPartyId, controlMode, deactivatePartyId }) => {
    const axios = useAxios();
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [editMode, setEditMode] = useState(false);

    // fetch seats data from the server
    useEffect(() => {
        const fetchSeats = async () => {
            try {
                const response = await axios.get(`${apiUrl}/seats`);
                setSeats(response.data);
            } catch (error) {
                console.error('Error fetching seats', error);
            }
        };
        fetchSeats();
    }, []); 

    // new party created
    useEffect(() => {
        if (newPartyId) {
            const updatedSeats = seats.map(seat => {
                if (selectedSeats.includes(seat)) {
                    return { ...seat, partyid: newPartyId };
                }
                return seat;
            });
            setSeats(updatedSeats);
            setSelectedSeats(updatedSeats.filter(seat => seat.partyid === newPartyId)); 
        }
        // deselect all seats 
        else {
            setSelectedSeats([]);
        }
    }, [newPartyId]);

    // party deactivation
    useEffect(() => {
        if (deactivatePartyId) {
            const updatedSeats = seats.map(seat => {
                if (seat.partyid === deactivatePartyId) {
                    return { ...seat, partyid: null };
                }
                return seat;
            });
            setSeats(updatedSeats);
            setSelectedSeats([]);
        }
    }, [deactivatePartyId]);

    // control mode updated
    useEffect(() => {
        if(controlMode === "edit") {
            setEditMode(true);
        }
        else if(controlMode === "cancel") {
            if (selectedSeats.length === 0) return;
            setSelectedSeats([]);
            setEditMode(false);
        }
        else if(editMode && controlMode === "save") {
            if(selectedSeats.length === 0) return;
            const partyId = selectedSeats[0].partyid;
            const updatedSeats = seats.map(seat => {
                if(seat.partyid === partyId && !selectedSeats.find(selectedSeat => selectedSeat.seatid === seat.seatid)) {
                    return { ...seat, partyid: null };
                }
                else if(selectedSeats.find(selectedSeat => selectedSeat.seatid === seat.seatid)) {
                    return { ...seat, partyid: partyId };
                }
                return seat;
            });
            setSeats(updatedSeats);
            setSelectedSeats([]);
            setEditMode(false); 
        }
        else return;
    }, [controlMode]);

    // deselect all seats when clicking outside the seating area
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!editMode && !event.target.closest('[aria-label]') && !event.target.closest('.seat-paper')) {
                setSelectedSeats([]);
                onSeatClick([], null);
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [editMode]); // Add editMode as a dependency

    const handleSeatClick = (seat) => {
        let partyId = seat.partyid;
        // cannot click on other party's seats in edit mode
        if (editMode && partyId && selectedSeats.length > 0 && selectedSeats[0].partyid !== partyId) {
            return;
        }
        // drop selected seats if not in edit mode
        let prevSelectedSeats = selectedSeats;
        if(!editMode && selectedSeats.length > 0 && selectedSeats[0].partyid) {
            prevSelectedSeats = [];
        }
        // set partyId to previously selected party if in edit mode
        if(editMode && selectedSeats.length > 0) {
            partyId = selectedSeats[0].partyid;
        }

        let newSelectedSeats;
        if((editMode && partyId) || !partyId) { // normally select/deselect seat
            if (selectedSeats.includes(seat)) { // deselect seat
                // do not allow deselection if no seats are left after deselecting
                if (partyId && prevSelectedSeats.length === 1) {
                    return;
                }
                newSelectedSeats = selectedSeats.filter(selectedSeat => selectedSeat !== seat);
            }
            else { // select seat
                newSelectedSeats = [...prevSelectedSeats, seat];
            }
        }
        else { // select all seats of the party
            newSelectedSeats = seats.filter(seat => seat.partyid === partyId);
        }
        setSelectedSeats(newSelectedSeats);
        onSeatClick(newSelectedSeats.map(seat => seat.seatid), partyId);
    };

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
                                onClick={() => seat && handleSeatClick(seat)}
                            >
                                {seat && (
                                    <Paper className="seat-paper" elevation={3} style={{ color: 'white' }}>
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

    const getSeatStatus = (seat) => {
        if (selectedSeats.some(selectedSeat => selectedSeat.seatid === seat.seatid)) {
            return 'selected';
        } else if (!seat.partyid) {
            return 'vacant';
        } else {
            return 'occupied';
        }
    };

    const floors = [...new Set(seats.map(seat => seat.floor))].sort(); // Get unique floor numbers

    return (
        <div className="seating-container">
            {floors.map(floor => renderSeats(floor))}
        </div>
    );
};

export default Seats;