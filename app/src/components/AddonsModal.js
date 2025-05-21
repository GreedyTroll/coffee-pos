import React, { useState, useEffect } from 'react';
import './AddonsModal.css';

const AddonsModal = ({ show, onClose, product, onConfirm, addons }) => {
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [groupedAddons, setGroupedAddons] = useState({});

  useEffect(() => {
    let newGroupedAddons = {};
    if (product && addons) {
      if (product.addongroups && Array.isArray(product.addongroups)) {
        product.addongroups.forEach(group => {
          if (addons[group.groupname]) {
            newGroupedAddons[group.groupname] = addons[group.groupname];
          }
        });
      }
      if (product.addons && Array.isArray(product.addons) && product.addons.length > 0) {
        newGroupedAddons['null'] = product.addons;
      }
    }
    setGroupedAddons(newGroupedAddons);
  }, [product, addons]);

  useEffect(() => {
    if (product) {
      const defaultSelected = Object.values(groupedAddons)
        .filter(addons => addons[0].groupname !== null)
        .map(addons => addons[addons.length - 1]);
      setSelectedAddons(defaultSelected);
    }
  }, [product, groupedAddons]);

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
