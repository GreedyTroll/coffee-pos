import useAxios from '../hooks/useAxiosAuth';
import React, { useState, useEffect } from 'react';
import './TagAddonLinker.css';

const apiUrl = process.env.REACT_APP_API_URL;

const TagAddonLinker = ({ allTags, allAddons, allAddonGroups, item, closePopup, handleTagChange, handleAddonChange, handleAddonGroupChange }) => {
    const [linkedTags, setLinkedTags] = useState(item.tags || []);
    const [unlinkedTags, setUnlinkedTags] = useState([]);
    const [linkedAddons, setLinkedAddons] = useState(item.addons || []);
    const [unlinkedAddons, setUnlinkedAddons] = useState([]);
    const [linkedAddonGroups, setLinkedAddonGroups] = useState(item.addongroups || []);
    const [unlinkedAddonGroups, setUnlinkedAddonGroups] = useState([]);

    useEffect(() => {
    }, []);
    
    useEffect(() => {
        setLinkedTags(item.tags || []);
        setUnlinkedTags(allTags.filter(t => !linkedTags.some(lt => lt.tagid === t.tagid)));
    }, [allTags, linkedTags]);

    useEffect(() => {
        const ungrouped = allAddons.filter(a => a.groupid === null);
        setUnlinkedAddons(ungrouped.filter(a => !linkedAddons.some(la => la.addonid === a.addonid)));
    }, [allAddons, linkedAddons]);

    useEffect(() => {
        // setLinkedAddonGroups(item.addongroups || []);
        setUnlinkedAddonGroups(allAddonGroups.filter(g => !linkedAddonGroups.some(lg => lg.groupid === g.groupid)));
    }, [allAddonGroups, linkedAddonGroups]);

    useEffect(() => {
        handleTagChange({
            target: { name: 'tags', value: linkedTags }
        });
    }, [linkedTags]);

    useEffect(() => {
        item.addons = linkedAddons;
        handleAddonChange({
            target: { name: 'addons', value: linkedAddons }
        });
    }, [linkedAddons]);

    useEffect(() => {
        item.addongroups = linkedAddonGroups;
        handleAddonGroupChange({
            target: { name: 'addongroups', value: linkedAddonGroups }
        });
    }, [linkedAddonGroups]);

    const handleTagClick = (tag, isLinked) => {
        if (isLinked) {
            setLinkedTags(linkedTags.filter(t => t.tagid !== tag.tagid));
            setUnlinkedTags([...unlinkedTags, tag]);
        } else {
            setUnlinkedTags(unlinkedTags.filter(t => t.tagid !== tag.tagid));
            setLinkedTags([...linkedTags, tag]);
        }
    };

    const handleAddonGroupClick = (group, isLinked) => {
        if (isLinked) {
            setLinkedAddonGroups(linkedAddonGroups.filter(g => g.groupname !== group.groupname));
            setUnlinkedAddonGroups([...unlinkedAddonGroups, group]);
        } else {
            setUnlinkedAddonGroups(unlinkedAddonGroups.filter(g => g.groupname !== group.groupname));
            setLinkedAddonGroups([...linkedAddonGroups, group]);
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
        item.addongroups = linkedAddonGroups;
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
                            <h4>Linked Addon Groups</h4>
                            {linkedAddonGroups.map(group => (
                                <div key={group.groupname} onClick={() => handleAddonGroupClick(group, true)}>
                                    <span>{group.groupname}</span>
                                </div>
                            ))}
                        </div>
                        <div className="unlinked-addons">
                            <h4>Unlinked Addon Groups</h4>
                            {unlinkedAddonGroups.map(group => (
                                <div key={group.groupname} onClick={() => handleAddonGroupClick(group, false)}>
                                    <span>{group.groupname}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="addons-container">
                        <div className="linked-addons">
                            <h4>Linked Individual Addons</h4>
                            {linkedAddons.map(addon => (
                                <div key={addon.addonid} onClick={() => handleAddonClick(addon, true)}>
                                    <span>{addon.addonname}</span>
                                    <span>{formatPrice(addon.price)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="unlinked-addons">
                            <h4>Unlinked Individual Addons</h4>
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
