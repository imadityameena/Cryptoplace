import { useContext, useEffect, useState } from 'react'
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

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === 'Escape' && setMenu((m) => ({ ...m, open: false }));
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

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
    <header className='navbar'>
      <Link to='/' aria-label='Cryptoplace home'><img src={logo} alt="Cryptoplace" className='logo' /></Link>
      <nav aria-label='Main'>
        <ul id='main-menu' className={menuOpen ? 'open' : ''}>
          <li><NavLink to='/' end>Home</NavLink></li>
          {user ? (
            <>
              <li><NavLink to='/watchlist'>Watchlist</NavLink></li>
              <li><NavLink to='/portfolio'>Portfolio</NavLink></li>
              <li>
                <NavLink to='/alerts' className='nav-alerts'>
                  Alerts
                  {triggeredCount > 0 && (
                    <span className='nav-badge' aria-label={`${triggeredCount} triggered`}>
                      {triggeredCount}
                    </span>
                  )}
                </NavLink>
              </li>
              <li className='mobile-only'><NavLink to='/account'>Account</NavLink></li>
            </>
          ) : (
            <>
              <li className='mobile-only'><NavLink to='/login'>Log in</NavLink></li>
              <li className='mobile-only'><NavLink to='/signup'>Sign up</NavLink></li>
            </>
          )}
        </ul>
      </nav>
      <div className='nav-right'>
        <select value={currency.name} onChange={currencyHandler} aria-label='Currency'>
          {Object.values(CURRENCIES).map((c) => (
            <option key={c.name} value={c.name}>{c.name.toUpperCase()}</option>
          ))}
        </select>
        {user ? (
          <>
            <Link to='/account' className='nav-user' title='Account settings'>
              Hi, {user.name.split(' ')[0]}
            </Link>
            <button className='nav-cta' onClick={logoutHandler}>Log out</button>
          </>
        ) : (
          <>
            <Link to='/login' className='nav-login'>Log in</Link>
            <Link to='/signup' className='nav-cta'>Sign up<img src={arrow_icon} alt="" /></Link>
          </>
        )}
        <button
          className='menu-toggle'
          onClick={toggleMenu}
          aria-label='Toggle menu'
          aria-expanded={menuOpen}
          aria-controls='main-menu'
        >
          {menuOpen ? '✕' : '☰'}
          {!menuOpen && triggeredCount > 0 && <span className='menu-dot'></span>}
        </button>
      </div>
    </header>
  )
}

export default Navbar
