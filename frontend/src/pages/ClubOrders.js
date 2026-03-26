import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/App";
import ClubLayout from "@/components/ClubLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ClubOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user?.club_id) return;
    try {
      const response = await axios.get(`${BACKEND_URL}/api/orders/${user.club_id}`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.club_id]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'pending':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <ClubLayout title="Orders">
      {loading ? (
        <div className="text-center py-20">
          <p className="text-zinc-400">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <Card className="bg-[#121212] border-white/10 p-12 text-center">
          <p className="text-zinc-400">No orders found</p>
        </Card>
      ) : (
        <Card className="bg-[#121212] border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-zinc-400">ORDER NUMBER</TableHead>
                <TableHead className="text-zinc-400">DATE</TableHead>
                <TableHead className="text-zinc-400">TOTAL</TableHead>
                <TableHead className="text-zinc-400">STATUS</TableHead>
                <TableHead className="text-zinc-400">ITEMS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow 
                  key={order.id} 
                  data-testid={`order-row-${order.id}`}
                  className="border-white/10 hover:bg-white/5"
                >
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell className="text-zinc-400">{order.date}</TableCell>
                  <TableCell className="text-[#DFFF00] font-bold">
                    ${order.total.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-zinc-400">
                      {order.items.map((item, idx) => (
                        <div key={idx}>
                          {item.product} x {item.quantity}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </ClubLayout>
  );
};

export default ClubOrders;
