import React, { useEffect, useState } from 'react';
import useAxios from '../hooks/useAxiosAuth';
import './MenuSection.css';
import MenuItem from './MenuItem';
import TagAddonLinker from './TagAddonLinker';

const apiUrl = process.env.REACT_APP_API_URL;

const MenuSection = ({ category, isAuthenticated, openPopup, updateCategory }) => {
    const [originalCategory, setOriginalCategory] = useState(category);
    const [localCategory, setLocalCategory] = useState(category);
    const [updatedItems, setUpdatedItems] = useState([]);
    const [addedItems, setAddedItems] = useState([]);
    const [deletedItems, setDeletedItems] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [popupItem, setPopupItem] = useState(null);
    const [placeHolderItem, setPlaceHolderItem] = useState({
        productid: -1,
        productname: '',
        description: '',
        price: 0,
        remainingstock: null,
        ishidden: false,
        menuorder: 0,
    });
/*
    const [tags, setTags] = useState([]);
    const [addons, setAddons] = useState([]);
    const [newTags, setNewTags] = useState({});
    const [newAddons, setNewAddons] = useState({});
    const [newAddonGroups, setNewAddonGroups] = useState({});
*/
    const axios = useAxios();

    useEffect(() => {
        setLocalCategory(category);
        setOriginalCategory(category);
        setPlaceHolderItem({...placeHolderItem, categoryid: category.categoryid})
    }, [category]);
/*
    useEffect(() => {
        axios.get(`${apiUrl}/tags`).then(response => setTags(response.data));
        axios.get(`${apiUrl}/addons`).then(response => setAddons(response.data));
    }, []);
*/
    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
    }

    const handleExistingProductChange = (product) => {
        if(addedItems.some(item => item.productid === product.productid)) {
            setAddedItems((prev) => 
                prev.map((item) => (item.productid === product.productid ? product : item))
            );
        }
        else if(product.productid < 0) {
            addNewItem(product);
        } else {
            setUpdatedItems((prev) => {
                const found = prev.find((p) => p.productid === product.productid);
                return found
                    ? prev.map((p) => (p.productid === product.productid ? product : p))
                    : [...prev, product];
            });
            setLocalCategory((prev) => {
                const found = prev.items.find((p) => p.productid === product.productid);
                if (found) {
                    return {
                        ...prev,
                        items: prev.items.map((p) => (p.productid === product.productid ? product : p))
                    };
                } else {
                    return {
                        ...prev,
                        items: [...prev.items, product]
                    };
                }
            });
        }
    };
