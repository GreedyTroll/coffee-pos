import useAxios from '../hooks/useAxiosAuth';
import React, { useState, useEffect } from 'react';
import './TagAddonManager.css';
import { FaTrash } from 'react-icons/fa';

const apiUrl = process.env.REACT_APP_API_URL;

const TagAddonManager = ({ closePopup }) => {
    const [tags, setTags] = useState([]);
    const [addons, setAddons] = useState([]);
    const [newTagName, setNewTagName] = useState('');
    const [newAddonName, setNewAddonName] = useState('');
    const [newAddonPrice, setNewAddonPrice] = useState('');

    const axios = useAxios();

    useEffect(() => {
        axios.get(`${apiUrl}/menu/tags`)
            .then(response => {
                setTags(response.data);
            })
            .catch(error => console.error('Error fetching tags:', error));

        axios.get(`${apiUrl}/menu/addons`)
            .then(response => {
                setAddons(response.data);
            })
            .catch(error => console.error('Error fetching addons:', error));
    }, []);
    
    const handleClosePopup = () => {
        setAddons([]);
        setTags([]);
        closePopup();
    };

    const handleAddTag = () => {
        if (!newTagName.trim()) return;
        axios.post(`${apiUrl}/menu/addTag`, { tag_name: newTagName })
            .then(() => {
                setNewTagName('');
                axios.get(`${apiUrl}/menu/tags`).then(res => setTags(res.data));
            })
            .catch(error => console.error('Error adding tag:', error));
    };

    const handleAddAddon = () => {
        if (!newAddonName.trim()) return;
        axios.post(`${apiUrl}/menu/addAddon`, {
            addon_name: newAddonName,
            price: parseFloat(newAddonPrice) || 0
        })
            .then(() => {
                setNewAddonName('');
                setNewAddonPrice('');
                axios.get(`${apiUrl}/menu/addons`).then(res => setAddons(res.data));
            })
            .catch(error => console.error('Error adding addon:', error));
    };

    const handleDeleteTag = (tagId) => {
        axios.delete(`${apiUrl}/menu/tags/${tagId}`)
            .then(() => setTags(tags.filter(t => t.tagid !== tagId)))
            .catch(error => console.error('Error deleting tag:', error));
    };

    const handleDeleteAddon = (addonId) => {
        axios.delete(`${apiUrl}/menu/addons/${addonId}`)
            .then(() => setAddons(addons.filter(a => a.addonid !== addonId)))
            .catch(error => console.error('Error deleting addon:', error));
    };

    const formatPrice = (price) => {
        if (Math.round(price) === 0) return '';
        return price > 0 ? `(+${Math.round(price)})` : `(${Math.round(price)})`;
    };

    return (
        <div className="popup">
            <div className="popup-inner">
                <h2>{"Edit Tags and Addons"}</h2>
                <button className="close-btn" onClick={handleClosePopup}>Close</button>
                <div className="section-row">
                    <div className="tags-section">
                        <h3>Tags</h3>
                        <div className="tagaddon-tags-container">
                            {tags.map(tag => (
                                <div key={tag.tagid} className="tagaddon-tag-item">
                                    <span>{tag.tagname}</span>
                                    <FaTrash className="trashicon" onClick={() => handleDeleteTag(tag.tagid)} />
                                </div>
                            ))}
                        </div>
                        <div className="new-item-row">
                            <input
                                value={newTagName}
                                onChange={e => setNewTagName(e.target.value)}
                                placeholder="New tag name"
                            />
                            <button onClick={handleAddTag}>Add Tag</button>
                        </div>
                    </div>
                    <div className="addons-section">
                        <h3>Addons</h3>
                        <div className="tagaddon-addons-container">
                            {addons.map(addon => (
                                <div key={addon.addonid} className="tagaddon-addon-item">
                                    <span>
                                        {addon.addonname}
                                        {addon.price ? ` ${formatPrice(addon.price)}` : ''}
                                    </span>
                                    <FaTrash className="trashicon" onClick={() => handleDeleteAddon(addon.addonid)} />
                                </div>
                            ))}
                        </div>
                        <div className="new-item-row">
                            <input
                                value={newAddonName}
                                onChange={e => setNewAddonName(e.target.value)}
                                placeholder="New addon name"
                            />
                            <input
                                value={newAddonPrice}
                                onChange={e => setNewAddonPrice(e.target.value)}
                                placeholder="Addon price"
                            />
                            <button onClick={handleAddAddon}>Add Addon</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TagAddonManager;
