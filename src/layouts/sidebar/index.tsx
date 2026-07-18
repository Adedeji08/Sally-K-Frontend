import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import Navbar from "../navbar";
// import { formatCurrency, signOut } from "../../../utils/function";
// import { UserData } from "../../../pages/recommender/wallet/types";
// import useRequest from "../../hooks/use-req";
// import BankAccountPopup from "../../link-account-modal";

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const [supportDropdown, setSupportDropdown] = useState(false);



  const menuItems = [
    {
      path: '/profile',
    //   activeIcon: ActiveD,
    //   inactiveIcon: UnactiveD,
      label: 'My Profile',
    },
    {
      path: '/links',
    //   activeIcon: ActiveL,
    //   inactiveIcon: UnactiveL,
      label: 'My Links',
    },
    {
      path: '/rewards',
    //   activeIcon: ActiveR,
    //   inactiveIcon: UnactiveW,
      label: 'Rewards',
    },
    {
      path: '/referrals',
    //   activeIcon: ActiveP,
    //   inactiveIcon: UnactiveR,
      label: 'Referrals',
    },
   
  ];


  const handleSignOut = (e: React.MouseEvent) => {
    e.stopPropagation();

    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="hidden lg:block w-full">
        <Navbar/>
      </div>
      <div className="min-h-screen flex flex-col mx-auto w-full">
        {/* Main Header - Above everything */}
        <div className="flex-1 lg:px-[50px]  flex lg:mt-10">
          {/* Mobile Overlay */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={closeSidebar}
            />
          )}

          {/* Sidebar */}
          <aside
            className={`
                fixed lg:sticky
                lg:top-24
                inset-y-0 left-0 lg:mt-20
                w-[296px] bg-white border-r border-gray-200
                lg:rounded-[16px] lg:h-screen
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                z-50 lg:z-0
                  `}
          >

            <div className="h-full flex flex-col">
              {/* Sidebar Header - Mobile only */}
              <div className="flex items-center justify-between p-4 lg:hidden border-b border-gray-200">
                {/* <MobileLogo /> */}
                <button
                  onClick={closeSidebar}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 space-y-1 py-4 lg:py-6">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                //   const Icon = isActive ? item.activeIcon : item.inactiveIcon;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeSidebar}
                      className={`
          flex items-center gap-3 px-4 py-3 rounded-lg
          transition-colors duration-200
          ${isActive
                          ? 'bg-[#EEF2F6] text-black font-semibold'
                          : 'text-black font-medium hover:bg-gray-100'
                        }
        `}
                    >
                      {/* <Icon /> */}
                      <span className="text-[16px]">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>


              {/* Premium Recommender */}

              <div className="p-4 ">
                <div className="bg-[#EEF2F6] rounded-xl p-3">
                  <button onClick={() => setSupportDropdown(prev => !prev)} className="flex justify-between gap-5 text-[#333D4D] font-semibold text-[16px]">
                    <span className="flex gap-1">
                      {/* <SupportIcon /> */}
                      Support and Legal
                    </span>
                    {/* <DropdownIcon /> */}
                  </button>

                  {supportDropdown && (
                    <div className="space-y-4 text-[12px] px-6 py-3">

                      <div className="flex justify-between">
                        <Link to={`https://www.vouchlinks.com/contact`} className="text-[#6B7280] flex gap-3">Contact us  </Link>
                      </div>

                      <div className="flex justify-between">
                        <Link to={`https://www.vouchlinks.com/terms`} className="text-[#6B7280] flex gap-3">Term of Service </Link>
                      </div>

                      <div className="flex justify-between">
                        <Link to={`https://www.vouchlinks.com/privacy`} className="text-[#6B7280] flex gap-3">Privacy Poilcy </Link>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-4 ">
                  <Link
                    to="https://www.facebook.com/vouchlinks"
                  >
                    {/* <FacebookIcon /> */}
                  </Link>
                  <Link
                    to="https://x.com/vouchlinks"
                  >
                    {/* <XIcon /> */}
                  </Link>
                  <Link
                    to="https://www.instagram.com/vouchlinks/"
                  >
                    {/* <InstagramIcon /> */}
                  </Link>
                  <Link
                    to="#"
                  >
                    {/* <YoutubeIcon /> */}
                  </Link>
                  <Link
                    to="http://linkedin.com/company/vouchlinks/"
                  >
                    {/* <LinkedInIcon /> */}
                  </Link>
                  <Link
                    to="https://www.tiktok.com/@vouchlinks"
                  >
                    {/* <Tiktok /> */}
                  </Link>
                </div>
              </div>

            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Mobile Header */}
            <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
              <button
                onClick={toggleSidebar}
                className="text-gray-600 hover:text-gray-800"
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <div className="relative" ref={dropdownRef}>
                <div
                  className="flex items-center gap-3 cursor-pointer md:bg-white border-2 border-[#DBDEF0] bg-transparent md:border-none rounded-full py-3 px-5 shadow-sm"
                  onClick={() => setIsOpen((prev) => !prev)}
                >
                
                  <div className="text-gray-700 lg:text-[14px] text-[12px] capitalize flex items-center gap-1 font-medium">
            'VouchLinks'
                   
                    <svg
                      className={`mt-1 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10.8504 5.97689L7.00039 10.123L3.15039 5.97689"
                        stroke="#121212"
                        strokeWidth="1.05"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Dropdown Menu */}
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl lg:text-[14px] text-[#121212] text-[12px] shadow-lg border border-gray-100 overflow-hidden z-50">
                    <button onClick={() => navigate('/')} className="w-full text-left px-4 py-2 hover:bg-gray-100">
                      Explore Rewards
                    </button>

                    <button onClick={handleSignOut} className="w-full text-left px-4 py-3 hover:bg-gray-100">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 p-4 lg:p-0 lg:ml-6 ">
              <div className="w-full h-full mt-20">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
       
      </div>
    </>
  );
};

export default MainLayout;