/*
    const handleTagChange = (productid, e) => {
        const { name, value } = e.target;
        setNewTags(prev => ({
            ...prev,
            [productid]: {
                ...(prev[productid] || {}),
                [name]: value
            }
        }));
    };

    const handleAddonChange = (productid, e) => {
        const { name, value } = e.target;
        setNewAddons(prev => ({
            ...prev,
            [productid]: {
                ...(prev[productid] || {}),
                [name]: value
            }
        }));
    };

    const handleAddonGroupChange = (productid, e) => {
        const { name, value } = e.target;
        setNewAddonGroups(prev => ({
            ...prev,
            [productid]: {
                ...(prev[productid] || {}),
                [name]: value
            }
        }));
    };

    const saveTagsAndAddons = (productid) => {
        const tag_ids = newTags[productid]?.tags?.map(tag => tag.tagid) || [];
        const addon_ids = newAddons[productid]?.addons?.map(addon => addon.addonid) || [];
        const group_ids = newAddonGroups[productid]?.addongroups?.map(group => group.groupid) || [];

        axios.post(`${apiUrl}/tags/linkTag`, { product_id: productid, tag_ids });
        axios.post(`${apiUrl}/addons/linkAddon`, { product_id: productid, addon_ids });
        axios.post(`${apiUrl}/addons/linkAddon`, { product_id: productid, group_ids });
    };
*/
    const addCategory = () => {
        const newCategory = {
            category_name: localCategory.categoryname,
            description: localCategory.description,
            menu_order: localCategory.menuorder
        }
        axios.post(`${apiUrl}/menu/addCategory`, newCategory)
        .then(response => {
            updateCategory(localCategory, response.data.categoryid);
            console.log("created category lol");
        })
        .catch(error => {
            console.error('Error adding category:', error);
        });
    };

    const handleCategoryChange = (e) => {
        const { name, value } = e.target;
        setLocalCategory(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const addDeleteItem = (id) => {
        setLocalCategory(prev => {
            const updatedItems = prev.items.map(item => {
                if (item.productid === id) {
                    if (deletedItems.includes(id)) {
                        return { ...item, deleted: false };
                    } else {
                        return { ...item, deleted: true };
                    }
                }
                return item;
            });
            return { ...prev, items: updatedItems };
        });
        if (id < 0) {
            setAddedItems(prev => prev.filter(item => item.productid !== id))
        }
        else {
            setDeletedItems((prev) => {
                const found = prev.find((p) => p === id);
                return found ? prev.filter((p) => p !== id) : [...prev, id];
            });
        }
    };

    const addNewItem = (product) => {
        setAddedItems([...addedItems, product]);
        setPlaceHolderItem({...placeHolderItem, productid: -Math.floor(Math.random() * 100000)})
    };

    const deleteCategory = () => {
        updateCategory(null, localCategory.categoryid);
        setIsEditMode(false);
    }

    const commitAddItem = (item) => {
        const newItem = {
            product_name: item.productname,
            description: item.description,
            price: item.price,
            remaining_stock: item.remainingstock,
            is_hidden: item.ishidden,
            menu_order: item.menuorder,
            categoryid: item.categoryid
        };
        axios.post(`${apiUrl}/menu/addItem`, newItem)
        .then(response => {
            setLocalCategory(prev => ({
                ...prev,
                items: [...prev.items, { ...item, productid: response.data.productid }]
            }));
        }
        )
        .catch(error => {
            console.error('Error adding item:', error);
        });
    };

    const commitUpdateItem = (item) => {
        const updatedItem = {
            product_name: item.productname,
            description: item.description,
            price: item.price,
            remaining_stock: item.remainingstock,
            menu_order: item.menuorder,
            categoryid: item.categoryid,
            is_hidden: item.ishidden
        };
        axios.put(`${apiUrl}/menu/item/${item.productid}`, updatedItem)
        .catch(error => {
            console.error('Error updating item:', error);
        });
    }
    
    const deleteItem = (id) => {
        axios.delete(`${apiUrl}/menu/item/${id}`)
        .then(() => {
            setLocalCategory(prev => ({
                ...prev,
                items: prev.items.filter(i => i.productid !== id)
            }));
        })
        .catch(error => {
            console.error('Error deleting item:', error);
        });
    };

    const saveChanges = () => {
        // update category
        const updatedCategory = {
            categoryid: localCategory.categoryid,
            category_name: localCategory.categoryname,
            description: localCategory.description,
            menu_order: localCategory.menuorder
        };
        axios.put(`${apiUrl}/menu/category/${localCategory.categoryid}`, updatedCategory); 

        // delete items
        deletedItems.forEach(id => {
            deleteItem(id);
        });

        // update items
        updatedItems.forEach(item => {
            commitUpdateItem(item);
        });

        // new items
        addedItems.forEach(item => {
            commitAddItem(item);
        });

        updateCategory(localCategory, localCategory.categoryid);

        setAddedItems([]);
        setDeletedItems([]);
        setUpdatedItems([]);
        setIsEditMode(false);
    };

    const donotSave = () => {
        setIsEditMode(false);
        setAddedItems([]);
        setDeletedItems([]);
        setUpdatedItems([]);
        setLocalCategory(originalCategory);
    };

    if (localCategory.categoryid < 0) {
        return (
            <div className="menu-section">
                <div className="category-header">
                    <h2 className="center-text">Add New Category</h2>
                </div>
                <div className="menu-items">
                    <div className="new-category-inputs">
                        <input
                            type="text"
                            name="categoryname"
                            placeholder="Category Name"
                            value={localCategory.categoryname}
                            onChange={handleCategoryChange}
                            className="menu-item-name-edit"
                        />
                        <input
                            type="text"
                            name="description"
                            placeholder="Description"
                            value={localCategory.description}
                            onChange={handleCategoryChange}
                            className="menu-item-description-edit"
                        />
                        <input
                            type="number"
                            name="menuorder"
                            placeholder="Menu Order"
                            value={localCategory.menuorder}
                            onChange={handleCategoryChange}
                            className="menu-item-order"
                        />
                        <button onClick={addCategory}>Add Category</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="menu-section">
            <div className="category-header">
                <h2 className="center-text">{localCategory.categoryname || ""}</h2>
                {isEditMode && (
                    <>
                        <input
                            type="number"
                            name="menuorder"
                            value={localCategory.menuorder}
                            onChange={handleCategoryChange}
                            className="category-order"
                        />
                        <button className="delete-button" onClick={deleteCategory}>Delete Category</button>
                    </>
                )}
            </div>
            <p className="center-text">{localCategory.description || ""}</p>
            <div className="center-button">
                {isEditMode ? (
                    <>
                        <button onClick={saveChanges}>Save</button>
                        <button onClick={donotSave}>Cancel</button>
                    </>
                ) : (
                    isAuthenticated && <button onClick={toggleEditMode}>Edit</button>
                )}
            </div>
            <div className="menu-items">
                {localCategory.items
                    .map((item) => (
                        <MenuItem
                            key={item.productid}
                            itemDeets={item}
                            updateItem={handleExistingProductChange}
                            addontagLink={() => setPopupItem(item)}
                            editMode={isEditMode}
                            addDeleteItem={addDeleteItem}
                        />
                    ))
                }
                {isEditMode && 
                    addedItems.map((item) => (
                        <MenuItem
                            key={item.productid}
                            itemDeets={item}
                            updateItem={handleExistingProductChange}
                            addontagLink={() => {}}
                            editMode={isEditMode}
                            addDeleteItem={addDeleteItem}
                        />
                    ))
                }
                {isEditMode && (
                    <MenuItem
                        itemDeets={placeHolderItem}
                        updateItem={handleExistingProductChange}
                        addontagLink={() => {}}
                        editMode={isEditMode}
                        addDeleteItem={addDeleteItem}
                    />
                )}
            </div>
            {/*popupItem && (
                <TagAddonLinker
                    allTags={tags}
                    allAddons={addons}
                    item={popupItem}
                    closePopup={() => setPopupItem(null)}
                    handleTagChange={(e) => handleTagChange(popupItem.productid, e)}
                    handleAddonChange={(e) => handleAddonChange(popupItem.productid, e)}
                    handleAddonGroupChange={(e) => handleAddonGroupChange(popupItem.productid, e)}
                />
            )*/}
        </div>
    );
};

export default MenuSection;
