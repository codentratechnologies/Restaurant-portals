import { useState, useEffect } from 'react';
import { ref, onValue, query, orderByChild, update } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import { useAuth } from './useAuth';

export interface MenuItem {
  id: string;
  foodId?: string;
  name: string;
  description: string;
  price: number;
  categories: string[];
  dietary_types: string[];
  is_available: boolean;
  image_url?: string;
  tags?: string[];
  customizations?: any[];
  created_at: string;
  updated_at: string;
}

export function useMenuItems() {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Reference to user-specific menu node: menu/{user_id}
    const menuRef = ref(rtdb, `menu/${user.uid}`);

    const unsubscribe = onValue(
      menuRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();

          let maxId = 0;
          let itemsList: MenuItem[] = [];
          const seenFoodIds = new Set<string>();

          // The data is now nested: data[category][foodId]
          Object.keys(data).forEach((key) => {
            const node = data[key];
            if (typeof node === 'object' && node !== null) {
              // Check if this node is an old flat food item
              if (node.name !== undefined && node.price !== undefined) {
                // Ignore old flat structure
                return;
              }

              // Otherwise it's a category folder
              Object.keys(node).forEach((foodIdKey) => {
                const item = node[foodIdKey];

                // Ensure it's a valid object
                if (typeof item === 'object' && item !== null && item.name) {
                  // Track maxId for later use in CreateFoodItem if needed
                  if (item.foodId && item.foodId.startsWith('f')) {
                    const num = parseInt(item.foodId.substring(1), 10);
                    if (!isNaN(num) && num > maxId) maxId = num;
                  }

                  if (!seenFoodIds.has(foodIdKey)) {
                    seenFoodIds.add(foodIdKey);
                    itemsList.push({
                      id: foodIdKey, // The key itself is the foodId now
                      ...item,
                    });
                  }
                }
              });
            }
          });

          // Sort by created_at descending (newest first)
          itemsList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

          setMenuItems(itemsList);
        } else {
          setMenuItems([]); // Database node doesn't exist or is empty
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching menu items:', err);
        setError('Failed to load menu items.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { menuItems, loading, error };
}

