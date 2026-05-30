import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { productService } from '../../firebase/db';
import { Plus, Edit2, Trash2, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

const Products = () => {
  const { products } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form States
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [organicInfo, setOrganicInfo] = useState('');

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Vegetables');
    setPrice('');
    setUnit('');
    setStock('');
    setImage('');
    setDescription('');
    setOrganicInfo('');
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price);
    setUnit(p.unit);
    setStock(p.stock);
    setImage(p.image);
    setDescription(p.description);
    setOrganicInfo(p.organicInfo);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !unit || !stock || !image) {
      alert("Please fill in all mandatory fields.");
      return;
    }

    const payload = {
      name,
      category,
      price: parseFloat(price),
      unit,
      stock: parseInt(stock),
      image,
      description: description || 'Fresh farm organic produce.',
      organicInfo: organicInfo || '100% Certified Organic and Pesticide Free.'
    };

    try {
      if (editingProduct) {
        // Edit
        await productService.update(editingProduct.id, payload);
        alert("Product updated successfully!");
      } else {
        // Add
        await productService.add(payload);
        alert("New product added to catalog!");
      }
      setShowModal(false);
    } catch (err) {
      alert("Error saving product: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this product from the organic catalog?")) {
      try {
        await productService.delete(id);
        alert("Product deleted.");
      } catch (err) {
        alert("Error deleting product: " + err.message);
      }
    }
  };

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="font-heading fw-extrabold text-success m-0">Product Catalog</h4>
          <span className="text-muted text-xs font-body">Manage organic inventory and pricing details</span>
        </div>
        <button 
          onClick={openAddModal}
          className="btn btn-organic d-flex align-items-center gap-1.5 shadow"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Products Table Card */}
      <div className="card border-0 glass-card rounded-4 shadow-sm overflow-hidden text-start">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="font-heading" style={{ fontSize: '13px' }}>
                <th className="px-4 py-3">Product</th>
                <th className="py-3">Category</th>
                <th className="py-3">Unit</th>
                <th className="py-3">Price</th>
                <th className="py-3">Stock Status</th>
                <th className="py-3 text-center" style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const isLowStock = p.stock <= 5;
                const isOutOfStock = p.stock === 0;

                return (
                  <tr key={p.id} className="font-body" style={{ fontSize: '13.5px' }}>
                    {/* Item */}
                    <td className="px-4 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <img 
                          src={p.image} 
                          alt={p.name} 
                          className="rounded-3 object-fit-cover border"
                          style={{ width: '48px', height: '48px' }}
                        />
                        <div>
                          <h6 className="m-0 font-heading fw-bold text-success" style={{ fontSize: '13.5px' }}>{p.name}</h6>
                          <span className="text-muted" style={{ fontSize: '10.5px' }}>ID: {p.id}</span>
                        </div>
                      </div>
                    </td>
                    
                    {/* Category */}
                    <td className="py-3 fw-semibold text-secondary">{p.category}</td>
                    
                    {/* Unit */}
                    <td className="py-3 text-muted">{p.unit}</td>
                    
                    {/* Price */}
                    <td className="py-3 fw-bold text-dark">₹{p.price}</td>
                    
                    {/* Stock status */}
                    <td className="py-3">
                      {isOutOfStock ? (
                        <span className="badge bg-danger rounded-pill d-inline-flex align-items-center gap-1">
                          <AlertTriangle size={10} /> Sold Out
                        </span>
                      ) : isLowStock ? (
                        <span className="badge bg-warning text-dark rounded-pill d-inline-flex align-items-center gap-1">
                          <AlertTriangle size={10} /> Low Stock ({p.stock})
                        </span>
                      ) : (
                        <span className="badge bg-success-subtle text-success rounded-pill d-inline-flex align-items-center gap-1">
                          <CheckCircle2 size={10} /> {p.stock} Available
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 text-center">
                      <div className="d-flex justify-content-center gap-1">
                        <button 
                          onClick={() => openEditModal(p)}
                          className="btn btn-sm btn-outline-success p-1 rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: '28px', height: '28px' }}
                          title="Edit Product"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="btn btn-sm btn-outline-danger p-1 rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: '28px', height: '28px' }}
                          title="Delete Product"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Add/Edit Product Modal */}
      {showModal && (
        <div 
          className="modal fade show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content border-0 glass-card text-start" style={{ borderRadius: '24px' }}>
              <div className="modal-header border-0 d-flex justify-content-between align-items-center px-4 pt-4">
                <h5 className="modal-title font-heading fw-bold text-success">
                  {editingProduct ? 'Edit Organic Product' : 'Add Organic Product'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body px-4 pb-4">
                  <div className="row g-3">
                    
                    {/* Name */}
                    <div className="col-md-6">
                      <label className="form-label text-secondary fw-semibold text-xs">Product Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Fresh Red Apples" 
                        className="form-control form-control-organic" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        required 
                      />
                    </div>

                    {/* Category */}
                    <div className="col-md-6">
                      <label className="form-label text-secondary fw-semibold text-xs">Category</label>
                      <select 
                        className="form-select form-control-organic" 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="Vegetables">Vegetables</option>
                        <option value="Fruits">Fruits</option>
                        <option value="Oils">Oils</option>
                        <option value="Cool Drinks">Cool Drinks</option>
                      </select>
                    </div>

                    {/* Unit size */}
                    <div className="col-md-4">
                      <label className="form-label text-secondary fw-semibold text-xs">Weight Unit (e.g. 1kg, 500ml)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 500g" 
                        className="form-control form-control-organic" 
                        value={unit} 
                        onChange={(e) => setUnit(e.target.value)}
                        required 
                      />
                    </div>

                    {/* Price */}
                    <div className="col-md-4">
                      <label className="form-label text-secondary fw-semibold text-xs">Price (₹)</label>
                      <input 
                        type="number" 
                        min="1" 
                        placeholder="Price" 
                        className="form-control form-control-organic" 
                        value={price} 
                        onChange={(e) => setPrice(e.target.value)}
                        required 
                      />
                    </div>

                    {/* Stock */}
                    <div className="col-md-4">
                      <label className="form-label text-secondary fw-semibold text-xs">Stock Quantity</label>
                      <input 
                        type="number" 
                        min="0" 
                        placeholder="Stock" 
                        className="form-control form-control-organic" 
                        value={stock} 
                        onChange={(e) => setStock(e.target.value)}
                        required 
                      />
                    </div>

                    {/* Image URL */}
                    <div className="col-12">
                      <label className="form-label text-secondary fw-semibold text-xs">Image URL (Unsplash or direct link)</label>
                      <input 
                        type="text" 
                        placeholder="https://images.unsplash.com/..." 
                        className="form-control form-control-organic" 
                        value={image} 
                        onChange={(e) => setImage(e.target.value)}
                        required 
                      />
                    </div>

                    {/* Description */}
                    <div className="col-12">
                      <label className="form-label text-secondary fw-semibold text-xs">Product Description</label>
                      <textarea 
                        rows="3" 
                        placeholder="Enter features, health benefits, taste..." 
                        className="form-control form-control-organic" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                      ></textarea>
                    </div>

                    {/* Organic cultivation info */}
                    <div className="col-12">
                      <label className="form-label text-secondary fw-semibold text-xs">Organic Farming Information</label>
                      <input 
                        type="text" 
                        placeholder="Cultivated using compost manure, zero chemical pesticides." 
                        className="form-control form-control-organic" 
                        value={organicInfo} 
                        onChange={(e) => setOrganicInfo(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0 px-4 pb-4 pt-0 d-flex gap-2">
                  <button type="submit" className="btn btn-organic flex-grow-1">
                    {editingProduct ? 'Save Changes' : 'Publish Product'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)} 
                    className="btn btn-light rounded-pill px-4"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
