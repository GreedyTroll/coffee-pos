import useAxios from '../hooks/useAxiosAuth';
import React, { useState, useEffect } from 'react';
import MenuSection from './MenuSection';
import TagAddonManager from './TagAddonManager';
import './Menu.css';

const apiUrl = process.env.REACT_APP_API_URL;

const Menu = ({ isAuthenticated }) => {
    const [menu, setMenu] = useState([]);
    const [popup, setPopup] = useState(false);

    const axios = useAxios();

    const processMenuData = (data) => {
        return data;
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

    const updateCategory = (category, categoryId) => {
        // if category is null, delete the category
        if (!category) {
            axios.delete(`${apiUrl}/menu/category/${categoryId}`)
            .then(() => {
                setMenu(prev => prev.filter(c => c.categoryid !== categoryId));
            })
            .catch(error => {
                console.error('Error deleting category:', error);
            });
            return;
        }
        // update existing category
        const existingCategoryIndex = menu.findIndex(cat => cat.categoryid === categoryId);
        if (existingCategoryIndex !== -1) {
            const updatedMenu = [...menu];
            updatedMenu[existingCategoryIndex] = { ...category, categoryid: categoryId };
            setMenu(updatedMenu);
        } else { // add new category
            setMenu(prev => [...prev, { ...category, categoryid: categoryId, items: [] }]);
        }
    };

    const closePopup = () => {
        setPopup(false);
    }

    return (
        <div>
            <div className="route-title-container">
                <h1>Menu</h1>
            </div>

            {isAuthenticated && (
                <div className="open-popup-btn">
                    <button onClick={() => setPopup(true)}>Edit Tags and Addons</button>
                </div>
            )}

            {menu.map((category, index) => (            
                <MenuSection
                    key={index}
                    category={category}
                    isAuthenticated={isAuthenticated}
                    updateCategory={updateCategory}
                />
            ))}
            {<MenuSection
                category={{ categoryid: -1, categoryname: '', description: '', menuorder: 0, items: [] }}
                isAuthenticated={isAuthenticated}
                updateCategory={updateCategory}
            />}
            {popup && (
                <TagAddonManager 
                    closePopup={closePopup}
                />
            )}
        </div>
    );
};

export default Menu;
