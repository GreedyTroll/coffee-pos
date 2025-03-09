import React, { useState } from 'react';
import './AddonsModal.css';

const AddonsModal = ({ show, onClose, product, onConfirm }) => {
  const [selectedAddons, setSelectedAddons] = useState([]);

  if (!show || !product) return null;

  const handleAddonClick = (addon) => {
    setSelectedAddons((prev) =>
      prev.includes(addon)
        ? prev.filter((a) => a !== addon)
        : [...prev, addon]
    );
  };

  const handleConfirm = () => {
    onConfirm(product, selectedAddons);
    onClose();
  };

  const formatPrice = (price_str) => {
    const price = parseFloat(price_str).toFixed(0);
    if(price == 0) return '';
    return price < 0 ? `-$${-price}` : `+$${price}`;
  }

  return (
    <div className="addons-modal-overlay">
      <div className="addons-modal">
        <h3>Select Addons for {product.productname}</h3>
        {product.addons && product.addons.map((addon) => (
          <div
            key={addon.addonid}
            className={`addon-square ${selectedAddons.includes(addon) ? 'selected' : ''}`}
            onClick={() => handleAddonClick(addon)}
          >
            {addon.addonname} {formatPrice(addon.price)}
          </div>
        ))}
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleConfirm}>Add</button>
        </div>
      </div>
    </div>
  );
};

export default AddonsModal;
