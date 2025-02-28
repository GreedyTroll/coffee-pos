import React from 'react';
import './MenuSection.css';

const MenuSection = ({ category, products, isEditMode, handleProductChange, addProduct, deleteItem, newProducts, openPopup }) => {
    return (
        <div className="menu-section">
            <div className="category-header">
                <h2 className="center-text">{category.categoryname || ""}</h2>
                {isEditMode && (
                    <>
                        <input
                            type="number"
                            value={category.menuorder || category.menu_order}
                            onChange={(e) => handleProductChange(category.categoryid, e)}
                            className="category-order"
                        />
                        <button className="delete-button" onClick={() => deleteItem(category)}>Delete Category</button>
                        <button className="edit-button" onClick={() => openPopup(category)}>Edit Category Tags/Addons</button>
                    </>
                )}
            </div>
            <p className="center-text">{category.description || ""}</p>
            <div className="menu-items">
                {products.map((product, index) => (
                    <div key={index} className="menu-row">
                        <div className="menu-item-name">{product.productname || product.product_name || "No Product Name"}</div>
                        <div className="menu-item-description">{product.description || ""}</div>
                        <div className="tags-container">
                            {product.tags && product.tags.map(tag => (
                                <span key={tag.tagid} className="tag-item">
                                    {tag.tagname}
                                </span>
                            ))}
                        </div>
                        <div className="menu-item-price">{product.price ? `${Math.round(product.price)}` : 0}</div>
                        {isEditMode && (
                            <input
                                type="number"
                                value={product.menuorder || product.menu_order}
                                onChange={(e) => handleProductChange(category.categoryid, e, index)}
                                className="menu-item-order"
                            />
                        )}
                        {isEditMode && (
                            <>
                                <button className="delete-button" onClick={() => deleteItem(product)}>Delete</button>
                                <button className="edit-button" onClick={() => openPopup(product)}>Edit Tags/Addons</button>
                            </>
                        )}
                    </div>
                ))}
                {isEditMode && (
                    <div className="menu-row">
                        <input
                            type="text"
                            placeholder="Add New Product..."
                            name="product_name"
                            value={newProducts[category.categoryid]?.product_name || ''}
                            onChange={(e) => handleProductChange(category.categoryid, e)}
                        />
                        <input
                            type="text"
                            placeholder="Description"
                            name="description"
                            value={newProducts[category.categoryid]?.description || ''}
                            onChange={(e) => handleProductChange(category.categoryid, e)}
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            name="price"
                            value={newProducts[category.categoryid]?.price || ''}
                            onChange={(e) => handleProductChange(category.categoryid, e)}
                        />
                        <input
                            type="number"
                            placeholder="Menu Order"
                            name="menu_order"
                            value={newProducts[category.categoryid]?.menu_order || ''}
                            onChange={(e) => handleProductChange(category.categoryid, e)}
                        />
                        <button onClick={() => addProduct(category.categoryid)}>Add Product</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuSection;
