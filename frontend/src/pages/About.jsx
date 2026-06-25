import React from 'react';
import { Heart, Compass, ShieldAlert, Award } from 'lucide-react';

const About = () => {
  return (
    <div className="main-content" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <section style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--primary)' }}>About Seva Hrudhayam</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
          "Seva Hrudhayam" translates to "The Heart of Service". We are a social venture dedicated to reducing food waste at major events and redirecting critical resources to nearby child care institutions and orphanages.
        </p>
      </section>

      <div className="grid-2">
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ color: 'var(--primary)' }}>The Problem We Address</h3>
          <p>
            Social gatherings like weddings, corporate functions, birthdays, and parties often cook extra food to ensure there is no shortage. Unfortunately, this safety margin frequently results in large quantities of excess high-quality food being thrown away.
          </p>
          <p>
            At the same time, children living in nearby orphanages lack access to balanced nutrition, clean clothes, educational toys, and appropriate bedding. There is no simple, quick mechanism to connect the surplus with the deficit before the food spoils.
          </p>
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ color: 'var(--secondary)' }}>Our Tech-Driven Solution</h3>
          <p>
            Seva Hrudhayam provides a responsive, real-time logistics dashboard.
          </p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Geolocation Locking:</strong> Captures exact coordinates using HTML5 APIs to prioritize orphanages within a 20 km radius.</li>
            <li><strong>Sound Alerts:</strong> Plays notification sirens on the orphanage dashboard immediately when matching food becomes available.</li>
            <li><strong>Role Management:</strong> Admins audit and verify registrations, ensuring children's safety and proper food handling.</li>
            <li><strong>Future Scheduling:</strong> Allows organizers to pre-book event donations so orphanages can arrange collections.</li>
          </ul>
        </div>
      </div>

      <section className="glass-panel" style={{ textAlign: 'center', background: 'rgba(211, 84, 0, 0.03)', border: '1px solid var(--border-color)', padding: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Our Core Pillars</h3>
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem', marginTop: '1.5rem' }}>
          <div style={{ width: '220px' }}>
            <Award size={36} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
            <h4>Transparency</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Direct coordination between donor and head ensures resources reach directly.</p>
          </div>
          <div style={{ width: '220px' }}>
            <Compass size={36} color="var(--secondary)" style={{ margin: '0 auto 0.5rem' }} />
            <h4>Efficiency</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Real-time location matching minimizes transit delays, vital for perishable food.</p>
          </div>
          <div style={{ width: '220px' }}>
            <Heart size={36} color="var(--accent)" style={{ margin: '0 auto 0.5rem' }} />
            <h4>Dignity</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Ensuring donation requests (clothes, toys, beds) are verified to be in highly usable condition.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
