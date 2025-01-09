import useAxios from '../hooks/useAxios';
import React, { useState, useEffect } from 'react';

const apiUrl = process.env.REACT_APP_API_URL;



const Order = () => {
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
                prevOrders.map(order =>
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

    return (
        <div>
            {sortedOrders.map(order => (
                <div key={order.orderid} style={{ display: 'inline-block', margin: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', width: '200px' }}>
                    <h3>Order Date: {new Date(order.orderdate).toLocaleString()}</h3>
                    <p>Order Type: {order.ordertype}</p>
                    <p>Payment Method: {order.paymentmethod}</p>
                    <p>Total Amount: {Number(order.totalamount).toFixed(0)}</p>
                    <ul>
                        {order.items.map(item => (
                            <li key={item.OrderItemID}>
                                <span>{item.ProductName} - {item.Quantity}</span>
                                <button
                                    style={{
                                        marginLeft: '10px',
                                        padding: '5px 10px',
                                        backgroundColor: item.prepared ? 'green' : 'red',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '3px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handlePreparedChange(order.orderid, item.OrderItemID, !item.prepared)}
                                >
                                    {item.prepared ? 'Prepared' : 'Not Prepared'}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default Order;