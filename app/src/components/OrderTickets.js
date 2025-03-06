import useAxios from '../hooks/useAxiosAuth';
import React, { useState, useEffect } from 'react';
import './OrderTickets.css';

const apiUrl = process.env.REACT_APP_API_URL;

const OrderTickets = ({ onOrderTicketClick, partyUpdate }) => {
    const axios = useAxios();

    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(`${apiUrl}/orders`);
                const ordersWithPreparedQuantity = response.data.map(order => ({
                    ...order,
                    items: order.items.map(item => ({
                        ...item,
                        PreparedQuantity: item.Delivered ? item.Quantity : 0 // Initialize PreparedQuantity based on Delivered status
                    }))
                }));
                setOrders(ordersWithPreparedQuantity);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchOrders();
    }, []);

    useEffect(() => {
        if(partyUpdate && partyUpdate.party) {
            setOrders(orders.map(order => {
                if (partyUpdate.party === order.partyid) {
                    const updatedOrder = { ...order };
                    updatedOrder.seat_ids = partyUpdate.seats;
                    return updatedOrder;
                }
                return order;
            }));
        }
        else return;
    }, [partyUpdate]);

    // Sort orders by orderdate
    const sortedOrders = orders.sort((a, b) => new Date(a.orderdate) - new Date(b.orderdate));

    const handlePreparedChange = (orderId, orderItemId) => {
        const updatedOrders = [...orders];
        const orderIndex = updatedOrders.findIndex(order => order.orderid === orderId);
        if (orderIndex !== -1) {
            const itemIndex = updatedOrders[orderIndex].items.findIndex(item => item.OrderItemID === orderItemId);
            if (itemIndex !== -1) {
                const updatedItem = { ...updatedOrders[orderIndex].items[itemIndex] };
                if(updatedItem.PreparedQuantity === updatedItem.Quantity)
                    updatedItem.PreparedQuantity = 0; // Reset PreparedQuantity to zero
                else 
                    updatedItem.PreparedQuantity =  updatedItem.Quantity;
                updatedOrders[orderIndex].items[itemIndex] = updatedItem;

                setOrders(updatedOrders);
                axios.put(`${apiUrl}/orders/delivered/${orderItemId}`).then(() => {
                }).catch(error => {
                    console.error('Error updating item preparation status:', error);
                });
            }
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
                        onClick={() => onOrderTicketClick(order.partyid)} // Call handler on click
                    >
                        <h3>{new Date(order.orderdate).toLocaleTimeString()}</h3>
                        <p>Total: {Number(order.totalamount).toFixed(0)}</p>
                        {order.seat_ids.length > 0 && (
                          <p>Seats: {order.seat_ids.join(', ')}</p> // Display seat IDs
                        )}
                        <ul>
                            {order.items.map(item => (
                                <li
                                    key={item.OrderItemID}
                                    onClick={() => handlePreparedChange(order.orderid, item.OrderItemID)}
                                >
                                    <span style={{ float: 'left' }}>
                                        {item.ProductName}
                                        {item.AddOns && item.AddOns.length > 0 && `(${item.AddOns.map(a => a.name).join(', ')})`}
                                    </span>
                                    <span style={{ float: 'right' }}>
                                        {item.PreparedQuantity}/{item.Quantity}
                                    </span>
                                    <div
                                        className="progress-bar"
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            height: '100%',
                                            width: `${(item.PreparedQuantity / item.Quantity) * 100}%`,
                                            backgroundColor: 'rgb(3, 158, 3)',
                                            zIndex: -1,
                                        }}
                                    ></div>
                                </li>
                            ))}
                        </ul>
                        {order.items.every(item => item.PreparedQuantity === item.Quantity) && (
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