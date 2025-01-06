import React from 'react';
import './MenuSection.css';

const MenuSection = ({ category, products, isEditMode, handleProductChange, addProduct, deleteItem, newProducts }) => {
    return (
        <div className="menu-section">
            <h2 className="center-text">{category.categoryname || ""}</h2>
            <p className="center-text">{category.description || ""}</p>
            <table>
                <tbody>
                    {products.map((product, index) => (
                        <tr key={index}>
                            <td>{product.productname || product.product_name ||"No Product Name"}</td>
                            <td>{product.description || "No Description"}</td>
                            <td>{product.price ? `${Math.round(product.price)}` : 0}</td>
                            {isEditMode && <td>{product.menuorder || product.menu_order}</td>}
                            {isEditMode && (
                                <td>
                                    <button onClick={() => deleteItem(product)}>Delete</button>
                                </td>
                            )}
                        </tr>
                    ))}
                    {isEditMode && (
                        <tr>
                            <td>
                                <input
                                    type="text"
                                    placeholder="Add New Product..."
                                    name="product_name"
                                    value={newProducts[category.categoryid]?.product_name || ''}
                                    onChange={(e) => handleProductChange(category.categoryid, e)}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    placeholder="Description"
                                    name="description"
                                    value={newProducts[category.categoryid]?.description || ''}
                                    onChange={(e) => handleProductChange(category.categoryid, e)}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    placeholder="Price"
                                    name="price"
                                    value={newProducts[category.categoryid]?.price || ''}
                                    onChange={(e) => handleProductChange(category.categoryid, e)}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    placeholder="Menu Order"
                                    name="menu_order"
                                    value={newProducts[category.categoryid]?.menu_order || ''}
                                    onChange={(e) => handleProductChange(category.categoryid, e)}
                                />
                            </td>
                            <td>
                                <button onClick={() => addProduct(category.categoryid)}>Add Product</button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default MenuSection;
