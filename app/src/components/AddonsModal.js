import React, { useState } from 'react';
import './AddonsModal.css';

const AddonsModal = ({ show, onClose, product, onConfirm }) => {
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  if (!show || !product) return null;

  const handleAddonClick = (addon) => {
    setSelectedAddons((prev) => {
      if (addon.groupname === null) {
        return prev.includes(addon)
          ? prev.filter((a) => a !== addon)
          : [...prev, addon];
      } else {
        return [
          ...prev.filter((a) => a.groupname !== addon.groupname),
          addon,
        ];
      }
    });
  };

  const handleConfirm = () => {
    const groups = Object.keys(groupedAddons).filter(group => group !== 'null');
    const selectedGroups = selectedAddons.map(addon => addon.groupname);
    
    const allGroupsSelected = groups.every(group => selectedGroups.includes(group));
    
    if (!allGroupsSelected) {
      setErrorMessage('Please select at least one addon from each group.');
      return;
    }

    onConfirm(product, selectedAddons);
    onClose();
  };

  const formatPrice = (price_str) => {
    const price = parseFloat(price_str).toFixed(0);
    if(price == 0) return '';
    return price < 0 ? `-$${-price}` : `+$${price}`;
  }

  const groupedAddons = product.addons.reduce((acc, addon) => {
    const group = addon.groupname;
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(addon);
    return acc;
  }, {});
  console.log(groupedAddons);

  return (
    <div className="addons-modal-overlay">
      <div className="addons-modal">
        <h3>Select Addons for {product.productname}</h3>
        <div className="addons-columns">
          {Object.keys(groupedAddons).map((group) => (
            <div key={group} className="addon-column">
              {group !== 'null' ? (<h4>{group}</h4>) : <h4> </h4>}
              {groupedAddons[group].map((addon) => (
                <div
                  key={addon.addonid}
                  className={`addon-square ${selectedAddons.includes(addon) ? 'selected' : ''}`}
                  onClick={() => handleAddonClick(addon)}
                >
                  {addon.addonname} {formatPrice(addon.price)}
                </div>
              ))}
            </div>
          ))}
        </div>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleConfirm}>Add</button>
        </div>
      </div>
    </div>
  );
};

export default AddonsModal;
