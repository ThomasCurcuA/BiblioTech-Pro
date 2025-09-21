import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Bell, X, CheckCircle, AlertTriangle, Info, AlertCircle,
  Trash2, Eye, Filter
} from 'lucide-react';
import { useLibrary } from '../lib/context';

const notificationVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-400" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
    case 'error':
      return <AlertCircle className="h-5 w-5 text-red-400" />;
    default:
      return <Info className="h-5 w-5 text-blue-400" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'border-green-500/50 bg-green-500/10';
    case 'warning':
      return 'border-yellow-500/50 bg-yellow-500/10';
    case 'error':
      return 'border-red-500/50 bg-red-500/10';
    default:
      return 'border-blue-500/50 bg-blue-500/10';
  }
};

export default function NotificationSystem() {
  const { state, dispatch } = useLibrary();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const notifications = state.notifications;
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const markAsRead = (id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  };

  const deleteNotification = (id: string) => {
    dispatch({ type: 'DELETE_NOTIFICATION', payload: id });
  };

  const markAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.read) {
        dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notification.id });
      }
    });
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}g fa`;
    if (hours > 0) return `${hours}h fa`;
    if (minutes > 0) return `${minutes}m fa`;
    return 'Ora';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Centro Notifiche</h1>
          <p className="text-gray-400">Gestisci i messaggi e gli avvisi del sistema</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Filter className="h-4 w-4 mr-2" />
            {filter === 'all' ? 'Solo non lette' : 'Tutte'}
          </Button>
          {filteredNotifications.some(n => !n.read) && (
            <Button
              onClick={markAllAsRead}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Segna tutte come lette
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Totale</p>
                <p className="text-2xl font-bold text-white">{notifications.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Non lette</p>
                <p className="text-2xl font-bold text-white">
                  {notifications.filter(n => !n.read).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Lette</p>
                <p className="text-2xl font-bold text-white">
                  {notifications.filter(n => n.read).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          <AnimatePresence>
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                variants={notificationVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`bg-gray-800 border-gray-700 ${getNotificationColor(notification.type)}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={notification.read ? "secondary" : "default"}
                              className="text-xs"
                            >
                              {notification.read ? 'Letta' : 'Nuova'}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {formatTime(notification.timestamp)}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-300 mb-4">
                          {notification.message}
                        </p>
                        <div className="flex gap-2">
                          {!notification.read && (
                            <Button
                              onClick={() => markAsRead(notification.id)}
                              size="sm"
                              variant="outline"
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Segna come letta
                            </Button>
                          )}
                          <Button
                            onClick={() => deleteNotification(notification.id)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Elimina
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {filter === 'unread' ? 'Nessuna notifica non letta' : 'Nessuna notifica'}
              </h3>
              <p className="text-gray-400">
                {filter === 'unread' 
                  ? 'Tutte le notifiche sono state lette'
                  : 'Non ci sono notifiche nel sistema'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
