import React, { useEffect, useState } from 'react';
import useAxios from '../hooks/useAxiosAuth';
import './MenuSection.css';

const apiUrl = process.env.REACT_APP_API_URL;

const MenuSection = ({ category, isAuthenticated, openPopup, updateCategory }) => {
    const [localCategory, setLocalCategory] = useState(category);
    const [newProduct, setNewProduct] = useState({ productname: '', description: '', price: 0, menuorder: 100 });
    const [updatedItems, setUpdatedItems] = useState([]);
    const [addedItems, setAddedItems] = useState([]);
    const [deletedItems, setDeletedItems] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);

    const axios = useAxios();

    useEffect(() => {
        setLocalCategory(category);
    }, [category]);

    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
    }

    const handleProductChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleExistingProductChange = (e, index) => {
        const { name, value } = e.target;
        setLocalCategory((prev) => {
            const updatedProducts = [...prev.products];
            updatedProducts[index] = { ...updatedProducts[index], [name]: value };
            return { ...prev, products: updatedProducts };
        });
        setUpdatedItems((prev) => {
            const existing = localCategory.products[index];
            if (!existing.productid) return prev;
            const updatedItem = { ...existing, [name]: value };
            const found = prev.find((p) => p.productid === updatedItem.productid);
            return found
                ? prev.map((p) => (p.productid === updatedItem.productid ? updatedItem : p))
                : [...prev, updatedItem];
        });
    };

    const addCategory = () => {
        const newCategory = {
            category_name: localCategory.categoryname,
            description: localCategory.description,
            menu_order: localCategory.menuorder
        }
        axios.post(`${apiUrl}/menu/addCategory`, newCategory)
        .then(response => {
            updateCategory(localCategory, response.data.categoryid);
        })
        .catch(error => {
            console.error('Error adding category:', error);
        });
    };

    const addItem = (item) => {
        const newItem = {
            product_name: item.productname,
            description: item.description,
            price: item.price,
            menu_order: item.menuorder,
            categoryid: item.categoryid
        };
        axios.post(`${apiUrl}/menu/addItem`, newItem)
        .catch(error => {
            console.error('Error adding item:', error);
        });
    };

    const handleCategoryChange = (e) => {
        const { name, value } = e.target;
        setLocalCategory(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const addProduct = () => {
        const new_product = {...newProduct, categoryid: localCategory.categoryid};
        setAddedItems([...addedItems, new_product]);
        const updatedProducts = [...localCategory.products, new_product];
        const updatedCategory = { ...localCategory, products: updatedProducts };
        setLocalCategory(updatedCategory);
        setNewProduct({ productname: '', description: '', price: 0, menuorder: 100 });
    };

    const deleteItem = (item) => {
        if (item.productid) { // delete product
            setDeletedItems([...deletedItems, item]);
            setLocalCategory((prev) => {
                const updatedProducts = prev.products.filter((p) => p.productid !== item.productid);
                return { ...prev, products: updatedProducts };
            });
        } else if (item.categoryname) { // delete category
            updateCategory(null, item.categoryid);
            setIsEditMode(false);
        } else { // delete new product (without product id yet)
            setAddedItems(addedItems.filter(i => i !== item));
            setLocalCategory((prev) => {
                const updatedProducts = prev.products.filter((p) => p !== item);
                return { ...prev, products: updatedProducts };
            });
        }
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
        
        // update items
        addedItems.forEach(item => {
            addItem(item);
        });

        // update items
        updatedItems.forEach(item => {
            const updatedItem = {
                product_name: item.productname,
                description: item.description,
                price: item.price,
                menu_order: item.menuorder,
                categoryid: item.category
            };
            axios.put(`${apiUrl}/menu/item/${item.productid}`, updatedItem)
            .catch(error => {
                console.error('Error updating item:', error);
            });
        });

        // delete items
        deletedItems.forEach(item => {
            axios.delete(`${apiUrl}/menu/item/${item.productid}`)
            .catch(error => {
                console.error('Error deleting item:', error);
            });
        });

        setAddedItems([]);
        setDeletedItems([]);
        setUpdatedItems([]);
        setIsEditMode(false);
    };

    const cancelChanges = () => {
        setIsEditMode(false);
        setAddedItems([]);
        setDeletedItems([]);
        setUpdatedItems([]);
        setLocalCategory(category);
    };

    if (localCategory.categoryid < 0) {
        return (
            <div className="menu-section">
                <div className="new-category">
                    <h2>Add New Category</h2>
                    <div className="new-category-inputs">
                        <input
                            type="text"
                            name="categoryname"
                            placeholder="Category Name"
                            value={localCategory.categoryname}
                            onChange={handleCategoryChange}
                        />
                        <input
                            type="text"
                            name="description"
                            placeholder="Description"
                            value={localCategory.description}
                            onChange={handleCategoryChange}
                        />
                        <input
                            type="number"
                            name="menuorder"
                            placeholder="Menu Order"
                            value={localCategory.menuorder}
                            onChange={handleCategoryChange}
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
                        <button className="delete-button" onClick={() => deleteItem(localCategory)}>Delete Category</button>
                    </>
                )}
            </div>
            <p className="center-text">{localCategory.description || ""}</p>
            <div className="center-button">
                {isEditMode ? (
                    <>
                        <button onClick={saveChanges}>Save</button>
                        <button onClick={cancelChanges}>Cancel</button>
                    </>
                ) : (
                    isAuthenticated && <button onClick={toggleEditMode}>Edit</button>
                )}
            </div>
            <div className="menu-items">
                {localCategory.products.map((product, index) => (
                    <div key={index} className="menu-row">
                        <div className="menu-item-name">{product.productname || "No Product Name"}</div>
                        <div className="menu-item-description">{product.description || ""}</div>
                        <div className="tags-container">
                            {product.tags && product.tags.map(tag => (
                                <span key={tag.tagid} className="tag-item">
                                    {tag.tagname}
                                </span>
                            ))}
                        </div>
                        <div className="menu-item-price">{product.price ? `${Math.round(product.price)}` : 0}</div>
                        {isEditMode && (
                            <input
                                type="number"
                                name="menuorder"
                                value={product.menuorder}
                                onChange={(e) => handleExistingProductChange(e, index)}
                                className="menu-item-order"
                            />
                        )}
                        {isEditMode && (
                            <>
                                <button className="delete-button" onClick={() => deleteItem(product)}>Delete</button>
                                <button className="edit-button" onClick={() => openPopup(product)}>Edit Tags/Addons</button>
                            </>
                        )}
                    </div>
                ))}
                {isEditMode && (
                    <div className="menu-row">
                        <input
                            type="text"
                            placeholder="Add New Product..."
                            name="productname"
                            value={newProduct.productname}
                            onChange={handleProductChange}
                        />
                        <input
                            type="text"
                            placeholder="Description"
                            name="description"
                            value={newProduct.description}
                            onChange={handleProductChange}
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            name="price"
                            value={newProduct.price}
                            onChange={handleProductChange}
                        />
                        <input
                            type="number"
                            placeholder="Menu Order"
                            name="menuorder"
                            value={newProduct.menuorder}
                            onChange={handleProductChange}
                        />
                        <button onClick={addProduct}>Add Product</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuSection;
