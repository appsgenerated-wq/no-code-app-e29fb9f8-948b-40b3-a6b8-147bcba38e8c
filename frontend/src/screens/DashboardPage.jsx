import React, { useEffect, useState, useCallback } from 'react';
import config from '../constants.js';
import { PlusCircleIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

const DashboardPage = ({ user, onLogout, manifest }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [myRestaurant, setMyRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '' });

  const loadAllRestaurants = useCallback(async () => {
    try {
      const response = await manifest.from('Restaurant').find({ include: ['owner'] });
      setRestaurants(response.data);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    }
  }, [manifest]);

  const loadMyRestaurantData = useCallback(async () => {
    if (user.role === 'owner') {
      try {
        const response = await manifest.from('Restaurant').find({ filter: { owner: user.id } });
        if (response.data.length > 0) {
          const ownerRestaurant = response.data[0];
          setMyRestaurant(ownerRestaurant);
          const menuResponse = await manifest.from('MenuItem').find({ filter: { restaurant: ownerRestaurant.id }, sort: { createdAt: 'desc' } });
          setMenuItems(menuResponse.data);
        }
      } catch (error) {
        console.error('Error loading my restaurant data:', error);
      }
    }
  }, [manifest, user.id, user.role]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([loadAllRestaurants(), loadMyRestaurantData()]);
      setIsLoading(false);
    };
    fetchData();
  }, [loadAllRestaurants, loadMyRestaurantData]);

  const handleCreateMenuItem = async (e) => {
    e.preventDefault();
    if (!myRestaurant) return;
    try {
      const createdItem = await manifest.from('MenuItem').create({
        ...newItem,
        price: parseFloat(newItem.price),
        restaurant: myRestaurant.id
      });
      setMenuItems([createdItem, ...menuItems]);
      setNewItem({ name: '', description: '', price: '' });
    } catch (error) {
      console.error('Failed to create menu item:', error);
      alert('Error: Could not create menu item.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}!</h1>
            <p className="text-sm text-gray-500">Role: <span className="font-medium capitalize text-indigo-600">{user.role}</span></p>
          </div>
          <div className="flex items-center space-x-4">
            <a href={`${config.BACKEND_URL}/admin`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-600 hover:text-indigo-600">Admin Panel</a>
            <button onClick={onLogout} className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700 transition-colors">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user.role === 'owner' && myRestaurant && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Manage Your Restaurant: {myRestaurant.name}</h2>
            <h3 className="text-lg font-medium mb-3 text-gray-700">Add a New Menu Item</h3>
            <form onSubmit={handleCreateMenuItem} className="space-y-4">
              <input type="text" placeholder="Item Name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" required />
              <textarea placeholder="Description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" rows="2"></textarea>
              <input type="number" placeholder="Price (USD)" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" step="0.01" min="0" required />
              <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors">
                <PlusCircleIcon className="h-5 w-5"/> Add Item
              </button>
            </form>
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3 text-gray-700">Current Menu</h3>
              {menuItems.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {menuItems.map(item => (
                    <li key={item.id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                      <p className="font-semibold text-green-600">${item.price.toFixed(2)}</p>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-gray-500 italic">No menu items yet. Add one above!</p>}
            </div>
          </div>
        )}
        
        <h2 className="text-2xl font-bold text-gray-800 mb-6">All Restaurants</h2>
        {isLoading ? <p>Loading restaurants...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map(resto => (
              <div key={resto.id} className="bg-white rounded-lg shadow overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                <img src={resto.heroImage?.thumbnail?.url || 'https://placehold.co/400x225'} alt={resto.name} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900">{resto.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 truncate">{resto.description}</p>
                  <p className="text-xs text-gray-400 mt-2">Owner: {resto.owner?.name || 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
