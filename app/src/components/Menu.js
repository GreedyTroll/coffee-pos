import useAxios from '../hooks/useAxiosAuth';
import React, { useState, useEffect } from 'react';
import MenuSection from './MenuSection';
import TagAddonPopup from './TagAddonPopup';
import './Menu.css';

const apiUrl = process.env.REACT_APP_API_URL;

const Menu = ({ isAuthenticated }) => {
    const [menu, setMenu] = useState([]);
    const [newTags, setNewTags] = useState({});
    const [newAddons, setNewAddons] = useState({});
    const [popupItem, setPopupItem] = useState(null);

    const axios = useAxios();

    const processMenuData = (data) => {
        return data.map(category => {
            const products = category.items.map(item => ({
                ...item,
                tags: item.tags || [],
                addons: item.addons || []
            }));
            return {
                ...category,
                products
            };
        });
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

    const handleTagChange = (itemid, e) => {
        const { name, value } = e.target;
        setNewTags(prev => ({
            ...prev,
            [itemid]: { ...prev[itemid], [name]: value }
        }));
    };

    const handleAddonChange = (itemid, e) => {
        const { name, value } = e.target;
        setNewAddons(prev => ({
            ...prev,
            [itemid]: { ...prev[itemid], [name]: value }
        }));
    };

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
            setMenu(prev => [...prev, { ...category, categoryid: categoryId, products: [] }]);
        }
    };

    const saveChanges = () => {
        // Update tags
        Object.keys(newTags).forEach(itemid => {
            const tag_ids = newTags[itemid].tags.map(tag => tag.tagid);
            axios.post(`${apiUrl}/menu/linkTag`, { item_id: itemid, tag_ids })
            .catch(error => {
                console.error('Error updating tags:', error);
            });
        });

        // Update addons
        Object.keys(newAddons).forEach(itemid => {
            const addon_ids = newAddons[itemid].addons.map(addon => addon.addonid);
            axios.post(`${apiUrl}/menu/linkAddon`, { item_id: itemid, addon_ids })
            .catch(error => {
                console.error('Error updating addons:', error);
            });
        });
    };

    const openPopup = (item) => {
        setPopupItem(item);
    };

    const closePopup = () => {
        setPopupItem(null);
    };

    return (
        <div>
            <div className="route-title-container">
                <h1>Menu</h1>
            </div>

            {menu.map((category, index) => (            
                <MenuSection
                    key={index}
                    category={category}
                    openPopup={openPopup}
                    isAuthenticated={isAuthenticated}
                    updateCategory={updateCategory}
                />
            ))}
            <MenuSection
                category={{ categoryid: -1, categoryname: '', description: '', menuorder: 0, products: [] }}
                openPopup={openPopup}
                isAuthenticated={isAuthenticated}
                updateCategory={updateCategory}
            />
            {popupItem && (
                <TagAddonPopup
                    item={popupItem}
                    closePopup={closePopup}
                    handleTagChange={handleTagChange}
                    handleAddonChange={handleAddonChange}
                />
            )}
        </div>
    );
};

export default Menu;
