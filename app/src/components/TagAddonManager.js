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
    const [newAddonGroupName, setNewAddonGroupName] = useState('');
    const [addonGroups, setAddonGroups] = useState([]);
    const [selectedAddonGroup, setSelectedAddonGroup] = useState('');

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
        
        axios.get(`${apiUrl}/menu/addonGroups`)
            .then(response => {
                setAddonGroups(response.data);
            })
            .catch(error => console.error('Error fetching addon groups:', error));
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
            price: parseFloat(newAddonPrice) || 0,
            addon_group: selectedAddonGroup
        })
            .then(() => {
                setNewAddonName('');
                setNewAddonPrice('');
                setSelectedAddonGroup('');
                axios.get(`${apiUrl}/menu/addons`).then(res => setAddons(res.data));
            })
            .catch(error => console.error('Error adding addon:', error));
    };

    const handleAddAddonGroup = () => {
        axios.post(`${apiUrl}/menu/addAddonGroup`, { group_name: newAddonGroupName })
            .then(() => {
                setNewAddonGroupName('');
                axios.get(`${apiUrl}/menu/addonGroups`).then(res => setAddonGroups(res.data));
            })
            .catch(error => console.error('Error adding tag:', error));
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

    const handleDeleteAddonGroup = (groupId) => {
        axios.delete(`${apiUrl}/menu/addonGroup/${groupId}`)
            .then(() => {
                setAddonGroups(addonGroups.filter(group => group.groupid !== groupId));
                console.log('addons', addons);
                setAddons(addons.filter(addon => addon.groupid !== groupId));
            })
            .catch(error => console.error('Error deleting addon group:', error));
    };

    const handleUpdateAddonGroup = (addonId, groupId) => {
        axios.put(`${apiUrl}/menu/updateAddonGroup`, {
            addon_id: addonId,
            group_id: (groupId) ? groupId : null
        })
            .then(() => {
                axios.get(`${apiUrl}/menu/addons`).then(res => setAddons(res.data));
            })
            .catch(error => console.error('Error updating addon group:', error));
    };

    const formatPrice = (price) => {
        if (Math.round(price) === 0) return '';
        return price > 0 ? `(+${Math.round(price)})` : `(${Math.round(price)})`;
    };

    return (
        <div className="tag-addon-popup">
            <div className="popup-inner">
                <h2>{"Edit Tags and Addons"}</h2>
                <button className="close-btn" onClick={handleClosePopup}>Close</button>
                <div className="section-row">
                    <div className="tags-manage-section">
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
                    <div className="addons-manage-section">
                        <h3>Addons</h3>
                        <div className="tagaddon-addons-container">
                            {addons.map(addon => (
                                <div key={addon.addonid} className="tagaddon-addon-item">
                                    <span>
                                        {addon.addonname}
                                        {addon.price ? ` ${formatPrice(addon.price)}` : ''}
                                    </span>
                                    <select
                                        value={addon.groupid || ''}
                                        onChange={e => handleUpdateAddonGroup(addon.addonid, e.target.value)}
                                    >
                                        <option value="">Select group</option>
                                        {addonGroups.map(group => (
                                            <option key={group.groupid} value={group.groupid}>
                                                {group.groupname}
                                            </option>
                                        ))}
                                    </select>
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
                                type="number"
                                value={newAddonPrice}
                                onChange={e => setNewAddonPrice(e.target.value)}
                                placeholder="Addon price"
                            />
                            <select
                                value={selectedAddonGroup}
                                onChange={e => setSelectedAddonGroup(e.target.value)}
                            >
                                <option value="">Select group</option>
                                {addonGroups.map(group => (
                                    <option key={group.groupid} value={group.groupid}>
                                        {group.groupname}
                                    </option>
                                ))}
                            </select>
                            <button onClick={handleAddAddon}>Add Addon</button>
                        </div>
                    </div>
                    <div className="addon-groups-manage-section">
                        <h3>Addon Groups</h3>
                        <div className="tagaddon-addon-groups-container">
                            {addonGroups.map(group => (
                                <div key={group.groupid} className="tagaddon-addon-group-item">
                                    <span>{group.groupname}</span>
                                    <FaTrash className="trashicon" onClick={() => handleDeleteAddonGroup(group.groupid)} />
                                </div>
                            ))}
                            <div className="new-item-row">
                                <input
                                    value={newAddonGroupName}
                                    onChange={e => setNewAddonGroupName(e.target.value)}
                                    placeholder="New Addon Group name"
                                />
                                <button onClick={handleAddAddonGroup}>Add Group</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TagAddonManager;
