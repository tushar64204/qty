import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './order.css'; // Import the CSS file

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);


  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('https://serverfoodcart.onrender.com');
        if (Array.isArray(response.data)) {
          // Filter out orders older than 30 hours
          const now = new Date();
          const filtered = response.data.filter(order => {
            const orderDate = new Date(order.date + ' ' + order.time);
            const timeDifference = (now - orderDate) / (1000 * 60 * 60); // in hours
            return timeDifference <= 48;
          });

          // Sort orders by date and time (most recent first)
          const sortedOrders = filtered.sort((a, b) => {
            const dateA = new Date(a.date + ' ' + a.time);
            const dateB = new Date(b.date + ' ' + b.time);
            return dateB - dateA;
          });

          setOrders(sortedOrders);
          setFilteredOrders(sortedOrders);
        } else {
          setError('Unexpected response format');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);

    const filtered = orders.filter((order) =>
      order.orderNumber.includes(searchValue) ||
      order.name.toLowerCase().includes(searchValue) ||
      order.paymentMethod.toLowerCase().includes(searchValue) ||
      new Date(order.date).toLocaleDateString().includes(searchValue)
    );
    setFilteredOrders(filtered);
  };

  const handlePrint = (order) => {
    const win = window.open('', '', 'height=700,width=700');
    win.document.write('<html><head><title>Invoice</title>');
    win.document.write('<style>@media print { .no-print { display: none; } }</style>');
    win.document.write('</head><body >');
    win.document.write(`
      <div style="padding: 20px; border: 1px solid black; margin-bottom: 20px;">
        <h2>HooShop GROUP OF RESTAURANTS</h2>
        <p>Address</p>
        <p>Rohtak, Haryana</p>
        <p>Rohtak - 124001</p>
        <p>Contact: 9817409607</p>
        <p><strong>TAX INVOICE</strong></p>
        <p><strong>Bill No:</strong> ${order.orderNumber}</p>
        <p><strong>Date & Time:</strong> ${order.date} ${order.time}</p>
        <p><strong>Name:</strong> ${order.name}</p>
        <p><strong>Table:</strong> ${order.table}</p>
        <p><strong>Order Details:</strong> ${order.order}</p>
        <p><strong>Total:</strong> ₹${order.total}</p>
        <p><strong>GST:</strong> ₹${order.gst}</p>
        <p><strong>Grand Total:</strong> ₹${order.grandTotal}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      </div>
    `);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
  };

  const handleFieldChange = async (orderId, field, value) => {
    try {
      let parsedValue = value;
      if (['total', 'gst', 'grandTotal'].includes(field)) {
        parsedValue = parseFloat(value.replace(/[^0-9.-]+/g, ''));
      }
      const updatedOrders = orders.map((order) =>
        order._id === orderId ? { ...order, [field]: parsedValue } : order
      );
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
      await axios.put(`https://serverfoodcart.onrender.com/${orderId}`, { [field]: parsedValue });
    } catch (err) {
      console.error('Failed to update order field:', err);
      setError('Failed to update order field');
    }
  };

  const handleDelete = async (orderId) => {
    try {
      await axios.delete(`https://serverfoodcart.onrender.com/${orderId}`);
      setOrders(orders.filter(order => order._id !== orderId));
      setFilteredOrders(filteredOrders.filter(order => order._id !== orderId));
    } catch (err) {
      setError('Failed to delete order');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>All Orders</h1>
      <input
        type="text"
        placeholder="Search by Order Number, Name, Payment Method, Date"
        value={searchTerm}
        onChange={handleSearch}
        className="search-bar"
      />
      {filteredOrders.length > 0 ? (
        <table className="order-table">
          <thead>
            <tr>
              <th>Serial No.</th>
              <th>Order Number</th>
              <th>Date & Time</th>
              <th>Name</th>
              <th>Table</th>
              <th>Order Details</th>
              <th>Total (₹)</th>
              <th>GST (₹)</th>
              <th>Grand Total (₹)</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th className="no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, index) => (
              <tr key={order._id}>
                <td data-label="Serial No.">{index + 1}</td>
                <td
                  data-label="Order Number"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleFieldChange(order._id, 'orderNumber', e.target.textContent)}
                >
                  {order.orderNumber}
                </td>
                <td data-label="Date & Time">{order.date} {order.time}</td>
                <td
                  data-label="Name"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleFieldChange(order._id, 'name', e.target.textContent)}
                >
                  {order.name}
                </td>
                <td
                  data-label="Table"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleFieldChange(order._id, 'table', e.target.textContent)}
                >
                  {order.table}
                </td>
                <td
                  data-label="Order Details"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleFieldChange(order._id, 'order', e.target.textContent)}
                >
                  {order.order}
                </td>
                <td
                  data-label="Total"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleFieldChange(order._id, 'total', e.target.textContent)}
                >
                  ₹{order.total}
                </td>
                <td
                  data-label="GST"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleFieldChange(order._id, 'gst', e.target.textContent)}
                >
                  ₹{order.gst}
                </td>
                <td
                  data-label="Grand Total"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleFieldChange(order._id, 'grandTotal', e.target.textContent)}
                >
                  ₹{order.grandTotal}
                   {/* the filteredOrders array is being used throughout the code, so make sure to update its state along with the original orders state array to keep everything in sync.} */}
                </td>
                <td
                  data-label="Payment Method"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleFieldChange(order._id, 'paymentMethod', e.target.textContent)}
                >
                  {order.paymentMethod}
                </td>
                <td data-label="Status">
                  <select
                    value={order.status || 'Running'}
                    onChange={(e) => handleFieldChange(order._id, 'status', e.target.value)}
                  >
                    <option value="Running">Running</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Not Acceptable">Not Acceptable</option>
                  </select>
                </td>
                <td data-label="Actions" className="no-print">
                  <button onClick={() => handlePrint(order)}>Print</button>
                  <button onClick={() => handleDelete(order._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No orders found</p>
      )}
    </div>
  );
};

export default Orders;
