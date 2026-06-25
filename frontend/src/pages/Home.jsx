import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Flame, Gift, Map, Compass, AlertTriangle, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Import newly generated images
import foodWasteImg from '../assets/food_waste.png';
import orphanageCareImg from '../assets/orphanage_care.png';
import donationEssentialsImg from '../assets/donation_essentials.png';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      {/* Hero Section */}
      <section className="hero" style={{ paddingBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', padding: '0.4rem 1rem', background: 'rgba(211, 84, 0, 0.08)', borderRadius: '50px', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          <Heart size={14} fill="var(--primary)" /> Connecting Kindness
        </div>
        <h1 style={{ fontSize: '3.2rem', marginBottom: '1rem' }}>Prevent Food Waste, <br /><span style={{ color: 'var(--primary)' }}>Empower Innocent Lives</span></h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '750px', margin: '0 auto' }}>
          Seva Hrudhayam connects weddings, celebrations, and donors directly with nearby orphanages. Don't let excess food or usable essentials go to waste. Report them instantly, and support those in need.
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          {user ? (
            <Link to={user.role === 'admin' ? '/admin-dashboard' : user.role === 'donor' ? '/donor-dashboard' : '/orphanage-dashboard'} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/donor-auth" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
                Join as Donor
              </Link>
              <Link to="/orphanage-auth" className="btn btn-outline" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
                Register Orphanage
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Visual Contrast Section: Waste vs Care */}
      <section className="glass-panel" style={{ background: '#fff', border: '1px solid var(--border-color)' }}>
        <h3 style={{ textTransform: 'uppercase', fontSize: '1rem', color: 'var(--primary)', letterSpacing: '1px', textAlign: 'center', marginBottom: '0.5rem' }}>The Mission</h3>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>Bridging the Gap Between Excess and Need</h2>
        
        <div className="grid-2">
          {/* Card 1: Food Waste at Events */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ overflow: 'hidden', borderRadius: 'var(--radius-md)', height: '240px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <img 
                src={foodWasteImg} 
                alt="Surplus food waste at catering social events" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <AlertTriangle color="var(--primary)" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4>Surplus Waste at Celebrations</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Weddings, parties, and corporate receptions prepare excess catering as a safety margin. Sadly, this fresh cooked, high-quality food is thrown away at the end of the day.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Orphanages Lack of Food */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ overflow: 'hidden', borderRadius: 'var(--radius-md)', height: '240px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <img 
                src={orphanageCareImg} 
                alt="Orphanage children receiving nutrition care support" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <Heart color="var(--secondary)" size={20} style={{ flexShrink: 0, fill: 'var(--secondary)', marginTop: '2px' }} />
              <div>
                <h4>Nourishing Innocent Lives</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  By capturing your surplus food immediately and matching with orphanages within a 20 km radius, we provide fresh, wholesome meals to children who need them most.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Numbers Section */}
      <section className="metrics-container" style={{ margin: '0 auto', maxWidth: '1100px', width: '100%' }}>
        <div className="metric-card glass-panel" style={{ textAlign: 'center', flexDirection: 'column' }}>
          <div className="metric-icon" style={{ background: 'rgba(211, 84, 0, 0.1)' }}>
            <Flame size={24} />
          </div>
          <div className="metric-details">
            <h3>4,850+</h3>
            <p>Servings Shared</p>
          </div>
        </div>

        <div className="metric-card glass-panel" style={{ textAlign: 'center', flexDirection: 'column' }}>
          <div className="metric-icon" style={{ background: 'rgba(39, 174, 96, 0.1)', color: 'var(--secondary)' }}>
            <Gift size={24} />
          </div>
          <div className="metric-details">
            <h3>1,200+</h3>
            <p>Clothes & Toys Given</p>
          </div>
        </div>

        <div className="metric-card glass-panel" style={{ textAlign: 'center', flexDirection: 'column' }}>
          <div className="metric-icon" style={{ background: 'rgba(241, 196, 15, 0.1)', color: 'var(--accent)' }}>
            <ShieldCheck size={24} />
          </div>
          <div className="metric-details">
            <h3>100%</h3>
            <p>Verified Connections</p>
          </div>
        </div>
      </section>

      {/* Supporting Essentials Section */}
      <section className="glass-panel" style={{ background: '#fff', border: '1px solid var(--border-color)' }}>
        <div className="grid-2" style={{ alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ textTransform: 'uppercase', fontSize: '1rem', color: 'var(--secondary)', letterSpacing: '1px' }}>Resource Categories</h3>
            <h2>What Else Can You Donate?</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Beyond fresh surplus food, Seva Hrudhayam enables you to clear out usable household goods and distribute them to childcare homes:
            </p>
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.95rem' }}>
              <li><strong>Usable Clothes:</strong> Freshly washed shirts, pants, sweaters, and school uniforms.</li>
              <li><strong>Kids Toys:</strong> Dolls, board games, blocks, puzzles, and drawing sets in clean condition.</li>
              <li><strong>Old Beds & Cot Gear:</strong> Mattresses, clean blankets, sheets, pillows, and wooden cots.</li>
              <li><strong>Custom Essentials:</strong> Notebooks, pencil boxes, school bags, and hygiene kits.</li>
            </ul>
          </div>
          
          <div style={{ overflow: 'hidden', borderRadius: 'var(--radius-md)', height: '300px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
            <img 
              src={donationEssentialsImg} 
              alt="Donation essentials like clothes, toys, and beds" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section style={{ padding: '2rem 0', borderTop: '1px solid var(--border-color)', margin: '0 auto', maxWidth: '1200px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.2rem' }}>How Seva Hrudhayam Works</h2>
        
        <div className="grid-3">
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(211, 84, 0, 0.1)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', fontWeight: 'bold', color: 'var(--primary)', justifyContent: 'center' }}>1</div>
            <h4>Report Surplus Resources</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Whether you are finished with a wedding reception or sorting out usable old clothes, input the location and count in the app.
            </p>
          </div>

          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(39, 174, 96, 0.1)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', fontWeight: 'bold', color: 'var(--secondary)', justifyContent: 'center' }}>2</div>
            <h4>Instant Location Matching</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              The system calculates distances and finds verified orphanages within 20 km (or within the district). Real-time alarms sound on their dashboard.
            </p>
          </div>

          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(241, 196, 15, 0.1)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', fontWeight: 'bold', color: 'var(--accent)', justifyContent: 'center' }}>3</div>
            <h4>Safe Delivery & Completion</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Orphanage heads accept, exchange contact numbers, coordinate pickups, and mark it complete once delivery is successful.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Access Portal Banner */}
      <section className="glass-panel" style={{ background: 'linear-gradient(135deg, var(--dark) 0%, #1a252f 100%)', color: '#fff', padding: '3rem', borderRadius: 'var(--radius-lg)', margin: '0 auto 2rem', maxWidth: '1100px', width: '100%' }}>
        <div className="grid-2" style={{ alignItems: 'center' }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '1rem' }}>Ready to prevent waste?</h2>
            <p style={{ color: '#bdc3c7', marginBottom: '1.5rem' }}>
              In event celebrations, up to 15-20% of prepared food is discarded. Together, we can redirect this nutrition directly and transparently. Log in to start helping childcare centres today.
            </p>
            <Link to="/about" className="btn btn-primary">
              Learn More About Us
            </Link>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '1.5rem', borderRadius: 'var(--radius-md)', width: '170px', textAlign: 'center' }}>
              <Map size={32} color="var(--primary)" style={{ margin: '0 auto 0.75rem' }} />
              <h5>Geo Filtering</h5>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '1.5rem', borderRadius: 'var(--radius-md)', width: '170px', textAlign: 'center' }}>
              <Compass size={32} color="var(--secondary)" style={{ margin: '0 auto 0.75rem' }} />
              <h5>Real-time Alerts</h5>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
