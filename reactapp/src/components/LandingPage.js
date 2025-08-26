import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleSignupClick = () => {
    console.log("🔄 Landing page signup clicked, navigating to /signup");
    navigate("/signup");
  };

  const handleLoginClick = () => {
    console.log("🔄 Landing page login clicked, navigating to /login");
    navigate("/login");
  };

  return (
    <div className="landing">
      {/* GlobalNavbar is shown in App.js; keep page content minimal here */}

      <header className="landing-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span>🚀 Trusted by 500+ Companies</span>
          </div>
          <h1>Transform Your Inventory Management</h1>
          <p className="hero-subtitle">
            Stop losing money on stockouts and overstocking. Our intelligent inventory system 
            gives you real-time visibility across all warehouses, automated reorder alerts, 
            and actionable insights that reduce costs by up to 30%.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">30%</span>
              <span className="stat-label">Cost Reduction</span>
            </div>
            <div className="stat">
              <span className="stat-number">99.9%</span>
              <span className="stat-label">Uptime</span>
            </div>
            <div className="stat">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Support</span>
            </div>
          </div>
          <div className="hero-actions">
            <button 
              onClick={handleSignupClick} 
              className="cta primary-btn"
              type="button"
              aria-label="Start free trial - navigate to signup page"
            >
              Start Free Trial
            </button>
              <button 
              onClick={handleLoginClick} 
              className="secondary secondary-btn"
              type="button"
              aria-label="Sign in to existing account - navigate to login page"
            >
              Sign In
            </button>
          </div>
          <p className="hero-note">No credit card required • 14-day free trial</p>
        </div>
      </header>

      <section className="landing-features">
        <div className="section-header">
          <h2>Why Leading Companies Choose Us</h2>
        </div>
        <div className="features-grid">
          <div className="feature">
            <div className="feature-icon">📊</div>
            <h3>Real-Time Inventory Tracking</h3>
            <p>Monitor stock levels across multiple warehouses with live updates. Get instant alerts when items are running low or when there's unusual activity.</p>
            <div className="feature-benefit">
              <span>✓ Reduce stockouts by 85%</span>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">🤖</div>
            <h3>AI-Powered Forecasting</h3>
            <p>Predict demand patterns using machine learning algorithms. Automatically generate purchase orders and optimize reorder points based on historical data.</p>
            <div className="feature-benefit">
              <span>✓ Improve forecast accuracy by 40%</span>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">🔔</div>
            <h3>Smart Alert System</h3>
            <p>Never miss critical inventory events. Get notified about low stock, expiring items, supplier delays, and unusual demand spikes via email, SMS, or dashboard.</p>
            <div className="feature-benefit">
              <span>✓ Respond to issues 3x faster</span>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">📱</div>
            <h3>Role-Based Dashboards</h3>
            <p>Customized views for every team member. Warehouse staff see daily tasks, managers get performance metrics, and executives access strategic insights.</p>
            <div className="feature-benefit">
              <span>✓ Increase team productivity by 25%</span>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">📈</div>
            <h3>Advanced Analytics</h3>
            <p>Comprehensive reporting on inventory turnover, carrying costs, supplier performance, and seasonal trends. Export data to Excel or integrate with your ERP.</p>
            <div className="feature-benefit">
              <span>✓ Make data-driven decisions</span>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">🔒</div>
            <h3>Enterprise Security</h3>
            <p>Bank-level security with role-based access control, audit trails, and SOC 2 compliance. Your data is encrypted and backed up in multiple locations.</p>
            <div className="feature-benefit">
              <span>✓ Enterprise-grade security</span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-testimonials">
        <div className="section-header">
          <h2>What Our Customers Say</h2>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial">
            <div className="testimonial-content">
              <p>"This system transformed our warehouse operations. We reduced stockouts by 90% and cut carrying costs by $50,000 annually."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">👨‍💼</div>
              <div className="author-info">
                <h4>Michael Chen</h4>
                <span>Operations Director, TechCorp</span>
              </div>
            </div>
          </div>
          <div className="testimonial">
            <div className="testimonial-content">
              <p>"The automated alerts save us hours every week. Our team can now focus on strategic tasks instead of manual inventory checks."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">👩‍💼</div>
              <div className="author-info">
                <h4>Sarah Johnson</h4>
                <span>Warehouse Manager, RetailPlus</span>
              </div>
            </div>
          </div>
          <div className="testimonial">
            <div className="testimonial-content">
              <p>"Implementation was smooth and the ROI was immediate. We're now expanding to use it across all our distribution centers."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">👨‍💻</div>
              <div className="author-info">
                <h4>David Rodriguez</h4>
                <span>CTO, GlobalSupply</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <div className="cta-content">
          <h2>Ready to Optimize Your Inventory?</h2>
          <p>Join thousands of companies that have transformed their operations with our platform.</p>
          <div className="cta-actions">
            <button 
              onClick={handleSignupClick} 
              className="cta-primary"
              type="button"
            >
              Start Your Free Trial
            </button>
            <button 
              onClick={handleLoginClick} 
              className="cta-secondary"
              type="button"
            >
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#integrations">Integrations</a></li>
              <li><a href="#api">API</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#blog">Blog</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="#help">Help Center</a></li>
              <li><a href="#docs">Documentation</a></li>
              <li><a href="#status">System Status</a></li>
              <li><a href="#community">Community</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#security">Security</a></li>
              <li><a href="#compliance">Compliance</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Inventory Management System. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}


