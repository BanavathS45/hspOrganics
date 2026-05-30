import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { notificationService } from '../../firebase/db';
import { Bell, Plus, Calendar, Trash2, Megaphone, ShieldAlert, Sparkles, ShoppingBag } from 'lucide-react';

const Notifications = () => {
  const { notifications } = useApp();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetRole, setTargetRole] = useState('all'); // 'all', 'admin', or specific customer ID
  const [loading, setLoading] = useState(false);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title || !body) {
      alert("Please enter title and description.");
      return;
    }

    setLoading(true);
    try {
      notificationService.addSystemNotification({
        title,
        body,
        type: 'general',
        userId: targetRole
      });
      alert("Notification broadcasted successfully!");
      setTitle('');
      setBody('');
    } catch (err) {
      alert("Error broadcasting notification: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getNotiIcon = (type) => {
    switch (type) {
      case 'new_order':
        return <ShoppingBag className="text-warning" size={16} />;
      case 'inventory_alert':
        return <ShieldAlert className="text-danger" size={16} />;
      case 'new_product':
        return <Sparkles className="text-info" size={16} />;
      default:
        return <Megaphone className="text-success" size={16} />;
    }
  };

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-4">
        <h4 className="font-heading fw-extrabold text-success m-0">Push Notifications Panel</h4>
        <span className="text-muted text-xs font-body">Broadcast system alerts and monitor registration/order notifications</span>
      </div>

      <div className="row g-4 text-start">
        {/* Left Side: Broadcast New Notification */}
        <div className="col-12 col-md-5">
          <div className="card border-0 glass-card p-4 rounded-4 shadow-sm h-100">
            <h5 className="font-heading fw-bold text-success mb-3 d-flex align-items-center gap-1.5">
              <Bell size={20} /> Broadcast Announcement
            </h5>

            <form onSubmit={handleBroadcast} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label text-secondary fw-semibold text-xs">Target Audience</label>
                <select 
                  className="form-select form-control-organic text-sm"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                >
                  <option value="all">📢 All Customers & Admins</option>
                  <option value="admin">🔒 Admins Only</option>
                  <option value="user-demo">👤 Demo Customer Only</option>
                </select>
              </div>

              <div>
                <label className="form-label text-secondary fw-semibold text-xs">Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Fresh Mangoes Season!" 
                  className="form-control form-control-organic text-sm" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                />
              </div>

              <div>
                <label className="form-label text-secondary fw-semibold text-xs">Message Body</label>
                <textarea 
                  rows="3" 
                  placeholder="e.g. Sweet Devgad Alphonso Mangoes are back in stock. Order now before they are sold out!" 
                  className="form-control form-control-organic text-sm" 
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required 
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-organic w-100 py-2 mt-2 rounded-pill font-heading fw-bold shadow d-flex align-items-center justify-content-center gap-1.5"
              >
                <Plus size={16} /> {loading ? 'Broadcasting...' : 'Broadcast Alert'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Notification Logs */}
        <div className="col-12 col-md-7">
          <div className="card border-0 glass-card p-4 rounded-4 shadow-sm h-100">
            <h5 className="font-heading fw-bold text-success mb-3">Live Log Stream</h5>
            
            <div className="d-flex flex-column gap-2.5" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              {notifications.map((noti) => (
                <div 
                  key={noti.id} 
                  className="p-3 border rounded-4 bg-white d-flex align-items-start gap-3"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <div className="p-2.5 rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center flex-shrink-0" style={{ background: 'var(--accent-green-bg)' }}>
                    {getNotiIcon(noti.type)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <h6 className="m-0 font-heading fw-bold text-success" style={{ fontSize: '13.5px' }}>{noti.title}</h6>
                      <span className="text-muted font-body d-flex align-items-center gap-1 text-xxs" style={{ fontSize: '10px' }}>
                        <Calendar size={10} /> {new Date(noti.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="m-0 text-muted font-body text-xs mt-1" style={{ fontSize: '12px', lineHeight: '1.4' }}>
                      {noti.body}
                    </p>
                    <span className="badge bg-light text-muted border text-xxs mt-2 font-heading" style={{ fontSize: '9px' }}>
                      Audience: {noti.userId === 'all' ? 'All' : noti.userId}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Notifications;
