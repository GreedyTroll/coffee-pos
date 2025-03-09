import React, { useState, useEffect } from 'react';
import useAxios from '../hooks/useAxiosAuth';
import { FaTrash } from 'react-icons/fa';
import './Order.css';
import AddonsModal from './AddonsModal';

const apiUrl = process.env.REACT_APP_API_URL;

const OrderComponent = ({ partyId, onOrderSent }) => {
  const [menu, setMenu] = useState([]);
  const [party, setParty] = useState(null);
  const [order, setOrder] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [orderType, setOrderType] = useState(partyId ? 'Dine-in' : 'Take-out'); // Set default orderType
  const [showAddonsModal, setShowAddonsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const axios = useAxios();

  const processMenuData = (data) => {
    return data;
  };

  useEffect(() => {
    axios.get(`${apiUrl}/menu`)
      .then(response => {
        setMenu(processMenuData(response.data));
      })
      .catch(error => console.error('Error fetching menu:', error));

    axios.get(`${apiUrl}/orders/paymentmethods`)
      .then(response => {
        setPaymentMethods(response.data);
        setSelectedPaymentMethod(response.data[0]);
      })
      .catch(error => console.error('Error fetching payment methods:', error));

    setParty(partyId);
  }, []);

  const handleItemClick = (item) => {
    setSelectedProduct(item);
    setShowAddonsModal(true);
  };

  const handleConfirmAddons = (product, selectedAddons) => {
    setOrder((prevOrder) => {
      const existingItemIndex = prevOrder.findIndex((o) =>
        o.product_id === product.productid &&
        JSON.stringify(o.addons.map(a => a.addonid).sort()) ===
        JSON.stringify(selectedAddons.map(a => a.addonid).sort())
      );
      if (existingItemIndex !== -1) {
        const updatedOrder = [...prevOrder];
        updatedOrder[existingItemIndex].quantity += 1;
        updatedOrder[existingItemIndex].addons = selectedAddons;
        return updatedOrder;
      } else {
        return [
          ...prevOrder,
          {
            product_id: product.productid,
            product_name: product.productname,
            quantity: 1,
            addons: selectedAddons
          }
        ];
      }
    });
  };

  const handleSendOrder = () => {
    // only send addon ids to the server
    const orderWithAddonIds = order.map(item => ({
      ...item,
      addons: item.addons.map(addon => addon.addonid),
    }));
    onOrderSent();
    axios.post(`${apiUrl}/orders/new`, {
      party_id: (orderType === 'Take-out') ? null : party,
      payment_method: selectedPaymentMethod,
      order_type: orderType,
      items: orderWithAddonIds
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
      const category = menu.find(category =>
        category.items.some(product => product.productid === item.product_id)
      );
      const menuItem = category
        ? category.items.find(product => product.productid === item.product_id)
        : null;
      const basePrice = menuItem ? menuItem.price * item.quantity : 0;
      const addonsPrice = item.addons?.reduce(
        (sum, addon) => sum + parseFloat(addon.price || 0),
        0
      ) || 0;
      return total + basePrice + (addonsPrice * item.quantity);
    }, 0);
  };

  const categories = menu.map(category => category.categoryid);

  return (
    <>
      {showAddonsModal && (
        <AddonsModal
          show={showAddonsModal}
          onClose={() => setShowAddonsModal(false)}
          product={selectedProduct}
          onConfirm={handleConfirmAddons}
        />
      )}
      <div className="order-container">
        <div className="order-wrapper">
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="payment-method">
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
                  <div className="item-controls">
                    <FaTrash className="trash-icon" onClick={() => handleRemoveItem(index)} />
                  </div>
                  <span className="item-name">
                    {item.product_name}
                    {item.addons?.length > 0 && (
                      ` (${item.addons.map(a => a.addonname).join(', ')})`
                    )}
                  </span>
                  <span className="item-quantity">{item.quantity}</span>
                  <div className="item-controls">
                    <button className="quantity-button" onClick={() => handleDecreaseQuantity(index)}>-</button>
                    <button className="quantity-button" onClick={() => handleIncreaseQuantity(index)}>+</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="total-price">
              Total: ${calculateTotalPrice().toFixed(0)}
            </div>
          </div>
          <div className="order-content">
            {categories.map(categoryId => (
              <div key={categoryId} className="category">
                <div className="category-title">
                  {menu.find(category => category.categoryid === categoryId)?.categoryname}
                </div>
                <div className="items">
                  {menu.find(category => category.categoryid === categoryId)?.items.map(item => (
                    <div key={item.productid} className="item" onClick={() => handleItemClick(item)}>
                      {item.productname}  ${Math.round(item.price)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="order-actions">
          <button className="send-button" onClick={handleSendOrder}>Send Order</button>
        </div>
      </div>
    </>
  );
};

export default OrderComponent;