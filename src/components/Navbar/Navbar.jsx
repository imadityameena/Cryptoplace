import { useContext, useState } from 'react'
import "./Navbar.css"
import logo from "../../assets/logo.png"
import arrow_icon from "../../assets/arrow_icon.png"
import { CoinContext } from '../../context/CoinContext'
import { AuthContext } from '../../context/AuthContext'
import { AlertsContext } from '../../context/AlertsContext'
import { CURRENCIES } from '../../constants'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const { currency, setCurrency } = useContext(CoinContext);
  const { user, logout, updateProfile } = useContext(AuthContext);
  const { triggeredCount } = useContext(AlertsContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menu, setMenu] = useState({ open: false, path: location.pathname });

  // Close the mobile menu whenever the route changes
  const menuOpen = menu.open && menu.path === location.pathname;
  const toggleMenu = () => setMenu({ open: !menuOpen, path: location.pathname });

  const currencyHandler = (event) => {
    const next = CURRENCIES[event.target.value] || CURRENCIES.usd;
    setCurrency(next);
    if (user && user.preferredCurrency !== next.name) {
      updateProfile({ preferredCurrency: next.name }).catch(() => {});
    }
  };

  const logoutHandler = () => {
    logout();
    navigate('/');
  };

  return (
    <div className='navbar'>
      <Link to='/'><img src={logo} alt="Cryptoplace" className='logo' /></Link>
      <ul className={menuOpen ? 'open' : ''}>
        <NavLink to='/' end><li>Home</li></NavLink>
        {user && (
          <>
            <NavLink to='/watchlist'><li>Watchlist</li></NavLink>
            <NavLink to='/portfolio'><li>Portfolio</li></NavLink>
            <NavLink to='/alerts'>
              <li className='nav-alerts'>
                Alerts
                {triggeredCount > 0 && (
                  <span className='nav-badge' aria-label={`${triggeredCount} triggered`}>
                    {triggeredCount}
                  </span>
                )}
              </li>
            </NavLink>
            <NavLink to='/account' className='mobile-only'><li>Account</li></NavLink>
          </>
        )}
      </ul>
      <div className='nav-right'>
        <select value={currency.name} onChange={currencyHandler} aria-label='Currency'>
          <option value="usd">USD</option>
          <option value="eur">EUR</option>
          <option value="inr">INR</option>
        </select>
        {user ? (
          <>
            <Link to='/account' className='nav-user' title='Account settings'>
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt=''
                  className='nav-avatar'
                  referrerPolicy='no-referrer'
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              )}
              Hi, {user.name.split(' ')[0]}
            </Link>
            <button onClick={logoutHandler}>Log out</button>
          </>
        ) : (
          <>
            <Link to='/login' className='nav-login'>Log in</Link>
            <Link to='/signup'>
              <button>Sign up<img src={arrow_icon} alt="" /></button>
            </Link>
          </>
        )}
        {user && (
          <button
            className='menu-toggle'
            onClick={toggleMenu}
            aria-label='Toggle menu'
            aria-expanded={menuOpen}
          >
            {menuOpen ? '✕' : '☰'}
            {!menuOpen && triggeredCount > 0 && <span className='menu-dot'></span>}
          </button>
        )}
      </div>
    </div>
  )
}

export default Navbar
