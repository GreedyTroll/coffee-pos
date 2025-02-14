import React, { useState, useEffect } from 'react';
import useAxios from '../hooks/useAxiosAuth';
import { FaTrash } from 'react-icons/fa';
import './Order.css';

const apiUrl = process.env.REACT_APP_API_URL;

const OrderComponent = ({ partyId, onOrderSent }) => {
  const [menu, setMenu] = useState([]);
  const [order, setOrder] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [orderType, setOrderType] = useState(partyId ? 'Dine-in' : 'Take-out'); // Set default orderType

  const axios = useAxios();

  useEffect(() => {
    axios.get(`${apiUrl}/menu`)
      .then(response => {
        setMenu(response.data);
        setActiveTab(response.data[0]?.categoryid);
      })
      .catch(error => console.error('Error fetching menu:', error));

    axios.get(`${apiUrl}/orders/paymentmethods`)
      .then(response => {
        setPaymentMethods(response.data);
        setSelectedPaymentMethod(response.data[0]);
      })
      .catch(error => console.error('Error fetching payment methods:', error));
  }, []);

  const handleItemClick = (item) => {
    setOrder(prevOrder => {
      const existingItemIndex = prevOrder.findIndex(orderItem => orderItem.product_id === item.productid);
      if (existingItemIndex !== -1) {
        const updatedOrder = [...prevOrder];
        updatedOrder[existingItemIndex].quantity += 1;
        return updatedOrder;
      } else {
        return [...prevOrder, { product_id: item.productid, product_name: item.productname, quantity: 1 }];
      }
    });
  };

  const handleSendOrder = () => {
    onOrderSent(); // Trigger onOrderSent immediately
    axios.post(`${apiUrl}/orders/new`, {
      party_id: partyId,
      payment_method: selectedPaymentMethod,
      order_type: orderType,
      items: order
    })
    .catch(error => console.error('Error sending order:', error));
  };

  const handleRemoveItem = (index) => {
    setOrder(order.filter((_, i) => i !== index));
  };

  const handleIncreaseQuantity = (index) => {
    setOrder(prevOrder => {
      const updatedOrder = [...prevOrder];
      updatedOrder[index].quantity += 1;
      return updatedOrder;
    });
  };

  const handleDecreaseQuantity = (index) => {
    setOrder(prevOrder => {
      const updatedOrder = [...prevOrder];
      if (updatedOrder[index].quantity > 1) {
        updatedOrder[index].quantity -= 1;
      }
      return updatedOrder;
    });
  };

  const calculateTotalPrice = () => {
    return order.reduce((total, item) => {
      const menuItem = menu.find(menuItem => menuItem.productid === item.product_id);
      return total + (menuItem ? menuItem.price * item.quantity : 0);
    }, 0);
  };

  const categories = [...new Set(menu.map(item => item.categoryid))];

  return (
    <div className="order-component">
      <div className="order-wrapper">
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="payment-method">
            <label htmlFor="payment-method">Payment Method </label>
            <select
              id="payment-method"
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            >
              {paymentMethods.map((method, index) => (
                <option key={index} value={method}>{method}</option>
              ))}
            </select>
          </div>
          <div className="order-type">
            <label>
              <input
                type="radio"
                value="Dine-in"
                checked={orderType === 'Dine-in'}
                onChange={(e) => setOrderType(e.target.value)}
              />
              Dine-in
            </label>
            <label>
              <input
                type="radio"
                value="Take-out"
                checked={orderType === 'Take-out'}
                onChange={(e) => setOrderType(e.target.value)}
              />
              Take-out
            </label>
          </div>
          <ul>
            {order.map((item, index) => (
              <li key={index}>
                <span className="item-name">{item.product_name}</span>
                <span className="item-quantity">{item.quantity}</span>
                <div className="item-controls">
                  <button className="quantity-button" onClick={() => handleDecreaseQuantity(index)}>-</button>
                  <button className="quantity-button" onClick={() => handleIncreaseQuantity(index)}>+</button>
                  <FaTrash className="trash-icon" onClick={() => handleRemoveItem(index)} />
                </div>
              </li>
            ))}
          </ul>
          <div className="total-price">
            Total: ${calculateTotalPrice().toFixed(0)}
          </div>
        </div>
        <div className="order-content">
          <div className="tabs">
            {categories.map(categoryId => (
              <button
                key={categoryId}
                className={`tab ${activeTab === categoryId ? 'active' : ''}`}
                onClick={() => setActiveTab(categoryId)}
              >
                {menu.find(item => item.categoryid === categoryId)?.categoryname}
              </button>
            ))}
          </div>
          <div className="items">
            {menu.filter(item => item.categoryid === activeTab && item.productid).map(item => (
              <div key={item.productid} className="item" onClick={() => handleItemClick(item)}>
                {item.productname}  ${Math.round(item.price)}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="order-actions">
        <button className="send-button" onClick={handleSendOrder}>Send Order</button>
      </div>
    </div>
  );
};

export default OrderComponent;