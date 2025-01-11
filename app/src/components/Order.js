import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';
import './Order.css';

const apiUrl = process.env.REACT_APP_API_URL;

const OrderComponent = ({ partyId, onOrderSent }) => {
  const [menu, setMenu] = useState([]);
  const [order, setOrder] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    axios.get(`${apiUrl}/menu`)
      .then(response => {
        setMenu(response.data);
        setActiveTab(response.data[0]?.categoryid);
      })
      .catch(error => console.error('Error fetching menu:', error));
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
    axios.post(`${apiUrl}/orders/new/${partyId}`, {
      payment_method: 'LinePay',
      order_type: 'Dine-in',
      items: order
    })
    .then(response => {
      console.log('Order sent:', response);
      onOrderSent();
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
      <div className="order-summary">
        <h3>Order Summary</h3>
        <ul>
          {order.map((item, index) => (
            <li key={index}>
              {item.product_name} - {item.quantity}
              <button className="quantity-button" onClick={() => handleDecreaseQuantity(index)}>-</button>
              <button className="quantity-button" onClick={() => handleIncreaseQuantity(index)}>+</button>
              <FaTrash className="trash-icon" onClick={() => handleRemoveItem(index)} />
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
        <button className="send-button" onClick={handleSendOrder}>Send Order</button>
      </div>
    </div>
  );
};

export default OrderComponent;