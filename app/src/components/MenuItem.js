import React, { useEffect, useState } from 'react';
import './MenuItem.css';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const MenuItem = ({ itemDeets, updateItem, addontagLink, editMode, addDeleteItem }) => {
    const [item, setItem] = useState(itemDeets);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        setItem(itemDeets);
        if(!itemDeets){
            console.log("itemDeets is null");
        }
    }, [itemDeets]);

    useEffect(() => {
        setIsEditMode(editMode);
    }, [editMode]);

    const deleteItem = (item) => {
        addDeleteItem(item.productid);
    };

    const toggleEditStock = () => {
        if(item.productid < 0) {
            setItem({ ...item, remainingstock: item.remainingstock === null ? 0 : null });
            return;
        }
        updateItem({ ...item, remainingstock: item.remainingstock === null ? 0 : null });
        // If remainingstock is null, set it to 0, otherwise set it to null
    };

    const toggleVisibility = () => {
        if(item.productid < 0) {
            setItem({ ...item, ishidden: !item.ishidden });
            return;
        }
        updateItem({ ...item, ishidden: !item.ishidden });
    };

    const handleProductChange = (e) => {
        if(item.productid < 0) {
            setItem({...item, [e.target.name]: e.target.value});
            return;
        }
        else {
            const { name, value } = e.target;
            updateItem({...item, [name]: value});
        }
    }
    
    const addNewProduct = () => {
        if(item.productname === "" || item.price === ""){
            alert("Please fill in all fields");
            return;
        }
        updateItem(item);
    }

    if(!isEditMode && item.ishidden) { 
        return (<></>);
    }
    return (
        <div className={`menu-row${item.deleted ? ' deleted' : ''}`}>
            {item.productid < 0 && (
                <>
                <input
                    type="text"
                    name="productname"
                    placeholder="Product Name"
                    value={item.productname}
                    onChange={handleProductChange}
                    className="menu-item-name-edit"
                />
                <input
                    type="text"
                    name="description"
                    placeholder="Description"
                    value={item.description}
                    onChange={handleProductChange}
                    className="menu-item-description-edit"
                />
                </>
            )}
            {item.productid >= 0 && (
                <>
                <div className="menu-item-name">
                    {item.productname || "No Product Name"}
                        {item.remainingstock !== null && ` (${item.remainingstock})`}
                </div>
                <div className="menu-item-description">{item.description || ""}</div>
                </>
            )}
            {!isEditMode && (
                <div className="menu-item-price">{item.price ? `${Math.round(item.price)}` : 0}</div>
            )}
            {isEditMode && (
            <>
                <input 
                    type="number"
                    name="price"
                    value={Math.round(item.price)}
                    onChange={(e) => handleProductChange(e)}
                    className="menu-item-price-edit"
                />
                <input
                    type="number"
                    name="menuorder"
                    value={item.menuorder}
                    onChange={(e) => handleProductChange(e)}
                    className="menu-item-order"
                />
                {item.remainingstock !== null ? (
                    <input
                        type="number"
                        name="remainingstock"
                        value={item.remainingstock}
                        onChange={(e) => handleProductChange(e)}
                        className="menu-item-stock"
                    />
                    ) : (
                    <span></span>
                    )}
                    <button onClick={() => toggleEditStock()}>
                        {item.remainingstock !== null ? "No Stock" : "Edit Stock"}
                    </button>
                    <button onClick={() => toggleVisibility()}>
                        {item.ishidden ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </button>
                    <button className="delete-button" onClick={() => deleteItem(item)}>Delete</button>
                    {item.productid < 0 ? (
                    <button className="add-button" onClick={() => addNewProduct()}>Add Product</button>
                    ) : (
                    <button className="edit-button" onClick={() => addontagLink(item)}>Tags Addons</button>
                    )
                }
            </>
            )}
        </div>
    );
};

export default MenuItem;
