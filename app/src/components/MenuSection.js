import React from 'react';
import './MenuSection.css';

const MenuSection = ({ category, products, isEditMode, handleProductChange, addProduct, deleteItem }) => {
    return (
        <div className="menu-section">
            <h2 className="center-text">{category.categoryname || ""}</h2>
            <p className="center-text">{category.description || ""}</p>
            <table>
                <tbody>
                    {products.map((product, index) => (
                        <tr key={index}>
                            <td>{product.productname || "No Product Name"}</td>
                            <td>{product.price ? `$${product.price}` : "N/A"}</td>
                            {isEditMode && <td>{product.menuorder}</td>}
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
                                    name="new-product-name"
                                    onChange={(e) => handleProductChange(category.categoryid, e)}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    placeholder="Price"
                                    name="new-product-price"
                                    onChange={(e) => handleProductChange(category.categoryid, e)}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    placeholder="Menu Order"
                                    name="new-product-menuorder"
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
