import useAxios from '../hooks/useAxios';
import React, { useState, useEffect } from 'react';
import './OrderTickets.css';

const apiUrl = process.env.REACT_APP_API_URL;

const OrderTickets = ({ onOrderTicketClick }) => {
    const axios = useAxios();

    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(`${apiUrl}/orders`);
                setOrders(response.data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchOrders();
    }, []);

    // Sort orders by orderdate
    const sortedOrders = orders.sort((a, b) => new Date(a.orderdate) - new Date(b.orderdate));

    const handlePreparedChange = async (orderId, orderItemId, prepared) => {
        try {
            await axios.put(`${apiUrl}/orders/delivered/${orderItemId}`);
            setOrders(prevOrders =>
                prevOrders
                    .map(order =>
                        order.orderid === orderId
                            ? {
                                ...order,
                                items: order.items.map(item =>
                                    item.OrderItemID === orderItemId ? { ...item, prepared } : item
                                ),
                              }
                            : order
                    )
            );
        } catch (error) {
            console.error('Error updating item preparation status:', error);
        }
    };

    const handleDiscardOrder = async (orderId) => {
        try {
            setOrders(prevOrders => prevOrders.filter(order => order.orderid !== orderId));
        } catch (error) {
            console.error('Error discarding order:', error);
        }
    };

    return (
        <div className="order-tickets-wrapper">
            <div className="order-tickets-container">
                {sortedOrders.map(order => (
                    <div
                        key={order.orderid}
                        className={`order-ticket ${order.ordertype === 'Take-out' ? 'take-out' : ''}`}
                        style={{ display: 'inline-block', margin: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', width: '200px' }}
                        onClick={() => onOrderTicketClick(order.partyid)} // Call handler on click
                    >
                        <h3>{new Date(order.orderdate).toLocaleTimeString()}</h3>
                        <p>Total: {Number(order.totalamount).toFixed(0)}</p>
                        {order.seat_ids.length > 0 && (
                          <p>Seats: {order.seat_ids.join(', ')}</p> // Display seat IDs
                        )}
                        <ul>
                            {order.items.map(item => (
                                <li key={item.OrderItemID} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{item.ProductName} - {item.Quantity}</span>
                                    <button
                                        className={`button ${item.prepared ? 'prepared' : ''}`}
                                        onClick={() => handlePreparedChange(order.orderid, item.OrderItemID, !item.prepared)}
                                    >
                                        {item.prepared ? 'Prepared' : 'Preparing...'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        {order.items.every(item => item.prepared) && (
                            <button className="button discard" onClick={() => handleDiscardOrder(order.orderid)}>
                                Complete!
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderTickets;