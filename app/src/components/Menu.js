import useAxios from '../hooks/useAxios';
import React, { useState, useEffect } from 'react';
import MenuSection from './MenuSection';
import './Route.css';

const apiUrl = process.env.REACT_APP_API_URL;

const Menu = () => {
    const [menu, setMenu] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [newCategory, setNewCategory] = useState({ category_name: '', description: '', menu_order: 0 });
    const [newProducts, setNewProducts] = useState({});
    const [deletedItems, setDeletedItems] = useState([]);
    const [addedItems, setAddedItems] = useState([]);

    const axios = useAxios();

    const processMenuData = (data) => {
        return data.reduce((acc, item) => {
            const categoryIndex = acc.findIndex(cat => cat.categoryid === item.categoryid);
            if (categoryIndex !== -1) {
                if (item.productid) {
                    acc[categoryIndex].products.push(item);
                }
            } else {
                acc.push({
                    ...item,
                    products: item.productid ? [item] : []
                });
            }
            return acc;
        }, []);
    };

    useEffect(() => {
        axios.get(`${apiUrl}/menu`)
        .then(response => {
            const menuData = processMenuData(response.data);
            setMenu(menuData);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
    }, []);

    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
    };

    const handleCategoryChange = (e) => {
        const { name, value } = e.target;
        setNewCategory(prev => ({ ...prev, [name]: value }));
    };

    const addCategory = () => {
        axios.post(`${apiUrl}/menu/addCategory`, newCategory)
        .then(response => {
            setMenu(prev => [...prev, { ...response.data, products: [] }]);
            setNewCategory({ category_name: '', description: '', menu_order: 0 });
        })
        .catch(error => {
            console.error('Error adding category:', error);
        });
    };

    const handleProductChange = (categoryid, e) => {
        const { name, value } = e.target;
        setNewProducts(prev => ({
            ...prev,
            [categoryid]: { ...prev[categoryid], [name]: value }
        }));
    };

    const addProduct = (categoryid) => {
        const newProduct = newProducts[categoryid];
        setMenu(prev => {
            const newMenu = [...prev];
            const categoryIndex = newMenu.findIndex(cat => cat.categoryid === categoryid);
            if (!newMenu[categoryIndex].products) {
                newMenu[categoryIndex].products = [];
            }
            newMenu[categoryIndex].products = [...newMenu[categoryIndex].products, { ...newProduct, temporaryId: Date.now() }];
            return newMenu;
        });
        setAddedItems(prev => [...prev, { ...newProduct, categoryid }]);
        setNewProducts(prev => ({ ...prev, [categoryid]: { product_name: '', description: '', price: '', menu_order: '' } }));
    };

    const deleteItem = (item) => {
        console.log(`item to delete ${JSON.stringify(item)}`)
        setDeletedItems(prev => [...prev, item]);
    
        if (item.categoryid) {
            // It's a product deletion
            setMenu(prev => prev.map(category => {
                if (category.categoryid === item.categoryid) {
                    return {
                        ...category,
                        products: category.products.filter(product => product.productid !== item.productid)
                    };
                }
                return category;
            }));
        } else {
            // It's a category deletion
            setMenu(prev => prev.filter(category => category.categoryid !== item.categoryid));
        }
    };    

    const saveChanges = () => {
        deletedItems.forEach(item => {
            const endpoint = item.category_name ? 'category' : 'item';
            axios.delete(`${apiUrl}/menu/${endpoint}/${item.productid}`)
            .then(response => {
                console.log('Item deleted:', response.data);
            })
            .catch(error => {
                console.error('Error deleting item:', error);
            });
        });

        addedItems.forEach(item => {
            axios.post(`${apiUrl}/menu/addItem`, item)
            .then(response => {
                console.log('Item added:', response.data);
            })
            .catch(error => {
                console.error('Error adding item:', error);
            });
        });

        setIsEditMode(false);
        setDeletedItems([]);
        setAddedItems([]);
    };

    const cancelChanges = () => {
        axios.get(`${apiUrl}/menu`)
        .then(response => {
            const menuData = processMenuData(response.data);
            setMenu(menuData);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
        setIsEditMode(false);
        setDeletedItems([]);
        setAddedItems([]);
    };

    const categories = menu.filter(item => item.categoryname);

    return (
        <div>
            <div className="route-title-container">
                <h1>Menu</h1>
            </div>
            <div className="center-button">
                {isEditMode ? (
                    <>
                        <button onClick={saveChanges}>Save</button>
                        <button onClick={cancelChanges}>Cancel</button>
                    </>
                ) : (
                    <button onClick={toggleEditMode}>Edit Mode</button>
                )}
            </div>
            {categories.map((category, index) => (
                (isEditMode || (category.products && category.products.length > 0)) && (
                    <MenuSection
                        key={index}
                        category={category}
                        products={category.products}
                        isEditMode={isEditMode}
                        handleProductChange={handleProductChange}
                        addProduct={addProduct}
                        deleteItem={deleteItem}
                        newProducts={newProducts} // Pass down the newProducts state
                    />
                )
            ))}
            {isEditMode && (
                <div className="new-category">
                    <h2>Add New Category</h2>
                    <div className="new-category-inputs">
                        <input
                            type="text"
                            name="category_name"
                            placeholder="Category Name"
                            value={newCategory.category_name}
                            onChange={handleCategoryChange}
                        />
                        <input
                            type="text"
                            name="description"
                            placeholder="Description"
                            value={newCategory.description}
                            onChange={handleCategoryChange}
                        />
                        <input
                            type="number"
                            name="menu_order"
                            placeholder="Menu Order"
                            value={newCategory.menu_order}
                            onChange={handleCategoryChange}
                        />
                        <button onClick={addCategory}>Add Category</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Menu;
