import useAxios from '../hooks/useAxiosAuth';
import React, { useState, useEffect } from 'react';
import './OrderManager.css';

const apiUrl = process.env.REACT_APP_API_URL;

function OrderManager({ partyId, orderId }) {
  const [orders, setOrders] = useState([]);
  const [party, setParty] = useState(null);
  const [singleOrderId, setSingleOrderId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [checkoutMessage, setCheckoutMessage] = useState('');

  const axios = useAxios();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${apiUrl}/orders?party_id=${partyId}`);
        console.log('Orders:', response.data);
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      }
    };

    const fetchOrderById = async () => {
      try {
        const response = await axios.get(`${apiUrl}/orders/${orderId}`);
        console.log('Order:', response.data);
        setOrders([response.data]);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      }
    };

    if (partyId) {
        fetchOrders();
        setParty(partyId);
    }
    else if (orderId) {
      fetchOrderById();
    }

    const fetchPaymentMethods = async () => {
      try {
        const response = await axios.get(`${apiUrl}/orders/paymentmethods`);
        setPaymentMethods(response.data);
      } catch (error) {
        console.error('Failed to fetch payment methods:', error);
      }
    };
    fetchPaymentMethods();
  }, [partyId, orderId]);

  const handleDeleteOrder = async (orderId) => {
    try {
      await axios.delete(`${apiUrl}/orders/${orderId}`);
      setOrders(orders.filter(order => order.id !== orderId));
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };

  const handleCheckout = async () => {
    if(!party) { // checkout the only order
      try {
        await axios.put(`${apiUrl}/orders/${orders[0].orderid}`, {
            paid: true,
            payment_method: paymentMethod
        });
        setCheckoutMessage('Checkout successful!');
        const response = await axios.get(`${apiUrl}/orders/${orders[0].orderid}`);
        setOrders([response.data]);
      }
      catch (error) {
        console.error('Failed to checkout order:', error);
      }
      return;
    }
    
    try { // checkout all remaining orders for party
      await axios.put(`${apiUrl}/orders/checkout/${party}`, {
        payment_method: paymentMethod
      });
      setCheckoutMessage('Checkout successful!');
      const response = await axios.get(`${apiUrl}/orders?party_id=${party}`);
      setOrders(response.data);
    } catch (error) {
      console.error('Checkout failed:', error);
      setCheckoutMessage('Checkout failed. Please try again.');
    }
  };

  const confirmDelete = (orderId) => {
    setSelectedOrder(orderId);
    setShowConfirmDelete(true);
  };

  const cancelDelete = () => {
    setSelectedOrder(null);
    setShowConfirmDelete(false);
  };

  const handleConfirmDelete = async () => {
    if (selectedOrder) {
      await handleDeleteOrder(selectedOrder);
      setSelectedOrder(null);
      setShowConfirmDelete(false);
    }
  };

  const totalRemainingAmount = orders
    .filter(order => !order.paidtime)
    .reduce((total, order) => total + Math.round(parseFloat(order.totalamount)), 0);

  return (
    <div className="order-manager-container">
      <div className="order-manager-wrapper">
        {orders.map(order => (
          <div key={order.orderid} className={`order-row ${order.paidtime ? 'paid-order' : ''}`}>
            <div className='order-info'>
              <span>{new Date(order.orderdate).toLocaleTimeString()}</span>
              <div className='item-list'>
                {order.items?.map(item => (
                  <div className='item-info' key={item.OrderItemID}>
                    <strong>
                      {item.ProductName}
                      {item.AddOns && item.AddOns.length > 0 && (
                        ` (${item.AddOns.map(addon => addon.name).join(', ')})`
                      )}
                    </strong>
                    <span>{item.Quantity}</span>
                  </div>
                ))}
              </div>
              <span className="order-total">${Math.round(parseFloat(order.totalamount))}</span>
            </div>
            <button className="delete-btn" onClick={() => confirmDelete(order.orderid)}>
              Delete
            </button>
          </div>
        ))}
      </div>
      {showConfirmDelete && (
        <div className="delete-confirm-popup">
          <p>Are you sure you want to delete this order?</p>
          <div className="delete-confirm-buttons">
            <button onClick={handleConfirmDelete}>Yes</button>
            <button onClick={cancelDelete}>No</button>
          </div>
        </div>
      )}
      <div className="checkout-section">
        <div className="total-remaining">
          Total Remaining: ${totalRemainingAmount}
        </div>
        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
          <option value="">Select Payment</option>
          {paymentMethods.map(method => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>
        <button onClick={handleCheckout} disabled={paymentMethod === '' || totalRemainingAmount === 0}>
          Checkout
        </button>
      </div>
      {checkoutMessage && (
        <div className="checkout-message">
          {checkoutMessage}
        </div>
      )}
    </div>
  );
}

export default OrderManager;