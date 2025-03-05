import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, HandHeart, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleUserClick = () => {
    navigate('/auth', { state: { role: 'user' } });
  };

  const handleNgoClick = () => {
    navigate('/auth', { state: { role: 'ngo' } });
  };

  const handleAdminClick = () => {
    navigate('/auth', { state: { role: 'admin' } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <Card
          className="p-6 flex flex-col items-center justify-center space-y-4 shadow-lg hover:shadow-xl transition cursor-pointer"
          onClick={handleUserClick}
        >
          <User size={48} className="text-blue-500" />
          <CardContent className="text-center">
            <h2 className="text-xl font-semibold">User</h2>
            <p className="text-gray-600">Access as an individual user</p>
          </CardContent>
        </Card>

        {/* NGO Card */}
        <Card
          className="p-6 flex flex-col items-center justify-center space-y-4 shadow-lg hover:shadow-xl transition cursor-pointer"
          onClick={handleNgoClick}
        >
          <HandHeart size={48} className="text-green-500" />
          <CardContent className="text-center">
            <h2 className="text-xl font-semibold">NGO</h2>
            <p className="text-gray-600">Access as an NGO representative</p>
          </CardContent>
        </Card>

        {/* Admin Card */}
        <Card
          className="p-6 flex flex-col items-center justify-center space-y-4 shadow-lg hover:shadow-xl transition cursor-pointer"
          onClick={handleAdminClick}
        >
          <ShieldCheck size={48} className="text-red-500" />
          <CardContent className="text-center">
            <h2 className="text-xl font-semibold">Admin</h2>
            <p className="text-gray-600">Access as an administrator</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoleSelection;
