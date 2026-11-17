import { useContext } from 'react'
import "./Navbar.css"
import logo from "../../assets/logo.png"
import arrow_icon from "../../assets/arrow_icon.png"
import { CoinContext } from '../../context/CoinContext'
import { AuthContext } from '../../context/AuthContext'
import { AlertsContext } from '../../context/AlertsContext'
import { CURRENCIES } from '../../constants'
import { Link, NavLink, useNavigate } from 'react-router-dom'

const Navbar = () => {
  const { currency, setCurrency } = useContext(CoinContext);
  const { user, logout, updateProfile } = useContext(AuthContext);
  const { triggeredCount } = useContext(AlertsContext);
  const navigate = useNavigate();

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
      <ul>
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
          </>
        )}
      </ul>
      <div className='nav-right'>
        <select value={currency.name} onChange={currencyHandler}>
          <option value="usd">USD</option>
          <option value="eur">EUR</option>
          <option value="inr">INR</option>
        </select>
        {user ? (
          <>
            <span className='nav-user'>Hi, {user.name.split(' ')[0]}</span>
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
      </div>
    </div>
  )
}

export default Navbar
