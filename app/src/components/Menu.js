import useAxios from '../hooks/useAxiosAuth';
import React, { useState, useEffect } from 'react';
import MenuSection from './MenuSection';
import TagAddonLinker from './TagAddonLinker';
import TagAddonManager from './TagAddonManager';
import './Menu.css';

const apiUrl = process.env.REACT_APP_API_URL;

const Menu = ({ isAuthenticated }) => {
    const [menu, setMenu] = useState([]);
    const [tags, setTags] = useState([]);
    const [addons, setAddons] = useState([]);
    const [newTags, setNewTags] = useState({});
    const [newAddons, setNewAddons] = useState({});
    const [popupItem, setPopupItem] = useState(null);
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
        // get tags
        axios.get(`${apiUrl}/menu/tags`)
        .then(response => {
            setTags(response.data);
        })
        .catch(error => {
            console.error('Error fetching tags:', error);
        });
        // get addons
        axios.get(`${apiUrl}/menu/addons`)
        .then(response => {
            setAddons(response.data);
        })
        .catch(error => {
            console.error('Error fetching addons:', error);
        });

    }, []);

    const handleTagChange = (categoryid, productid, e) => {
        const { name, value } = e.target;
        setNewTags(prev => ({
            ...prev,
            [categoryid]: {
                ...(prev[categoryid] || {}),
                [productid]: {
                    ...((prev[categoryid] || {})[productid] || {}),
                    [name]: value
                }
            }
        }));
    };

    const handleAddonChange = (categoryid, productid, e) => {
        const { name, value } = e.target;
        setNewAddons(prev => ({
            ...prev,
            [categoryid]: {
                ...(prev[categoryid] || {}),
                [productid]: {
                    ...((prev[categoryid] || {})[productid] || {}),
                    [name]: value
                }
            }
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
            setMenu(prev => [...prev, { ...category, categoryid: categoryId, items: [] }]);
        }
        // update the tags/addons for the category
        console.log(category);
        if (category && category.items) {
            const catId = category.categoryid || categoryId;
            category.items.forEach((item) => {
                const productId = item.productid;
                if (newTags[catId] && newTags[catId][productId]?.tags) {
                    const tag_ids = newTags[catId][productId].tags.map(tag => tag.tagid);
                    axios.post(`${apiUrl}/menu/linkTag`, { product_id: productId, tag_ids })
                    .catch(error => console.error('Error updating tags:', error));
                }
                if (newAddons[catId] && newAddons[catId][productId]?.addons) {
                    const addon_ids = newAddons[catId][productId].addons.map(addon => addon.addonid);
                    axios.post(`${apiUrl}/menu/linkAddon`, { product_id: productId, addon_ids })
                    .catch(error => console.error('Error updating addons:', error));
                }
            });
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

    const cancelChanges = (categoryid) => {
        // Clear new tags and addons
        setNewTags(prev => {
            delete prev[categoryid];
            return prev;
        });
        setNewAddons(prev => {
            delete prev[categoryid];
            return prev;
        });
    }

    const openPopup = (item) => {
        setPopupItem(item);
    };

    const closePopupItem = () => {
        setPopupItem(null);
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
                    openPopup={openPopup}
                    isAuthenticated={isAuthenticated}
                    updateCategory={updateCategory}
                    cancelChanges={cancelChanges}
                />
            ))}
            <MenuSection
                category={{ categoryid: -1, categoryname: '', description: '', menuorder: 0, items: [] }}
                openPopup={openPopup}
                isAuthenticated={isAuthenticated}
                updateCategory={updateCategory}
            />
            {popupItem && (
                <TagAddonLinker
                    allTags={tags}
                    allAddons={addons}
                    item={popupItem}
                    closePopup={closePopupItem}
                    handleTagChange={handleTagChange}
                    handleAddonChange={handleAddonChange}
                />
            )}
            {popup && (
                <TagAddonManager 
                    closePopup={closePopup}
                />
            )}
        </div>
    );
};

export default Menu;
