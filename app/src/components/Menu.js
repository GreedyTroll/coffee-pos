import useAxios from '../hooks/useAxios';
import React, { useState, useEffect } from 'react';
import MenuSection from './MenuSection';

const apiUrl = process.env.REACT_APP_API_URL;

const Menu = () => {
    const [menu, setMenu] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [newCategory, setNewCategory] = useState({ categoryname: '', description: '' });
    const [newProducts, setNewProducts] = useState({});
    
    const axios = useAxios();

    useEffect(() => {
        axios.get(`${apiUrl}/menu`)
        .then(response => {
            setMenu(response.data);
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
        console.log('New Category Added:', newCategory);
        setNewCategory({ categoryname: '', description: '' });
    };

    const handleProductChange = (categoryid, e) => {
        const { name, value } = e.target;
        setNewProducts(prev => ({
            ...prev,
            [categoryid]: { ...prev[categoryid], [name]: value }
        }));
    };

    const addProduct = (categoryid) => {
        console.log('New Product Added to Category', categoryid, ':', newProducts[categoryid]);
        setNewProducts(prev => ({ ...prev, [categoryid]: {} }));
    };

    const deleteItem = (item) => {
        console.log('Item Deleted:', item);
    };

    const categories = menu.filter(item => item.categoryname);
    const products = menu.filter(item => item.productname);

    return (
        <div>
            <h1>Menu</h1>
            <button onClick={toggleEditMode}>
                {isEditMode ? "Exit Modification Mode" : "Enter Modification Mode"}
            </button>
            {categories.map((category, index) => (
                <MenuSection
                    key={index}
                    category={category}
                    products={products.filter(product => product.categoryid === category.categoryid)}
                    isEditMode={isEditMode}
                    handleProductChange={handleProductChange}
                    addProduct={addProduct}
                    deleteItem={deleteItem}
                />
            ))}
            {isEditMode && (
                <div className="new-category">
                    <h2>Add New Category</h2>
                    <div className="new-category-inputs">
                        <input
                            type="text"
                            name="categoryname"
                            placeholder="Category Name"
                            value={newCategory.categoryname}
                            onChange={handleCategoryChange}
                        />
                        <input
                            type="text"
                            name="description"
                            placeholder="Description"
                            value={newCategory.description}
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
