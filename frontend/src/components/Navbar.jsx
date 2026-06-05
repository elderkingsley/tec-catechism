import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, 
  faTimes, 
  faUser, 
  faRightFromBracket, 
  faShieldHalved,
  faHome 
} from '@fortawesome/free-solid-svg-icons';

function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Main Navbar */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 hover:opacity-90 transition"
              onClick={closeMenu}
            >
              <img 
                src="/images/logo.png" 
                alt="TEC Logo" 
                className="h-10 w-10 object-contain"
              />
              <span className="text-lg sm:text-xl font-bold hidden xs:inline">
                TEC Catechism
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                to="/" 
                className="hover:text-blue-200 transition font-medium"
              >
                Home
              </Link>

              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="flex items-center space-x-2 bg-blue-700 px-4 py-2 rounded-lg hover:bg-blue-600 transition font-medium"
                    >
                      <FontAwesomeIcon icon={faShieldHalved} />
                      <span>Admin</span>
                    </Link>
                  )}

                  <div className="flex items-center space-x-2 text-blue-100">
                    <FontAwesomeIcon icon={faUser} />
                    <span>{user?.name}</span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition font-medium"
                  >
                    <FontAwesomeIcon icon={faRightFromBracket} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="hover:text-blue-200 transition font-medium"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition font-medium"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white hover:text-blue-200 transition p-2"
              aria-label="Toggle menu"
            >
              <FontAwesomeIcon 
                icon={isMenuOpen ? faTimes : faBars} 
                className="text-2xl"
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img 
                src="/images/logo.png" 
                alt="TEC Logo" 
                className="h-8 w-8 object-contain"
              />
              <span className="font-bold">Menu</span>
            </div>
            <button
              onClick={closeMenu}
              className="text-white hover:text-blue-200"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>

          {/* Mobile Menu Items */}
          <div className="flex-1 overflow-y-auto">
            <nav className="py-4">
              {/* Home Link */}
              <Link
                to="/"
                onClick={closeMenu}
                className="flex items-center space-x-3 px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
              >
                <FontAwesomeIcon icon={faHome} className="w-5" />
                <span className="font-medium">Home</span>
              </Link>

              {isAuthenticated ? (
                <>
                  {/* Admin Link */}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={closeMenu}
                      className="flex items-center space-x-3 px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                    >
                      <FontAwesomeIcon icon={faShieldHalved} className="w-5" />
                      <span className="font-medium">Admin Panel</span>
                    </Link>
                  )}

                  {/* User Info */}
                  <div className="border-t border-gray-200 mt-4 pt-4 px-6">
                    <div className="flex items-center space-x-3 text-gray-600 mb-4">
                      <FontAwesomeIcon icon={faUser} className="w-5" />
                      <span className="font-medium">{user?.name}</span>
                    </div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-2 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition font-medium"
                    >
                      <FontAwesomeIcon icon={faRightFromBracket} />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Login Link */}
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="block mx-6 mt-4 text-center bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Login
                  </Link>

                  {/* Register Link */}
                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="block mx-6 mt-3 text-center bg-white text-blue-600 border-2 border-blue-600 px-4 py-3 rounded-lg hover:bg-blue-50 transition font-medium"
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Mobile Menu Footer */}
          <div className="border-t border-gray-200 p-4 text-center text-sm text-gray-500">
            © 2026 TEC Catechism
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
