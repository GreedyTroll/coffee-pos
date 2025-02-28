import useAxios from '../hooks/useAxiosAuth';
import React, { useState, useEffect } from 'react';
import './TagAddonPopup.css';

const apiUrl = process.env.REACT_APP_API_URL;

const TagAddonPopup = ({ item, closePopup, handleTagChange, handleAddonChange }) => {
    const [linkedTags, setLinkedTags] = useState(item.tags || []);
    const [unlinkedTags, setUnlinkedTags] = useState([]);
    const [linkedAddons, setLinkedAddons] = useState(item.addons || []);
    const [unlinkedAddons, setUnlinkedAddons] = useState([]);

    const axios = useAxios();

    useEffect(() => {
        axios.get(`${apiUrl}/menu/tags`)
            .then(response => {
                setUnlinkedTags(response.data.filter(tag => !linkedTags.some(t => t.tagid === tag.tagid)));
            })
            .catch(error => console.error('Error fetching tags:', error));

        axios.get(`${apiUrl}/menu/addons`)
            .then(response => {
                setUnlinkedAddons(response.data.filter(addon => !linkedAddons.some(a => a.addonid === addon.addonid)));
            })
            .catch(error => console.error('Error fetching addons:', error));
    }, []);

    useEffect(() => {
        handleTagChange(item.productid, { target: { name: 'tags', value: linkedTags } });
    }, [linkedTags]);

    useEffect(() => {
        handleAddonChange(item.productid, { target: { name: 'addons', value: linkedAddons } });
    }, [linkedAddons]);

    const handleTagClick = (tag, isLinked) => {
        if (isLinked) {
            setLinkedTags(linkedTags.filter(t => t.tagid !== tag.tagid));
            setUnlinkedTags([...unlinkedTags, tag]);
        } else {
            setUnlinkedTags(unlinkedTags.filter(t => t.tagid !== tag.tagid));
            setLinkedTags([...linkedTags, tag]);
        }
    };

    const handleAddonClick = (addon, isLinked) => {
        if (isLinked) {
            setLinkedAddons(linkedAddons.filter(a => a.addonid !== addon.addonid));
            setUnlinkedAddons([...unlinkedAddons, addon]);
        } else {
            setUnlinkedAddons(unlinkedAddons.filter(a => a.addonid !== addon.addonid));
            setLinkedAddons([...linkedAddons, addon]);
        }
    };

    const handleClosePopup = () => {
        item.tags = linkedTags;
        item.addons = linkedAddons;
        closePopup();
    };

    return (
        <div className="popup">
            <div className="popup-inner">
                <h2>{item.productname || "Edit Tags and Addons"}</h2>
                <button className="close-btn" onClick={handleClosePopup}>Close</button>
                <div className="tags-section">
                    <h3>Tags</h3>
                    <div className="tags-container">
                        <div className="linked-tags">
                            <h4>Linked Tags</h4>
                            {linkedTags.map(tag => (
                                <div key={tag.tagid} onClick={() => handleTagClick(tag, true)}>
                                    {tag.tagname}
                                </div>
                            ))}
                        </div>
                        <div className="unlinked-tags">
                            <h4>Unlinked Tags</h4>
                            {unlinkedTags.map(tag => (
                                <div key={tag.tagid} onClick={() => handleTagClick(tag, false)}>
                                    {tag.tagname}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="addons-section">
                    <h3>Addons</h3>
                    <div className="addons-container">
                        <div className="linked-addons">
                            <h4>Linked Addons</h4>
                            {linkedAddons.map(addon => (
                                <div key={addon.addonid} onClick={() => handleAddonClick(addon, true)}>
                                    {addon.addonname}
                                </div>
                            ))}
                        </div>
                        <div className="unlinked-addons">
                            <h4>Unlinked Addons</h4>
                            {unlinkedAddons.map(addon => (
                                <div key={addon.addonid} onClick={() => handleAddonClick(addon, false)}>
                                    {addon.addonname}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TagAddonPopup;
