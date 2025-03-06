import useAxios from '../hooks/useAxiosAuth';
import React, { useState, useEffect } from 'react';
import './TagAddonLinker.css';

const apiUrl = process.env.REACT_APP_API_URL;

const TagAddonLinker = ({ allTags, allAddons, item, closePopup, handleTagChange, handleAddonChange }) => {
    const [linkedTags, setLinkedTags] = useState(item.tags || []);
    const [unlinkedTags, setUnlinkedTags] = useState([]);
    const [linkedAddons, setLinkedAddons] = useState(item.addons || []);
    const [unlinkedAddons, setUnlinkedAddons] = useState([]);

    useEffect(() => {
        setUnlinkedAddons(allAddons.filter(a => !linkedAddons.some(la => la.addonid === a.addonid)));
        setUnlinkedTags(allTags.filter(t => !linkedTags.some(lt => lt.tagid === t.tagid)));
    }, [allTags, allAddons]);

    useEffect(() => {
        handleTagChange(item.categoryid, item.productid, {
            target: { name: 'tags', value: linkedTags }
        });
    }, [linkedTags]);

    useEffect(() => {
        handleAddonChange(item.categoryid, item.productid, {
            target: { name: 'addons', value: linkedAddons }
        });
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

    const formatPrice = (price) => {
        if (Math.round(price) === 0) return '';
        return price > 0 ? `+${Math.round(price)}` : `${Math.round(price)}`;
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
                                    <span>{addon.addonname}</span>
                                    <span>{formatPrice(addon.price)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="unlinked-addons">
                            <h4>Unlinked Addons</h4>
                            {unlinkedAddons.map(addon => (
                                <div key={addon.addonid} onClick={() => handleAddonClick(addon, false)}>
                                    <span>{addon.addonname}</span>
                                    <span>{formatPrice(addon.price)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TagAddonLinker;
